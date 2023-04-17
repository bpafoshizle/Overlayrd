<template>
  <div>
    <canvas id="bgcanvasid" :width="settings.canvasWidth" :height="settings.canvasHeight" background="none"></canvas>
    <div style="display:none;">
      <img v-for="twitchEvent in checkedEvents" :id="twitchEvent.imageId" :src="twitchEvent.imageFile"
        :width="twitchEvent.imageWidth" :height="twitchEvent.imageHeight" />
      <audio v-for="twitchEvent in checkedEvents" :id="twitchEvent.audioId" :src="twitchEvent.audioFile"
        :volume="twitchEvent.audioVolume" />
    </div>
  </div>
</template>
  
<script>
import { useTheme } from 'vuetify'
import { mapWritableState } from 'pinia'
import { useSettingsStore } from '../stores/settings'

export default {
  data() {
    return {
      alertList: [
        ['HNDR', 'twitchFollower'],
        ['KuHouse', 'twitchSubscription'],
      ],
      checkedEvents: []
    }
  },

  computed: {
    // gives access to settings inside the component
    ...mapWritableState(useSettingsStore, ['settings']),
  },

  methods: {
    async getTwitchAppAccessToken() {
      fetch(`${this.settings.twitchHelixUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          'client_id': this.settings.twitchClientId,
          'client_secret': this.settings.twitchClientSecret,
          'grant_type': 'client_credentials'
        }
      })
        .then(response => response.json())
        .then(data => {
          this.settings.twitchAppAccessToken = data.access_token;
          console.log(`app access token: ${this.settings.twitchAppAccessToken}`);
        });
    },
    async getTwitchBroadcasterID() {
      fetch(`${this.settings.twitchHelixUrl}/users?login=${this.settings.twitchBroadcasterName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': this.settings.twitchClientId,
          'Authorization': `Bearer ${this.settings.twitchAppAccessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          this.settings.twitchBroadcasterID = data.data[0].id;
          console.log(`broadcaster id: ${this.settings.twitchBroadcasterID}`);
        });
    },

    listenEvents(env) {
      const alertTimeout = 5000;
      const localUrl = this.settings.twitchWSLocalUrl;
      const prodUrl = this.settings.twitchWSProdUrl;
      const initialUrl = ((env === 'DEV') ? localUrl : prodUrl);
      let twitchUserName = this.settings.twitchBroadcasterName;
      let eventTypes = this.settings.selectedTwitchEvents;
      let ws;
      let wsClosing;
      let sessionId; // will be set after session_welcome
      let keepAliveInterval; // will be set after session_welcome
      let lastKeepAliveTimestamp; // set after session_keepalive or notification
      let reconnect = false;

      function connect(url = initialUrl, reconnect = false) {
        console.log(`connecting to ${url}`);
        reconnect = reconnect;
        ws = new WebSocket(url);
      }
      connect();

      async function subscribeToEvents() {
        if (!reconnect) {
          await this.getTwitchAppAccessToken();
          await this.getTwitchBroadcasterID();
          this.settings.getCheckedTwitchEvents.forEach(async twitchEvent => {
            const response = await fetch(`${this.settings.twitchHelixUrl}/eventsub/subscriptions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Client-Id': this.settings.twitchClientId,
                'Authorization': `Bearer ${this.settings.twitchUserAccessToken}`
              },
              body: JSON.stringify({
                'type': twitchEvent.value,
                'version': twitchEvent.version,
                'condition': {
                  'broadcaster_user_id': this.settings.twitchBroadcasterID,
                  'moderator_user_id': this.settings.twitchBroadcasterID
                },
                'transport': {
                  'method': 'websocket',
                  'session_id': sessionId
                }
              })
            });
            console.log(response.json());
          });
        } else {
          console.log('reconnect, skipping subscribe')
        }
      }
      ws.onopen = () => {
        console.log('connected to eventsub');
      };
      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.metadata.message_type === 'session_welcome') {
          let payload = data.payload;
          sessionId = payload.session.id
          console.log(`session id: ${sessionId}`)
          keepAliveInterval = payload.session.keepalive_timeout_seconds;
          if (reconnect) {
            console.log('reconnect welcome recieved, skipping subscribe. closing old connection')
            wsClosing.close()
          } else {
            subscribeToEvents();
          }

        }
        else if (data.metadata.message_type === 'session_keepalive') {
          console.log(`keepalive received. timestamp: ${data.metadata.message_timestamp}`)
          lastKeepAliveTimestamp = data.metadata.message_timestamp;
        }
        else if (data.metadata.message_type === 'session_reconnect') {
          console.log(`reconnecting to eventsub at ${data.payload.session.reconnect_url}`);
          wsClosing = ws;
          setTimeout(() => {
            connect(data.payload.session.reconnect_url, true)
          }, 1000);
        }
        else if (data.metadata.message_type === 'notification') {
          lastKeepAliveTimestamp = data.metadata.message_timestamp;
          let payload = data.payload;
          let eventType = payload.subscription.type;
          let username = payload.event.broadcaster_user_name;
          let alertTemplate = null;
          if (eventType === 'channel.follow') {
            alertTemplate = 'twitchFollower';
            this.eventAlertBox(username, alertTemplate, alertTimeout);
          }
          else if (eventType === 'channel.subscribe') {
            alertTemplate = 'twitchSubscription';
            this.eventAlertBox(username, alertTemplate, alertTimeout);
          }
        }
      };
      ws.onerror = error => {
        console.log('error: ', error);
      };
      ws.onclose = () => {
        console.log('disconnected from eventsub');
      };
    },

    eventAlertBox(username, alertTemplateName, timeOut) {
      function calculateImgPlacement() {
        const canvas = document.querySelector('#bgcanvasid');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = alertTemplate.textColor;
        ctx.font = '56px Monaco';
        const img = document.querySelector(`#${alertTemplate.imageId}`);
        const props = {
          imgStartX: (canvas.width - img.width),
          imgStartY: (canvas.height - img.height),
          imgWidth: img.width,
          imgHeight: img.height,
          imgTextOffsetY: parseInt(alertTemplate.textYOffset),
          imgTextOffsetX: parseInt(alertTemplate.textXOffset),
          textWidth: ctx.measureText(username).width,
          alertAudioId: alertTemplate.audioId
        }
        //console.log(props);
        return props;
      }
      const alertTemplate = this.settings.twitchEvents.find(
        (event) => event.id === alertTemplateName
      );
      const {
        imgStartX,
        imgStartY,
        imgWidth,
        imgHeight,
        imgTextOffsetY,
        imgTextOffsetX,
        textWidth,
        alertAudioId
      } = calculateImgPlacement();

      // console.log(`imgStartX: ${imgStartX}, imgStartY: ${imgStartY}, imgWidth: ${imgWidth}, imgHeight: ${imgHeight}, imgTextOffsetY: ${imgTextOffsetY}, imgTextOffsetX: ${imgTextOffsetX}, textWidth: ${textWidth}`)
      let alpha = 0;
      let fadeIn = true;

      // 60 frames per second * 2.5 seconds = 150 frames. 1/150 = 0.006666666666666667
      let fps = 60;
      let secondsToHalf = timeOut / 2 / 1000;
      let framesToHalf = fps * secondsToHalf;
      let delta = 1 / framesToHalf;
      let startTime = Date.now();

      let audio = document.querySelector(`#${alertAudioId}`);
      audio.play();

      function draw() {
        const canvas = document.querySelector('#bgcanvasid');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = alpha;
        ctx.drawImage(document.querySelector(`#${alertTemplate.imageId}`), imgStartX, imgStartY, imgWidth, imgHeight);
        ctx.fillText(
          username,
          imgStartX + imgTextOffsetX + (imgWidth - textWidth) / 2,
          imgStartY + imgTextOffsetY
        );
        if (fadeIn) {
          alpha += delta;
          if (alpha >= 1) {
            fadeIn = false;
            setTimeout(() => {
              fadeIn = false;
            }, timeOut / 2);
          }
        } else {
          alpha -= delta;
          if (alpha <= 0) {
            fadeIn = true;
            setTimeout(() => {
              fadeIn = true;
            }, timeOut / 2);
          }
        }
        if (Date.now() - startTime < timeOut) {
          requestAnimationFrame(draw);
        }
        else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      draw();
    },

    // DEBUGGING FUNCTIONS
    loopDrawAlert() {
      const timeOut = 5000;
      let alertIndex = 0;
      let requestId = null;


      let drawAlert = () => {
        //console.log(this)
        this.eventAlertBox(this.alertList[alertIndex][0], this.alertList[alertIndex][1], timeOut);
        alertIndex = (alertIndex + 1) % this.alertList.length;
        setTimeout(drawAlert, timeOut);
      }
      drawAlert();
    },

    drawOneAlert() {
      const timeOut = 5000;
      let alertIndex = 0;
      this.eventAlertBox(this.alertList[alertIndex][0], this.alertList[alertIndex][1], timeOut);
    }
  },

  async created() {
    console.log(`Created Component OverlayCanvas`);
    this.checkedEvents = this.settings.twitchEvents.filter((twitchEvent) => twitchEvent.checked);
    this.checkedEvents.forEach(async (twitchEvent) => {
      twitchEvent.imageFile = URL.createObjectURL(await twitchEvent.imageFileHandle.getFile());
      twitchEvent.audioFile = URL.createObjectURL(await twitchEvent.audioFileHandle.getFile());
    });


  },

  mounted() {
    console.log(`Mounted Component OverlayCanvas`)
    const theme = useTheme();
    theme.global.name.value = 'overlayTheme';
    this.listenEvents('PROD');
    //this.loopDrawAlert();
  },

}
</script>

<style>
.v-theme--overlayTheme {
  background: none;
  background-color: rgba(0, 0, 0, 0);
}
</style>