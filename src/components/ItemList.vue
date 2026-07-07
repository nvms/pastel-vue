<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import Button from "./Button.vue"
import Modal from "./Modal.vue"
import ConfirmPopover from "./ConfirmPopover.vue"

const props = defineProps({
  // each item: { label, icon?, meta?, status?, value?, disabled? }
  // status is a string, or { label, tone } where tone is
  // neutral | positive | warning | negative | info
  items: { type: Array, default: () => [] },
  // row actions revealed on hover: { name, icon, label?, variant?, confirm?, show? }
  // variant: default | danger. confirm: true | { title, message, confirmLabel, cancelLabel, placement }
  // show is an optional (item) => boolean predicate that gates the action per row
  actions: { type: Array, default: () => [] },
  // how a confirm action asks for confirmation: a centered modal, or an inline popover
  confirmStyle: { type: String, default: "modal" }, // modal | popover
  // staggered entrance on mount
  animate: { type: Boolean, default: true },
  // tighter rows for dense lists
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(["select", "action"])

const statusOf = (s) => (typeof s === "string" ? { label: s, tone: "neutral" } : { tone: "neutral", ...s })

// cap the cascade so a long list still finishes quickly
const delay = (i) => (props.animate ? `${Math.min(i, 12) * 40}ms` : "0ms")

const actionsFor = (item) => props.actions.filter((a) => !a.show || a.show(item))
const hasActions = (item) => actionsFor(item).length > 0 && !item.disabled

// width reserved in the trail for the absolutely-positioned buttons, and the
// distance the metadata block slides. sm icon buttons are control-h-sm (28px)
// with a 2px gap, plus 14px of breathing room between the metadata and the buttons
const actionsWidth = (item) => {
  const n = actionsFor(item).length
  return n ? `${n * 28 + (n - 1) * 2 + 14}px` : "0px"
}

const keyOf = (item, index) => item.value ?? item.label ?? index

const onSelect = (item, index) => {
  if (item.disabled) return
  emit("select", item, index)
}

// resolve an action's confirm config against an item. explicitTitle is "" unless
// the consumer set one - the popover stays title-less, the modal falls back to a default
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

// the row whose inline confirm popover is open - kept revealed so the trigger and
// its anchor stay put while the (teleported) popover is shown
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
</script>

<template>
  <div class="pc-itemlist" :class="{ 'pc-itemlist--animate': animate, 'pc-itemlist--compact': compact }">
    <div
      v-for="(item, i) in items"
      :key="item.value ?? item.label ?? i"
      :class="['pc-itemlist__row', {
        'pc-itemlist__row--disabled': item.disabled,
        'pc-itemlist__row--actions-open': openKey === keyOf(item, i),
      }]"
      :style="{ '--row-delay': delay(i), '--actions-w': actionsWidth(item) }"
    >
      <Icon v-if="item.icon" :icon="item.icon" class="pc-itemlist__icon" aria-hidden="true" />
      <button
        type="button"
        class="pc-itemlist__label"
        :disabled="item.disabled || undefined"
        @click="onSelect(item, i)"
      >{{ item.label }}</button>

      <div class="pc-itemlist__trail">
        <span class="pc-itemlist__info">
          <span v-if="item.meta" class="pc-itemlist__meta">{{ item.meta }}</span>

          <span
            v-if="item.status"
            class="pc-itemlist__status"
            :class="`pc-itemlist__status--${statusOf(item.status).tone}`"
          >
            <span class="pc-itemlist__dot" aria-hidden="true" />
            {{ statusOf(item.status).label }}
          </span>
        </span>

        <template v-if="hasActions(item)">
          <span class="pc-itemlist__actions">
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
        </template>
      </div>
    </div>

    <Modal v-model="confirmOpen" size="sm" :title="confirmText?.title">
      <slot name="confirm" :pending="pending">
        <p class="pc-itemlist__confirm-msg">{{ confirmText?.message }}</p>
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
.pc-itemlist { display: flex; flex-direction: column; width: 100%; }

.pc-itemlist__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  color: var(--ink);
  transition: background 140ms ease;
  /* scope hover invalidation and paint to the row - on a page with many lists,
     uncontained hover transitions make the browser reconsider the whole document */
  contain: layout style paint;
}
.pc-itemlist__row + .pc-itemlist__row { border-top: 1px solid var(--ink-08); }
.pc-itemlist__row:hover:not(.pc-itemlist__row--disabled) { background: var(--ink-04); }
.pc-itemlist__row--disabled { color: var(--ink-40); }

.pc-itemlist--compact .pc-itemlist__row { padding: 8px 12px; gap: 10px; }

.pc-itemlist__icon { font-size: 17px; color: var(--ink-40); flex-shrink: 0; }
.pc-itemlist--compact .pc-itemlist__icon { font-size: 15px; }

.pc-itemlist__label {
  flex: 1;
  min-width: 0;
  align-self: center;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  text-align: left;
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: -0.14px;
  line-height: 1.4;
  color: var(--ink);
  cursor: pointer;
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 120ms ease;
}
.pc-itemlist__label:hover { text-decoration: underline; }
.pc-itemlist__label:focus-visible { text-decoration: underline; }
.pc-itemlist__label:disabled { color: var(--ink-40); cursor: not-allowed; }
.pc-itemlist--compact .pc-itemlist__label { font-size: 13px; }

/* trailing zone: room for the action buttons is reserved with static padding and
   the metadata block starts translated into it, flush right. on hover the block
   slides left (transform) while the buttons fade in (opacity) - no property that
   triggers layout ever animates, so a hover stays cheap no matter how much else
   is on the page */
.pc-itemlist__trail {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: var(--actions-w, 0px);
}
.pc-itemlist__info {
  display: flex;
  align-items: center;
  gap: 14px;
  transform: translateX(var(--actions-w, 0px));
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.pc-itemlist__meta {
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.01em;
  color: var(--ink-40);
  font-variant-numeric: tabular-nums;
}

.pc-itemlist__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--display);
  font-size: 12.5px;
  letter-spacing: -0.1px;
  color: var(--ink-60);
  white-space: nowrap;
}
.pc-itemlist__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ink-20);
  flex-shrink: 0;
}
.pc-itemlist__status--positive .pc-itemlist__dot { background: var(--status-active); }
.pc-itemlist__status--warning .pc-itemlist__dot { background: var(--status-warning); }
.pc-itemlist__status--negative .pc-itemlist__dot { background: var(--status-failed); }
.pc-itemlist__status--info .pc-itemlist__dot { background: var(--status-paused); }

.pc-itemlist__actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}
.pc-itemlist__actions > * { flex-shrink: 0; }
.pc-itemlist__row:hover:not(.pc-itemlist__row--disabled) .pc-itemlist__info,
.pc-itemlist__row:focus-within .pc-itemlist__info,
.pc-itemlist__row--actions-open .pc-itemlist__info {
  transform: translateX(0);
}
.pc-itemlist__row:hover:not(.pc-itemlist__row--disabled) .pc-itemlist__actions,
.pc-itemlist__row:focus-within .pc-itemlist__actions,
.pc-itemlist__row--actions-open .pc-itemlist__actions {
  opacity: 1;
  pointer-events: auto;
}

.pc-itemlist__confirm-msg { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-60); }

.pc-itemlist--animate .pc-itemlist__row {
  animation: pc-itemlist-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-itemlist-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pc-itemlist--animate .pc-itemlist__row { animation: none; }
  .pc-itemlist__info { transition: none; }
  .pc-itemlist__actions { transition: opacity 120ms ease; }
}
</style>
