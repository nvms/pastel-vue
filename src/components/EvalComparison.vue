<script setup>
import { computed } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps({
  // two runs of the same suite - same { name, status, score? } shape
  baseline: { type: Array, default: () => [] },
  candidate: { type: Array, default: () => [] },
  baselineLabel: { type: String, default: "Baseline" },
  candidateLabel: { type: String, default: "Candidate" },
})

const indexBy = (arr) => {
  const m = {}
  for (const r of arr) m[r.name] = r
  return m
}

// match cases by name, classify each, regressions sort to the top
const rows = computed(() => {
  const base = indexBy(props.baseline)
  const cand = indexBy(props.candidate)
  const names = [
    ...new Set([...props.baseline.map((r) => r.name), ...props.candidate.map((r) => r.name)]),
  ]
  const out = names.map((name) => {
    const b = base[name] || null
    const c = cand[name] || null
    let change
    if (!b) change = "new"
    else if (!c) change = "removed"
    else {
      const bs = typeof b.score === "number" ? b.score : null
      const cs = typeof c.score === "number" ? c.score : null
      if (bs != null && cs != null) {
        change = cs > bs + 1e-9 ? "improved" : cs < bs - 1e-9 ? "regressed" : "unchanged"
      } else {
        const bp = b.status === "passed"
        const cp = c.status === "passed"
        change = cp && !bp ? "improved" : !cp && bp ? "regressed" : "unchanged"
      }
    }
    return { name, base: b, cand: c, change }
  })
  const order = { regressed: 0, improved: 1, new: 2, removed: 3, unchanged: 4 }
  return out.sort((a, b) => order[a.change] - order[b.change])
})

const cellText = (r) => {
  if (!r) return "—"
  if (typeof r.score === "number") return `${Math.round(r.score * 100)}%`
  return r.status === "passed" ? "pass" : r.status === "failed" ? "fail" : r.status
}

const CHANGE = {
  improved: { icon: "lucide:arrow-up", label: "Improved" },
  regressed: { icon: "lucide:arrow-down", label: "Regressed" },
  unchanged: { icon: "lucide:minus", label: "Unchanged" },
  new: { icon: "lucide:plus", label: "New" },
  removed: { icon: "lucide:minus", label: "Removed" },
}
</script>

<template>
  <div class="pc-evalcmp">
    <div class="pc-evalcmp__grid pc-evalcmp__header">
      <span class="pc-evalcmp__h">Test case</span>
      <span class="pc-evalcmp__h pc-evalcmp__h--num">{{ baselineLabel }}</span>
      <span class="pc-evalcmp__h pc-evalcmp__h--num">{{ candidateLabel }}</span>
      <span class="pc-evalcmp__h">Change</span>
    </div>

    <div
      v-for="(row, i) in rows"
      :key="row.name"
      :class="['pc-evalcmp__grid', 'pc-evalcmp__row', `pc-evalcmp__row--${row.change}`]"
      :style="{ '--row-delay': `${Math.min(i, 12) * 35}ms` }"
    >
      <span class="pc-evalcmp__name">{{ row.name }}</span>
      <span class="pc-evalcmp__cell">{{ cellText(row.base) }}</span>
      <span class="pc-evalcmp__cell pc-evalcmp__cell--cand">{{ cellText(row.cand) }}</span>
      <span :class="['pc-evalcmp__chip', `pc-evalcmp__chip--${row.change}`]">
        <Icon :icon="CHANGE[row.change].icon" />
        {{ CHANGE[row.change].label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.pc-evalcmp { width: 100%; }

/* one shared column template - header and every row align to it */
.pc-evalcmp__grid {
  display: grid;
  grid-template-columns: 1fr 86px 86px 112px;
  align-items: center;
  gap: 14px;
}

.pc-evalcmp__header {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ink-08);
}
.pc-evalcmp__h {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
}
.pc-evalcmp__h--num {
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-evalcmp__row {
  padding: 10px 0;
  border-bottom: 1px solid var(--ink-08);
  animation: pc-evalcmp-in 320ms cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-evalcmp-in {
  from { opacity: 0; translate: -10px 0; }
  to { opacity: 1; translate: 0 0; }
}
.pc-evalcmp__row--removed { opacity: 0.55; }

.pc-evalcmp__name {
  font-size: 13.5px;
  letter-spacing: -0.13px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-evalcmp__cell {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--ink-40);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.pc-evalcmp__cell--cand { color: var(--ink); }

.pc-evalcmp__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  padding: 2px 8px;
  border-radius: var(--badge-radius);
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 9px;
  font-weight: 500;
}
.pc-evalcmp__chip--improved { background: var(--status-active-bg); color: var(--status-active); }
.pc-evalcmp__chip--regressed { background: var(--status-failed-bg); color: var(--status-failed); }
.pc-evalcmp__chip--unchanged { background: var(--ink-04); color: var(--ink-40); }
.pc-evalcmp__chip--new {
  background: color-mix(in srgb, var(--lavender) 30%, var(--paper));
  color: var(--status-paused);
}
.pc-evalcmp__chip--removed { background: var(--ink-04); color: var(--ink-40); }

@media (prefers-reduced-motion: reduce) {
  .pc-evalcmp__row { animation: none; }
}
</style>
