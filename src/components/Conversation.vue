<script setup>
import { ref } from "vue"
import { Icon } from "@iconify/vue"
import Spinner from "./Spinner.vue"

const props = defineProps({
  /**
   * turns: [{ user, answer, steps? }]
   * steps (optional, the agent's internal trace for that turn):
   *   { type: "thought", text }
   *   { type: "tool", tool, args?, result?, status?, durationMs? }
   */
  turns: { type: Array, default: () => [] },
  agentName: { type: String, default: "Assistant" },
})

// which turns have their trace expanded
const openTurns = ref(new Set())
const turnOpen = (i) => openTurns.value.has(i)
const toggleTurn = (i) => {
  if (openTurns.value.has(i)) openTurns.value.delete(i)
  else openTurns.value.add(i)
}

// which individual tool steps are expanded to full args + result
const openSteps = ref(new Set())
const stepKey = (i, si) => `${i}:${si}`
const stepOpen = (i, si) => openSteps.value.has(stepKey(i, si))
const toggleStep = (i, si) => {
  const k = stepKey(i, si)
  if (openSteps.value.has(k)) openSteps.value.delete(k)
  else openSteps.value.add(k)
}

const formatDuration = (ms) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}s` : `${Math.round(ms)}ms`

const summarize = (steps) => {
  const tools = steps.filter((s) => s.type === "tool").length
  const dur = steps.reduce((s, st) => s + (st.durationMs || 0), 0)
  const parts = []
  if (tools) parts.push(`${tools} tool call${tools === 1 ? "" : "s"}`)
  parts.push(`${steps.length} step${steps.length === 1 ? "" : "s"}`)
  if (dur) parts.push(formatDuration(dur))
  return parts.join(" · ")
}

const hasArgs = (step) => step.args && Object.keys(step.args).length > 0
const toolExpandable = (step) => hasArgs(step) || step.result != null

// one-line preview shown on the collapsed tool step
const toolPreview = (step) => {
  const args = hasArgs(step)
    ? Object.entries(step.args).map(([k, v]) => `${k}: ${argVal(v)}`).join(", ")
    : ""
  const result = step.result == null ? "" : resultText(step.result)
  if (args && result) return `${args} → ${result}`
  if (args) return args
  if (result) return `→ ${result}`
  return ""
}
const argVal = (v) => (typeof v === "string" ? `"${v}"` : v == null ? "" : JSON.stringify(v))
const resultText = (r) =>
  typeof r === "string" ? r : r == null ? "" : JSON.stringify(r, null, 2)
</script>

<template>
  <div class="pc-conv">
    <div v-for="(turn, i) in turns" :key="i" class="pc-conv__turn">
      <!-- user message -->
      <div class="pc-conv__msg">
        <div class="pc-conv__role pc-conv__role--user">You</div>
        <div class="pc-conv__text">{{ turn.user }}</div>
      </div>

      <!-- agent answer + optional trace -->
      <div class="pc-conv__msg">
        <div class="pc-conv__role pc-conv__role--agent">{{ agentName }}</div>
        <div class="pc-conv__text">{{ turn.answer }}</div>

        <template v-if="turn.steps && turn.steps.length">
          <button
            type="button"
            :class="['pc-conv__toggle', { 'pc-conv__toggle--open': turnOpen(i) }]"
            @click="toggleTurn(i)"
          >
            <Icon icon="lucide:chevron-right" class="pc-conv__toggle-chev" />
            <span>{{ summarize(turn.steps) }}</span>
          </button>

          <div :class="['pc-conv__trace-wrap', { 'pc-conv__trace-wrap--open': turnOpen(i) }]">
            <div class="pc-conv__trace">
              <div class="pc-conv__trace-inner">
              <div
                v-for="(step, si) in turn.steps"
                :key="si"
                class="pc-conv__step"
                :style="{ '--pc-conv-stagger': turnOpen(i) ? `${Math.min(si, 10) * 35}ms` : '0ms' }"
              >
                <!-- thought: just text, shown in full -->
                <div v-if="step.type === 'thought'" class="pc-conv__thought">
                  <span class="pc-conv__icon pc-conv__icon--thought">
                    <Icon icon="lucide:sparkles" />
                  </span>
                  <span class="pc-conv__thought-text">{{ step.text }}</span>
                </div>

                <!-- tool: compact line, expandable to full args + result -->
                <template v-else>
                  <component
                    :is="toolExpandable(step) ? 'button' : 'div'"
                    :type="toolExpandable(step) ? 'button' : undefined"
                    :class="[
                      'pc-conv__tool-head',
                      { 'pc-conv__tool-head--btn': toolExpandable(step) },
                    ]"
                    @click="toolExpandable(step) && toggleStep(i, si)"
                  >
                    <span
                      :class="[
                        'pc-conv__icon',
                        'pc-conv__icon--tool',
                        { 'pc-conv__icon--error': step.status === 'error' },
                      ]"
                    >
                      <Spinner v-if="step.status === 'running'" :size="10" />
                      <Icon v-else icon="lucide:wrench" />
                    </span>
                    <span class="pc-conv__tool-line">
                      <span class="pc-conv__tool-name">{{ step.tool }}</span>
                      <span class="pc-conv__tool-preview">{{ toolPreview(step) }}</span>
                    </span>
                    <span
                      v-if="step.durationMs != null"
                      class="pc-conv__tool-dur"
                    >{{ formatDuration(step.durationMs) }}</span>
                    <Icon
                      v-if="toolExpandable(step)"
                      icon="lucide:chevron-right"
                      :class="['pc-conv__tool-chev', { 'pc-conv__tool-chev--open': stepOpen(i, si) }]"
                    />
                  </component>

                  <div
                    v-if="toolExpandable(step)"
                    :class="['pc-conv__detail-wrap', { 'pc-conv__detail-wrap--open': stepOpen(i, si) }]"
                  >
                    <div class="pc-conv__detail">
                      <div class="pc-conv__detail-inner">
                      <div v-if="hasArgs(step)" class="pc-conv__args">
                        <div v-for="(val, key) in step.args" :key="key" class="pc-conv__arg">
                          <span class="pc-conv__arg-key">{{ key }}</span>
                          <span class="pc-conv__arg-val">{{ argVal(val) }}</span>
                        </div>
                      </div>
                      <div
                        v-if="step.result != null"
                        :class="['pc-conv__result', { 'pc-conv__result--error': step.status === 'error' }]"
                      >{{ resultText(step.result) }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-conv {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.pc-conv__turn {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* messages */
.pc-conv__msg { display: flex; flex-direction: column; gap: 3px; }
.pc-conv__role {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 9px;
  font-weight: 500;
}
.pc-conv__role--user { color: var(--ink-40); }
.pc-conv__role--agent { color: var(--status-paused); }
.pc-conv__text {
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.14px;
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* trace toggle */
.pc-conv__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-sharp);
  background: transparent;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-60);
  cursor: pointer;
  outline: none;
  transition: background 120ms ease, color 120ms ease, box-shadow 120ms ease;
}
.pc-conv__toggle:hover { background: var(--ink-04); color: var(--ink); }
.pc-conv__toggle:active { background: var(--ink-08); }
.pc-conv__toggle:focus-visible { box-shadow: var(--focus-ring); }
.pc-conv__toggle-chev {
  font-size: 13px;
  color: var(--ink-40);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-conv__toggle--open .pc-conv__toggle-chev { transform: rotate(90deg); }

/* trace */
.pc-conv__trace-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-conv__trace-wrap--open { grid-template-rows: 1fr; }
/* the grid-collapse clipper must be bare - no padding/border/margin, or it
   peeks through at 0fr. all styling lives on the inner element */
.pc-conv__trace {
  min-height: 0;
  overflow: hidden;
}
.pc-conv__trace-inner {
  margin-top: 6px;
  margin-left: 3px;
  padding-left: 12px;
  border-left: 2px solid var(--ink-08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pc-conv__step {
  opacity: 0;
  translate: -8px 0;
  transition:
    opacity 240ms ease var(--pc-conv-stagger, 0ms),
    translate 260ms cubic-bezier(0.4, 0, 0.2, 1) var(--pc-conv-stagger, 0ms);
}
.pc-conv__trace-wrap--open .pc-conv__step { opacity: 1; translate: 0 0; }

/* step icon */
.pc-conv__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
.pc-conv__icon--thought {
  background: color-mix(in srgb, var(--lavender) 40%, var(--paper));
  color: var(--midnight);
}
.pc-conv__icon--tool {
  background: color-mix(in srgb, var(--blue-soft) 70%, var(--paper));
  color: var(--midnight);
}
.pc-conv__icon--error { background: var(--status-failed-bg); color: var(--status-failed); }

/* thought - full text, wraps */
.pc-conv__thought {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.pc-conv__thought-text {
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: -0.12px;
  color: var(--ink-60);
  padding-top: 1px;
}

/* tool head - the compact one-line preview */
.pc-conv__tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: transparent;
  outline: none;
}
.pc-conv__tool-head--btn {
  cursor: pointer;
  padding: 3px 4px;
  margin: -3px -4px;
  border-radius: var(--radius-sharp);
  transition: background 120ms ease, box-shadow 120ms ease;
}
.pc-conv__tool-head--btn:hover { background: var(--ink-04); }
.pc-conv__tool-head--btn:focus-visible { box-shadow: var(--focus-ring); }

.pc-conv__tool-line {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.4;
}
.pc-conv__tool-name {
  font-family: var(--mono);
  font-weight: 500;
  color: var(--ink);
}
.pc-conv__tool-preview {
  font-family: var(--mono);
  color: var(--ink-40);
  margin-left: 6px;
}
.pc-conv__tool-dur {
  flex-shrink: 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--ink-40);
}
.pc-conv__tool-chev {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ink-20);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1), color 120ms ease;
}
.pc-conv__tool-head--btn:hover .pc-conv__tool-chev { color: var(--ink-40); }
.pc-conv__tool-chev--open { transform: rotate(90deg); }

/* tool detail - full args + result, expands per step */
.pc-conv__detail-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-conv__detail-wrap--open { grid-template-rows: 1fr; }
.pc-conv__detail {
  min-height: 0;
  overflow: hidden;
}
.pc-conv__detail-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 7px 0 3px 24px;
}
.pc-conv__args {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: var(--ink-04);
  border-radius: var(--radius-sharp);
}
.pc-conv__arg {
  display: flex;
  gap: 8px;
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.5;
}
.pc-conv__arg-key { color: var(--ink-40); flex-shrink: 0; }
.pc-conv__arg-val { color: var(--ink); overflow-wrap: anywhere; }
.pc-conv__result {
  padding: 8px 10px;
  border-left: 2px solid var(--ink-20);
  background: var(--ink-04);
  border-radius: 0 var(--radius-sharp) var(--radius-sharp) 0;
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--ink-60);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.pc-conv__result--error {
  border-left-color: var(--status-failed);
  background: var(--status-failed-bg);
  color: var(--status-failed);
}

@media (prefers-reduced-motion: reduce) {
  .pc-conv__step { transition: none; }
}
</style>
