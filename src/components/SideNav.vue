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
// visible rows need, and hands that width to the parent via min-width.
// the inline min-width is owned by fit(), not a reactive binding: measuring
// has to touch it, and a re-fit that lands mid-transition must still end
// on the target instead of wherever the animation happened to be
const nav = ref(null)
const sectionsList = ref(null)
let fitWidth = 0
let fitTimer = null

// each visible row is asked for its own max-content width inside the same frame the
// floor is read, so the browser does the arithmetic and nothing is painted mid-measure.
// the row's left comes from its list, not its own rect - the entrance animation
// translates the row and rects include transforms
const measureRows = (el, navLeft) => {
  const links = [...el.querySelectorAll(".pc-sidenav__link")].filter(l => !l.closest('[data-state="closed"]'))
  for (const link of links) link.style.width = "max-content"
  const need = links.reduce((w, link) => {
    const left = link.closest(".pc-sidenav__items").getBoundingClientRect().left - navLeft
    return Math.max(w, left + link.offsetWidth)
  }, 0)
  for (const link of links) link.style.width = ""
  return need
}

// the parent's own width (without our min-width) is the floor - a target below it
// would spend most of the transition invisible, so the shrink would look like a jump.
// measuring it means briefly lifting the min-width, which is invisible as long as no
// paint happens in between, so the transition is paused for the read and the
// animated value is put back so the next write transitions from where it was
const measureFloor = (el) => {
  const current = getComputedStyle(el).minWidth
  el.style.transition = "none"
  el.style.minWidth = ""
  const floor = el.offsetWidth
  el.style.minWidth = current
  void el.offsetWidth
  el.style.transition = ""
  return floor
}

let settling = false
let settleTimer = null

const fit = ({ instant = false } = {}) => {
  const el = nav.value
  if (!el) return
  const floor = measureFloor(el)
  const navLeft = el.getBoundingClientRect().left
  const padRight = parseFloat(getComputedStyle(el).paddingRight) || 0
  const target = Math.max(Math.ceil(measureRows(el, navLeft) + padRight), floor)
  if (!target) return
  const changed = target !== fitWidth
  fitWidth = target
  if (instant) el.style.transition = "none"
  el.style.minWidth = `${target}px`
  if (instant) {
    void el.offsetWidth
    el.style.transition = ""
    return
  }
  if (changed && !reducedMotion()) {
    settling = true
    clearTimeout(settleTimer)
    settleTimer = setTimeout(settled, 400)
  }
}

const scheduleFit = (delay) => {
  clearTimeout(fitTimer)
  if (delay > 0) { fitTimer = setTimeout(fit, delay); return }
  nextTick(() => requestAnimationFrame(() => requestAnimationFrame(fit)))
}

watch(openKeys, (next, prev) => {
  const closing = [...prev].some(k => !next.has(k))
  scheduleFit(closing && !reducedMotion() ? CLOSE_MS : 0)
})

// layout changes the nav did not cause (it gets laid out late, fonts land, rows change)
// re-fit through a ResizeObserver. its own width transition also resizes the content,
// so observations are ignored while one is running and a single fit runs when it ends
const settled = () => {
  clearTimeout(settleTimer)
  settling = false
  fit()
}
const onTransitionEnd = (e) => {
  if (e.target === nav.value && e.propertyName === "min-width") settled()
}
let observer = null

// a freshly loaded page snaps to its width - only later changes animate
const refit = () => fit({ instant: !fitWidth })

onMounted(() => {
  refit()
  if (document.fonts?.ready) document.fonts.ready.then(refit)
  window.addEventListener("resize", refit)
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => { if (!settling) refit() })
    observer.observe(nav.value)
    observer.observe(sectionsList.value)
  }
})
onBeforeUnmount(() => {
  clearTimeout(fitTimer)
  clearTimeout(settleTimer)
  window.removeEventListener("resize", refit)
  observer?.disconnect()
})
</script>

<template>
  <nav
    ref="nav"
    :class="['pc-sidenav', { 'pc-sidenav--grouped': hasGroups }]"
    @transitionend="onTransitionEnd"
  >
    <header
      v-if="$slots.header"
      :class="['pc-sidenav__header', { 'pc-sidenav__header--tinted': tintedHeader }]"
    ><slot name="header" /></header>

    <ScrollArea class="pc-sidenav__sections" height="100%">
      <div ref="sectionsList" class="pc-sidenav__sections-list">
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
                        <span class="pc-sidenav__gutter" aria-hidden="true" />
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
   icons share one column whether or not the row carries a caret */
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

/* children step in by one icon column, so their icons sit under the parent's label */
.pc-sidenav__link--child { padding-left: 38px; }

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
