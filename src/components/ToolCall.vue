<script setup>
import { ref, computed, inject } from "vue"
import { Icon } from "@iconify/vue"
import Spinner from "./Spinner.vue"
import { tokenizeCode } from "../syntax.js"

const props = defineProps({
  // the tool / function name, e.g. "reservations.count"
  name: { type: String, default: "" },
  status: { type: String, default: "success" }, // success | error | running | pending
  // named arguments object, or a raw value (string/array) for tools without named args
  input: { type: [Object, Array, String, Number, Boolean], default: null },
  // the tool result - string, number, object, or array. large objects scroll
  output: { default: undefined },
  durationMs: { type: Number, default: null },
  // iconify name; falls back to a wrench
  icon: { type: String, default: "lucide:wrench" },
  collapsible: { type: Boolean, default: true },
  defaultOpen: { type: Boolean, default: true },
  // rise-and-fade in when first mounted (matches ChatMessage); self-contained,
  // so it works anywhere this component is rendered
  animateIn: { type: Boolean, default: true },
})

const rootRef = ref(null)
// optional - present when rendered inside a ChatScroller
const scroller = inject("pcChatScroller", null)

const open = ref(props.defaultOpen)
const toggle = () => {
  if (!props.collapsible) return
  open.value = !open.value
  // when expanding inside a chat scroller, reveal this card instead of letting
  // the auto-pin keep the user at the bottom with the body off-screen above.
  // called synchronously so the pin releases before the expand resize can re-pin
  if (open.value && scroller) scroller.reveal(rootRef.value)
}

const STATUS = {
  success: { label: "Done", cls: "ok", icon: "lucide:check" },
  error: { label: "Error", cls: "err", icon: "lucide:x" },
  running: { label: "Running", cls: "run", icon: "" },
  pending: { label: "Queued", cls: "pend", icon: "lucide:clock" },
}
const statusMeta = computed(() => STATUS[props.status] || STATUS.success)

const isComplex = (v) => v !== null && typeof v === "object"
const fmt = (v) => JSON.stringify(v, null, 2)

// prism token pieces for a json snippet; falls back to one plain piece
const tok = (code) => tokenizeCode(code, "json") || [{ text: code, type: null }]
// highlight an object/array as pretty json, or a primitive as its json literal
const jsonTokens = (v) => tok(isComplex(v) ? fmt(v) : JSON.stringify(v))

const isEmptyObj = (v) => isComplex(v) && Object.keys(v).length === 0
const hasInput = computed(() => {
  const v = props.input
  return v !== null && v !== undefined && v !== "" && !isEmptyObj(v)
})
const hasOutput = computed(() => props.output !== undefined && props.output !== null)

