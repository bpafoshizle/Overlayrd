<template>
  <div>
    <v-btn color="primary" @click="selectDirectory">{{ buttonText }}</v-btn>
    <p v-if="directoryHandle">Selected directory location: {{ directoryHandle.name }}</p>
  </div>
</template>
  
<script>
export default {
  data() {
    return {
      directoryHandle: null
    }
  },
  props:{
    buttonText: {
      type: String,
      default: 'Select Directory Location'
    }
  },
  methods: {
    async selectDirectory() {
      const handle = await window.showDirectoryPicker();
      this.directoryHandle = handle;
    }
  }
}
</script>