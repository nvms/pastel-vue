<script setup>
import { Icon } from "@iconify/vue"
import Spinner from "./Spinner.vue"

defineProps({
  /**
   * stages: [{ label, status, detail? }]
   * status: done | running | queued | failed
   */
  stages: { type: Array, default: () => [] },
  orientation: { type: String, default: "horizontal" }, // horizontal | vertical
})
</script>

<template>
  <!-- horizontal: nodes in a row joined by connectors -->
  <div v-if="orientation !== 'vertical'" class="pc-pipeline pc-pipeline--h">
    <template v-for="(stage, i) in stages" :key="i">
      <div
        v-if="i > 0"
        :class="['pc-pipeline__conn', { 'pc-pipeline__conn--done': stages[i - 1].status === 'done' }]"
      />
      <div class="pc-pipeline__stage">
        <div :class="['pc-pipeline__node', `pc-pipeline__node--${stage.status}`]">
          <Icon v-if="stage.status === 'done'" icon="lucide:check" />
          <Icon v-else-if="stage.status === 'failed'" icon="lucide:x" />
          <Spinner v-else-if="stage.status === 'running'" :size="14" />
        </div>
        <div :class="['pc-pipeline__label', { 'pc-pipeline__label--dim': stage.status === 'queued' }]">
          {{ stage.label }}
        </div>
        <div v-if="stage.detail" class="pc-pipeline__detail">{{ stage.detail }}</div>
      </div>
    </template>
  </div>

  <!-- vertical: nodes stacked, joined by a rail -->
  <div v-else class="pc-pipeline pc-pipeline--v">
    <div
      v-for="(stage, i) in stages"
      :key="i"
      :class="['pc-pipeline__row', { 'pc-pipeline__row--last': i === stages.length - 1 }]"
    >
      <div :class="['pc-pipeline__rail', { 'pc-pipeline__rail--done': stage.status === 'done' }]">
        <div :class="['pc-pipeline__node', `pc-pipeline__node--${stage.status}`]">
          <Icon v-if="stage.status === 'done'" icon="lucide:check" />
          <Icon v-else-if="stage.status === 'failed'" icon="lucide:x" />
          <Spinner v-else-if="stage.status === 'running'" :size="14" />
        </div>
      </div>
      <div class="pc-pipeline__text">
        <div :class="['pc-pipeline__label', { 'pc-pipeline__label--dim': stage.status === 'queued' }]">
          {{ stage.label }}
        </div>
        <div v-if="stage.detail" class="pc-pipeline__detail">{{ stage.detail }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-pipeline__node {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.pc-pipeline__node--done { background: var(--status-active); color: var(--paper-on-dark); }
.pc-pipeline__node--failed { background: var(--status-failed); color: var(--paper-on-dark); }
.pc-pipeline__node--running { background: color-mix(in srgb, var(--lavender) 55%, var(--paper)); }
.pc-pipeline__node--queued {
  background: var(--paper);
  box-shadow: inset 0 0 0 2px var(--ink-20);
}

.pc-pipeline__label {
  font-family: var(--display);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.13px;
  color: var(--ink);
}
.pc-pipeline__label--dim { color: var(--ink-40); }
.pc-pipeline__detail {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--ink-60);
}

/* horizontal */
.pc-pipeline--h {
  display: flex;
  align-items: flex-start;
}
.pc-pipeline__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  flex-shrink: 0;
}
.pc-pipeline__stage .pc-pipeline__detail { margin-top: -4px; }
.pc-pipeline__conn {
  flex: 1;
  height: 2px;
  margin-top: 13px;
  background: var(--ink-08);
  min-width: 24px;
}
.pc-pipeline__conn--done {
  background: color-mix(in srgb, var(--status-active) 45%, var(--ink-08));
}

/* vertical */
.pc-pipeline--v {
  display: flex;
  flex-direction: column;
}
.pc-pipeline__row {
  display: flex;
  gap: 14px;
  padding-bottom: 22px;
}
.pc-pipeline__row--last { padding-bottom: 0; }
.pc-pipeline__rail {
  position: relative;
  width: 28px;
  flex-shrink: 0;
}
.pc-pipeline__rail::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 30px;
  bottom: -22px;
  width: 2px;
  background: var(--ink-08);
}
.pc-pipeline__rail--done::after {
  background: color-mix(in srgb, var(--status-active) 45%, var(--ink-08));
}
.pc-pipeline__row--last .pc-pipeline__rail::after { display: none; }
.pc-pipeline__text {
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
</style>
