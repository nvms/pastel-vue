<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { CollapsibleRoot, CollapsibleContent } from "reka-ui"
import ScrollArea from "./ScrollArea.vue"

const props = defineProps({
  // sections: [{ title?, items: [{ key, label, to?, badge?, active?, icon?, children?, defaultOpen? }] }]
  // an item with children is a group: its row toggles the sub-menu instead of emitting select
  sections: { type: Array, required: true },
  activeKey: { type: [String, Number, null], default: null },
  // show the small leading dot indicator on each item
  indicators: { type: Boolean, default: false },
  // wash the header (branding) area with a soft pastel gradient
  tintedHeader: { type: Boolean, default: false },
})
const emit = defineEmits(["select", "toggle"])

const isActive = (item) => item.active ?? (item.key === props.activeKey)
const isGroup = (item) => Array.isArray(item.children) && item.children.length > 0
const hasGroups = computed(() => props.sections.some(s => s.items.some(isGroup)))
const groupHasActive = (item) => item.children.some(isActive)

const openKeys = ref(new Set())
const isOpen = (item) => openKeys.value.has(item.key)
const setOpen = (item, open) => {
  const next = new Set(openKeys.value)
  open ? next.add(item.key) : next.delete(item.key)
  openKeys.value = next
}
const toggle = (item) => {
  setOpen(item, !isOpen(item))
  emit("toggle", { item, open: isOpen(item) })
}

const seedOpen = () => {
  for (const section of props.sections) {
    for (const item of section.items) {
      if (isGroup(item) && (item.defaultOpen || groupHasActive(item))) setOpen(item, true)
    }
  }
}
seedOpen()

const revealActiveGroup = () => {
  for (const section of props.sections) {
    for (const item of section.items) {
      if (isGroup(item) && groupHasActive(item) && !isOpen(item)) setOpen(item, true)
    }
  }
}
watch(() => props.activeKey, revealActiveGroup)
watch(() => props.sections, () => { seedOpen(); scheduleFit(0) }, { deep: true })

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const CLOSE_MS = 180

// labels never wrap - instead the nav widens (animated) to whatever its
// visible rows need, and hands that width to the parent via min-width
const nav = ref(null)
const fitWidth = ref(null)
let fitTimer = null

const textWidth = (el) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect().width
}

const measureLink = (link) => {
  const cs = getComputedStyle(link)
  const parts = [...link.children]
  const inner = parts.reduce((w, el) => (
    w + (el.classList.contains("pc-sidenav__name") ? textWidth(el) : el.getBoundingClientRect().width)
  ), 0)
  const gaps = (parseFloat(cs.columnGap) || 0) * Math.max(parts.length - 1, 0)
  return parseFloat(cs.paddingLeft) + inner + gaps + parseFloat(cs.paddingRight)
}

const fit = () => {
  const el = nav.value
  if (!el) return
  const navLeft = el.getBoundingClientRect().left
  const padRight = parseFloat(getComputedStyle(el).paddingRight) || 0
  let need = 0
  for (const link of el.querySelectorAll(".pc-sidenav__link")) {
    if (link.closest('[data-state="closed"]')) continue
    const left = link.getBoundingClientRect().left - navLeft
    need = Math.max(need, left + measureLink(link))
  }
  fitWidth.value = need > 0 ? Math.ceil(need + padRight) : null
}

// reka reveals collapsible content a frame after mount, so measure once it is actually laid out
const scheduleFit = (delay) => {
  clearTimeout(fitTimer)
  if (delay > 0) { fitTimer = setTimeout(fit, delay); return }
  nextTick(() => requestAnimationFrame(() => requestAnimationFrame(fit)))
}

watch(openKeys, (next, prev) => {
  const closing = [...prev].some(k => !next.has(k))
  scheduleFit(closing && !reducedMotion() ? CLOSE_MS : 0)
})

onMounted(() => {
  fit()
  if (typeof document !== "undefined" && document.fonts?.ready) document.fonts.ready.then(fit)
})
onBeforeUnmount(() => clearTimeout(fitTimer))

const navStyle = computed(() => (fitWidth.value ? { minWidth: `${fitWidth.value}px` } : undefined))
</script>

