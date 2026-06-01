<script setup>
import { computed, useSlots } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  // optional iconify icon name, e.g. "lucide:bold" - icon-only when no slot content
  icon: { type: String, default: "" },
  size: { type: String, default: "md" }, // sm | md | lg
  type: { type: String, default: "button" },
})
const emit = defineEmits(["update:modelValue"])

const slots = useSlots()
const iconOnly = computed(() => !!props.icon && !slots.default)

const toggle = () => {
  if (props.disabled) return
  emit("update:modelValue", !props.modelValue)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-pressed="modelValue"
    :class="[
      'pc-toggle-btn',
      `pc-toggle-btn--${size}`,
      { 'pc-toggle-btn--on': modelValue, 'pc-toggle-btn--icon': iconOnly },
    ]"
    @click="toggle"
  >
    <Icon v-if="icon" :icon="icon" class="pc-toggle-btn__icon" aria-hidden="true" />
    <span v-if="!iconOnly" class="pc-toggle-btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.pc-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  min-height: var(--control-h);
  border-radius: var(--radius-sharp);
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: -0.14px;
  font-weight: 500;
  background: var(--ink-04);
  color: var(--ink-60);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background 140ms ease,
    color 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 60ms ease;
  outline: none;
  user-select: none;
  white-space: nowrap;
  line-height: 1.2;
}
.pc-toggle-btn:hover:not(:disabled) { background: var(--ink-08); color: var(--ink); }
.pc-toggle-btn:active:not(:disabled) { transform: translateY(1.5px); }
.pc-toggle-btn:focus-visible { box-shadow: var(--focus-ring); }
.pc-toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* on - midnight accent fill, mirrors a primary button's weight */
.pc-toggle-btn--on {
  background: var(--midnight);
  color: var(--paper-on-dark);
}
.pc-toggle-btn--on:hover:not(:disabled) { background: var(--midnight-hover); color: var(--paper-on-dark); }
.pc-toggle-btn--on:active:not(:disabled) { background: var(--midnight-active); }

/* sizes */
.pc-toggle-btn--sm { padding: 0 10px; min-height: var(--control-h-sm); font-size: 13px; }
.pc-toggle-btn--lg { padding: 0 18px; min-height: var(--control-h-lg); font-size: 15px; }

/* icon-only: perfect square matched to each size's height */
.pc-toggle-btn--icon { width: var(--control-h); padding: 0; }
.pc-toggle-btn--icon.pc-toggle-btn--sm { width: var(--control-h-sm); }
.pc-toggle-btn--icon.pc-toggle-btn--lg { width: var(--control-h-lg); }

.pc-toggle-btn__icon { font-size: 16px; flex-shrink: 0; }
.pc-toggle-btn--sm .pc-toggle-btn__icon { font-size: 15px; }
.pc-toggle-btn--lg .pc-toggle-btn__icon { font-size: 18px; }

.pc-toggle-btn__label { display: inline-flex; align-items: center; gap: 8px; }
</style>
