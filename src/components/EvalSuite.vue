<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import Spinner from "./Spinner.vue"

const props = defineProps({
  /**
   * results: [{ name, status, score?, input?, output?, expected?,
   *             rationale?, checks?, durationMs? }]
   * status: passed | failed | running | pending | error
   * score:  0..1 (optional)
   * checks: [{ label, passed }]  (assertion-style sub-checks)
   * rationale: the LLM judge's reasoning (optional)
   */
  results: { type: Array, default: () => [] },
  name: { type: String, default: "" },
})

const scoreLevel = (s) => (s >= 0.8 ? "high" : s >= 0.5 ? "medium" : "low")
const formatDuration = (ms) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}s` : `${Math.round(ms)}ms`

const hasDetail = (r) =>
  r.input != null || r.output != null || r.expected != null ||
  r.rationale != null || (r.checks && r.checks.length > 0)

const open = ref(new Set())
const isOpen = (i) => open.value.has(i)
const toggle = (i) => {
  if (open.value.has(i)) open.value.delete(i)
  else open.value.add(i)
}
</script>

<template>
  <div class="pc-evalsuite">
    <div v-if="name" class="pc-evalsuite__head">{{ name }}</div>

    <div class="pc-evalsuite__list">
      <div
        v-for="(r, i) in results"
        :key="i"
        class="pc-evalsuite__case"
        :style="{ '--row-delay': `${Math.min(i, 12) * 35}ms` }"
      >
        <component
          :is="hasDetail(r) ? 'button' : 'div'"
          :type="hasDetail(r) ? 'button' : undefined"
          :class="['pc-evalsuite__row', { 'pc-evalsuite__row--btn': hasDetail(r) }]"
          @click="hasDetail(r) && toggle(i)"
        >
          <span :class="['pc-evalsuite__status', `pc-evalsuite__status--${r.status}`]">
            <Spinner v-if="r.status === 'running'" :size="12" />
            <Icon v-else-if="r.status === 'passed'" icon="lucide:check" />
            <Icon v-else-if="r.status === 'failed'" icon="lucide:x" />
            <Icon v-else-if="r.status === 'error'" icon="lucide:triangle-alert" />
            <Icon v-else icon="lucide:circle-dashed" />
          </span>
          <span class="pc-evalsuite__case-name">{{ r.name }}</span>
          <span
            v-if="r.score != null"
            :class="['pc-evalsuite__score', `pc-evalsuite__score--${scoreLevel(r.score)}`]"
          >{{ Math.round(r.score * 100) }}%</span>
          <span v-if="r.durationMs != null" class="pc-evalsuite__dur">
            {{ formatDuration(r.durationMs) }}
          </span>
          <Icon
            v-if="hasDetail(r)"
            icon="lucide:chevron-right"
            :class="['pc-evalsuite__chev', { 'pc-evalsuite__chev--open': isOpen(i) }]"
          />
        </component>

        <div
          v-if="hasDetail(r)"
          :class="['pc-evalsuite__detail-wrap', { 'pc-evalsuite__detail-wrap--open': isOpen(i) }]"
        >
          <div class="pc-evalsuite__detail">
            <div class="pc-evalsuite__detail-inner">
            <div v-if="r.input != null" class="pc-evalsuite__field">
              <div class="pc-evalsuite__field-label">Input</div>
              <div class="pc-evalsuite__field-text">{{ r.input }}</div>
            </div>
            <div v-if="r.output != null" class="pc-evalsuite__field">
              <div class="pc-evalsuite__field-label">Output</div>
              <div class="pc-evalsuite__field-text">{{ r.output }}</div>
            </div>
            <div v-if="r.expected != null" class="pc-evalsuite__field">
              <div class="pc-evalsuite__field-label">Expected</div>
              <div class="pc-evalsuite__field-text">{{ r.expected }}</div>
            </div>
            <div v-if="r.checks && r.checks.length" class="pc-evalsuite__field">
              <div class="pc-evalsuite__field-label">Checks</div>
              <div class="pc-evalsuite__checks">
                <div v-for="(c, ci) in r.checks" :key="ci" class="pc-evalsuite__check">
                  <Icon
                    :icon="c.passed ? 'lucide:check' : 'lucide:x'"
                    :class="['pc-evalsuite__check-icon', c.passed ? 'is-pass' : 'is-fail']"
                  />
                  <span>{{ c.label }}</span>
                </div>
              </div>
            </div>
            <div v-if="r.rationale != null" class="pc-evalsuite__field">
              <div class="pc-evalsuite__field-label">Judge</div>
              <div class="pc-evalsuite__rationale">{{ r.rationale }}</div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-evalsuite { width: 100%; }

.pc-evalsuite__head {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ink-08);
}

.pc-evalsuite__list { display: flex; flex-direction: column; }
.pc-evalsuite__case {
  border-bottom: 1px solid var(--ink-08);
  animation: pc-evalsuite-in 320ms cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-evalsuite-in {
  from { opacity: 0; translate: -10px 0; }
  to { opacity: 1; translate: 0 0; }
}

.pc-evalsuite__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 4px;
  text-align: left;
  background: transparent;
  outline: none;
}
.pc-evalsuite__row--btn {
  cursor: pointer;
  transition: background 120ms ease, box-shadow 120ms ease;
}
.pc-evalsuite__row--btn:hover { background: var(--ink-04); }
.pc-evalsuite__row--btn:focus-visible { box-shadow: var(--focus-ring); }

.pc-evalsuite__status {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.pc-evalsuite__status--passed { color: var(--status-active); }
.pc-evalsuite__status--failed { color: var(--status-failed); }
.pc-evalsuite__status--error { color: var(--status-warning); }
.pc-evalsuite__status--pending { color: var(--ink-20); }

.pc-evalsuite__case-name {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  letter-spacing: -0.13px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-evalsuite__score {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.pc-evalsuite__score--high { color: var(--status-active); }
.pc-evalsuite__score--medium { color: var(--status-warning); }
.pc-evalsuite__score--low { color: var(--status-failed); }
.pc-evalsuite__dur {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--ink-40);
}
.pc-evalsuite__chev {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--ink-20);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-evalsuite__chev--open { transform: rotate(90deg); }

/* detail */
.pc-evalsuite__detail-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-evalsuite__detail-wrap--open { grid-template-rows: 1fr; }
/* the grid-collapse clipper stays bare so it does not peek at 0fr */
.pc-evalsuite__detail {
  min-height: 0;
  overflow: hidden;
}
.pc-evalsuite__detail-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 4px 14px 31px;
}
.pc-evalsuite__field-label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  margin-bottom: 4px;
}
.pc-evalsuite__field-text {
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.55;
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 8px 10px;
  background: var(--ink-04);
  border-radius: var(--radius-sharp);
}
.pc-evalsuite__checks { display: flex; flex-direction: column; gap: 4px; }
.pc-evalsuite__check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  letter-spacing: -0.12px;
  color: var(--ink);
}
.pc-evalsuite__check-icon { font-size: 13px; flex-shrink: 0; }
.pc-evalsuite__check-icon.is-pass { color: var(--status-active); }
.pc-evalsuite__check-icon.is-fail { color: var(--status-failed); }
.pc-evalsuite__rationale {
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: -0.13px;
  color: var(--ink-60);
  padding-left: 10px;
  border-left: 2px solid color-mix(in srgb, var(--lavender) 60%, var(--ink-08));
}

@media (prefers-reduced-motion: reduce) {
  .pc-evalsuite__case { animation: none; }
}
</style>
