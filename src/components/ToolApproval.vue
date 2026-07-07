<script setup>
import { ref, computed, nextTick } from "vue"
import { Icon } from "@iconify/vue"
import Button from "./Button.vue"
import Input from "./Input.vue"
import { tokenizeCode } from "../syntax.js"

const props = defineProps({
  // the tool / function name, e.g. "menu.publish_recipe"
  name: { type: String, default: "" },
  // named arguments object, or a raw value (string/array) for tools without named args
  input: { type: [Object, Array, String, Number, Boolean], default: null },
  // optional human-readable line explaining what the tool wants to do
  description: { type: String, default: "" },
  // the resolved state, controlled by the parent. the card stays rendered after
  // a decision so the transcript keeps a record of what was allowed
  decision: { type: String, default: "pending" }, // pending | approved | rejected
  // when true, rejecting first reveals an optional reason field; the reason is
  // passed as the reject event payload
  withReason: { type: Boolean, default: false },
  approveLabel: { type: String, default: "Approve" },
  rejectLabel: { type: String, default: "Reject" },
  // iconify name; falls back to a wrench to match ToolCall
  icon: { type: String, default: "lucide:wrench" },
  disabled: { type: Boolean, default: false },
  // rise-and-fade in when first mounted (matches ToolCall / ChatMessage)
  animateIn: { type: Boolean, default: true },
})

const emit = defineEmits(["approve", "reject"])

const DECISION = {
  pending: { label: "Needs approval", cls: "pending", icon: "lucide:shield-question" },
  approved: { label: "Approved", cls: "approved", icon: "lucide:check" },
  rejected: { label: "Rejected", cls: "rejected", icon: "lucide:x" },
}
const decisionMeta = computed(() => DECISION[props.decision] || DECISION.pending)
const pending = computed(() => props.decision === "pending")

const rejecting = ref(false)
const reason = ref("")
const reasonRef = ref(null)

const onApprove = () => emit("approve")
const onReject = () => {
  if (props.withReason && !rejecting.value) {
    rejecting.value = true
    nextTick(() => reasonRef.value?.focus())
    return
  }
  const r = reason.value.trim()
  emit("reject", r || null)
}
const cancelReject = () => {
  rejecting.value = false
  reason.value = ""
}

const isComplex = (v) => v !== null && typeof v === "object"
const fmt = (v) => JSON.stringify(v, null, 2)
const tok = (code) => tokenizeCode(code, "json") || [{ text: code, type: null }]
const jsonTokens = (v) => tok(isComplex(v) ? fmt(v) : JSON.stringify(v))

const isEmptyObj = (v) => isComplex(v) && Object.keys(v).length === 0
const hasInput = computed(() => {
  const v = props.input
  return v !== null && v !== undefined && v !== "" && !isEmptyObj(v)
})
</script>

<template>
  <div
    class="pc-approval"
    :class="[`pc-approval--${decisionMeta.cls}`, { 'pc-approval--animate': animateIn }]"
    role="group"
    :aria-label="`Approval required: ${name}`"
  >
    <div class="pc-approval__head">
      <span class="pc-approval__icon"><Icon :icon="icon" /></span>
      <span class="pc-approval__name">{{ name }}</span>
      <span class="pc-approval__chip">
        <Icon :icon="decisionMeta.icon" class="pc-approval__chip-icon" />
        {{ decisionMeta.label }}
      </span>
    </div>

    <div class="pc-approval__body">
      <p v-if="description" class="pc-approval__desc">{{ description }}</p>

      <section v-if="hasInput" class="pc-approval__section">
        <div class="pc-approval__label">Input</div>
        <pre v-if="isComplex(input)" class="pc-approval__code pc-syntax"><span v-for="(t, i) in tok(fmt(input))" :key="i" :class="['token', t.type]">{{ t.text }}</span></pre>
        <div v-else-if="typeof input === 'string'" class="pc-approval__text">{{ input }}</div>
        <span v-else class="pc-approval__arg-val pc-syntax"><span v-for="(t, i) in jsonTokens(input)" :key="i" :class="['token', t.type]">{{ t.text }}</span></span>
      </section>

      <slot />

      <div v-if="pending" class="pc-approval__decide">
        <div v-if="rejecting" class="pc-approval__reason">
          <Input
            ref="reasonRef"
            v-model="reason"
            size="sm"
            placeholder="Reason (optional)"
            :disabled="disabled"
            @keydown.enter="onReject"
            @keydown.esc="cancelReject"
          />
        </div>
        <div class="pc-approval__actions">
          <Button v-if="rejecting" variant="ghost" size="sm" :disabled="disabled" @click="cancelReject">Back</Button>
          <Button variant="outline" size="sm" :disabled="disabled" @click="onReject">{{ rejectLabel }}</Button>
          <Button v-if="!rejecting" variant="primary" size="sm" :disabled="disabled" @click="onApprove">{{ approveLabel }}</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-approval {
  border: 1px solid color-mix(in srgb, var(--status-warning) 32%, var(--ink-08));
  border-radius: var(--radius-comfy);
  background:
    radial-gradient(90% 140% at 0% 0%, color-mix(in srgb, var(--status-warning) 7%, transparent), transparent 70%),
    var(--paper);
  overflow: hidden;
}
.pc-approval--approved,
.pc-approval--rejected {
  border-color: var(--ink-08);
  background: var(--paper);
}

.pc-approval--animate {
  animation: pc-approval-in 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
@keyframes pc-approval-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-approval__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 0;
}
.pc-approval__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--status-warning-bg);
  color: var(--status-warning);
  font-size: 13px;
}
.pc-approval--approved .pc-approval__icon { background: var(--ink-04); color: var(--ink-60); }
.pc-approval--rejected .pc-approval__icon { background: var(--status-failed-bg); color: var(--status-failed); }

.pc-approval__name {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-approval__chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--status-warning-bg);
  color: var(--status-warning);
}
.pc-approval--approved .pc-approval__chip { background: var(--status-active-bg); color: var(--status-active); }
.pc-approval--rejected .pc-approval__chip { background: var(--status-failed-bg); color: var(--status-failed); }
.pc-approval__chip-icon { font-size: 12px; }

.pc-approval__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 10px 10px;
}

.pc-approval__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: -0.13px;
  color: var(--ink-60);
}

.pc-approval__section { display: flex; flex-direction: column; gap: 5px; }
.pc-approval__label {
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-40);
}

.pc-approval__arg-val {
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink);
  overflow-wrap: anywhere;
}
.pc-approval__code {
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
.pc-approval__code::-webkit-scrollbar { width: 8px; height: 8px; }
.pc-approval__code::-webkit-scrollbar-thumb { background: var(--ink-20); border-radius: 4px; }
.pc-approval__text {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.pc-approval__decide { display: flex; flex-direction: column; gap: 8px; }
.pc-approval__reason {
  animation: pc-approval-reason-in 180ms ease-out backwards;
}
@keyframes pc-approval-reason-in {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
}
.pc-approval__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .pc-approval--animate { animation: none; }
  .pc-approval__reason { animation: none; }
}
</style>
