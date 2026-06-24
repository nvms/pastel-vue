<script setup>
import { ref, provide } from "vue"
import { Icon } from "@iconify/vue"
import { useStickToBottom } from "../composables/useStickToBottom.js"
import { useOverlayScrollbar } from "../composables/useOverlayScrollbar.js"

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

const bar = useOverlayScrollbar(scrollRef, contentRef)

// let descendant collapsibles (e.g. ToolCall) ask to be revealed on expand,
// without coupling them to this component
provide("pcChatScroller", { reveal })

defineExpose({ pinned, isAtBottom, scrollToBottom, reveal })
</script>

<template>
  <div
    class="pc-scroller"
    @pointerenter="bar.wake"
    @pointermove="bar.wake"
    @pointerleave="bar.sleep"
    @wheel="bar.wake"
  >
    <div ref="scrollRef" class="pc-scroller__viewport">
      <div ref="contentRef" class="pc-scroller__content" :style="{ '--pc-scroller-gap': `${gap}px` }">
        <slot />
      </div>
    </div>

    <div
      v-if="bar.overflow.value"
      class="pc-scroller__scrollbar"
      :class="{ 'pc-scroller__scrollbar--show': bar.active.value || bar.dragging.value }"
      @pointerdown="bar.onTrackDown"
    >
      <div
        class="pc-scroller__thumb"
        :style="{ height: `${bar.thumbSize.value}px`, transform: `translateY(${bar.thumbOffset.value}px)` }"
        @pointerdown.stop="bar.onThumbDown"
      />
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
  /* native bar is hidden - the overlay scrollbar below renders the thumb */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pc-scroller__viewport::-webkit-scrollbar { width: 0; height: 0; display: none; }

.pc-scroller__content {
  display: flex;
  flex-direction: column;
  gap: var(--pc-scroller-gap);
}

/* overlaid scrollbar - never reserves layout space, track stays transparent so
   it can't clash with the surface underneath */
.pc-scroller__scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 11px;
  padding: 3px;
  display: flex;
  user-select: none;
  touch-action: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 260ms ease;
  z-index: 2;
}
.pc-scroller__scrollbar--show {
  opacity: 1;
  pointer-events: auto;
}
.pc-scroller__thumb {
  width: 100%;
  position: relative;
  background: var(--ink-20);
  border-radius: 999px;
  transition: background 140ms ease;
}
.pc-scroller__thumb:hover,
.pc-scroller__thumb:active { background: var(--ink-40); }
/* enlarged invisible hit target so the thin thumb is easy to grab */
.pc-scroller__thumb::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  min-width: 40px;
  min-height: 40px;
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
/* layer the tint over paper so the button stays opaque on hover - a bare
   var(--ink-04) would replace the fill and let content show through */
.pc-scroller__jump:hover { background: linear-gradient(var(--ink-04), var(--ink-04)), var(--paper); }
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
  .pc-scroller__scrollbar { transition: opacity 80ms ease; }
}
</style>
