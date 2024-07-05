<template>
  <div>{{ counterValue }}</div>
  <button @click="incrementCounter">Increment</button>
</template>

<script>
export default {
  props: {
    counterValue: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    incrementCounter() {
      this.$emit('update:counterValue', this.counterValue + 1);
    },
  },
};
</script>
