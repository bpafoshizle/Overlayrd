<template>
  <div>
    <v-btn color="primary" @click="selectFile">{{ buttonText }}</v-btn>
    <p v-if="fileHandle">Selected file location: {{ fileHandle.name }}</p>
  </div>
</template>
  
<script>
export default {
  data() {
    return {
      fileHandle: null
    }
  },
  props:{
    buttonText: {
      type: String,
      default: 'Select File Location'
    }
  },
  methods: {
    async selectFile() {
      const handle = await window.showSaveFilePicker();
      this.fileHandle = handle;
    }
  }
}
</script>