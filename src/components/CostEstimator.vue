<script setup>
import { ref, computed } from "vue"
import Select from "./Select.vue"
import Slider from "./Slider.vue"
import { DEFAULT_MODEL_PRICING, costOf, formatUSD, formatTokens } from "../pricing.js"

const props = defineProps({
  // pricing list: [{ id, label, inputPer1M, outputPer1M }]
  models: { type: Array, default: () => DEFAULT_MODEL_PRICING },
})

// the sliders are driven by a 0..STEPS position; the real value is mapped
// logarithmically so low numbers get just as much travel as high ones
const STEPS = 1000
const logScale = (min, max) => {
  const k = Math.log(max / min)
  return {
    toValue: (pos) => min * Math.exp(k * (pos / STEPS)),
    toPos: (val) => STEPS * (Math.log(Math.max(min, val) / min) / k),
  }
}
const roundSig = (v, sig = 2) => {
  if (v <= 0) return 0
  const mag = 10 ** (Math.floor(Math.log10(v)) - (sig - 1))
  return Math.round(v / mag) * mag
}

const inScale = logScale(100, 200000)
const outScale = logScale(100, 32000)
const reqScale = logScale(10, 5000000)

const inputPos = ref(inScale.toPos(2000))
const outputPos = ref(outScale.toPos(600))
const reqPos = ref(reqScale.toPos(1000))

const inputTokens = computed(() => roundSig(inScale.toValue(inputPos.value)))
const outputTokens = computed(() => roundSig(outScale.toValue(outputPos.value)))
const requestsPerMonth = computed(() => roundSig(reqScale.toValue(reqPos.value)))

const fmtIn = (pos) => formatTokens(roundSig(inScale.toValue(pos)))
const fmtOut = (pos) => formatTokens(roundSig(outScale.toValue(pos)))
const fmtReq = (pos) => formatTokens(roundSig(reqScale.toValue(pos)))

const modelId = ref(props.models[0] ? props.models[0].id : "")
const modelOptions = computed(() =>
  props.models.map((m) => ({ value: m.id, label: m.label })),
)
const perRequest = computed(() =>
  costOf(modelId.value, inputTokens.value, outputTokens.value, props.models),
)
const monthly = computed(() =>
  perRequest.value ? perRequest.value.total * requestsPerMonth.value : 0,
)
</script>

<template>
  <div class="pc-estimator">
    <div class="pc-estimator__controls">
      <div class="pc-estimator__field">
        <span class="pc-estimator__label">Model</span>
        <Select v-model="modelId" :options="modelOptions" style="width: 100%;" />
      </div>
      <div class="pc-estimator__field">
        <span class="pc-estimator__label">Input tokens / request</span>
        <Slider v-model="inputPos" :min="0" :max="STEPS" :step="1" show-value :format-value="fmtIn" />
      </div>
      <div class="pc-estimator__field">
        <span class="pc-estimator__label">Output tokens / request</span>
        <Slider v-model="outputPos" :min="0" :max="STEPS" :step="1" show-value :format-value="fmtOut" />
      </div>
      <div class="pc-estimator__field">
        <span class="pc-estimator__label">Requests / month</span>
        <Slider v-model="reqPos" :min="0" :max="STEPS" :step="1" show-value :format-value="fmtReq" />
      </div>
    </div>

    <div class="pc-estimator__result">
      <div class="pc-estimator__eyebrow">Estimated monthly cost</div>
      <div class="pc-estimator__hero">
        {{ formatUSD(monthly) }}<span class="pc-estimator__unit">/ month</span>
      </div>
      <div class="pc-estimator__per">
        {{ perRequest ? formatUSD(perRequest.total) : "—" }} per request
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-estimator { width: 100%; }

.pc-estimator__controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pc-estimator__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pc-estimator__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}

.pc-estimator__result {
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: var(--radius-comfy);
  border: 1px solid var(--ink-08);
  background:
    radial-gradient(72% 95% at 0% 0%, rgba(189, 187, 255, 0.32), transparent 72%),
    radial-gradient(64% 85% at 100% 100%, rgba(214, 225, 255, 0.32), transparent 70%),
    var(--paper);
}
.pc-estimator__eyebrow {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-estimator__hero {
  font-family: var(--display);
  font-size: 40px;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 1.05;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  margin: 6px 0 2px;
}
.pc-estimator__unit {
  font-size: 0.4em;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--ink-40);
  margin-left: 0.4em;
}
.pc-estimator__per {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink-60);
}
</style>