const fmtDuration = (ms) =>
  ms == null ? "" : ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}s` : `${Math.round(ms)}ms`
</script>

<template>
  <div ref="rootRef" class="pc-tool" :class="[`pc-tool--${statusMeta.cls}`, { 'pc-tool--open': open, 'pc-tool--animate': animateIn }]">
    <component
      :is="collapsible ? 'button' : 'div'"
      :type="collapsible ? 'button' : undefined"
      class="pc-tool__head"
      :class="{ 'pc-tool__head--btn': collapsible }"
      :aria-expanded="collapsible ? open : undefined"
      @click="toggle"
    >
      <span class="pc-tool__icon">
        <Spinner v-if="status === 'running'" :size="13" />
        <Icon v-else :icon="icon" />
      </span>
      <span class="pc-tool__name">{{ name }}</span>
      <span class="pc-tool__status">
        <Icon v-if="statusMeta.icon" :icon="statusMeta.icon" class="pc-tool__status-icon" />
        {{ statusMeta.label }}
      </span>
      <span v-if="durationMs != null" class="pc-tool__dur">{{ fmtDuration(durationMs) }}</span>
      <Icon
        v-if="collapsible"
        icon="lucide:chevron-down"
        class="pc-tool__chev"
      />
    </component>

    <div class="pc-tool__bodywrap">
      <div class="pc-tool__body">
        <div class="pc-tool__inner">
          <section v-if="hasInput" class="pc-tool__section">
            <div class="pc-tool__label">Input</div>
            <pre v-if="isComplex(input)" class="pc-tool__code pc-syntax"><span v-for="(t, i) in tok(fmt(input))" :key="i" :class="['token', t.type]">{{ t.text }}</span></pre>
            <div v-else-if="typeof input === 'string'" class="pc-tool__text">{{ input }}</div>
            <span v-else class="pc-tool__arg-val pc-syntax"><span v-for="(t, i) in jsonTokens(input)" :key="i" :class="['token', t.type]">{{ t.text }}</span></span>
          </section>

          <section v-if="hasOutput" class="pc-tool__section">
            <div class="pc-tool__label">Output</div>
            <pre v-if="isComplex(output)" class="pc-tool__code pc-syntax"><span v-for="(t, i) in tok(fmt(output))" :key="i" :class="['token', t.type]">{{ t.text }}</span></pre>
            <div v-else-if="typeof output === 'string'" class="pc-tool__text">{{ output }}</div>
            <span v-else class="pc-tool__arg-val pc-syntax"><span v-for="(t, i) in jsonTokens(output)" :key="i" :class="['token', t.type]">{{ t.text }}</span></span>
          </section>

          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-tool {
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  background: var(--paper);
  overflow: hidden;
  transition: transform 60ms ease;
}

/* whole-card press feedback when the header is pressed, matching Button's
   push-down. only fires for the clickable header, not text selection in the body */
.pc-tool:has(.pc-tool__head--btn:active) { transform: translateY(1px); }

/* self-contained rise-and-fade entrance on mount, matching ChatMessage bubbles.
   `backwards` (not `both`) so it stops holding `transform` after it finishes,
   letting the press transform above take effect */
.pc-tool--animate {
  animation: pc-tool-in 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
@keyframes pc-tool-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .pc-tool--animate { animation: none; }
}

.pc-tool__head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  background: transparent;
  border: 0;
  font: inherit;
  text-align: left;
  color: var(--ink);
}
.pc-tool__head--btn { cursor: pointer; transition: background 120ms ease; }
.pc-tool__head--btn:hover { background: var(--ink-04); }
.pc-tool__head--btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.pc-tool__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--ink-04);
  color: var(--ink-60);
  font-size: 13px;
}
.pc-tool--err .pc-tool__icon { background: var(--status-failed-bg); color: var(--status-failed); }

.pc-tool__name {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-tool__status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--status-active-bg);
  color: var(--status-active);
}
.pc-tool__status-icon { font-size: 12px; }
.pc-tool--err .pc-tool__status { background: var(--status-failed-bg); color: var(--status-failed); }
.pc-tool--run .pc-tool__status { background: var(--status-paused-bg); color: var(--status-paused); }
.pc-tool--pend .pc-tool__status { background: var(--status-draft-bg); color: var(--status-draft); }

.pc-tool__dur {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-40);
  flex-shrink: 0;
}
.pc-tool__chev {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--ink-40);
  font-size: 16px;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* when there is no duration the chevron still pins right via margin-left auto;
   when there is a duration, push the chevron off the duration with a small gap */
.pc-tool__dur + .pc-tool__chev { margin-left: 8px; }
.pc-tool--open .pc-tool__chev { transform: rotate(180deg); }

.pc-tool__bodywrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pc-tool--open .pc-tool__bodywrap { grid-template-rows: 1fr; }
.pc-tool__body { overflow: hidden; min-height: 0; }

.pc-tool__inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* the header already carries its bottom padding; a hair here balances the gap
     above the first label against the 10px sides and bottom */
  padding: 2px 10px 10px;
}

.pc-tool__section { display: flex; flex-direction: column; gap: 5px; }
.pc-tool__label {
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-40);
}

/* inline primitive value (non-object input/output) */
.pc-tool__arg-val {
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.pc-tool__code {
  margin: 0;
  padding: 8px 10px;
  border-radius: var(--radius-sharp);
  background: var(--ink-04);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  max-height: 260px;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-20) transparent;
}
.pc-tool__code::-webkit-scrollbar { width: 8px; height: 8px; }
.pc-tool__code::-webkit-scrollbar-thumb { background: var(--ink-20); border-radius: 4px; }

/* free-text (prose) output wraps and stays unhighlighted */
.pc-tool__text {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {
  .pc-tool__bodywrap, .pc-tool__chev { transition: none; }
}
</style>
