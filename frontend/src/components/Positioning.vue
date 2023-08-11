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
    <v-container v-if="imageSetup" fill-height>
      <v-row align="start" style="height: 50px;">

        <!-- Vertical Image Pixel Adjuster -->
        <v-col>
          <v-row align="start" style="height: 50px;">
            <v-btn @click="adjustImageVertical('up')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-up-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustImageVertical('down')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-down-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="imageY" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryImageVertical"></v-text-field>
          </v-row>
        </v-col>

        <!-- Horizontal Image Pixel Adjuster -->
        <v-col>
          <v-row>
            <v-btn @click="adjustImageHorizontal('left')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-left-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-btn @click="adjustImageHorizontal('right')" color="primary" height="50" class="mx-1 px-1">
              <v-icon icon="mdi-arrow-right-bold" size="24"></v-icon>
              <v-icon icon="mdi-image" size="24"></v-icon>
            </v-btn>
            <v-text-field v-model="imageX" outlined hide-details class="mx-1 px-1"
              @keyup.enter="directEntryImageHorizontal"></v-text-field>
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
            <v-text-field v-model="textOffsetVerticalPixels" outlined hide-details class="mx-1 px-1"
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
            <v-text-field v-model="textOffsetHorizontalPixels" outlined hide-details class="mx-1 px-1"
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
      <img v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.imageId" :src="twitchEvent.imageFile || false"
        :width="700" :height="700" @load="loadedImage" @error="errorImage" />
      <audio v-for="twitchEvent in getCheckedTwitchEvents" :id="twitchEvent.audioId" :src="twitchEvent.audioFile || false"
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
      imageSetup: false,
      filesAccessible: true,
      origImage: undefined,
      workingTwitchEvent: undefined,
      workingImg: undefined,
      workingAudio: undefined,
      showFontColorPicker: false,
      exampleText: 'Example Text',
      fontSizes: [14, 24, 36, 56],
      textOffsetVerticalPixels: 0,
      textOffsetHorizontalPixels: 0,
      imageX: 50,
      imageY: 50,
      selectedFontSize: 56,
      selectedFontColor: '#000000', // Default color (black)
      iconTop: 200, // Initial icon position (adjust as needed)
      iconLeft: 200, // Initial icon position (adjust as needed)
      pi2: Math.PI * 2,
      resizerRadius: 8,
      draggingResizer: { x: 0, y: 0 },
      imageRight: 750,
      imageBottom: 750,
      draggingImage: false,
      emojis: [
        { emoji: '▶️', x: 0, y: 0, width: 24, height: 24 },
        { emoji: '♻', x: 30, y: 0, width: 24, height: 24 },
        // Add more emojis as needed
      ],
    }
  },

  watch: {
    positioningSelectedEvent(newEvent, oldEvent) {
      console.log(`positioningSelectedEvent previous: ${oldEvent}`);
      console.log(`positioningSelectedEvent current: ${newEvent}`);
      this.setupImage(newEvent);
    },
    imageY(newValue, oldValue) {
      console.log(`imageY: ${newValue}`);
      this.workingTwitchEvent.imageY = newValue;
      this.drawAll();
    },
    imageX(newValue, oldValue) {
      console.log(`imageX: ${newValue}`);
      this.workingTwitchEvent.imageX = newValue;
      this.drawAll();
    },
    textOffsetVerticalPixels(newValue, oldValue) {
      console.log(`textOffsetVerticalPixels: ${newValue}`);
      this.workingTwitchEvent.textYOffset = newValue;
      this.drawAll();
    },
    textOffsetHorizontalPixels(newValue, oldValue) {
      this.workingTwitchEvent.textXOffset = newValue;
      this.drawAll();
    },
    selectedFontSize(newValue, oldValue) {
      this.workingTwitchEvent.textSize = newValue;
      this.drawAll();
    },
    selectedFontColor(newValue, oldValue) {
      this.workingTwitchEvent.textColor = newValue;
    },

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
    directEntryImageVertical() {
      this.imageY = parseInt(this.imageY);
    },
    directEntryImageHorizontal() {
      this.imageX = parseInt(this.imageX);
    },
    adjustImageVertical(direction) {
      if (direction === 'up') {
        this.imageY--;
      } else if (direction === 'down') {
        this.imageY++;
      }
    },
    adjustImageHorizontal(direction) {
      if (direction === 'left') {
        this.imageX--;
      } else if (direction === 'right') {
        this.imageX++;
      }
    },
    directEntryTextVertical() {
      this.textOffsetVerticalPixels = parseInt(this.textOffsetVerticalPixels);
    },
    directEntryTextHorizontal() {
      this.textOffsetHorizontalPixels = parseInt(this.textOffsetHorizontalPixels);
    },
    adjustTextVertical(direction) {
      if (direction === 'up') {
        this.textOffsetVerticalPixels--;
      } else if (direction === 'down') {
        this.textOffsetVerticalPixels++;
      }
    },
    adjustTextHorizontal(direction) {
      if (direction === 'left') {
        this.textOffsetHorizontalPixels--;
      } else if (direction === 'right') {
        this.textOffsetHorizontalPixels++;
      }
    },
    onFontColorSelected() {
      // Close the color picker dialog automatically.
      this.showFontColorPicker = false;
      console.log(`Font color selected: ${this.selectedFontColor}`);
      this.drawAll();
    },
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
      dx = x - this.workingTwitchEvent.imageX;
      dy = y - this.workingTwitchEvent.imageY;
      if (dx * dx + dy * dy <= rr) { return (0); }
      // top-right
      dx = x - this.imageRight;
      dy = y - this.workingTwitchEvent.imageY;
      if (dx * dx + dy * dy <= rr) { return (1); }
      // bottom-right
      dx = x - this.imageRight;
      dy = y - this.imageBottom;
      if (dx * dx + dy * dy <= rr) { return (2); }
      // bottom-left
      dx = x - this.workingTwitchEvent.imageX;
      dy = y - this.imageBottom;
      if (dx * dx + dy * dy <= rr) { return (3); }
      return (-1);
    },

    hitImage(x, y) {
      return (x > this.workingTwitchEvent.imageX && x < this.workingTwitchEvent.imageX + this.workingTwitchEvent.imageWidth && y > this.workingTwitchEvent.imageY && y < this.workingTwitchEvent.imageY + this.workingTwitchEvent.imageHeight);
    },

    handleMouseDown(e) {
      //log canvas info
      this.logCanvasInfo();
      this.startX = parseInt(e.pageX - this.getCanvasOffsetX);
      this.startY = parseInt(e.pageY - this.getCanvasOffsetY);

      console.log('Mouse position (pageX, pageY):', e.pageX, e.pageY);
      console.log('Mouse position on canvas (startX, startY):', this.startX, this.startY);

      this.draggingResizer = this.anchorHitTest(this.startX, this.startY);
      this.draggingImage = this.draggingResizer < 0 && this.hitImage(this.startX, this.startY);
    },

    handleMouseUp(e) {
      this.draggingResizer = -1;
      this.draggingImage = false;
      this.drawAll();
    },

    handleMouseOut(e) {
      this.handleMouseUp(e);
    },

    handleMouseMove(e) {
      if (this.draggingResizer > -1) {

        const mouseX = parseInt(e.pageX - this.getCanvasOffsetX);
        const mouseY = parseInt(e.pageY - this.getCanvasOffsetY);

        // resize the image
        switch (this.draggingResizer) {
          case 0: //top-left
            this.imageX = mouseX;
            this.workingTwitchEvent.imageWidth = this.imageRight - mouseX;
            this.workingTwitchEvent.imageY = mouseY;
            this.workingTwitchEvent.imageHeight = this.imageBottom - mouseY;
            break;
          case 1: //top-right
            this.imageY = mouseY;
            this.workingTwitchEvent.imageWidth = mouseX - this.workingTwitchEvent.imageX;
            this.workingTwitchEvent.imageHeight = this.imageBottom - mouseY;
            break;
          case 2: //bottom-right
            this.imageWidth = mouseX - this.workingTwitchEvent.imageX;
            this.workingTwitchEvent.imageHeight = mouseY - this.workingTwitchEvent.imageY;
            break;
          case 3: //bottom-left
            this.imageX = mouseX;
            this.workingTwitchEvent.imageWidth = this.imageRight - mouseX;
            this.workingTwitchEvent.imageHeight = mouseY - this.workingTwitchEvent.imageY;
            break;
        }

        // enforce minimum dimensions of 25x25
        if (this.workingTwitchEvent.imageWidth < 25) { this.workingTwitchEvent.imageWidth = 25; }
        if (this.workingTwitchEvent.imageHeight < 25) { this.workingTwitchEvent.imageHeight = 25; }

        // set the image right and bottom
        // this.imageRight = this.workingTwitchEvent.imageX + this.workingTwitchEvent.imageWidth;
        // this.imageBottom = this.workingTwitchEvent.imageY + this.workingTwitchEvent.imageHeight;

        // redraw the image with resizing anchors
        this.draw(true, true);

      } else if (this.draggingImage) {

        const mouseX = parseInt(e.pageX - this.getCanvasOffsetX);
        const mouseY = parseInt(e.pageY - this.getCanvasOffsetY);

        // move the image by the amount of the latest drag
        let dx = mouseX - this.startX;
        let dy = mouseY - this.startY;
        this.imageX += dx;
        this.imageY += dy;
        this.imageRight += dx;
        this.imageBottom += dy;
        // reset the startXY for next time
        this.startX = mouseX;
        this.startY = mouseY;

        // redraw the image with border and the icons
        this.draw(false, true);
        this.drawIcons();
        this.drawText();
      }
    },

    handleEmojiClick(e) {
      const x = parseInt(e.pageX - this.getCanvasOffsetX);
      const y = parseInt(e.pageY - this.getCanvasOffsetY);

      // Log valid click x min and max and y min and max ranges for each emoji
      this.emojis.forEach((emojiData) => {
        console.log(`Emoji: ${emojiData.emoji} x: ${this.iconLeft + emojiData.x} - ${this.iconLeft + emojiData.x + emojiData.width} y: ${this.iconTop + emojiData.y} - ${this.iconTop + emojiData.y + emojiData.height}`);
      });

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
        console.log('▶️ emoji clicked!');
      } else if (emoji === '♻') {
        // Reset image to original position
        this.resetImage();
        console.log('♻ emoji clicked!');
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
      const textX = this.textOffsetHorizontalPixels + this.workingTwitchEvent.imageX + (this.workingTwitchEvent.imageWidth / 2);
      const textY = this.textOffsetVerticalPixels + this.workingTwitchEvent.imageY + (this.workingTwitchEvent.imageHeight / 2);

      // Draw the text in the center of the image
      ctx.fillText(this.exampleText, textX, textY);
    },

    drawIcons() {
      this.iconTop = this.imageBottom + 40; // Adjust icon position (if needed)
      this.iconLeft = this.workingTwitchEvent.imageX + 40; // Adjust icon position (if needed)
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

      // draw the image
      ctx.drawImage(this.workingImg, this.workingTwitchEvent.imageX, this.workingTwitchEvent.imageY, this.workingTwitchEvent.imageWidth, this.workingTwitchEvent.imageHeight);

      // optionally draw the draggable anchors
      if (withAnchors) {
        this.drawDragAnchor(this.workingTwitchEvent.imageX, this.workingTwitchEvent.imageY);
        this.drawDragAnchor(this.imageRight, this.workingTwitchEvent.imageY);
        this.drawDragAnchor(this.imageRight, this.imageBottom);
        this.drawDragAnchor(this.workingTwitchEvent.imageX, this.imageBottom);
      }

      // optionally draw the connecting anchor lines
      if (withBorders) {
        ctx.beginPath();
        ctx.moveTo(this.workingTwitchEvent.imageX, this.workingTwitchEvent.imageY);
        ctx.lineTo(this.imageRight, this.workingTwitchEvent.imageY);
        ctx.lineTo(this.imageRight, this.imageBottom);
        ctx.lineTo(this.workingTwitchEvent.imageX, this.imageBottom);
        ctx.closePath();
        ctx.stroke();
      }
    },

    async setupImage(eventId) {
      console.log('setupImage');
      this.workingTwitchEvent = this.getCheckedTwitchEvents.find(twitchEvent => twitchEvent.id === eventId);
      this.workingAudio = new Audio(this.workingTwitchEvent.audioFile);
      this.workingImg = new Image();

      this.workingImg.onload = () => {
        console.log("image loaded");
        this.workingTwitchEvent.imageWidth = this.workingTwitchEvent.imageWidth || this.origImage.width;
        this.workingTwitchEvent.imageHeight = this.workingTwitchEvent.imageHeight || this.origImage.height;
        this.imageX = this.workingTwitchEvent.imageX || 50;
        this.imageY = this.workingTwitchEvent.imageY || 50;
        this.imageRight = this.workingTwitchEvent.imageX + this.workingTwitchEvent.imageWidth;
        this.imageBottom = this.workingTwitchEvent.imageY + this.workingTwitchEvent.imageHeight;
        this.textOffsetVerticalPixels = this.workingTwitchEvent.textYOffset || 0;
        this.textOffsetHorizontalPixels = this.workingTwitchEvent.textXOffset || 0;
        this.selectedFontSize = this.workingTwitchEvent.textSize || 56;
        this.selectedFontColor = this.workingTwitchEvent.textColor || '#000000'; // Default color (black)
        this.drawAll();
      };
      this.workingImg.src = this.workingTwitchEvent.imageFile;

      this.removeCanvasEventListeners();
      this.addCanvasEventListeners();
      this.imageSetup = true;
    },

    resetImage() {
      console.log('resetImage');
      this.workingTwitchEvent.imageWidth = 700;
      this.workingTwitchEvent.imageHeight = 700;
      this.workingTwitchEvent.imageX = 50;
      this.workingTwitchEvent.imageY = 50;
      this.imageRight = this.workingTwitchEvent.imageX + this.workingTwitchEvent.imageWidth;
      this.imageBottom = this.workingTwitchEvent.imageY + this.workingTwitchEvent.imageHeight;
      this.textOffsetVerticalPixels = 0;
      this.textOffsetHorizontalPixels = 0;
      this.selectedFontSize = 56;
      this.selectedFontColor = '#000000'; // Default color (black)
      this.draggingImage = false;
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