<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import Button from "./Button.vue"
import Modal from "./Modal.vue"

const props = defineProps({
  // each item: { label, description?, icon?, meta?, status?, href?, value?, disabled? }
  // status is a string, or { label, tone } where tone is
  // neutral | positive | warning | negative | info
  items: { type: Array, default: () => [] },
  // row actions revealed on hover: { name, icon, label?, variant?, confirm? }
  // variant: default | danger. confirm: true | { title, message, confirmLabel, cancelLabel }
  actions: { type: Array, default: () => [] },
  // staggered entrance on mount
  animate: { type: Boolean, default: true },
  // tighter rows for dense lists
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(["select", "action"])

const statusOf = (s) => (typeof s === "string" ? { label: s, tone: "neutral" } : { tone: "neutral", ...s })

// description is a plain string, or { text, icon?, href? }
const descOf = (d) => (typeof d === "string" ? { text: d } : d || {})

// cap the cascade so a long list still finishes quickly
const delay = (i) => (props.animate ? `${Math.min(i, 12) * 40}ms` : "0ms")

const onSelect = (item, index) => {
  if (item.disabled) return
  emit("select", item, index)
}

const pending = ref(null) // { action, item, index } awaiting confirmation

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
  const { action, item } = pending.value
  const c = typeof action.confirm === "object" ? action.confirm : {}
  const verb = action.label || action.name
  return {
    title: c.title ?? `${verb}?`,
    message: c.message ?? `Are you sure you want to ${verb.toLowerCase()} "${item.label}"?`,
    confirmLabel: c.confirmLabel ?? verb,
    cancelLabel: c.cancelLabel ?? "Cancel",
    danger: action.variant === "danger",
  }
})

const proceed = () => {
  const p = pending.value
  if (!p) return
  emit("action", { action: p.action.name, item: p.item, index: p.index })
  pending.value = null
}
</script>

<template>
  <div class="pc-recordlist" :class="{ 'pc-recordlist--animate': animate, 'pc-recordlist--compact': compact }">
    <div
      v-for="(item, i) in items"
      :key="item.value ?? item.label ?? i"
      :class="['pc-recordlist__row', { 'pc-recordlist__row--disabled': item.disabled }]"
      :style="{ '--row-delay': delay(i) }"
    >
      <Icon v-if="item.icon" :icon="item.icon" class="pc-recordlist__icon" aria-hidden="true" />

      <span class="pc-recordlist__text">
        <component
          :is="item.href && !item.disabled ? 'a' : 'button'"
          :href="item.href && !item.disabled ? item.href : undefined"
          :type="item.href && !item.disabled ? undefined : 'button'"
          :disabled="!item.href && item.disabled ? true : undefined"
          class="pc-recordlist__name"
          @click="onSelect(item, i)"
        >{{ item.label }}</component>
        <span v-if="item.description || $slots.description" class="pc-recordlist__desc">
          <slot name="description" :item="item" :index="i">
            <Icon
              v-if="descOf(item.description).icon"
              :icon="descOf(item.description).icon"
              class="pc-recordlist__desc-icon"
              :class="`pc-recordlist__desc-icon--${descOf(item.description).iconTone || 'neutral'}`"
              aria-hidden="true"
            />
            <a
              v-if="descOf(item.description).href"
              :href="descOf(item.description).href"
              class="pc-recordlist__desc-text pc-recordlist__desc-link"
            >{{ descOf(item.description).text }}</a>
            <span v-else class="pc-recordlist__desc-text">{{ descOf(item.description).text }}</span>
          </slot>
        </span>
      </span>

      <div class="pc-recordlist__trail">
        <span v-if="item.meta" class="pc-recordlist__meta">{{ item.meta }}</span>

        <span
          v-if="item.status"
          class="pc-recordlist__status"
          :class="`pc-recordlist__status--${statusOf(item.status).tone}`"
        >
          <span class="pc-recordlist__dot" aria-hidden="true" />
          {{ statusOf(item.status).label }}
        </span>

        <span v-if="actions.length && !item.disabled" class="pc-recordlist__actions-wrap">
          <span class="pc-recordlist__actions">
            <Button
              v-for="action in actions"
              :key="action.name"
              :icon="action.icon"
              :variant="action.variant === 'danger' ? 'danger' : 'ghost'"
              size="sm"
              :aria-label="action.label || action.name"
              @click="onAction(action, item, i)"
            />
          </span>
        </span>
      </div>
    </div>

    <Modal v-model="confirmOpen" size="sm" :title="confirmText?.title">
      <slot name="confirm" :pending="pending">
        <p class="pc-recordlist__confirm-msg">{{ confirmText?.message }}</p>
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
.pc-recordlist { display: flex; flex-direction: column; width: 100%; }

