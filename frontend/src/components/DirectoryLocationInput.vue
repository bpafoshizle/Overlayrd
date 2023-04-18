<template>
  <div>
    <v-btn color="primary" @click="selectDirectory">{{ buttonText }}</v-btn>
  </div>
</template>
  
<script>
export default {
  props: {
    buttonText: {
      type: String,
      default: 'Select Directory Location'
    }
  },
  methods: {
    async selectDirectory() {
      const handle = await window.showDirectoryPicker();
      this.$emit("directorySelected", handle);
    }
  }
}
</script>