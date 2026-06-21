<script setup>
import { ref, provide } from "vue"
import { Icon } from "@iconify/vue"
import { useStickToBottom } from "../composables/useStickToBottom.js"

const props = defineProps({
  // how close, in px, counts as "at the bottom" for pinning / re-pinning
  threshold: { type: Number, default: 80 },
  // vertical space between stacked items
  gap: { type: Number, default: 16 },
  // built-in jump-to-bottom button shown when unpinned; override via #overlay
  showJumpButton: { type: Boolean, default: true },
})

const scrollRef = ref(null)
const contentRef = ref(null)
const { pinned, isAtBottom, scrollToBottom, reveal } = useStickToBottom(scrollRef, contentRef, {
  threshold: props.threshold,
})

// let descendant collapsibles (e.g. ToolCall) ask to be revealed on expand,
// without coupling them to this component
provide("pcChatScroller", { reveal })

defineExpose({ pinned, isAtBottom, scrollToBottom, reveal })
</script>

<template>
  <div class="pc-scroller">
    <div ref="scrollRef" class="pc-scroller__viewport">
      <div ref="contentRef" class="pc-scroller__content" :style="{ '--pc-scroller-gap': `${gap}px` }">
        <slot />
      </div>
    </div>

    <slot name="overlay" :pinned="pinned" :is-at-bottom="isAtBottom" :scroll-to-bottom="scrollToBottom">
      <Transition name="pc-scroller-jump">
        <button
          v-if="showJumpButton && !isAtBottom"
          type="button"
          class="pc-scroller__jump"
          aria-label="Scroll to latest"
          @click="scrollToBottom()"
        >
          <Icon icon="lucide:arrow-down" />
        </button>
      </Transition>
    </slot>
  </div>
</template>

<style scoped>
/* outer wrapper is the non-scrolling positioning context for the overlay, so
   the jump button stays put instead of scrolling away with the content */
.pc-scroller {
  position: relative;
  height: 100%;
  min-height: 0;
}
.pc-scroller__viewport {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  /* take full control of bottom-pinning - the browser's own scroll anchoring
     would otherwise shift scrollTop when content above the viewport grows */
  overflow-anchor: none;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-20) transparent;
}
.pc-scroller__viewport::-webkit-scrollbar { width: 8px; }
.pc-scroller__viewport::-webkit-scrollbar-thumb { background: var(--ink-20); border-radius: 4px; }

.pc-scroller__content {
  display: flex;
  flex-direction: column;
  gap: var(--pc-scroller-gap);
}

.pc-scroller__jump {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--ink-08);
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-medium);
  cursor: pointer;
  font-size: 17px;
  transition: background 120ms ease, transform 60ms ease, box-shadow 120ms ease;
}
.pc-scroller__jump:hover { background: var(--ink-04); }
.pc-scroller__jump:active { transform: translateX(-50%) translateY(1px); }
.pc-scroller__jump:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.pc-scroller-jump-enter-active,
.pc-scroller-jump-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.pc-scroller-jump-enter-from,
.pc-scroller-jump-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .pc-scroller__jump,
  .pc-scroller-jump-enter-active,
  .pc-scroller-jump-leave-active { transition: none; }
}
</style>
