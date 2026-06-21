<script setup>
defineProps({
  // vertical space between stacked items
  gap: { type: Number, default: 16 },
})
</script>

<template>
  <div class="pc-thread" :style="{ '--pc-thread-gap': `${gap}px` }">
    <slot />
  </div>
</template>

<style scoped>
/* a non-scrolling message list that flows with the page. for a bounded,
   auto-pinning conversation use ChatScroller instead */
.pc-thread {
  display: flex;
  flex-direction: column;
  gap: var(--pc-thread-gap);
}
</style>
