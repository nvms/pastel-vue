<script setup>
import { ref, computed, inject, watch, onUnmounted } from "vue"
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
  // slim renders a single tight status line with no body at all - for
  // transcripts where the payloads are huge or simply not worth showing
  variant: { type: String, default: "full" }, // full | slim
  collapsible: { type: Boolean, default: true },
  defaultOpen: { type: Boolean, default: true },
  // rise-and-fade in when first mounted (matches ChatMessage); self-contained,
  // so it works anywhere this component is rendered
  animateIn: { type: Boolean, default: true },
  // cap on characters rendered per input/output section. highlighting is per
  // character, so an uncapped multi-megabyte payload would lock the tab on
  // expand. the full value is never rendered - a note says what was clipped
  maxChars: { type: Number, default: 50000 },
})

const rootRef = ref(null)
// optional - present when rendered inside a ChatScroller
const scroller = inject("pcChatScroller", null)

const slim = computed(() => props.variant === "slim")
const canCollapse = computed(() => props.collapsible && !slim.value)

const open = ref(props.defaultOpen && props.variant !== "slim")
const toggle = () => {
  if (!canCollapse.value) return
  open.value = !open.value
  // when expanding inside a chat scroller, reveal this card instead of letting
  // the auto-pin keep the user at the bottom with the body off-screen above.
  // called synchronously so the pin releases before the expand resize can re-pin
  if (open.value && scroller) scroller.reveal(rootRef.value)
}

// a collapsed body is not rendered at all - a transcript can hold a hundred of
// these cards, each with a large highlighted payload, and mounting all of that
// text behind a zero-height row is what makes such pages slow. the body mounts
// on expand and unmounts only after the collapse transition has finished
const bodyRendered = ref(open.value)
let unmountTimer = null
watch(open, (v) => {
  clearTimeout(unmountTimer)
  if (v) bodyRendered.value = true
  else unmountTimer = setTimeout(() => { bodyRendered.value = false }, 260)
})
onUnmounted(() => clearTimeout(unmountTimer))

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

// pre-shaped, clipped render model per section. computed so the stringify and
// highlight run once per value, and only when the body is actually rendered
const makeSection = (v) => {
  if (isComplex(v)) {
    const s = fmt(v)
    const clipped = s.length > props.maxChars
    return { kind: "code", tokens: tok(clipped ? s.slice(0, props.maxChars) : s), total: s.length, clipped }
  }
  if (typeof v === "string") {
    const clipped = v.length > props.maxChars
    return { kind: "text", text: clipped ? v.slice(0, props.maxChars) : v, total: v.length, clipped }
  }
  return { kind: "inline", tokens: jsonTokens(v), clipped: false }
}
const inputSection = computed(() => (hasInput.value ? makeSection(props.input) : null))
const outputSection = computed(() => (hasOutput.value ? makeSection(props.output) : null))

const fmtDuration = (ms) =>
  ms == null ? "" : ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}s` : `${Math.round(ms)}ms`
</script>

<template>
  <div ref="rootRef" class="pc-tool" :class="[`pc-tool--${statusMeta.cls}`, { 'pc-tool--open': open, 'pc-tool--animate': animateIn, 'pc-tool--slim': slim }]">
    <component
      :is="canCollapse ? 'button' : 'div'"
      :type="canCollapse ? 'button' : undefined"
      class="pc-tool__head"
      :class="{ 'pc-tool__head--btn': canCollapse }"
      :aria-expanded="canCollapse ? open : undefined"
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
        v-if="canCollapse"
        icon="lucide:chevron-down"
        class="pc-tool__chev"
      />
    </component>

    <div v-if="!slim" class="pc-tool__bodywrap">
      <div class="pc-tool__body">
        <div v-if="bodyRendered" class="pc-tool__inner">
          <section v-if="inputSection" class="pc-tool__section">
            <div class="pc-tool__label">Input</div>
            <pre v-if="inputSection.kind === 'code'" class="pc-tool__code pc-syntax"><span v-for="(t, i) in inputSection.tokens" :key="i" :class="['token', t.type]">{{ t.text }}</span></pre>
            <div v-else-if="inputSection.kind === 'text'" class="pc-tool__text">{{ inputSection.text }}</div>
            <span v-else class="pc-tool__arg-val pc-syntax"><span v-for="(t, i) in inputSection.tokens" :key="i" :class="['token', t.type]">{{ t.text }}</span></span>
            <div v-if="inputSection.clipped" class="pc-tool__clipnote">
              Showing the first {{ maxChars.toLocaleString() }} of {{ inputSection.total.toLocaleString() }} characters
            </div>
          </section>

          <section v-if="outputSection" class="pc-tool__section">
            <div class="pc-tool__label">Output</div>
            <pre v-if="outputSection.kind === 'code'" class="pc-tool__code pc-syntax"><span v-for="(t, i) in outputSection.tokens" :key="i" :class="['token', t.type]">{{ t.text }}</span></pre>
            <div v-else-if="outputSection.kind === 'text'" class="pc-tool__text">{{ outputSection.text }}</div>
            <span v-else class="pc-tool__arg-val pc-syntax"><span v-for="(t, i) in outputSection.tokens" :key="i" :class="['token', t.type]">{{ t.text }}</span></span>
            <div v-if="outputSection.clipped" class="pc-tool__clipnote">
              Showing the first {{ maxChars.toLocaleString() }} of {{ outputSection.total.toLocaleString() }} characters
            </div>
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
  /* scope style and paint invalidation to the card - transcripts render many of
     these and hover or scroll work on one card must not involve the rest */
  contain: layout style paint;
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

.pc-tool__clipnote {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--ink-40);
}

/* free-text (prose) output wraps and stays unhighlighted */
.pc-tool__text {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* slim: a single tight status line - no body, no chevron, nothing to expand.
   borderless and flush so a run of them reads as plain transcript lines */
.pc-tool--slim {
  border: 0;
  border-radius: 0;
  background: transparent;
}
.pc-tool--slim .pc-tool__head { padding: 2px 0; gap: 7px; }
.pc-tool--slim .pc-tool__icon { width: 18px; height: 18px; font-size: 11px; border-radius: 5px; }
.pc-tool--slim .pc-tool__name { font-size: 12px; margin-right: auto; }
/* duration sits left of the status chip so the chips stay flush right */
.pc-tool--slim .pc-tool__status { font-size: 10px; padding: 1px 7px; order: 1; }
.pc-tool--slim .pc-tool__status-icon { font-size: 11px; }
.pc-tool--slim .pc-tool__dur { font-size: 10px; }

@media (prefers-reduced-motion: reduce) {
  .pc-tool__bodywrap, .pc-tool__chev { transition: none; }
}
</style>
