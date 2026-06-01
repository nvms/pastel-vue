<script setup>
import { computed } from "vue"

const props = defineProps({
  value: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  size: { type: Number, default: 112 },
  // stroke width in the fixed 100-unit viewBox
  thickness: { type: Number, default: 9 },
  variant: { type: String, default: "default" }, // default | lavender | success | warning | danger
  label: { type: String, default: "" },
  showValue: { type: Boolean, default: true },
  // (value) => string; defaults to a rounded percentage of the range
  formatValue: { type: Function, default: null },
})

// 270deg sweep with the gap at the bottom, matching Knob
const SWEEP = 270
const START = -135
const C = 50

const radius = computed(() => 50 - props.thickness / 2 - 1)

const fraction = computed(() => {
  const span = props.max - props.min || 1
  return Math.max(0, Math.min(1, (props.value - props.min) / span))
})

const polar = (deg, r) => {
  const a = (deg - 90) * Math.PI / 180
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}
const arcPath = computed(() => {
  const r = radius.value
  const p1 = polar(START, r)
  const p2 = polar(START + SWEEP, r)
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 1 1 ${p2.x} ${p2.y}`
})

const displayValue = computed(() => {
  if (props.formatValue) return props.formatValue(props.value)
  return `${Math.round(fraction.value * 100)}%`
})

const valueFontSize = computed(() => Math.round(props.size * 0.22))
</script>

<template>
  <div class="pc-gauge" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      :class="['pc-gauge__svg', `pc-gauge__svg--${variant}`]"
      viewBox="0 0 100 100"
      role="progressbar"
      :aria-valuenow="Math.round(fraction * 100)"
      :aria-valuemin="0"
      :aria-valuemax="100"
    >
      <path :d="arcPath" class="pc-gauge__track" :stroke-width="thickness" />
      <path
        :d="arcPath"
        class="pc-gauge__value"
        :stroke-width="thickness"
        pathLength="100"
        :style="{ strokeDashoffset: 100 - fraction * 100 }"
      />
    </svg>

    <div v-if="showValue || label" class="pc-gauge__center">
      <div
        v-if="showValue"
        class="pc-gauge__value-text"
        :style="{ fontSize: `${valueFontSize}px` }"
      >{{ displayValue }}</div>
      <div v-if="label" class="pc-gauge__label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.pc-gauge {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}
.pc-gauge__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.pc-gauge__svg--default { --pc-gauge-color: var(--midnight); }
.pc-gauge__svg--lavender { --pc-gauge-color: var(--lavender); }
.pc-gauge__svg--success { --pc-gauge-color: color-mix(in srgb, var(--status-active) 68%, white); }
.pc-gauge__svg--warning { --pc-gauge-color: color-mix(in srgb, var(--status-warning) 68%, white); }
.pc-gauge__svg--danger  { --pc-gauge-color: color-mix(in srgb, var(--status-failed) 68%, white); }

.pc-gauge__track {
  fill: none;
  stroke: var(--ink-08);
  stroke-linecap: round;
}
.pc-gauge__value {
  fill: none;
  stroke: var(--pc-gauge-color);
  stroke-linecap: round;
  stroke-dasharray: 100;
  transition: stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pc-gauge__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  pointer-events: none;
}
.pc-gauge__value-text {
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pc-gauge__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-60);
}

@media (prefers-reduced-motion: reduce) {
  .pc-gauge__value { transition: none; }
}
</style>
