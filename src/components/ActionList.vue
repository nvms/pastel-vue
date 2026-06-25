<script setup>
import { Icon } from "@iconify/vue"

const props = defineProps({
  // each item: { label, subtitle?, icon?, href?, disabled?, value? }
  items: { type: Array, default: () => [] },
  // trailing icon on every row; set "" to hide
  chevron: { type: String, default: "lucide:chevron-right" },
  // staggered entrance on mount
  animate: { type: Boolean, default: true },
  // tighter rows for dense lists
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(["select"])

const onSelect = (item, index) => {
  if (item.disabled) return
  emit("select", item, index)
}

// cap the cascade so a long list still finishes quickly
const delay = (i) => (props.animate ? `${Math.min(i, 12) * 40}ms` : "0ms")
</script>

<template>
  <div class="pc-actionlist" :class="{ 'pc-actionlist--animate': animate, 'pc-actionlist--compact': compact }">
    <component
      :is="item.href && !item.disabled ? 'a' : 'button'"
      v-for="(item, i) in items"
      :key="item.value ?? item.label ?? i"
      :href="item.href && !item.disabled ? item.href : undefined"
      :type="item.href && !item.disabled ? undefined : 'button'"
      :disabled="!item.href && item.disabled ? true : undefined"
      :aria-disabled="item.disabled || undefined"
      :class="['pc-actionlist__item', { 'pc-actionlist__item--disabled': item.disabled }]"
      :style="{ '--row-delay': delay(i) }"
      @click="onSelect(item, i)"
    >
      <Icon v-if="item.icon" :icon="item.icon" class="pc-actionlist__icon" aria-hidden="true" />
      <span class="pc-actionlist__body">
        <span class="pc-actionlist__label">{{ item.label }}</span>
        <span v-if="item.subtitle" class="pc-actionlist__subtitle">{{ item.subtitle }}</span>
      </span>
      <Icon v-if="chevron" :icon="chevron" class="pc-actionlist__chevron" aria-hidden="true" />
    </component>
  </div>
</template>

<style scoped>
.pc-actionlist { display: flex; flex-direction: column; width: 100%; }

.pc-actionlist__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  text-align: left;
  background: transparent;
  color: var(--ink);
  border: 0;
  border-radius: 0;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  transition: background 140ms ease;
}
.pc-actionlist__item + .pc-actionlist__item { border-top: 1px solid var(--ink-08); }
.pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) { background: var(--ink-04); }
.pc-actionlist__item:focus-visible { background: var(--ink-04); }
.pc-actionlist__item:active:not(.pc-actionlist__item--disabled) { background: var(--ink-08); }
.pc-actionlist__item--disabled { color: var(--ink-40); cursor: not-allowed; }

.pc-actionlist--compact .pc-actionlist__item { padding: 9px 12px; gap: 10px; }

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
.pc-actionlist--compact .pc-actionlist__subtitle { font-size: 12px; }
.pc-actionlist__subtitle {
  font-size: 13px;
  color: var(--ink-60);
  line-height: 1.4;
}

/* the chevron is the only thing that moves on hover - the label stays put */
.pc-actionlist__chevron {
  font-size: 18px;
  color: var(--ink-40);
  flex-shrink: 0;
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), color 140ms ease;
}
.pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) .pc-actionlist__chevron {
  color: var(--ink);
  transform: translateX(3px);
}

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
  .pc-actionlist__chevron { transition: color 140ms ease; }
  .pc-actionlist__item:hover:not(.pc-actionlist__item--disabled) .pc-actionlist__chevron { transform: none; }
}
</style>
