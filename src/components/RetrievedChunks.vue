<script setup>
import Card from "./Card.vue"
import ConfidenceMeter from "./ConfidenceMeter.vue"

defineProps({
  // results: [{ text, score, source?, chunk? }] - score is 0..1, given pre-ranked
  results: { type: Array, default: () => [] },
  // make each result card clickable (emits "select")
  interactive: { type: Boolean, default: true },
})
const emit = defineEmits(["select"])
</script>

<template>
  <div class="pc-retrieved">
    <Card
      v-for="(result, i) in results"
      :key="i"
      padded
      :interactive="interactive"
      @click="interactive && emit('select', result)"
    >
      <div class="pc-retrieved__head">
        <div class="pc-retrieved__meta">
          <span class="pc-retrieved__rank">#{{ i + 1 }}</span>
          <span v-if="result.source" class="pc-retrieved__source">{{ result.source }}</span>
          <span v-if="result.chunk != null" class="pc-retrieved__chunk">
            chunk {{ result.chunk }}
          </span>
        </div>
        <ConfidenceMeter :value="result.score" size="sm" />
      </div>
      <p class="pc-retrieved__text">{{ result.text }}</p>
    </Card>
  </div>
</template>

<style scoped>
.pc-retrieved {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pc-retrieved__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.pc-retrieved__meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.pc-retrieved__rank {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--ink-40);
  flex-shrink: 0;
}
.pc-retrieved__source {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-retrieved__chunk {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ink-40);
  flex-shrink: 0;
}
.pc-retrieved__chunk::before {
  content: "·";
  margin-right: 8px;
  color: var(--ink-20);
}

.pc-retrieved__text {
  font-size: 14px;
  line-height: 1.55;
  letter-spacing: -0.14px;
  color: var(--ink-60);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