.pc-recordlist__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--ink);
  transition: background 140ms ease;
}
.pc-recordlist__row + .pc-recordlist__row { border-top: 1px solid var(--ink-08); }
.pc-recordlist__row:hover:not(.pc-recordlist__row--disabled) { background: var(--ink-04); }
.pc-recordlist__row--disabled { color: var(--ink-40); }

.pc-recordlist--compact .pc-recordlist__row { padding: 8px 12px; gap: 10px; }

.pc-recordlist__icon { font-size: 18px; color: var(--ink-40); flex-shrink: 0; }
.pc-recordlist--compact .pc-recordlist__icon { font-size: 16px; }

/* two lines of text on the left, clickable name over a muted secondary line */
.pc-recordlist__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }

.pc-recordlist__name {
  align-self: flex-start;
  max-width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: -0.14px;
  line-height: 1.4;
  color: var(--ink);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 120ms ease;
}
.pc-recordlist__name:hover { text-decoration: underline; }
.pc-recordlist__name:focus-visible { text-decoration: underline; }
.pc-recordlist__row--disabled .pc-recordlist__name { color: var(--ink-40); cursor: not-allowed; }
.pc-recordlist--compact .pc-recordlist__name { font-size: 13px; }

.pc-recordlist__desc {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 12.5px;
  color: var(--ink-60);
  line-height: 1.4;
}
.pc-recordlist--compact .pc-recordlist__desc { font-size: 12px; }
.pc-recordlist__desc-icon { font-size: 15px; color: var(--ink-40); flex-shrink: 0; }
.pc-recordlist__desc-icon--positive { color: var(--status-active); }
.pc-recordlist__desc-icon--warning { color: var(--status-warning); }
.pc-recordlist__desc-icon--negative { color: var(--status-failed); }
.pc-recordlist__desc-icon--info { color: var(--status-paused); }
.pc-recordlist__desc-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.pc-recordlist__desc-link { color: inherit; text-decoration: none; }
.pc-recordlist__desc-link:hover { text-decoration: underline; }
.pc-recordlist__desc-link:focus-visible { text-decoration: underline; outline: none; }

/* trailing zone stays right-aligned; the action area opens to the left of it on
   hover, so the metadata eases over but never disappears and the name never moves */
.pc-recordlist__trail { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

.pc-recordlist__meta {
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.01em;
  color: var(--ink-40);
  font-variant-numeric: tabular-nums;
}

.pc-recordlist__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--display);
  font-size: 12.5px;
  letter-spacing: -0.1px;
  color: var(--ink-60);
  white-space: nowrap;
}
.pc-recordlist__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ink-20);
  flex-shrink: 0;
}
.pc-recordlist__status--positive .pc-recordlist__dot { background: var(--status-active); }
.pc-recordlist__status--warning .pc-recordlist__dot { background: var(--status-warning); }
.pc-recordlist__status--negative .pc-recordlist__dot { background: var(--status-failed); }
.pc-recordlist__status--info .pc-recordlist__dot { background: var(--status-paused); }

.pc-recordlist__actions-wrap {
  display: grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 240ms cubic-bezier(0.16, 1, 0.3, 1),
              margin-left 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pc-recordlist__actions-wrap:not(:first-child) { margin-left: -14px; }
.pc-recordlist__actions {
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 160ms ease, transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pc-recordlist__actions > * { flex-shrink: 0; }
.pc-recordlist__row:hover:not(.pc-recordlist__row--disabled) .pc-recordlist__actions-wrap,
.pc-recordlist__row:focus-within .pc-recordlist__actions-wrap {
  grid-template-columns: 1fr;
  margin-left: 0;
}
.pc-recordlist__row:hover:not(.pc-recordlist__row--disabled) .pc-recordlist__actions,
.pc-recordlist__row:focus-within .pc-recordlist__actions {
  opacity: 1;
  transform: translateX(0);
}

.pc-recordlist__confirm-msg { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-60); }

.pc-recordlist--animate .pc-recordlist__row {
  animation: pc-recordlist-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
@keyframes pc-recordlist-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pc-recordlist--animate .pc-recordlist__row { animation: none; }
  .pc-recordlist__actions-wrap { transition: none; }
  .pc-recordlist__actions { transition: opacity 150ms ease; transform: none; }
}
</style>
