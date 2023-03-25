<template>
  <div>
    <v-btn color="primary" @click="selectDirectory">{{ buttonText }}</v-btn>
    <p v-if="directoryHandle">Selected directory location: {{ directoryHandle.name }}</p>
  </div>
</template>
  
<script>
export default {
  props: {
    buttonText: {
      type: String,
      default: 'Select Directory Location'
    },
    directoryHandle: {
      type: Object,
      default: null
    }
  },
  methods: {
    async selectDirectory() {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      this.$emit("directorySelected", handle);
    }
  }
}
</script>