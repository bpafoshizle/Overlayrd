<template>
  <div>
    <v-container v-if="showFilesNotLoaded">
      <v-row align="center" no-gutters style="height: 150px;">
        <v-col align="center">
          <v-chip class="ma-2" color="error" variant="elevated" @click="selectDirectory">
            <v-icon start icon="mdi-file-document-remove"></v-icon>
            Overlayerd: Files not loaded
          </v-chip>
        </v-col>
      </v-row>
    </v-container>
    <canvas id="bgcanvasid" ref="bgcanvasref" :width="getCanvasWidth" :height="getCanvasHeight"
      :style="{ width: getCanvasWidth + 'px', height: getCanvasHeight + 'px' }" background="none"></canvas>
    <div style="display:none;">
      <img v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.imageId" :src="twitchEvent.imageFile"
        :width="twitchEvent.imageWidth" :height="twitchEvent.imageHeight" @load="loadedImage" @error="errorImage" />
      <audio v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.audioId" :src="twitchEvent.audioFile"
        :volume="twitchEvent.audioVolume" @load="loadedAudio" @error="errorAudio" />
    </div>
  </div>
</template>

<script>
import { useTheme } from 'vuetify'
import { mapWritableState, mapState } from 'pinia'
import { useSettingsStore, getIndexedDB, setIndexedDB } from '../stores/settings'
import { useDatabus } from '../stores/databus'

