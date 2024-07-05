<template>
  <img :src="gifUrl" alt="Animated GIF Background">
</template>

<script>
export default {
  props: {
    gifUrl: {
      type: String,
      required: true,
    },
  },
};
</script>
