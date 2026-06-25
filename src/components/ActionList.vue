<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import Button from "./Button.vue"
import Modal from "./Modal.vue"
import ConfirmPopover from "./ConfirmPopover.vue"

const props = defineProps({
  // each item: { label, subtitle?, icon?, href?, disabled?, value? }
  items: { type: Array, default: () => [] },
  // row actions revealed on hover, shown left of the chevron:
  // { name, icon, label?, variant?, confirm?, show? }
  // variant: default | danger. confirm: true | { title, message, confirmLabel, cancelLabel, placement }
  // show is an optional (item) => boolean predicate that gates the action per row
  actions: { type: Array, default: () => [] },
  // how a confirm action asks for confirmation: a centered modal, or an inline popover
  confirmStyle: { type: String, default: "modal" }, // modal | popover
  // trailing icon on every row; set "" to hide
  chevron: { type: String, default: "lucide:chevron-right" },
  // staggered entrance on mount
  animate: { type: Boolean, default: true },
  // tighter rows for dense lists
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(["select", "action"])

const actionsFor = (item) => props.actions.filter((a) => !a.show || a.show(item))
const keyOf = (item, index) => item.value ?? item.label ?? index

const onSelect = (item, index) => {
  if (item.disabled) return
  emit("select", item, index)
}

const resolveConfirm = (action, item) => {
  const c = typeof action.confirm === "object" ? action.confirm : {}
  const verb = action.label || action.name
  return {
    explicitTitle: c.title ?? "",
    defaultTitle: `${verb}?`,
    message: c.message ?? `Are you sure you want to ${verb.toLowerCase()} "${item.label}"?`,
    confirmLabel: c.confirmLabel ?? verb,
    cancelLabel: c.cancelLabel ?? "Cancel",
    placement: c.placement ?? "top-end",
    danger: action.variant === "danger",
  }
}

const emitAction = (action, item, index) => emit("action", { action: action.name, item, index })

const openKey = ref(null)
const pending = ref(null) // { action, item, index } awaiting modal confirmation

const onAction = (action, item, index) => {
  if (item.disabled) return
  if (action.confirm) {
    pending.value = { action, item, index }
    return
  }
  emit("action", { action: action.name, item, index })
}

const confirmOpen = computed({
  get: () => !!pending.value,
  set: (v) => { if (!v) pending.value = null },
})

const confirmText = computed(() => {
  if (!pending.value) return null
  const r = resolveConfirm(pending.value.action, pending.value.item)
  return { ...r, title: r.explicitTitle || r.defaultTitle }
})

const proceed = () => {
  const p = pending.value
  if (!p) return
  emit("action", { action: p.action.name, item: p.item, index: p.index })
  pending.value = null
}

// cap the cascade so a long list still finishes quickly
const delay = (i) => (props.animate ? `${Math.min(i, 12) * 40}ms` : "0ms")
</script>

<template>
  <div class="pc-actionlist" :class="{ 'pc-actionlist--animate': animate, 'pc-actionlist--compact': compact }">
    <div
      v-for="(item, i) in items"
      :key="item.value ?? item.label ?? i"
      :class="['pc-actionlist__item', {
        'pc-actionlist__item--disabled': item.disabled,
        'pc-actionlist__item--actions-open': openKey === keyOf(item, i),
      }]"
      :style="{ '--row-delay': delay(i) }"
    >
      <!-- the stretched primary target - its ::after covers the whole row so a
           click anywhere (except the actions) selects/navigates -->
      <component
        :is="item.href && !item.disabled ? 'a' : 'button'"
        :href="item.href && !item.disabled ? item.href : undefined"
        :type="item.href && !item.disabled ? undefined : 'button'"
        :disabled="!item.href && item.disabled ? true : undefined"
        :aria-disabled="item.disabled || undefined"
        class="pc-actionlist__main"
        @click="onSelect(item, i)"
      >
        <Icon v-if="item.icon" :icon="item.icon" class="pc-actionlist__icon" aria-hidden="true" />
        <span class="pc-actionlist__body">
          <span class="pc-actionlist__label">{{ item.label }}</span>
          <span v-if="item.subtitle" class="pc-actionlist__subtitle">{{ item.subtitle }}</span>
        </span>
      </component>

      <span v-if="actionsFor(item).length && !item.disabled" class="pc-actionlist__actions-wrap">
        <span class="pc-actionlist__actions">
          <template v-for="action in actionsFor(item)" :key="action.name">
            <ConfirmPopover
              v-if="confirmStyle === 'popover' && action.confirm"
              :title="resolveConfirm(action, item).explicitTitle"
              :message="resolveConfirm(action, item).message"
              :confirm-label="resolveConfirm(action, item).confirmLabel"
              :cancel-label="resolveConfirm(action, item).cancelLabel"
              :variant="action.variant === 'danger' ? 'danger' : 'primary'"
              :placement="resolveConfirm(action, item).placement"
              @open="openKey = keyOf(item, i)"
              @close="openKey = null"
              @confirm="emitAction(action, item, i)"
            >
              <template #trigger>
                <Button
                  :icon="action.icon"
                  :variant="action.variant === 'danger' ? 'danger' : 'ghost'"
                  size="sm"
                  :aria-label="action.label || action.name"
                />
              </template>
            </ConfirmPopover>
            <Button
              v-else
              :icon="action.icon"
              :variant="action.variant === 'danger' ? 'danger' : 'ghost'"
              size="sm"
              :aria-label="action.label || action.name"
              @click="onAction(action, item, i)"
            />
          </template>
        </span>
      </span>

      <Icon v-if="chevron" :icon="chevron" class="pc-actionlist__chevron" aria-hidden="true" />
    </div>

    <Modal v-model="confirmOpen" size="sm" :title="confirmText?.title">
      <slot name="confirm" :pending="pending">
        <p class="pc-actionlist__confirm-msg">{{ confirmText?.message }}</p>
      </slot>
      <template #footer="{ close }">
        <Button variant="outline" size="sm" @click="close">{{ confirmText?.cancelLabel }}</Button>
        <Button :variant="confirmText?.danger ? 'danger' : 'primary'" size="sm" @click="proceed">
          {{ confirmText?.confirmLabel }}
        </Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.pc-actionlist { display: flex; flex-direction: column; width: 100%; }

