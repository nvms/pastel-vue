<script setup>
import { computed } from "vue"
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from "reka-ui"

const props = defineProps({
  label: { type: String, default: null },
  eyebrow: { type: String, default: null },
  open: { type: Boolean, default: null },
  defaultOpen: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: "md" }, // sm | md
  variant: { type: String, default: "bordered" }, // bordered | flush | ghost
})
const emit = defineEmits(["update:open"])

const controlled = computed(() => props.open !== null)
</script>

<template>
  <CollapsibleRoot
    :open="controlled ? open : undefined"
    :default-open="controlled ? undefined : defaultOpen"
    :disabled="disabled"
    @update:open="v => emit('update:open', v)"
    :class="[
      'pc-collapsible',
      `pc-collapsible--${variant}`,
      `pc-collapsible--${size}`,
    ]"
  >
    <CollapsibleTrigger class="pc-collapsible__trigger">
      <span class="pc-collapsible__head">
        <span v-if="eyebrow" class="pc-collapsible__eyebrow">{{ eyebrow }}</span>
        <span class="pc-collapsible__label">
          <slot name="label">{{ label }}</slot>
        </span>
      </span>
      <span class="pc-collapsible__chevron" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </CollapsibleTrigger>
    <CollapsibleContent class="pc-collapsible__content">
      <div class="pc-collapsible__body">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.pc-collapsible { display: block; }

.pc-collapsible--bordered {
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  background: var(--paper);
  overflow: hidden;
}

.pc-collapsible__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 0;
  outline: none;
  text-align: left;
  font-family: var(--display);
  color: var(--ink);
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}
.pc-collapsible--md .pc-collapsible__trigger { padding: 14px 18px; }
.pc-collapsible--sm .pc-collapsible__trigger { padding: 10px 14px; }

.pc-collapsible--bordered .pc-collapsible__trigger:hover:not([data-disabled]) {
  background: var(--ink-04);
}
.pc-collapsible__trigger:focus-visible { box-shadow: inset var(--focus-ring); }
.pc-collapsible__trigger[data-disabled] { color: var(--ink-40); cursor: not-allowed; }

.pc-collapsible__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.pc-collapsible__eyebrow {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-collapsible__label {
  font-weight: 500;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.pc-collapsible--md .pc-collapsible__label { font-size: 15px; }
.pc-collapsible--sm .pc-collapsible__label { font-size: 13px; }

.pc-collapsible__chevron {
  width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ink-60);
  flex-shrink: 0;
  transition: rotate 200ms ease, color 140ms ease;
}
.pc-collapsible__trigger[data-state="open"] .pc-collapsible__chevron {
  rotate: 180deg;
  color: var(--ink);
}

.pc-collapsible__content { overflow: hidden; }
.pc-collapsible__content[data-state="open"] { animation: pc-collapsible-down 220ms ease-out; }
.pc-collapsible__content[data-state="closed"] { animation: pc-collapsible-up 180ms ease-out; }
@keyframes pc-collapsible-down {
  from { height: 0; }
  to { height: var(--reka-collapsible-content-height); }
}
@keyframes pc-collapsible-up {
  from { height: var(--reka-collapsible-content-height); }
  to { height: 0; }
}
.pc-collapsible__body {
  font-size: 14px;
  letter-spacing: -0.14px;
  line-height: 1.55;
  color: var(--ink);
}
.pc-collapsible--md .pc-collapsible__body { padding: 0 18px 18px; }
.pc-collapsible--sm .pc-collapsible__body { padding: 0 14px 14px; }

/* flush - hairlines top/bottom, no rounded surface */
.pc-collapsible--flush {
  border-top: 1px solid var(--ink-08);
  border-bottom: 1px solid var(--ink-08);
}
.pc-collapsible--flush .pc-collapsible__trigger { padding-left: 0; padding-right: 0; }
.pc-collapsible--flush .pc-collapsible__trigger:hover { background: transparent; }
.pc-collapsible--flush .pc-collapsible__body { padding-left: 0; padding-right: 0; }
.pc-collapsible--md.pc-collapsible--flush .pc-collapsible__body { padding-bottom: 18px; }
.pc-collapsible--sm.pc-collapsible--flush .pc-collapsible__body { padding-bottom: 14px; }

/* ghost - no chrome at all, the trigger is just the label + chevron */
.pc-collapsible--ghost .pc-collapsible__trigger {
  padding: 4px 0;
  color: var(--ink-60);
  gap: 6px;
  width: auto;
}
.pc-collapsible--ghost .pc-collapsible__trigger:hover { color: var(--ink); }
.pc-collapsible--ghost .pc-collapsible__chevron { width: 16px; height: 16px; }
.pc-collapsible--ghost .pc-collapsible__body {
  padding: 8px 0 0;
}
</style>
