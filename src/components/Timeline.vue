<script setup>
import { Icon } from "@iconify/vue"

defineProps({
  /**
   * items: [{ title, time?, description?, status?, icon?, to?, clickable? }]
   * status   - default | active | done | warning | danger (drives marker color)
   * icon     - iconify name; renders a larger circular marker with the icon
   * to       - href; renders the row as a link
   * clickable - makes the row interactive without a link (emits "select")
   */
  items: { type: Array, required: true },
})
const emit = defineEmits(["select"])

const isInteractive = (item) => !!(item.to || item.clickable)

const onActivate = (item) => {
  if (isInteractive(item)) emit("select", item)
}
const onKeydown = (item, e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    onActivate(item)
  }
}
</script>

<template>
  <div class="pc-timeline">
    <div
      v-for="(item, i) in items"
      :key="i"
      :class="['pc-timeline__row', { 'pc-timeline__row--last': i === items.length - 1 }]"
    >
      <div class="pc-timeline__rail">
        <span
          :class="[
            'pc-timeline__marker',
            `pc-timeline__marker--${item.status || 'default'}`,
            { 'pc-timeline__marker--icon': !!item.icon },
          ]"
        >
          <Icon v-if="item.icon" :icon="item.icon" />
        </span>
      </div>

      <div class="pc-timeline__content">
        <component
          :is="item.to ? 'a' : 'div'"
          :href="item.to || undefined"
          :class="['pc-timeline__body', { 'pc-timeline__body--interactive': isInteractive(item) }]"
          :role="item.clickable && !item.to ? 'button' : undefined"
          :tabindex="isInteractive(item) && !item.to ? 0 : undefined"
          @click="onActivate(item)"
          @keydown="isInteractive(item) && !item.to ? onKeydown(item, $event) : undefined"
        >
          <div class="pc-timeline__main">
            <div class="pc-timeline__head">
              <span class="pc-timeline__title">
                <slot name="title" :item="item">{{ item.title }}</slot>
              </span>
              <span v-if="item.time" class="pc-timeline__time">{{ item.time }}</span>
            </div>
            <div v-if="item.description || $slots.default" class="pc-timeline__desc">
              <slot :item="item">{{ item.description }}</slot>
            </div>
          </div>
          <Icon
            v-if="isInteractive(item)"
            class="pc-timeline__chevron"
            icon="lucide:chevron-right"
          />
        </component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-timeline {
  display: flex;
  flex-direction: column;
}
.pc-timeline__row {
  display: flex;
  gap: 14px;
  padding-bottom: 22px;
}
.pc-timeline__row--last { padding-bottom: 0; }

/* rail - fixed gutter holding the marker and the connector line */
.pc-timeline__rail {
  position: relative;
  width: 24px;
  flex-shrink: 0;
}
.pc-timeline__rail::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 6px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--lavender) 60%, var(--paper)),
    var(--ink-08)
  );
}
.pc-timeline__row--last .pc-timeline__rail::before { display: none; }

/* marker - always a 24px box so every row's center lines up */
.pc-timeline__marker {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* dot marker (no icon) */
.pc-timeline__marker:not(.pc-timeline__marker--icon)::before {
  content: "";
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--paper);
  box-shadow: inset 0 0 0 2px var(--ink-20);
}
.pc-timeline__marker--active:not(.pc-timeline__marker--icon)::before {
  background: var(--lavender);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--lavender) 28%, transparent);
}
.pc-timeline__marker--done:not(.pc-timeline__marker--icon)::before {
  background: var(--status-active);
  box-shadow: 0 0 0 4px var(--status-active-bg);
}
.pc-timeline__marker--warning:not(.pc-timeline__marker--icon)::before {
  background: var(--status-warning);
  box-shadow: 0 0 0 4px var(--status-warning-bg);
}
.pc-timeline__marker--danger:not(.pc-timeline__marker--icon)::before {
  background: var(--status-failed);
  box-shadow: 0 0 0 4px var(--status-failed-bg);
}

/* icon marker - the box itself becomes a tinted circle */
.pc-timeline__marker--icon {
  border-radius: 50%;
  font-size: 13px;
  background: var(--ink-04);
  color: var(--ink-60);
  box-shadow: inset 0 0 0 1px var(--ink-08);
}
.pc-timeline__marker--icon.pc-timeline__marker--active {
  background: color-mix(in srgb, var(--lavender) 38%, var(--paper));
  color: var(--midnight);
  box-shadow: none;
}
.pc-timeline__marker--icon.pc-timeline__marker--done {
  background: var(--status-active-bg);
  color: var(--status-active);
  box-shadow: none;
}
.pc-timeline__marker--icon.pc-timeline__marker--warning {
  background: var(--status-warning-bg);
  color: var(--status-warning);
  box-shadow: none;
}
.pc-timeline__marker--icon.pc-timeline__marker--danger {
  background: var(--status-failed-bg);
  color: var(--status-failed);
  box-shadow: none;
}

/* content */
.pc-timeline__content {
  padding-top: 2px;
  min-width: 0;
  flex: 1;
}
.pc-timeline__main { min-width: 0; flex: 1; }

.pc-timeline__body {
  display: flex;
  align-items: stretch;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
.pc-timeline__body--interactive {
  margin: -7px -10px;
  padding: 7px 10px;
  border-radius: var(--radius-sharp);
  cursor: pointer;
  outline: none;
  transition: background 140ms ease, box-shadow 140ms ease;
}
.pc-timeline__body--interactive:hover { background: var(--ink-04); }
.pc-timeline__body--interactive:focus-visible { box-shadow: var(--focus-ring); }

.pc-timeline__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.pc-timeline__title {
  font-family: var(--display);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--ink);
}
.pc-timeline__time {
  flex-shrink: 0;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-40);
}
.pc-timeline__desc {
  margin-top: 3px;
  font-size: 14px;
  line-height: 1.45;
  color: var(--ink-60);
  letter-spacing: -0.14px;
}

.pc-timeline__chevron {
  align-self: center;
  flex-shrink: 0;
  font-size: 16px;
  color: var(--ink-20);
  transition: color 140ms ease, transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pc-timeline__body--interactive:hover .pc-timeline__chevron {
  color: var(--ink-60);
  transform: translateX(3px);
}
/* on press, the chevron snaps back toward its origin - confirms the action */
.pc-timeline__body--interactive:active .pc-timeline__chevron {
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .pc-timeline__chevron { transition: color 140ms ease; }
}
</style>