.pc-actionlist__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  color: var(--ink);
  transition: background 140ms ease;
}
.pc-actionlist__item + .pc-actionlist__item { border-top: 1px solid var(--ink-08); }
.pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) { background: var(--ink-04); }
.pc-actionlist__item:has(.pc-actionlist__main:focus-visible) { background: var(--ink-04); }
.pc-actionlist__item:has(.pc-actionlist__main:active:not(:disabled)) { background: var(--ink-08); }
.pc-actionlist__item--disabled { color: var(--ink-40); }

.pc-actionlist--compact .pc-actionlist__item { padding: 9px 12px; gap: 10px; }

/* the primary target - holds the label and stretches over the whole row via ::after */
.pc-actionlist__main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  outline: none;
}
.pc-actionlist__main::after { content: ""; position: absolute; inset: 0; }
.pc-actionlist__item--disabled .pc-actionlist__main { cursor: not-allowed; }
.pc-actionlist--compact .pc-actionlist__main { gap: 10px; }

.pc-actionlist__icon { font-size: 18px; color: var(--ink-60); flex-shrink: 0; }
.pc-actionlist--compact .pc-actionlist__icon { font-size: 16px; }

.pc-actionlist__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.pc-actionlist__label {
  font-family: var(--display);
  font-size: 15px;
  letter-spacing: -0.14px;
  line-height: 1.35;
}
.pc-actionlist--compact .pc-actionlist__label { font-size: 13.5px; }
.pc-actionlist__subtitle {
  font-size: 13px;
  color: var(--ink-60);
  line-height: 1.4;
}
.pc-actionlist--compact .pc-actionlist__subtitle { font-size: 12px; }

/* actions sit above the stretched ::after so they stay clickable. their slot is
   always reserved in the row's empty trailing space (main is flex:1), so the
   reveal is a pure opacity + scale fade - no layout animation, no clipping, and
   nothing slides against the chevron */
.pc-actionlist__actions-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}
.pc-actionlist__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 140ms ease;
}
.pc-actionlist__actions > * { flex-shrink: 0; }
.pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) .pc-actionlist__actions,
.pc-actionlist__item:focus-within .pc-actionlist__actions,
.pc-actionlist__item--actions-open .pc-actionlist__actions {
  opacity: 1;
  pointer-events: auto;
}

/* the chevron is decorative and sits under the stretched target; only it moves on hover */
.pc-actionlist__chevron {
  flex-shrink: 0;
  color: var(--ink-40);
  font-size: 18px;
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), color 140ms ease;
}
.pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) .pc-actionlist__chevron {
  color: var(--ink);
  transform: translateX(3px);
}

.pc-actionlist__confirm-msg { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-60); }

.pc-actionlist--animate .pc-actionlist__item {
  animation: pc-actionlist-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-actionlist-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pc-actionlist--animate .pc-actionlist__item { animation: none; }
  .pc-actionlist__actions { transition: opacity 120ms ease; }
  .pc-actionlist__chevron { transition: color 140ms ease; }
  .pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) .pc-actionlist__chevron { transform: none; }
}
</style>
