<script setup>
import { computed } from "vue"
import { costOf, formatUSD, formatTokens, DEFAULT_MODEL_PRICING } from "../pricing.js"
import DistributionBar from "./DistributionBar.vue"

const props = defineProps({
  // model id - looked up in `models`
  model: { type: String, default: "" },
  inputTokens: { type: Number, default: 0 },
  outputTokens: { type: Number, default: 0 },
  // pricing list: [{ id, label, inputPer1M, outputPer1M }]
  models: { type: Array, default: () => DEFAULT_MODEL_PRICING },
})

const INPUT_COLOR = "#bdbbff"
const OUTPUT_COLOR = "#ffcd94"

const result = computed(() =>
  costOf(props.model, props.inputTokens, props.outputTokens, props.models),
)
const segments = computed(() => {
  const r = result.value
  if (!r) return []
  return [
    { label: "Input", value: r.input, color: INPUT_COLOR },
    { label: "Output", value: r.output, color: OUTPUT_COLOR },
  ]
})
</script>

<template>
  <div class="pc-costbreak">
    <template v-if="result">
      <div class="pc-costbreak__model">{{ result.model.label }}</div>
      <div class="pc-costbreak__total">{{ formatUSD(result.total) }}</div>

      <DistributionBar :segments="segments" :show-legend="false" :height="14" />

      <div class="pc-costbreak__rows">
        <div class="pc-costbreak__row">
          <span class="pc-costbreak__swatch" :style="{ background: INPUT_COLOR }" />
          <span class="pc-costbreak__label">Input</span>
          <span class="pc-costbreak__tokens">{{ formatTokens(inputTokens) }} tokens</span>
          <span class="pc-costbreak__cost">{{ formatUSD(result.input) }}</span>
        </div>
        <div class="pc-costbreak__row">
          <span class="pc-costbreak__swatch" :style="{ background: OUTPUT_COLOR }" />
          <span class="pc-costbreak__label">Output</span>
          <span class="pc-costbreak__tokens">{{ formatTokens(outputTokens) }} tokens</span>
          <span class="pc-costbreak__cost">{{ formatUSD(result.output) }}</span>
        </div>
      </div>
    </template>

    <div v-else class="pc-costbreak__unknown">
      No pricing found for model <code>{{ model || "(none)" }}</code>
    </div>
  </div>
</template>

<style scoped>
.pc-costbreak {
  display: flex;
  flex-direction: column;
}
.pc-costbreak__model {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-costbreak__total {
  font-family: var(--display);
  font-size: 40px;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 1.05;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  margin: 4px 0 16px;
}

.pc-costbreak__rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.pc-costbreak__row {
  display: grid;
  grid-template-columns: 10px auto 1fr auto;
  align-items: center;
  gap: 10px;
}
.pc-costbreak__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.pc-costbreak__label {
  font-size: 14px;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.pc-costbreak__tokens {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink-60);
}
.pc-costbreak__cost {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.pc-costbreak__unknown {
  font-size: 14px;
  color: var(--ink-60);
}
.pc-costbreak__unknown code {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--ink-04);
  padding: 1px 5px;
  border-radius: 3px;
}
</style>
