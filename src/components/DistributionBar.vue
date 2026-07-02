<script setup>
import { ref, computed } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"

const props = defineProps({
  // segments: [{ label, value, color? }]
  segments: { type: Array, default: () => [] },
  height: { type: Number, default: 16 },
  showLegend: { type: Boolean, default: true },
  // optional mono label above the bar
  label: { type: String, default: "" },
  // (value, percent) => string for the legend readout
  valueFormat: { type: Function, default: null },
  // show a tooltip on hover for each segment
  tooltip: { type: Boolean, default: false },
})

// ordered so adjacent segments always land on contrasting hues
const PALETTE = ["#bdbbff", "#ffcd94", "#9fd9bd", "#f6b8dd", "#a3c4f3", "#c9b6ec"]

const total = computed(() =>
  props.segments.reduce((sum, s) => sum + Math.max(0, s.value || 0), 0),
)

const resolved = computed(() => {
  const t = total.value || 1
  return props.segments.map((s, i) => {
    const value = Math.max(0, s.value || 0)
    const percent = (value / t) * 100
    return {
      label: s.label,
      value,
      percent,
      color: s.color || PALETTE[i % PALETTE.length],
      display: props.valueFormat
        ? props.valueFormat(value, percent)
        : `${Math.round(percent)}%`,
      raw: s,
    }
  })
})

// single shared tooltip that follows the hovered segment
const hoverSeg = ref(null)
const hoverEl = ref(null)
const tipRef = ref(null)
const { floatingStyles, isPositioned } = useFloating(hoverEl, tipRef, {
  placement: "top",
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
})

const onSegEnter = (seg, e) => {
  if (!props.tooltip) return
  hoverSeg.value = seg
  hoverEl.value = e.currentTarget
}
const onSegLeave = () => {
  hoverSeg.value = null
  hoverEl.value = null
}
</script>

<template>
  <div class="pc-distbar">
    <div v-if="label" class="pc-distbar__label">{{ label }}</div>

    <div class="pc-distbar__track" :style="{ height: `${height}px` }">
      <div
        v-for="(seg, i) in resolved"
        :key="i"
        class="pc-distbar__seg"
        :style="{ width: `${seg.percent}%`, background: seg.color }"
        @mouseenter="onSegEnter(seg, $event)"
        @mouseleave="onSegLeave"
      />
    </div>

    <div v-if="showLegend" class="pc-distbar__legend">
      <div v-for="(seg, i) in resolved" :key="i" class="pc-distbar__item">
        <span class="pc-distbar__swatch" :style="{ background: seg.color }" />
        <span class="pc-distbar__name">{{ seg.label }}</span>
        <span class="pc-distbar__value">{{ seg.display }}</span>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="tooltip && hoverSeg"
        ref="tipRef"
        class="pc-distbar__tip"
        role="tooltip"
        :style="[floatingStyles, { opacity: isPositioned ? 1 : 0 }]"
      >
        <slot name="tooltip" :segment="hoverSeg">
          <span class="pc-distbar__tip-name">{{ hoverSeg.label }}</span>
          <span class="pc-distbar__tip-value">{{ hoverSeg.display }}</span>
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pc-distbar { width: 100%; }

.pc-distbar__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  margin-bottom: 10px;
}

.pc-distbar__track {
  display: flex;
  width: 100%;
  border-radius: var(--radius-sharp);
  overflow: hidden;
  background: var(--ink-04);
}
.pc-distbar__seg {
  min-width: 2px;
  transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1), filter 120ms ease;
}
/* a crisp paper hairline so the boundary reads regardless of colour contrast */
.pc-distbar__seg:not(:last-child) {
  border-right: 2px solid var(--paper);
}
.pc-distbar__seg:hover { filter: brightness(0.95); }

.pc-distbar__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-top: 16px;
}
.pc-distbar__item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pc-distbar__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}
.pc-distbar__name {
  font-size: 14px;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.pc-distbar__value {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink-60);
  font-variant-numeric: tabular-nums;
}

/* hover tooltip */
.pc-distbar__tip {
  position: absolute;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--midnight);
  color: var(--paper-on-dark);
  padding: 7px 10px;
  border-radius: var(--radius-sharp);
  box-shadow: var(--shadow-medium);
  pointer-events: none;
  max-width: 240px;
  transition: opacity 90ms ease;
}
.pc-distbar__tip-name {
  font-family: var(--display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.12px;
}
.pc-distbar__tip-value {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--paper-on-dark-60);
}
</style>
