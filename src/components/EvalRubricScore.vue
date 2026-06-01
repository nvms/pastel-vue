<script setup>
import { computed } from "vue"

const props = defineProps({
  // criteria: [{ label, score, max? }] - max defaults to 1 (score is then 0..1)
  criteria: { type: Array, default: () => [] },
})

const rows = computed(() =>
  props.criteria.map((c) => {
    const max = c.max || 1
    const ratio = max > 0 ? Math.max(0, Math.min(1, c.score / max)) : 0
    const level = ratio >= 0.8 ? "high" : ratio >= 0.5 ? "medium" : "low"
    const readout = c.max && c.max !== 1
      ? `${c.score} / ${c.max}`
      : `${Math.round(ratio * 100)}%`
    return { label: c.label, ratio, level, readout }
  }),
)
</script>

<template>
  <div class="pc-rubric">
    <template v-for="(row, i) in rows" :key="i">
      <span class="pc-rubric__label">{{ row.label }}</span>
      <span class="pc-rubric__track">
        <span
          :class="['pc-rubric__fill', `pc-rubric__fill--${row.level}`]"
          :style="{ width: `${row.ratio * 100}%` }"
        />
      </span>
      <span class="pc-rubric__readout">{{ row.readout }}</span>
    </template>
  </div>
</template>

<style scoped>
.pc-rubric {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px 14px;
  width: 100%;
}

.pc-rubric__label {
  font-size: 13px;
  letter-spacing: -0.13px;
  color: var(--ink);
}

.pc-rubric__track {
  height: 7px;
  background: var(--ink-08);
  border-radius: var(--radius-sharp);
  overflow: hidden;
}
.pc-rubric__fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-sharp);
  transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-rubric__fill--high { background: color-mix(in srgb, var(--status-active) 70%, white); }
.pc-rubric__fill--medium { background: color-mix(in srgb, var(--status-warning) 75%, white); }
.pc-rubric__fill--low { background: color-mix(in srgb, var(--status-failed) 72%, white); }

.pc-rubric__readout {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
