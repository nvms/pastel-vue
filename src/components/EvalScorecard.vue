<script setup>
import { computed } from "vue"
import Gauge from "./Gauge.vue"
import DistributionBar from "./DistributionBar.vue"

const props = defineProps({
  // results: [{ status, score? }] - same shape as EvalSuite consumes
  results: { type: Array, default: () => [] },
  name: { type: String, default: "" },
})

const counts = computed(() => {
  const c = { passed: 0, failed: 0, error: 0, running: 0, pending: 0 }
  for (const r of props.results) if (c[r.status] != null) c[r.status]++
  return c
})
const resolved = computed(() => counts.value.passed + counts.value.failed + counts.value.error)
const passRate = computed(() =>
  resolved.value ? Math.round((counts.value.passed / resolved.value) * 100) : 0,
)
const pendingCount = computed(() => counts.value.running + counts.value.pending)
const avgScore = computed(() => {
  const scored = props.results.filter((r) => typeof r.score === "number")
  if (!scored.length) return null
  return scored.reduce((s, r) => s + r.score, 0) / scored.length
})
const segments = computed(() => {
  const c = counts.value
  const segs = []
  if (c.passed) segs.push({ label: "Passed", value: c.passed, color: "color-mix(in srgb, var(--status-active) 62%, white)" })
  if (c.failed) segs.push({ label: "Failed", value: c.failed, color: "color-mix(in srgb, var(--status-failed) 58%, white)" })
  if (c.error) segs.push({ label: "Error", value: c.error, color: "color-mix(in srgb, var(--status-warning) 70%, white)" })
  if (pendingCount.value) segs.push({ label: "Pending", value: pendingCount.value, color: "var(--ink-12, var(--ink-08))" })
  return segs
})
</script>

<template>
  <div class="pc-evalcard">
    <Gauge :value="passRate" :size="116" :thickness="10" variant="success" label="Pass rate" />

    <div class="pc-evalcard__body">
      <div v-if="name" class="pc-evalcard__name">{{ name }}</div>

      <div class="pc-evalcard__counts">
        <div class="pc-evalcard__count">
          <span class="pc-evalcard__num pc-evalcard__num--passed">{{ counts.passed }}</span>
          <span class="pc-evalcard__lbl">Passed</span>
        </div>
        <div class="pc-evalcard__count">
          <span class="pc-evalcard__num pc-evalcard__num--failed">{{ counts.failed }}</span>
          <span class="pc-evalcard__lbl">Failed</span>
        </div>
        <div v-if="counts.error" class="pc-evalcard__count">
          <span class="pc-evalcard__num pc-evalcard__num--error">{{ counts.error }}</span>
          <span class="pc-evalcard__lbl">Error</span>
        </div>
        <div v-if="pendingCount" class="pc-evalcard__count">
          <span class="pc-evalcard__num">{{ pendingCount }}</span>
          <span class="pc-evalcard__lbl">Pending</span>
        </div>
      </div>

      <DistributionBar :segments="segments" :height="10" :show-legend="false" />

      <div v-if="avgScore != null" class="pc-evalcard__avg">
        Avg score <strong>{{ avgScore.toFixed(2) }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-evalcard {
  display: flex;
  align-items: center;
  gap: 22px;
}

.pc-evalcard__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pc-evalcard__name {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}

.pc-evalcard__counts {
  display: flex;
  gap: 24px;
}
.pc-evalcard__count {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pc-evalcard__num {
  font-family: var(--display);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.5px;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.pc-evalcard__num--passed { color: var(--status-active); }
.pc-evalcard__num--failed { color: var(--status-failed); }
.pc-evalcard__num--error { color: var(--status-warning); }
.pc-evalcard__lbl {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
}

.pc-evalcard__avg {
  font-size: 12px;
  color: var(--ink-60);
  letter-spacing: -0.12px;
}
.pc-evalcard__avg strong {
  font-family: var(--mono);
  font-weight: 700;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
</style>
