<template>
  <div>
    <canvas id="bgcanvasid" :width="overlayProps.canvasWidth" :height="overlayProps.canvasHeight"
      background="none"></canvas>
    <div style="display:none;">
      <img v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.imageId" :src="twitchEvent.imageFile"
        :width="twitchEvent.imageWidth" :height="twitchEvent.imageHeight" />
      <audio v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.audioId" :src="twitchEvent.audioFile"
        :volume="twitchEvent.audioVolume" />
    </div>
  </div>
</template>
  
<script>
import { useTheme } from 'vuetify'
import { mapWritableState, mapState } from 'pinia'
import { useSettingsStore, getIndexedDB } from '../stores/settings'

export default {
  data() {
    return {
      alertList: [
        ['HNDR', 'twitchFollower'],
        ['KuHouse', 'twitchSubscription'],
      ],
      sessionId: '',
      reconnect: false,
      keepAliveInterval: 0,
      lastKeepAliveTimestamp: 0,
    }
  },

  computed: {
    // gives access to settings inside the component
    ...mapWritableState(useSettingsStore, ['userEnteredSettings']),
    ...mapState(useSettingsStore, ['overlayProps']),
    ...mapState(useSettingsStore, ['twitchConnectivity']),
    ...mapState(useSettingsStore, ['twitchTemporaries']),
    ...mapState(useSettingsStore, {
      getCheckedTwitchEvents(store) {
        return store.getCheckedTwitchEvents;
      }
    })
  },

  methods: {
    async getTwitchAppAccessToken() {
      const response = await fetch(`${this.twitchConnectivity.twitchIDUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'client_id': this.userEnteredSettings.twitchClientId,
          'client_secret': this.userEnteredSettings.twitchClientSecret,
          'grant_type': 'client_credentials'
        })
      });
      // console.log(response);
      const data = await response.json();
      // console.log(data);
      this.twitchTemporaries.twitchAppAccessToken = data.access_token;
      console.log(`app access token: ${this.twitchTemporaries.twitchAppAccessToken}`);
    },
    async getTwitchBroadcasterID() {
      const response = await fetch(`${this.twitchConnectivity.twitchHelixUrl}/users?login=${this.userEnteredSettings.twitchBroadcasterName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': this.userEnteredSettings.twitchClientId,
          'Authorization': `Bearer ${this.twitchTemporaries.twitchAppAccessToken}`
        }
      });
      //console.log(response);
      const data = await response.json();
      // console.log(data);
      this.twitchTemporaries.twitchBroadcasterID = data.data[0].id;
      console.log(`broadcaster id: ${this.twitchTemporaries.twitchBroadcasterID}`);
    },
    async subscribeToEvents() {
      await this.getTwitchAppAccessToken();
      await this.getTwitchBroadcasterID();
      this.getCheckedTwitchEvents.forEach(async twitchEvent => {
        const response = await fetch(`${this.twitchConnectivity.twitchHelixUrl}/eventsub/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': this.userEnteredSettings.twitchClientId,
            'Authorization': `Bearer ${this.twitchTemporaries.twitchUserAccessToken}`
          },
          body: JSON.stringify({
            'type': twitchEvent.value,
            'version': twitchEvent.version,
            'condition': {
              'broadcaster_user_id': this.twitchTemporaries.twitchBroadcasterID,
              'moderator_user_id': this.twitchTemporaries.twitchBroadcasterID
            },
            'transport': {
              'method': 'websocket',
              'session_id': this.sessionId
            }
          })
        });
        //console.log(response);
        const data = await response.json();
        //console.log(data);
      });
    },

    listenEvents(env) {
      const alertTimeout = 5000;
      const localUrl = this.twitchConnectivity.twitchWSLocalUrl;
      const prodUrl = this.twitchConnectivity.twitchWSProdUrl;
      const initialUrl = ((env === 'DEV') ? localUrl : prodUrl);
      // let twitchUserName = this.settings.twitchBroadcasterName;
      // let eventTypes = this.settings.selectedTwitchEvents;
      let ws;
      let wsClosing;

      function connect(url = initialUrl) {
        console.log(`connecting to ${url}`);
        ws = new WebSocket(url);
      }
      connect();
      ws.onopen = () => {
        console.log('connected to eventsub');
      };
      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.metadata.message_type === 'session_welcome') {
          let payload = data.payload;
          this.sessionId = payload.session.id;
          console.log(`session id: ${this.sessionId}`);
          this.keepAliveInterval = payload.session.keepalive_timeout_seconds;
          if (this.reconnect) {
            console.log('reconnect welcome recieved, skipping subscribe. closing old connection');
            wsClosing.close();
          } else {
            this.subscribeToEvents();
          }

        }
        else if (data.metadata.message_type === 'session_keepalive') {
          console.log(`keepalive received. timestamp: ${data.metadata.message_timestamp}`);
          this.lastKeepAliveTimestamp = data.metadata.message_timestamp;
        }
        else if (data.metadata.message_type === 'session_reconnect') {
          console.log(`reconnecting to eventsub at ${data.payload.session.reconnect_url}`);
          wsClosing = ws;
          setTimeout(() => {
            this.reconnect = true;
            connect(data.payload.session.reconnect_url);
          }, 1000);
        }
        else if (data.metadata.message_type === 'notification') {
          this.lastKeepAliveTimestamp = data.metadata.message_timestamp;
          let payload = data.payload;
          let eventType = payload.subscription.type;
          let username = payload.event.user_name;
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
      const alertTemplate = this.userEnteredSettings.twitchEvents.find(
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
    this.getCheckedTwitchEvents.forEach(async (twitchEvent) => {
      let imageFile = await (await getIndexedDB(twitchEvent.imageFileName)).getFile();
      let audioFile = await (await getIndexedDB(twitchEvent.audioFileName)).getFile();
      twitchEvent.imageFile = URL.createObjectURL(imageFile);
      twitchEvent.audioFile = URL.createObjectURL(audioFile);
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