export default {

  data() {
    return {
      filesAccessible: true,
    }
  },

  watch: {
    positioningSelectedEvent(newEvent, oldEvent) {
      console.log(`positioningSelectedEvent previous: ${oldEvent}`);
      console.log(`positioningSelectedEvent current: ${newEvent}`);
      this.setupImage(newEvent);
    }
  },

  computed: {
    // gives access to settings inside the component
    ...mapWritableState(useSettingsStore, ['userEnteredSettings']),
    ...mapState(useSettingsStore, ['overlayProps']),
    ...mapWritableState(useSettingsStore, ['directoryHandle']),
    ...mapState(useSettingsStore, {
      getCheckedTwitchEvents(store) {
        return store.getCheckedTwitchEvents;
      },
      getCanvasWidth(store) {
        return store.getCanvasWidth;
      },
      getCanvasHeight(store) {
        return store.getCanvasHeight;
      },
    }),
    ...mapState(useDatabus, ['positioningSelectedEvent']),

    showFilesNotLoaded() {
      console.log(`checking if files are accessible: ${this.filesAccessible}`);
      return !this.filesAccessible;
    }
  },

  methods: {
    loadedImage(event) {
      console.log(`loaded image: ${event.target.id}`);
    },
    errorImage(event) {
      console.log(`error loading image: ${event.target.id}`);
      this.filesAccessible = false;
    },
    loadedAudio(event) {
      console.log(`loaded audio: ${event.target.id}`);
    },
    errorAudio(event) {
      console.log(`error loading audio: ${event.target.id}`);
      this.filesAccessible = false;
    },

    async selectDirectory() {
      console.log('selecting directory');
      this.directoryHandle = await window.showDirectoryPicker();
      console.log(`Picked directory ${this.directoryHandle.name}`);
      await this.loadFileHandles();
    },

    async verifyPermission(fileHandle, readWrite) {
      const options = {};
      if (readWrite) {
        options.mode = 'readwrite';
      }
      // Check if permission was already granted. If so, return true.
      if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
      }
      // Request permission. If the user grants permission, return true.
      if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
      }
      // The user didn't grant permission, so return false.
      return false;
    },

    async loadFileHandles() {
      if (this.directoryHandle) {
        let directoryPermitted = await this.verifyPermission(this.directoryHandle);
        if (directoryPermitted) {
          console.log('Got permission to access the directory');
          let allFilePermissions = [];
          await Promise.all(this.getCheckedTwitchEvents.map(async (twitchEvent) => {
            let imageFileHandle = await this.directoryHandle.getFileHandle(twitchEvent.imageFileName);
            let audioFileHandle = await this.directoryHandle.getFileHandle(twitchEvent.audioFileName);
            let imagePermitted = await this.verifyPermission(imageFileHandle);
            let audioPermitted = await this.verifyPermission(audioFileHandle);
            if (imagePermitted && audioPermitted) {
              console.log(`Got permission to access ${twitchEvent.imageFileName} and ${twitchEvent.audioFileName}`);
              allFilePermissions.push(true);
              let imageFile = await imageFileHandle.getFile();
              twitchEvent.imageFile = URL.createObjectURL(imageFile);
              let audioFile = await audioFileHandle.getFile();
              twitchEvent.audioFile = URL.createObjectURL(audioFile);
              await setIndexedDB({ key: twitchEvent.imageFileName, value: imageFileHandle });
              await setIndexedDB({ key: twitchEvent.audioFileName, value: audioFileHandle });
            } else {
              console.log(`No permission to access ${twitchEvent.imageFileName} or ${twitchEvent.audioFileName}`);
              allFilePermissions.push(false);
            }
          }));

          if (allFilePermissions.length > 0 && allFilePermissions.every(Boolean)) {
            console.log('All files accessible: loadFileHandles');
            this.filesAccessible = true;
          } else {
            console.log('Not all files accessible: loadFileHandles');
            console.log(allFilePermissions);
            this.filesAccessible = false;
          }
        } else {
          console.log('No permission to access the directory');
        }
      } else {
        console.log('No directory handle found');
      }
    },

    setupImage(eventId) {
      console.log('setupImage');
      const dpr = window.devicePixelRatio || 1;
      const imageId = this.getCheckedTwitchEvents.find(twitchEvent => twitchEvent.id === eventId).imageId;
      const origImage = document.getElementById(imageId);
      // let audio = document.getElementById(imageId.audioId);
      const canvas = document.querySelector('#bgcanvasid');
      const ctx = canvas.getContext('2d');

      const offsetX = canvas.offsetLeft;
      const offsetY = canvas.offsetTop;

      let startX;
      let startY;
      let isDown = false;


      let pi2 = Math.PI * 2;
      let resizerRadius = 16;
      let rr = resizerRadius * resizerRadius;
      let draggingResizer = { x: 0, y: 0 };
      let imageX = 50;
      let imageY = 50;
      let imageWidth, imageHeight, imageRight, imageBottom;
      let draggingImage = false;

      let img = new Image();
      img.onload = function () {
        imageWidth = origImage.width;
        imageHeight = origImage.height;
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;
        draw(true, false);
      };
      img.src = origImage.src;

      function logCanvasInfo() {
        console.log('Canvas width:', canvas.width);
        console.log('Canvas height:', canvas.height);
        console.log('Canvas offsetLeft:', canvas.offsetLeft);
        console.log('Canvas offsetTop:', canvas.offsetTop);
      }

      //log canvas info
      logCanvasInfo();

      function draw(withAnchors, withBorders) {
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // log the current state
        // console.log(`imageX: ${imageX}, imageY: ${imageY}, imageWidth: ${imageWidth}, imageHeight: ${imageHeight}, imageRight: ${imageRight}, imageBottom: ${imageBottom}`);

        // draw the image
        ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);

        // draw the image
        //ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);

        // optionally draw the draggable anchors
        if (withAnchors) {
          drawDragAnchor(imageX, imageY);
          drawDragAnchor(imageRight, imageY);
          drawDragAnchor(imageRight, imageBottom);
          drawDragAnchor(imageX, imageBottom);
        }

        // optionally draw the connecting anchor lines
        if (withBorders) {
          ctx.beginPath();
          ctx.moveTo(imageX, imageY);
          ctx.lineTo(imageRight, imageY);
          ctx.lineTo(imageRight, imageBottom);
          ctx.lineTo(imageX, imageBottom);
          ctx.closePath();
          ctx.stroke();
        }
      }

      function drawDragAnchor(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, resizerRadius, 0, pi2, false);
        ctx.closePath();
        ctx.fill();
      }

      function anchorHitTest(x, y) {

        var dx, dy;

        // top-left
        dx = x - imageX;
        dy = y - imageY;
        if (dx * dx + dy * dy <= rr) { return (0); }
        // top-right
        dx = x - imageRight;
        dy = y - imageY;
        if (dx * dx + dy * dy <= rr) { return (1); }
        // bottom-right
        dx = x - imageRight;
        dy = y - imageBottom;
        if (dx * dx + dy * dy <= rr) { return (2); }
        // bottom-left
        dx = x - imageX;
        dy = y - imageBottom;
        if (dx * dx + dy * dy <= rr) { return (3); }
        return (-1);

      }

      function hitImage(x, y) {
        return (x > imageX && x < imageX + imageWidth && y > imageY && y < imageY + imageHeight);
      }

      function handleMouseDown(e) {
        // Calculate offsetX and offsetY relative to canvas
        const testOffsetX = e.pageX - canvas.offsetLeft;
        const testOffsetY = e.pageY - canvas.offsetTop + canvas.scrollTop;

        console.log('Mouse position (pageX, pageY):', e.pageX, e.pageY);
        console.log('Mouse position on canvas (testOffsetX, testOffsetY):', testOffsetX, testOffsetY);

        startX = parseInt(e.pageX - offsetX);
        startY = parseInt(e.pageY - offsetY);
        draggingResizer = anchorHitTest(startX, startY);
        draggingImage = draggingResizer < 0 && hitImage(startX, startY);
      }

      function handleMouseUp(e) {
        draggingResizer = -1;
        draggingImage = false;
        draw(true, false);
      }

      function handleMouseOut(e) {
        handleMouseUp(e);
      }

      function handleMouseMove(e) {

        if (draggingResizer > -1) {

          let mouseX = parseInt(e.pageX - offsetX);
          let mouseY = parseInt(e.pageY - offsetY);

          // resize the image
          switch (draggingResizer) {
            case 0: //top-left
              imageX = mouseX;
              imageWidth = imageRight - mouseX;
              imageY = mouseY;
              imageHeight = imageBottom - mouseY;
              break;
            case 1: //top-right
              imageY = mouseY;
              imageWidth = mouseX - imageX;
              imageHeight = imageBottom - mouseY;
              break;
            case 2: //bottom-right
              imageWidth = mouseX - imageX;
              imageHeight = mouseY - imageY;
              break;
            case 3: //bottom-left
              imageX = mouseX;
              imageWidth = imageRight - mouseX;
              imageHeight = mouseY - imageY;
              break;
          }

          // enforce minimum dimensions of 25x25
          if (imageWidth < 25) { imageWidth = 25; }
          if (imageHeight < 25) { imageHeight = 25; }

          // set the image right and bottom
          imageRight = imageX + imageWidth;
          imageBottom = imageY + imageHeight;

          // redraw the image with resizing anchors
          draw(true, true);

        } else if (draggingImage) {

          let imageClick = false;

          let mouseX = parseInt(e.pageX - offsetX);
          let mouseY = parseInt(e.pageY - offsetY);

          // move the image by the amount of the latest drag
          var dx = mouseX - startX;
          var dy = mouseY - startY;
          imageX += dx;
          imageY += dy;
          imageRight += dx;
          imageBottom += dy;
          // reset the startXY for next time
          startX = mouseX;
          startY = mouseY;

          // redraw the image with border
          draw(false, true);

        }
      }

      const addEventListeners = () => {
        this.$refs.bgcanvasref.addEventListener('mousedown', function (e) {
          handleMouseDown(e);
        });
        this.$refs.bgcanvasref.addEventListener('mousemove', function (e) {
          handleMouseMove(e);
        });
        this.$refs.bgcanvasref.addEventListener('mouseup', function (e) {
          handleMouseUp(e);
        });
        this.$refs.bgcanvasref.addEventListener('mouseout', function (e) {
          handleMouseOut(e);
        });
      }

      const removeEventListeners = () => {
        this.$refs.bgcanvasref.removeEventListener('mousedown', function (e) {
          handleMouseDown(e);
        });
        this.$refs.bgcanvasref.removeEventListener('mousemove', function (e) {
          handleMouseMove(e);
        });
        this.$refs.bgcanvasref.removeEventListener('mouseup', function (e) {
          handleMouseUp(e);
        });
        this.$refs.bgcanvasref.removeEventListener('mouseout', function (e) {
          handleMouseOut(e);
        });
      }

      removeEventListeners();
      addEventListeners();
    },

  },

  async mounted() {
    const theme = useTheme();
    theme.global.name.value = 'overlayTheme';
    this.directoryHandle = await getIndexedDB('directoryHandle') || null;
  },

}
</script>

<style>
#bgcanvasid {
  border: 1px solid #000;
}

.v-theme--overlayTheme {
  background: none;
  background-color: rgba(0, 0, 0, 0);
}
</style>