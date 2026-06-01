<script setup>
import { computed } from "vue"
import { tokenize } from "../tokenizer.js"

const props = defineProps({
  text: { type: String, default: "" },
  // o200k_base (GPT-4o/5) | cl100k_base (GPT-4)
  encoding: { type: String, default: "o200k_base" },
  // the count / characters / encoding summary header
  showSummary: { type: Boolean, default: true },
})

// three mutually-distinct hues, muted, cycled - any two adjacent tokens differ
const COLORS = [
  "color-mix(in srgb, #bdbbff 58%, white)",
  "color-mix(in srgb, #ffcd94 58%, white)",
  "color-mix(in srgb, #9fd9bd 58%, white)",
]

const result = computed(() => tokenize(props.text, props.encoding))
</script>

<template>
  <div class="pc-tokenview">
    <div v-if="showSummary" class="pc-tokenview__head">
      <span class="pc-tokenview__count">{{ result.count.toLocaleString() }}</span>
      <span class="pc-tokenview__unit">tokens</span>
      <span class="pc-tokenview__sub">
        {{ text.length.toLocaleString() }} characters &middot; {{ encoding }}
      </span>
    </div>

    <div v-if="result.tokens.length" class="pc-tokenview__body">
      <span
        v-for="(tok, i) in result.tokens"
        :key="i"
        class="pc-tokenview__tok"
        :style="{ background: COLORS[i % COLORS.length] }"
      >{{ tok.text }}</span>
    </div>
    <div v-else class="pc-tokenview__empty">No text to tokenize.</div>
  </div>
</template>

<style scoped>
.pc-tokenview {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pc-tokenview__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.pc-tokenview__count {
  font-family: var(--display);
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -0.9px;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.pc-tokenview__unit {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-tokenview__sub {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}

.pc-tokenview__body {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--display);
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: -0.1px;
  color: var(--ink);
}
.pc-tokenview__tok {
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.pc-tokenview__empty {
  font-size: 14px;
  color: var(--ink-40);
}
</style>
