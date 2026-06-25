<script setup>
import { computed } from "vue"

const props = defineProps({
  // diameter in px
  size: { type: Number, default: 14 },
  // for dark surfaces - renders white instead of inheriting currentColor
  light: { type: Boolean, default: false },
})

// keep the button spinner's ~7:1 diameter-to-stroke ratio so it reads right at any size
const border = computed(() => Math.max(2, Math.round(props.size / 7)))
</script>

<template>
  <span
    class="pc-spinner"
    :class="{ 'pc-spinner--light': light }"
    role="status"
    aria-label="Loading"
    :style="{ width: size + 'px', height: size + 'px', borderWidth: border + 'px' }"
  />
</template>

<style scoped>
.pc-spinner {
  display: inline-block;
  box-sizing: border-box;
  border-style: solid;
  border-color: currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  opacity: 0.8;
  animation: pc-spin 700ms linear infinite;
}
.pc-spinner--light {
  border-color: #fff;
  border-top-color: transparent;
  opacity: 1;
}
@keyframes pc-spin { to { transform: rotate(360deg); } }
</style>
