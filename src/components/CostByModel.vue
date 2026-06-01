<script setup>
import { computed } from "vue"
import { costOf, formatUSD, formatTokens, DEFAULT_MODEL_PRICING } from "../pricing.js"

const props = defineProps({
  // usage: [{ model, inputTokens, outputTokens }]
  usage: { type: Array, default: () => [] },
  // pricing list: [{ id, label, inputPer1M, outputPer1M }]
  models: { type: Array, default: () => DEFAULT_MODEL_PRICING },
})

const rows = computed(() => {
  const list = props.usage.map((u) => {
    const r = costOf(u.model, u.inputTokens, u.outputTokens, props.models)
    return {
      label: r ? r.model.label : (u.model || "Unknown"),
      inputTokens: u.inputTokens || 0,
      outputTokens: u.outputTokens || 0,
      cost: r ? r.total : 0,
    }
  })
  return list.sort((a, b) => b.cost - a.cost)
})
const maxCost = computed(() => Math.max(...rows.value.map((r) => r.cost), 0) || 1)
const inputTotal = computed(() => rows.value.reduce((s, r) => s + r.inputTokens, 0))
const outputTotal = computed(() => rows.value.reduce((s, r) => s + r.outputTokens, 0))
const costTotal = computed(() => rows.value.reduce((s, r) => s + r.cost, 0))
</script>

<template>
  <div class="pc-bymodel">
    <div class="pc-bymodel__grid pc-bymodel__head">
      <span class="pc-bymodel__h">Model</span>
      <span class="pc-bymodel__h pc-bymodel__h--num">In</span>
      <span class="pc-bymodel__h pc-bymodel__h--num">Out</span>
      <span class="pc-bymodel__h pc-bymodel__h--num">Cost</span>
      <span />
    </div>

    <div
      v-for="(row, i) in rows"
      :key="row.label"
      class="pc-bymodel__grid pc-bymodel__row"
      :style="{ '--row-delay': `${Math.min(i, 10) * 40}ms` }"
    >
      <span class="pc-bymodel__model">{{ row.label }}</span>
      <span class="pc-bymodel__num">{{ formatTokens(row.inputTokens) }}</span>
      <span class="pc-bymodel__num">{{ formatTokens(row.outputTokens) }}</span>
      <span class="pc-bymodel__num pc-bymodel__num--ink">{{ formatUSD(row.cost) }}</span>
      <span class="pc-bymodel__bar">
        <span
          class="pc-bymodel__bar-fill"
          :style="{ width: `${(row.cost / maxCost) * 100}%` }"
        />
      </span>
    </div>

    <div class="pc-bymodel__grid pc-bymodel__total">
      <span class="pc-bymodel__total-label">Total</span>
      <span class="pc-bymodel__num pc-bymodel__num--ink">{{ formatTokens(inputTotal) }}</span>
      <span class="pc-bymodel__num pc-bymodel__num--ink">{{ formatTokens(outputTotal) }}</span>
      <span class="pc-bymodel__num pc-bymodel__total-cost">{{ formatUSD(costTotal) }}</span>
      <span />
    </div>
  </div>
</template>

<style scoped>
.pc-bymodel { width: 100%; }

/* one shared column template - every row aligns to it */
.pc-bymodel__grid {
  display: grid;
  grid-template-columns: 1fr 72px 72px 100px 56px;
  align-items: center;
  gap: 14px;
}

.pc-bymodel__head {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ink-08);
}
.pc-bymodel__h {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
}
.pc-bymodel__h--num { text-align: right; }

.pc-bymodel__row {
  padding: 11px 0;
  border-bottom: 1px solid var(--ink-08);
  animation: pc-bymodel-in 320ms cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-bymodel-in {
  from { opacity: 0; translate: -10px 0; }
  to { opacity: 1; translate: 0 0; }
}

.pc-bymodel__model {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.14px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-bymodel__num {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--ink-60);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.pc-bymodel__num--ink { color: var(--ink); }

.pc-bymodel__bar {
  display: block;
  height: 6px;
  background: var(--ink-08);
  border-radius: var(--radius-sharp);
  overflow: hidden;
}
.pc-bymodel__bar-fill {
  display: block;
  height: 100%;
  background: var(--lavender);
  border-radius: var(--radius-sharp);
}

.pc-bymodel__total { padding-top: 12px; }
.pc-bymodel__total-label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-bymodel__total-cost {
  color: var(--ink);
  font-size: 14px;
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  .pc-bymodel__row { animation: none; }
}
</style>
