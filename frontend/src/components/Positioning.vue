<template>
  <div>
    <v-container v-if="showFilesNotLoaded">
      <v-row>
        <v-col align="center">
          <v-chip class="ma-2" color="error" variant="elevated" @click="selectDirectory">
            <v-icon start icon="mdi-file-document-remove"></v-icon>
            Overlayerd: Files not loaded
          </v-chip>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="mediaSetup" fill-height>
      <v-row align="start" style="height: 50px;">

        <!-- Vertical Media Pixel Adjuster -->
        <v-col>
          <v-row align="start" style="height: 50px;">
            <v-btn @click="adjustMediaVertical('up')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-up-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustMediaVertical('down')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-down-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="mediaY" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryMediaVertical"></v-text-field>
          </v-row>
        </v-col>

        <!-- Horizontal Media Pixel Adjuster -->
        <v-col>
          <v-row>
            <v-btn @click="adjustMediaHorizontal('left')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-left-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustMediaHorizontal('right')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-right-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="mediaX" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryMediaHorizontal"></v-text-field>
          </v-row>
        </v-col>

        <!-- Vertical Text Pixel Adjuster -->
        <v-col>
          <v-row align="start" style="height: 50px;">
            <v-btn @click="adjustTextVertical('up')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-up-bold" size="24"></v-icon>
              <v-icon icon="mdi-format-color-text" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustTextVertical('down')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-down-bold" size="24"></v-icon>
              <v-icon icon="mdi-format-color-text" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="textYOffset" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryTextVertical"></v-text-field>
          </v-row>
        </v-col>

        <!-- Horizontal Text Pixel Adjuster -->
        <v-col>
          <v-row>
            <v-btn @click="adjustTextHorizontal('left')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-left-bold" size="24"></v-icon>
              <v-icon icon="mdi-format-color-text" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustTextHorizontal('right')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-right-bold" size="24"></v-icon>
              <v-icon icon="mdi-format-color-text" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="textXOffset" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryTextHorizontal"></v-text-field>
          </v-row>
        </v-col>

        <v-col>
          <v-row>
            <v-btn @click="showFontColorPicker = !showFontColorPicker" color="primary" height="50">
              <v-icon icon="mdi-format-color-fill" size="24"></v-icon>
              <v-icon icon="mdi-format-color-text" size="24"></v-icon>
            </v-btn>
            <!-- Color picker dialog -->
            <v-dialog v-model="showFontColorPicker" max-width="400">
              <v-card color="background">
                <v-card-title>
                  <span class="headline">Select a Font Color</span>
                </v-card-title>
                <v-card-text>
                  <!-- Color picker component -->
                  <v-color-picker v-model="selectedFontColor" :modes="['hex']" />
                </v-card-text>
                <v-card-actions>
                  <!-- Close button -->
                  <v-btn color="primary" @click="onFontColorSelected">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
        </v-col>
        <v-col>
          <v-row>
            <v-select v-model="selectedFontSize" :items="fontSizes" label="Font Size" outlined hide-details>
            </v-select>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <canvas id="bgcanvasid" ref="bgcanvasref" :width="getCanvasWidth" :height="getCanvasHeight"
      :style="{ width: getCanvasWidth + 'px', height: getCanvasHeight + 'px' }" background="none"></canvas>
    <div style="display:none;">
      <video v-for="widget in getCheckedWidgets" :id="widget.mediaId" :src="widget.mediaFile || false" :width="700"
        :height="700" @load="loadedMedia" @error="errorMedia" controls loop autoplay />
      <img v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.mediaId" :src="twitchEvent.mediaFile || false"
        :width="700" :height="700" @load="loadedMedia" @error="errorMedia" />
      <audio v-for="checked in getAllCheckedEventsAndWidgets" :id="checked.audioId" :src="checked.audioFile || false"
        :volume="checked.audioVolume" @load="loadedAudio" @error="errorAudio" />
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
      mediaSetup: false,
      filesAccessible: true,
      origMedia: undefined,
      workingMediaObject: undefined,
      workingMediaElement: undefined,
      workingAudio: undefined,
      showFontColorPicker: false,
      exampleText: 'Example Text',
      fontSizes: [14, 24, 36, 56],
      textYOffset: 0,
      textXOffset: 0,
      mediaWidth: 700,
      mediaHeight: 700,
      mediaX: 50,
      mediaY: 50,
      selectedFontSize: 56,
      selectedFontColor: '#000000', // Default color (black)
      iconTop: 200, // Initial icon position (adjust as needed)
      iconLeft: 200, // Initial icon position (adjust as needed)
      pi2: Math.PI * 2,
      resizerRadius: 8,
      draggingResizer: { x: 0, y: 0 },
      mediaRight: this.mediaX + this.mediaWidth,
      mediaBottom: this.mediaY + this.mediaHeight,
      draggingMedia: false,
      emojis: [
        { emoji: '▶️', x: 0, y: 0, width: 24, height: 24 },
        { emoji: '♻', x: 30, y: 0, width: 24, height: 24 },
        // Add more emojis as needed
      ],
    }
  },

  watch: {
    positioningSelectedEvent(newEvent, oldEvent) {
      //console.log(`positioningSelectedEvent previous: ${oldEvent}`);
      //console.log(`positioningSelectedEvent current: ${newEvent}`);
      this.setupMedia(newEvent);
    },
    mediaY(newValue, oldValue) {
      //console.log(`mediaY: ${newValue}`);
      this.workingMediaObject.mediaY = newValue;
      this.drawAll();
    },
    mediaX(newValue, oldValue) {
      //console.log(`mediaX: ${newValue}`);
      this.workingMediaObject.mediaX = newValue;
      this.drawAll();
    },
    mediaWidth(newValue, oldValue) {
      //console.log(`mediaWidth: ${newValue}`);
      this.workingMediaObject.mediaWidth = newValue;
      this.drawAll();
    },
    mediaHeight(newValue, oldValue) {
      //console.log(`mediaHeight: ${newValue}`);
      this.workingMediaObject.mediaHeight = newValue;
      this.drawAll();
    },
    textYOffset(newValue, oldValue) {
      //console.log(`textYOffset: ${newValue}`);
      this.workingMediaObject.textYOffset = newValue;
      this.drawAll();
    },
    textXOffset(newValue, oldValue) {
      this.workingMediaObject.textXOffset = newValue;
      this.drawAll();
    },
    selectedFontSize(newValue, oldValue) {
      this.workingMediaObject.textSize = newValue;
      this.drawAll();
    },
    selectedFontColor(newValue, oldValue) {
      this.workingMediaObject.textColor = newValue;
    },

  },

  computed: {
    // gives access to settings inside the component
    ...mapWritableState(useSettingsStore, ['userEnteredSettings']),
    ...mapState(useSettingsStore, ['overlayProps']),
    ...mapWritableState(useSettingsStore, ['directoryHandle']),
    ...mapState(useSettingsStore, {
      getAllCheckedEventsAndWidgets(store) {
        return store.getAllCheckedEventsAndWidgets;
      },
      getCheckedTwitchEvents(store) {
        return store.getCheckedTwitchEvents;
      },
      getCheckedWidgets(store) {
        return store.getCheckedWidgets;
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
    },

    getCanvas() {
      return this.$refs.bgcanvasref;
    },

    getCanvasContext() {
      return this.$refs.bgcanvasref.getContext('2d');
    },

    getCanvasOffsetX() {
      return this.getCanvas.offsetLeft;
    },

    getCanvasOffsetY() {
      return this.getCanvas.offsetTop;
    },
  },

  methods: {
    directEntryMediaVertical() {
      this.mediaY = parseInt(this.mediaY);
    },
    directEntryMediaHorizontal() {
      this.mediaX = parseInt(this.mediaX);
    },
    adjustMediaVertical(direction) {
      if (direction === 'up') {
        this.mediaY--;
      } else if (direction === 'down') {
        this.mediaY++;
      }
    },
    adjustMediaHorizontal(direction) {
      if (direction === 'left') {
        this.mediaX--;
      } else if (direction === 'right') {
        this.mediaX++;
      }
    },
    directEntryTextVertical() {
      this.textYOffset = parseInt(this.textYOffset);
    },
    directEntryTextHorizontal() {
      this.textXOffset = parseInt(this.textXOffset);
    },
    adjustTextVertical(direction) {
      if (direction === 'up') {
        this.textYOffset--;
      } else if (direction === 'down') {
        this.textYOffset++;
      }
    },
    adjustTextHorizontal(direction) {
      if (direction === 'left') {
        this.textXOffset--;
      } else if (direction === 'right') {
        this.textXOffset++;
      }
    },
    onFontColorSelected() {
      // Close the color picker dialog automatically.
      this.showFontColorPicker = false;
      //console.log(`Font color selected: ${this.selectedFontColor}`);
      this.drawAll();
    },
    loadedMedia(event) {
      console.log(`loaded media: ${event.target.id}`);
    },
    errorMedia(event) {
      console.log(`error loading media: ${event.target.id}`);
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
          await Promise.all(this.getAllCheckedEventsAndWidgets.map(async (checked) => {
            let mediaFileHandle = await this.directoryHandle.getFileHandle(checked.mediaFileName);
            let audioFileHandle = await this.directoryHandle.getFileHandle(checked.audioFileName);
            let mediaPermitted = await this.verifyPermission(mediaFileHandle);
            let audioPermitted = await this.verifyPermission(audioFileHandle);
            if (mediaPermitted && audioPermitted) {
              console.log(`Got permission to access ${checked.mediaFileName} and ${checked.audioFileName}`);
              allFilePermissions.push(true);
              let mediaFile = await mediaFileHandle.getFile();
              checked.mediaFile = URL.createObjectURL(mediaFile);
              let audioFile = await audioFileHandle.getFile();
              checked.audioFile = URL.createObjectURL(audioFile);
              await setIndexedDB({ key: checked.mediaFileName, value: mediaFileHandle });
              await setIndexedDB({ key: checked.audioFileName, value: audioFileHandle });
            } else {
              console.log(`No permission to access ${checked.mediaFileName} or ${checked.audioFileName}`); s
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

    logCanvasInfo() {
      const canvas = this.getCanvas;
      console.log('Canvas width:', canvas.width);
      console.log('Canvas height:', canvas.height);
      console.log('Canvas offsetLeft:', canvas.offsetLeft);
      console.log('Canvas offsetTop:', canvas.offsetTop);
    },

    drawDragAnchor(x, y) {
      const ctx = this.getCanvasContext;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(x, y, this.resizerRadius, 0, this.pi2, false);
      ctx.closePath();
      ctx.fill();
    },

    anchorHitTest(x, y) {
      const rr = this.resizerRadius * this.resizerRadius;
      let dx, dy;
      // top-left
      dx = x - this.mediaX;
      dy = y - this.mediaY;
      if (dx * dx + dy * dy <= rr) { return (0); }
      // top-right
      dx = x - this.mediaRight;
      dy = y - this.mediaY;
      if (dx * dx + dy * dy <= rr) { return (1); }
      // bottom-right
      dx = x - this.mediaRight;
      dy = y - this.mediaBottom;
      if (dx * dx + dy * dy <= rr) { return (2); }
      // bottom-left
      dx = x - this.mediaX;
      dy = y - this.mediaBottom;
      if (dx * dx + dy * dy <= rr) { return (3); }
      return (-1);
    },

    hitMedia(x, y) {
      return (x > this.mediaX && x < this.mediaX + this.mediaWidth && y > this.mediaY && y < this.mediaY + this.mediaHeight);
    },

    handleMouseDown(e) {
      //log canvas info
      this.logCanvasInfo();
      this.startX = parseInt(e.pageX - this.getCanvasOffsetX);
      this.startY = parseInt(e.pageY - this.getCanvasOffsetY);

      //console.log('Mouse position (pageX, pageY):', e.pageX, e.pageY);
      //console.log('Mouse position on canvas (startX, startY):', this.startX, this.startY);

      this.draggingResizer = this.anchorHitTest(this.startX, this.startY);
      this.draggingMedia = this.draggingResizer < 0 && this.hitMedia(this.startX, this.startY);
    },

    handleMouseUp(e) {
      this.draggingResizer = -1;
      this.draggingMedia = false;
      this.drawAll();
    },

    handleMouseOut(e) {
      this.handleMouseUp(e);
    },

    handleMouseMove(e) {
      if (this.draggingResizer > -1) {

        const mouseX = parseInt(e.pageX - this.getCanvasOffsetX);
        const mouseY = parseInt(e.pageY - this.getCanvasOffsetY);

        // resize the media
        switch (this.draggingResizer) {
          case 0: //top-left
            this.mediaX = mouseX;
            this.mediaWidth = this.mediaRight - mouseX;
            this.mediaY = mouseY;
            this.mediaHeight = this.mediaBottom - mouseY;
            break;
          case 1: //top-right
            this.mediaY = mouseY;
            this.mediaWidth = mouseX - this.mediaX;
            this.mediaHeight = this.mediaBottom - mouseY;
            break;
          case 2: //bottom-right
            this.mediaWidth = mouseX - this.mediaX;
            this.mediaHeight = mouseY - this.mediaY;
            break;
          case 3: //bottom-left
            this.mediaX = mouseX;
            this.mediaWidth = this.mediaRight - mouseX;
            this.mediaHeight = mouseY - this.mediaY;
            break;
        }

        // enforce minimum dimensions of 25x25
        if (this.mediaWidth < 25) { this.mediaWidth = 25; }
        if (this.mediaHeight < 25) { this.mediaHeight = 25; }

        // set the media right and bottom
        this.mediaRight = this.mediaX + this.mediaWidth;
        this.mediaBottom = this.mediaY + this.mediaHeight;

        // redraw the media with resizing anchors
        this.draw(true, true);
        this.drawIcons();
        this.drawText();

      } else if (this.draggingMedia) {

        const mouseX = parseInt(e.pageX - this.getCanvasOffsetX);
        const mouseY = parseInt(e.pageY - this.getCanvasOffsetY);

        // move the media by the amount of the latest drag
        let dx = mouseX - this.startX;
        let dy = mouseY - this.startY;
        this.mediaX += dx;
        this.mediaY += dy;
        this.mediaRight += dx;
        this.mediaBottom += dy;
        // reset the startXY for next time
        this.startX = mouseX;
        this.startY = mouseY;

        // redraw the media with border and the icons
        this.draw(false, true);
        this.drawIcons();
        this.drawText();
      }
    },

    handleEmojiClick(e) {
      const x = parseInt(e.pageX - this.getCanvasOffsetX);
      const y = parseInt(e.pageY - this.getCanvasOffsetY);

      // Log valid click x min and max and y min and max ranges for each emoji
      // this.emojis.forEach((emojiData) => {
      //   console.log(`Emoji: ${emojiData.emoji} x: ${this.iconLeft + emojiData.x} - ${this.iconLeft + emojiData.x + emojiData.width} y: ${this.iconTop + emojiData.y} - ${this.iconTop + emojiData.y + emojiData.height}`);
      // });

      // Check if the click is inside the bounding box of each emoji
      this.emojis.forEach((emojiData) => {
        if (
          x >= this.iconLeft + emojiData.x &&
          x <= this.iconLeft + emojiData.x + emojiData.width &&
          y >= this.iconTop + emojiData.y &&
          y <= this.iconTop + emojiData.y + emojiData.height
        ) {
          // Trigger the appropriate function based on the clicked emoji
          this.handleEmojiClickEvent(emojiData.emoji);
        }
      });
    },

    handleEmojiClickEvent(emoji) {
      // Handle the click event based on the clicked emoji
      if (emoji === '▶️') {
        // play audio
        this.workingAudio.play();
        //console.log('▶️ emoji clicked!');
      } else if (emoji === '♻') {
        // Reset media to original position
        this.resetMedia();
        //console.log('♻ emoji clicked!');
      }
      // Add more cases for other emojis as needed
    },

    addCanvasEventListeners() {
      this.$refs.bgcanvasref.addEventListener('mousedown', this.handleMouseDown);
      this.$refs.bgcanvasref.addEventListener('mousemove', this.handleMouseMove);
      this.$refs.bgcanvasref.addEventListener('mouseup', this.handleMouseUp);
      this.$refs.bgcanvasref.addEventListener('mouseout', this.handleMouseOut);
      this.$refs.bgcanvasref.addEventListener('click', this.handleEmojiClick);
    },

    removeCanvasEventListeners() {
      this.$refs.bgcanvasref.removeEventListener('mousedown', this.handleMouseDown);
      this.$refs.bgcanvasref.removeEventListener('mousemove', this.handleMouseMove);
      this.$refs.bgcanvasref.removeEventListener('mouseup', this.handleMouseUp);
      this.$refs.bgcanvasref.removeEventListener('mouseout', this.handleMouseOut);
      this.$refs.bgcanvasref.removeEventListener('click', this.handleEmojiClick);
    },

    drawAll() {
      this.draw(true, false);
      this.drawIcons();
      this.drawText();
    },

    drawText() {
      const ctx = this.getCanvasContext;
      // Customize text styles (font size, color, etc.)
      ctx.font = `${this.selectedFontSize}px Monaco`; // Adjust the font size and family as needed
      ctx.fillStyle = this.selectedFontColor; // Adjust text color as needed
      ctx.textAlign = 'center';

      // Calculate the position to center the text
      const textX = this.textXOffset + this.mediaX + (this.mediaWidth / 2);
      const textY = this.textYOffset + this.mediaY + (this.mediaHeight / 2);

      // Draw the text in the center of the media
      ctx.fillText(this.exampleText, textX, textY);
    },

    drawIcons() {
      this.iconTop = this.mediaBottom + 40; // Adjust icon position (if needed)
      this.iconLeft = this.workingMediaObject.mediaX + 40; // Adjust icon position (if needed)
      const ctx = this.getCanvasContext;
      // Customize icon styles (font size, color, etc.)
      ctx.font = '26px serif';
      ctx.fillStyle = "black";
      ctx.textBaseline = 'top'; // Important to line up click hitbox with emoji's rendered position
      ctx.textAlign = 'left';

      // Draw the emojis
      this.emojis.forEach((emojiData) => {
        ctx.fillText(emojiData.emoji, this.iconLeft + emojiData.x, this.iconTop + emojiData.y);
      });
    },

    draw(withAnchors, withBorders) {
      const canvas = this.getCanvas;
      const ctx = this.getCanvasContext;

      // clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // composite operation to combine background
      ctx.globalCompositeOperation = "multiply";


      // draw the media
      ctx.drawImage(this.workingMediaElement, this.mediaX, this.mediaY, this.mediaWidth, this.mediaHeight);

      // optionally draw the draggable anchors
      if (withAnchors) {
        this.drawDragAnchor(this.mediaX, this.mediaY);
        this.drawDragAnchor(this.mediaRight, this.mediaY);
        this.drawDragAnchor(this.mediaRight, this.mediaBottom);
        this.drawDragAnchor(this.mediaX, this.mediaBottom);
      }

      // optionally draw the connecting anchor lines
      if (withBorders) {
        ctx.beginPath();
        ctx.moveTo(this.mediaX, this.mediaY);
        ctx.lineTo(this.mediaRight, this.mediaY);
        ctx.lineTo(this.mediaRight, this.mediaBottom);
        ctx.lineTo(this.mediaX, this.mediaBottom);
        ctx.closePath();
        ctx.stroke();
      }

    },

    async setupMedia(eventId) {
      console.log('setupMedia');
      this.workingMediaObject = this.getAllCheckedEventsAndWidgets.find(checked => checked.id === eventId);
      this.workingAudio = new Audio(this.workingMediaObject.audioFile);

      function handleMediaLoad() {
        console.log("media loaded");
        this.mediaWidth = this.workingMediaObject.mediaWidth || 300;
        this.mediaHeight = this.workingMediaObject.mediaHeight || 300;
        this.mediaX = this.workingMediaObject.mediaX || 50;
        this.mediaY = this.workingMediaObject.mediaY || 50;
        this.mediaRight = this.mediaX + this.mediaWidth;
        this.mediaBottom = this.mediaY + this.mediaHeight;
        this.textYOffset = this.workingMediaObject.textYOffset || 0;
        this.textXOffset = this.workingMediaObject.textXOffset || 0;
        this.selectedFontSize = this.workingMediaObject.textSize || 56;
        this.selectedFontColor = this.workingMediaObject.textColor || '#000000'; // Default color (black)
        this.drawAll();
      }

      if (this.workingMediaObject.mediaType === 'img') {
        this.workingMediaElement = new Image();
        this.workingMediaElement.onload = handleMediaLoad.bind(this);
        this.workingMediaElement.src = this.workingMediaObject.mediaFile;
      }
      else if (this.workingMediaObject.mediaType === "video") {
        this.workingMediaElement = document.createElement('video');
        this.workingMediaElement.loop = true;
        this.workingMediaElement.controls = true;
        this.workingMediaElement.type = "video/webm";
        this.workingMediaElement.addEventListener('loadedmetadata', handleMediaLoad.bind(this));
        this.workingMediaElement.src = this.workingMediaObject.mediaFile;
        this.workingMediaElement.play(); // Add play() method call
      }
      else {
        // Handle unsupported media types
        console.error('Unsupported media type:', this.workingMediaObject.mediaType);
      }



      this.removeCanvasEventListeners();
      this.addCanvasEventListeners();
      this.mediaSetup = true;
    },

    resetMedia() {
      console.log('resetMedia');
      this.mediaWidth = 700;
      this.mediaHeight = 700;
      this.mediaX = 50;
      this.mediaY = 50;
      this.mediaRight = this.mediaX + this.mediaWidth;
      this.mediaBottom = this.mediaY + this.mediaHeight;
      this.textYOffset = 0;
      this.textXOffset = 0;
      this.selectedFontSize = 56;
      this.selectedFontColor = '#000000'; // Default color (black)
      this.draggingMedia = false;
      this.drawAll();
    }
  },

  async mounted() {
    const theme = useTheme();
    theme.global.name.value = 'overlayTheme';
    this.directoryHandle = await getIndexedDB('directoryHandle') || null;
  },

  beforeDestroy() {
    removeCanvasEventListeners();
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

/* .v-input--density-compact {
  --v-input-control-height: 36px;
  --v-input-padding-top: 0px;
  --v-input-padding-bottom: 0px;
  --select-chips-margin-bottom: 0px;
}

.v-text-field {
  --v-input-control-height: 36px;
} */

.v-input__control {
  height: 50px;
}
</style>