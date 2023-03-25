<template>
  <!-- <v-theme-provider theme="overlayTheme"> -->
  <!-- <v-container theme="overlayTheme"> -->
  <canvas id="bg-canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  <div style="display:none;">
    <img v-for="alertTemplate in alertTemplates" :id="alertTemplate.imageId"
      :src="'/src/media/' + alertTemplate.imageFile" :width="alertTemplate.imageWidth"
      :height="alertTemplate.imageHeight" />
    <audio v-for="alertTemplate in alertTemplates" :id="alertTemplate.audioId"
      :src="'/src/media/' + alertTemplate.audioFile" :volume="alertTemplate.audioVolume" />
  </div>
  <!-- </v-container> -->
  <!-- </v-theme-provider> -->
</template>
  
<script>
import { useTheme } from 'vuetify'

export default {
  data() {
    return {
      canvasWidth: '1920',
      canvasHeight: '1080',
      color: 'black',
      alertList: [
        ['HNDR', 'twitchNewFollower'],
        ['EGriZZ', 'twitchNewSubscriber'],
        ['NotLilBear', 'twitchFirstTimeChat'],
        ['KuHouse', 'twitchNewDonation']
      ],
      alertTemplates: {
        twitchNewFollower: {
          imageFile: 'twitch_alert_new_follower.png',
          textXOffset: 0,
          textYOffset: 450,
          audioId: 'twitch-new-follower-audio',
          audioFile: 'twitch_alert_new_follower_audio.mp3',
          audioVolume: 0.5,
          imageId: 'twitch-new-follower-img',
          imageWidth: 700,
          imageHeight: 700,
          textColor: '#6441a4',
        },
        twitchNewSubscriber: {
          imageFile: 'twitch_alert_new_subscriber.png',
          textXOffset: 0,
          textYOffset: 450,
          audioId: 'twitch-new-subscriber-audio',
          audioFile: 'twitch_alert_new_subscriber_audio.mp3',
          audioVolume: 0.5,
          imageId: 'twitch-new-subscriber-img',
          imageWidth: 700,
          imageHeight: 700,
          textColor: '#6441a4',
        },
        twitchFirstTimeChat: {
          imageFile: 'twitch_alert_first_time_chat.png',
          textXOffset: 0,
          textYOffset: 450,
          audioId: 'twitch-first-time-chat-audio',
          audioFile: 'twitch_alert_first_time_chat_audio.mp3',
          audioVolume: 0.5,
          imageId: 'twitch-first-time-chat-img',
          imageWidth: 700,
          imageHeight: 700,
          textColor: '#6441a4',
        },
        twitchNewDonation: {
          imageFile: 'twitch_alert_new_donation.jpg',
          textXOffset: 0,
          textYOffset: 400,
          audioId: 'twitch-new-donation-audio',
          audioFile: 'twitch_alert_new_donation_audio.mp3',
          audioVolume: 0.5,
          imageId: 'twitch-new-donation-img',
          imageWidth: 700,
          imageHeight: 700,
          textColor: '#c0ffa9',
        }
      }
    }
  },

  methods: {
    listenEvents(env) {
      const alertTimeout = 5000;
      const localUrl = 'ws://localhost:8080/eventsub';
      const prodUrl = 'wss://eventsub-beta.wss.twitch.tv/ws';
      const initialUrl = ((env === 'DEV') ? localUrl : prodUrl);
      let twitchUserName = 'bpafoshizle';
      let eventTypes = ['channel.follow', 'channel.subscribe'];
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
          const response = await fetch("/subscribe", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "types": eventTypes,
              "username": twitchUserName,
              "session_id": sessionId
            })
          });
          console.log(response.json());
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
            alertTemplate = 'twitchNewFollower';
            this.eventAlertBox(username, alertTemplate, alertTimeout);
          }
          else if (eventType === 'channel.subscribe') {
            alertTemplate = 'twitchNewSubscriber';
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
        const canvas = document.querySelector('#bg-canvas');
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
        console.log(props);
        return props;
      }
      const alertTemplate = this.alertTemplates[alertTemplateName];
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
        const canvas = document.querySelector('#bg-canvas');
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
        console.log(this)
        this.eventAlertBox(this.alertList[alertIndex][0], this.alertList[alertIndex][1], timeOut);
        alertIndex = (alertIndex + 1) % this.alertList.length;
        setTimeout(drawAlert, timeOut)
      }
      drawAlert();
    },

    drawOneAlert() {
      const timeOut = 5000;
      let alertIndex = 0;
      this.eventAlertBox(this.alertList[alertIndex][0], this.alertList[alertIndex][1], timeOut);
    }
  },

  mounted() {
    console.log(`Mounted Component OverlayCanvas`)
    const theme = useTheme();
    theme.global.name.value = 'overlayTheme';
    //this.listenEvents('PROD');
    this.loopDrawAlert();
  },

}
</script>

<style>
canvas {
  background: transparent;
  border: 1px solid black;
}
</style>