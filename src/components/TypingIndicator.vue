<script setup>
defineProps({
  // optional text shown beside the dots, e.g. "Assistant is typing"
  label: { type: String, default: "" },
})
</script>

<template>
  <span class="pc-typing" role="status" :aria-label="label || 'Typing'">
    <span class="pc-typing__dots" aria-hidden="true">
      <span class="pc-typing__dot" />
      <span class="pc-typing__dot" />
      <span class="pc-typing__dot" />
    </span>
    <span v-if="label" class="pc-typing__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.pc-typing {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-60);
}
.pc-typing__dots { display: inline-flex; align-items: center; gap: 4px; }
.pc-typing__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
  animation: pc-typing-bounce 1200ms ease-in-out infinite;
}
.pc-typing__dot:nth-child(2) { animation-delay: 160ms; }
.pc-typing__dot:nth-child(3) { animation-delay: 320ms; }
.pc-typing__label { font-size: 13px; }

@keyframes pc-typing-bounce {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 0.9; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .pc-typing__dot { animation: none; opacity: 0.5; }
}
</style>
