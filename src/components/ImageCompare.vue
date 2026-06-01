<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps({
  before: { type: String, required: true },
  after: { type: String, required: true },
  beforeLabel: { type: String, default: "Before" },
  afterLabel: { type: String, default: "After" },
  // toggle the corner labels off entirely
  showLabels: { type: Boolean, default: true },
  alt: { type: String, default: "" },
  // divider position 0-100, v-model
  modelValue: { type: Number, default: 50 },
})
const emit = defineEmits(["update:modelValue"])

const pos = computed(() => Math.max(0, Math.min(100, props.modelValue)))

const rootRef = ref(null)
const dragging = ref(false)

const setFromX = (clientX) => {
  const r = rootRef.value.getBoundingClientRect()
  if (!r.width) return
  emit("update:modelValue", Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
}
const onDown = (e) => {
  dragging.value = true
  rootRef.value.setPointerCapture(e.pointerId)
  setFromX(e.clientX)
}
const onMove = (e) => {
  if (dragging.value) setFromX(e.clientX)
}
const onUp = (e) => {
  dragging.value = false
  if (rootRef.value.hasPointerCapture?.(e.pointerId)) {
    rootRef.value.releasePointerCapture(e.pointerId)
  }
}
const onKey = (e) => {
  const step = e.shiftKey ? 10 : 2
  if (e.key === "ArrowLeft") { e.preventDefault(); emit("update:modelValue", Math.max(0, pos.value - step)) }
  else if (e.key === "ArrowRight") { e.preventDefault(); emit("update:modelValue", Math.min(100, pos.value + step)) }
  else if (e.key === "Home") { e.preventDefault(); emit("update:modelValue", 0) }
  else if (e.key === "End") { e.preventDefault(); emit("update:modelValue", 100) }
}
</script>

<template>
  <div
    ref="rootRef"
    :class="['pc-imgcompare', { 'pc-imgcompare--dragging': dragging }]"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
  >
    <img class="pc-imgcompare__base" :src="after" :alt="alt" draggable="false" />
    <div
      class="pc-imgcompare__clip"
      :style="{ clipPath: `inset(0 ${100 - pos}% 0 0)` }"
    >
      <img class="pc-imgcompare__overlay" :src="before" :alt="alt" draggable="false" />
    </div>

    <span
      v-if="showLabels && beforeLabel"
      class="pc-imgcompare__label pc-imgcompare__label--before"
      :style="{ opacity: pos > 8 ? 1 : 0 }"
    >{{ beforeLabel }}</span>
    <span
      v-if="showLabels && afterLabel"
      class="pc-imgcompare__label pc-imgcompare__label--after"
      :style="{ opacity: pos < 92 ? 1 : 0 }"
    >{{ afterLabel }}</span>

    <div class="pc-imgcompare__divider" :style="{ left: `${pos}%` }">
      <div
        class="pc-imgcompare__handle"
        tabindex="0"
        role="slider"
        :aria-valuenow="Math.round(pos)"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-label="`Reveal ${beforeLabel} vs ${afterLabel}`"
        @keydown="onKey"
      >
        <Icon icon="lucide:chevrons-left-right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-imgcompare {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-comfy);
  border: 1px solid var(--ink-08);
  user-select: none;
  touch-action: none;
  cursor: ew-resize;
  line-height: 0;
}

.pc-imgcompare__base {
  display: block;
  width: 100%;
  height: auto;
}
.pc-imgcompare__clip {
  position: absolute;
  inset: 0;
}
.pc-imgcompare__overlay {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pc-imgcompare img { pointer-events: none; }

/* labels */
.pc-imgcompare__label {
  position: absolute;
  top: 12px;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--paper-on-dark);
  background: color-mix(in srgb, var(--midnight) 82%, transparent);
  padding: 4px 8px;
  border-radius: var(--radius-sharp);
  line-height: 1;
  pointer-events: none;
  transition: opacity 160ms ease;
}
.pc-imgcompare__label--before { left: 12px; }
.pc-imgcompare__label--after { right: 12px; }

/* divider + handle */
.pc-imgcompare__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--paper);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--midnight) 35%, transparent);
  transform: translateX(-1px);
  pointer-events: none;
}
.pc-imgcompare__handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--paper);
  color: var(--midnight);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  box-shadow: var(--shadow-medium);
  cursor: ew-resize;
  pointer-events: auto;
  outline: none;
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.pc-imgcompare__handle:hover { box-shadow: var(--shadow-lift); }
.pc-imgcompare__handle:focus-visible { box-shadow: var(--focus-ring); }
.pc-imgcompare--dragging .pc-imgcompare__handle {
  transform: translate(-50%, -50%) scale(1.08);
}
</style>
