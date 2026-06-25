<script setup>
import { ref, watch, onMounted, nextTick } from "vue"
import Button from "./Button.vue"

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Send a message…" },
  disabled: { type: Boolean, default: false },
  // shows the send button in its loading state and blocks submits while awaiting a reply
  loading: { type: Boolean, default: false },
  // auto-grow bounds, in rows
  minRows: { type: Number, default: 1 },
  maxRows: { type: Number, default: 8 },
  // Enter submits; Shift+Enter inserts a newline. set false to require the button
  submitOnEnter: { type: Boolean, default: true },
})

const emit = defineEmits(["update:modelValue", "submit"])

const taRef = ref(null)

const resize = () => {
  const el = taRef.value
  if (!el) return
  el.style.height = "auto"
  const cs = getComputedStyle(el)
  const line = parseFloat(cs.lineHeight) || 20
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
  const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)
  const max = line * props.maxRows + padY + border
  const next = Math.min(el.scrollHeight + border, max)
  el.style.height = `${next}px`
  el.style.overflowY = el.scrollHeight + border > max ? "auto" : "hidden"
}

const canSend = () => !props.disabled && !props.loading && props.modelValue.trim().length > 0

const submit = () => {
  if (!canSend()) return
  emit("submit", props.modelValue.trim())
  // clearing on send is the composer's contract; do it on the DOM directly so it
  // works regardless of focus, and notify the parent
  const el = taRef.value
  if (el) el.value = ""
  emit("update:modelValue", "")
  nextTick(resize)
}

const onInput = (e) => {
  emit("update:modelValue", e.target.value)
  resize()
}

const onKeydown = (e) => {
  if (e.key !== "Enter" || !props.submitOnEnter) return
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  submit()
}

// the textarea is DOM-owned (no :value binding). while it is focused the DOM is
// the source of truth - syncing modelValue back in would let a lagging echo of
// the user's own keystrokes overwrite and drop characters. external changes
// (programmatic set/prefill) apply when the field is not being edited
watch(() => props.modelValue, (v) => {
  const el = taRef.value
  if (!el || el === (typeof document !== "undefined" && document.activeElement)) return
  if (v !== el.value) {
    el.value = v
    nextTick(resize)
  }
})

onMounted(() => {
  if (taRef.value) taRef.value.value = props.modelValue
  resize()
})

const focus = () => {
  const el = taRef.value
  if (!el) return
  el.focus()
  const end = el.value.length
  el.setSelectionRange(end, end)
}

defineExpose({ focus })
</script>

<template>
  <div class="pc-composer" :class="{ 'pc-composer--disabled': disabled }">
    <div v-if="$slots.lead" class="pc-composer__lead"><slot name="lead" /></div>

    <textarea
      ref="taRef"
      class="pc-composer__input"
      :rows="minRows"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @keydown="onKeydown"
    />

    <div class="pc-composer__actions">
      <slot name="actions" />
      <slot name="send" :submit="submit" :disabled="!canSend()">
        <Button
          variant="primary"
          size="sm"
          icon="lucide:arrow-up"
          :loading="loading"
          :disabled="disabled || modelValue.trim().length === 0"
          aria-label="Send message"
          @click="submit"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.pc-composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  background: var(--paper);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.pc-composer:focus-within { border-color: var(--midnight); box-shadow: var(--focus-ring); }
.pc-composer--disabled { background: var(--ink-04); }

.pc-composer__lead { display: flex; align-items: center; flex-shrink: 0; padding-bottom: 4px; }

.pc-composer__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--ink);
  font-family: var(--display);
  font-size: 14px;
  line-height: 1.45;
  letter-spacing: -0.14px;
  padding: 6px 0;
  max-height: none;
}
.pc-composer__input::placeholder { color: var(--ink-40); }
.pc-composer__input:disabled { cursor: not-allowed; color: var(--ink-60); }

.pc-composer__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-bottom: 2px;
}
</style>