<template>
  <nav
    ref="nav"
    :class="['pc-sidenav', { 'pc-sidenav--grouped': hasGroups }]"
    :style="navStyle"
  >
    <header
      v-if="$slots.header"
      :class="['pc-sidenav__header', { 'pc-sidenav__header--tinted': tintedHeader }]"
    ><slot name="header" /></header>

    <ScrollArea class="pc-sidenav__sections" height="100%">
      <div class="pc-sidenav__sections-list">
        <div v-for="section in sections" :key="section.title" class="pc-sidenav__section">
          <div v-if="section.title" class="pc-sidenav__section-title">{{ section.title }}</div>
          <ul class="pc-sidenav__items">
            <li v-for="item in section.items" :key="item.key">
              <CollapsibleRoot v-if="isGroup(item)" :open="isOpen(item)" class="pc-sidenav__group">
                <button
                  type="button"
                  :class="['pc-sidenav__link', 'pc-sidenav__link--group', { 'pc-sidenav__link--parent-active': groupHasActive(item) }]"
                  :aria-expanded="isOpen(item)"
                  @click="toggle(item)"
                >
                  <span :class="['pc-sidenav__gutter', 'pc-sidenav__caret', { 'pc-sidenav__caret--open': isOpen(item) }]" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <slot name="icon" :item="item">
                    <span v-if="item.icon" class="pc-sidenav__icon">{{ item.icon }}</span>
                  </slot>
                  <span v-if="indicators && !item.icon && !$slots.icon" class="pc-sidenav__indicator" />
                  <span class="pc-sidenav__name">{{ item.label }}</span>
                  <span v-if="item.badge != null && item.badge !== 0" class="pc-sidenav__badge">{{ item.badge }}</span>
                </button>

                <CollapsibleContent class="pc-sidenav__children">
                  <ul class="pc-sidenav__items pc-sidenav__items--nested">
                    <li
                      v-for="(child, i) in item.children"
                      :key="child.key"
                      class="pc-sidenav__child"
                      :style="{ '--pc-sidenav-stagger': `${i * 28}ms` }"
                    >
                      <component
                        :is="child.to ? 'a' : 'button'"
                        :href="child.to"
                        type="button"
                        :class="['pc-sidenav__link', 'pc-sidenav__link--child', { 'pc-sidenav__link--active': isActive(child) }]"
                        @click="emit('select', child)"
                      >
                        <span class="pc-sidenav__gutter pc-sidenav__rail" aria-hidden="true" />
                        <slot name="icon" :item="child">
                          <span v-if="child.icon" class="pc-sidenav__icon">{{ child.icon }}</span>
                        </slot>
                        <span v-if="indicators && !child.icon && !$slots.icon" class="pc-sidenav__indicator" />
                        <span class="pc-sidenav__name">{{ child.label }}</span>
                        <span v-if="child.badge != null && child.badge !== 0" class="pc-sidenav__badge">{{ child.badge }}</span>
                      </component>
                    </li>
                  </ul>
                </CollapsibleContent>
              </CollapsibleRoot>

              <component
                v-else
                :is="item.to ? 'a' : 'button'"
                :href="item.to"
                type="button"
                :class="['pc-sidenav__link', { 'pc-sidenav__link--active': isActive(item) }]"
                @click="emit('select', item)"
              >
                <span v-if="hasGroups" class="pc-sidenav__gutter" aria-hidden="true" />
                <slot name="icon" :item="item">
                  <span v-if="item.icon" class="pc-sidenav__icon">{{ item.icon }}</span>
                </slot>
                <span v-if="indicators && !item.icon && !$slots.icon" class="pc-sidenav__indicator" />
                <span class="pc-sidenav__name">{{ item.label }}</span>
                <span v-if="item.badge != null && item.badge !== 0" class="pc-sidenav__badge">{{ item.badge }}</span>
              </component>
            </li>
          </ul>
        </div>
      </div>
    </ScrollArea>

    <footer v-if="$slots.footer" class="pc-sidenav__footer"><slot name="footer" /></footer>
  </nav>
</template>

