<script setup>
import { computed } from "vue"

const props = defineProps({
  // confidence / score, 0 to 1
  value: { type: Number, default: 0 },
  // optional leading mono label
  label: { type: String, default: "" },
  // fixed label width - set the same value on a stacked group so the bars line up
  labelWidth: { type: [String, Number], default: null },
  showValue: { type: Boolean, default: true },
  size: { type: String, default: "md" }, // sm | md
})

const clamped = computed(() => Math.max(0, Math.min(1, props.value)))
const level = computed(() => {
  const v = clamped.value
  if (v >= 0.8) return "high"
  if (v >= 0.5) return "medium"
  return "low"
})
const percent = computed(() => Math.round(clamped.value * 100))

const labelStyle = computed(() => {
  if (props.labelWidth == null) return null
  const w = typeof props.labelWidth === "number" ? `${props.labelWidth}px` : props.labelWidth
  return { width: w }
})
</script>

<template>
  <span :class="['pc-confidence', `pc-confidence--${size}`, `pc-confidence--${level}`]">
    <span v-if="label" class="pc-confidence__label" :style="labelStyle">{{ label }}</span>
    <span class="pc-confidence__track">
      <span class="pc-confidence__fill" :style="{ width: `${percent}%` }" />
    </span>
    <span v-if="showValue" class="pc-confidence__value">{{ percent }}%</span>
  </span>
</template>

<style scoped>
.pc-confidence {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
}
.pc-confidence--high { --pc-conf-color: color-mix(in srgb, var(--status-active) 70%, white); }
.pc-confidence--medium { --pc-conf-color: color-mix(in srgb, var(--status-warning) 75%, white); }
.pc-confidence--low { --pc-conf-color: color-mix(in srgb, var(--status-failed) 72%, white); }

.pc-confidence__label {
  flex-shrink: 0;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}

.pc-confidence__track {
  position: relative;
  width: 56px;
  height: 6px;
  flex-shrink: 0;
  background: var(--ink-08);
  border-radius: var(--radius-sharp);
  overflow: hidden;
}
.pc-confidence__fill {
  display: block;
  height: 100%;
  background: var(--pc-conf-color);
  border-radius: var(--radius-sharp);
  transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
/* fixed width + right aligned so the % stays aligned across a stacked group */
.pc-confidence__value {
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.pc-confidence--sm .pc-confidence__track { width: 44px; height: 5px; }
.pc-confidence--sm .pc-confidence__value { font-size: 10px; min-width: 28px; }
.pc-confidence--sm .pc-confidence__label { font-size: 9px; }
</style>