<style scoped>
.pc-sidenav {
  height: 100%;
  width: 100%;
  flex: 1 1 auto;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  gap: 20px;
  /* the nav's own contents never size the parent - only the measured min-width does,
     which is what lets the width animate instead of jumping */
  contain: inline-size;
  overflow-x: hidden;
  transition: min-width 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
/* 10px inset matches the section labels + nav-item content */
.pc-sidenav__header { flex-shrink: 0; padding: 0 10px; }
/* optional pastel wash - bleeds to the sidebar edges, content stays aligned */
.pc-sidenav__header--tinted {
  margin: -20px -16px 0;
  padding: 20px 26px;
  background:
    radial-gradient(75% 100% at 0% 0%, rgba(189, 187, 255, 0.32), transparent 72%),
    radial-gradient(70% 95% at 100% 0%, rgba(214, 225, 255, 0.34), transparent 70%),
    var(--paper);
}
.pc-sidenav__sections {
  flex: 1;
  min-height: 0;
}
/* rows never wrap, so the only horizontal overflow is the frame mid-animation - never scrollable */
.pc-sidenav__sections :deep(.pc-scrollarea__viewport) { overflow-x: hidden !important; }
.pc-sidenav__sections :deep(.pc-scrollarea__bar[data-orientation="horizontal"]) { display: none; }
.pc-sidenav__sections-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pc-sidenav__section { display: flex; flex-direction: column; gap: 8px; }
.pc-sidenav__section-title {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  padding: 0 10px;
}
.pc-sidenav__items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.pc-sidenav__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sharp);
  font-size: 14px;
  letter-spacing: -0.18px;
  color: var(--ink);
  position: relative;
  width: 100%;
  text-align: left;
  font-family: var(--display);
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
  outline: none;
}
.pc-sidenav__link:hover:not(.pc-sidenav__link--active) { background: var(--ink-04); color: var(--ink); }
.pc-sidenav__link:focus-visible { box-shadow: var(--focus-ring); }
.pc-sidenav__link--active { background: var(--midnight); color: var(--paper-on-dark); }
.pc-sidenav__link--active:hover { background: var(--midnight-hover); }
.pc-sidenav__link--active:focus-visible { box-shadow: var(--focus-ring-on-dark); }
.pc-sidenav__indicator {
  width: 4px; height: 4px; border-radius: 50%;
  background: currentColor; opacity: 0.4;
  flex-shrink: 0;
}
.pc-sidenav__link--active .pc-sidenav__indicator { opacity: 1; }
.pc-sidenav__icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  opacity: 0.7;
}
.pc-sidenav__link--active .pc-sidenav__icon { opacity: 1; }
.pc-sidenav__name { flex: 1; min-width: 0; white-space: nowrap; }
.pc-sidenav__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--badge-radius);
  background: var(--ink-08);
  color: var(--ink-60);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.pc-sidenav__link--active .pc-sidenav__badge { background: var(--paper); color: var(--midnight); }
.pc-sidenav__footer { flex-shrink: 0; border-top: 1px solid var(--ink-08); padding: 12px 10px 0; }

/* groups - every row in a grouped nav reserves the same leading gutter, so item
   icons share one column whether the row carries a caret, a rail, or nothing */
.pc-sidenav__gutter {
  width: 14px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
}
.pc-sidenav__caret {
  color: var(--ink-40);
  transition: rotate 200ms ease, color 140ms ease;
}
.pc-sidenav__link--group:hover .pc-sidenav__caret,
.pc-sidenav__link--parent-active .pc-sidenav__caret { color: var(--ink); }
.pc-sidenav__caret--open { rotate: 90deg; }
.pc-sidenav__link--parent-active .pc-sidenav__icon { opacity: 1; }

.pc-sidenav__rail { position: relative; }
.pc-sidenav__rail::before {
  content: "";
  position: absolute;
  left: 50%;
  top: -2px;
  bottom: -2px;
  width: 1px;
  background: var(--ink-08);
}
.pc-sidenav__child:last-child .pc-sidenav__rail::before { bottom: 50%; }
.pc-sidenav__child:last-child .pc-sidenav__rail::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 50%;
  width: 4px;
  height: 4px;
  translate: -50% 50%;
  border-radius: 50%;
  background: var(--ink-08);
}
.pc-sidenav__link--active .pc-sidenav__rail::before,
.pc-sidenav__link--active .pc-sidenav__rail::after { background: var(--paper-on-dark); opacity: 0.35; }

.pc-sidenav__children { overflow: hidden; }
.pc-sidenav__items--nested { padding-top: 2px; }
.pc-sidenav__children[data-state="open"] { animation: pc-sidenav-down 220ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.pc-sidenav__children[data-state="closed"] { animation: pc-sidenav-up 180ms ease-out; }
@keyframes pc-sidenav-down {
  from { height: 0; }
  to { height: var(--reka-collapsible-content-height); }
}
@keyframes pc-sidenav-up {
  from { height: var(--reka-collapsible-content-height); }
  to { height: 0; }
}
.pc-sidenav__children[data-state="open"] .pc-sidenav__child {
  animation: pc-sidenav-child-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--pc-sidenav-stagger, 0ms);
}
@keyframes pc-sidenav-child-in {
  from { opacity: 0; translate: -4px 0; }
  to { opacity: 1; translate: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .pc-sidenav { transition: none; }
  .pc-sidenav__caret { transition: color 140ms ease; }
  .pc-sidenav__children[data-state="open"],
  .pc-sidenav__children[data-state="closed"],
  .pc-sidenav__children[data-state="open"] .pc-sidenav__child { animation: none; }
}
</style>
