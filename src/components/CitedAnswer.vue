<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"
import { Icon } from "@iconify/vue"
import { useClickOutside } from "../composables/useClickOutside.js"
import ArrowLink from "./ArrowLink.vue"

const props = defineProps({
  // the generated answer; cite sources inline with [1], [2], ... markers
  answer: { type: String, default: "" },
  // sources: [{ title, snippet?, href?, linkLabel? }] - [1] maps to sources[0]
  sources: { type: Array, default: () => [] },
  // when true the sources list starts collapsed behind an expandable header
  collapsibleSources: { type: Boolean, default: false },
})

const sourcesOpen = ref(!props.collapsibleSources)

// split the answer into plain-text and citation segments
const segments = computed(() => {
  const out = []
  const re = /\[(\d+)\]/g
  let last = 0
  let m
  while ((m = re.exec(props.answer)) !== null) {
    if (m.index > last) out.push({ type: "text", text: props.answer.slice(last, m.index) })
    const n = parseInt(m[1], 10)
    out.push({ type: "cite", n, valid: n >= 1 && n <= props.sources.length })
    last = m.index + m[0].length
  }
  if (last < props.answer.length) {
    out.push({ type: "text", text: props.answer.slice(last) })
  }
  return out
})

const hoverN = ref(null)

/* ---- source popover ---- */
const popRef = ref(null)
const anchorEl = ref(null)
const popOpen = ref(false)
const activeN = ref(null)

const activeSource = computed(() =>
  activeN.value != null ? props.sources[activeN.value - 1] : null,
)
const isSourceLit = (n) => n === hoverN.value || (popOpen.value && n === activeN.value)

const { floatingStyles, isPositioned } = useFloating(anchorEl, popRef, {
  placement: "top",
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
})
useClickOutside([popRef, anchorEl], () => { popOpen.value = false })

const openCite = (n, e) => {
  // clicking the open citation again toggles it shut
  if (popOpen.value && activeN.value === n) {
    popOpen.value = false
    return
  }
  activeN.value = n
  anchorEl.value = e.currentTarget
  popOpen.value = true
}
const onCiteKey = (n, e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    openCite(n, e)
  }
}

const onKeydown = (e) => {
  if (e.key === "Escape") popOpen.value = false
}
onMounted(() => document.addEventListener("keydown", onKeydown))
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown))
</script>

<template>
  <div class="pc-cited">
    <div class="pc-cited__answer">
      <template v-for="(seg, i) in segments" :key="i">
        <template v-if="seg.type === 'text'">{{ seg.text }}</template>
        <button
          v-else-if="seg.valid"
          type="button"
          :class="['pc-cited__chip', { 'pc-cited__chip--active': popOpen && activeN === seg.n }]"
          :aria-label="`Source ${seg.n}`"
          @click="openCite(seg.n, $event)"
          @keydown="onCiteKey(seg.n, $event)"
          @mouseenter="hoverN = seg.n"
          @mouseleave="hoverN = null"
        >{{ seg.n }}</button>
        <template v-else>[{{ seg.n }}]</template>
      </template>
    </div>

    <div v-if="sources.length" class="pc-cited__sources">
      <component
        :is="collapsibleSources ? 'button' : 'div'"
        :type="collapsibleSources ? 'button' : undefined"
        :class="['pc-cited__sources-head', { 'pc-cited__sources-head--toggle': collapsibleSources }]"
        @click="collapsibleSources && (sourcesOpen = !sourcesOpen)"
      >
        <span>Sources</span>
        <template v-if="collapsibleSources">
          <span class="pc-cited__sources-count">{{ sources.length }}</span>
          <Icon
            icon="lucide:chevron-down"
            :class="['pc-cited__sources-chevron', { 'pc-cited__sources-chevron--open': sourcesOpen }]"
          />
        </template>
      </component>

      <div :class="['pc-cited__sources-wrap', { 'pc-cited__sources-wrap--open': sourcesOpen }]">
        <div class="pc-cited__sources-list">
          <div class="pc-cited__sources-inner">
          <div
            v-for="(src, i) in sources"
            :key="i"
            :class="['pc-cited__source', { 'pc-cited__source--lit': isSourceLit(i + 1) }]"
            :style="{ '--pc-cited-stagger': sourcesOpen ? `${Math.min(i, 8) * 35}ms` : '0ms' }"
          >
            <span class="pc-cited__source-num">{{ i + 1 }}</span>
            <div class="pc-cited__source-main">
              <div class="pc-cited__source-title">{{ src.title }}</div>
              <div v-if="src.snippet" class="pc-cited__source-snippet">{{ src.snippet }}</div>
              <ArrowLink
                v-if="src.href"
                :href="src.href"
                arrow="up-right"
                size="sm"
                class="pc-cited__source-link"
              >{{ src.linkLabel || "Open file" }}</ArrowLink>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="pc-cited-pop">
        <div
          v-if="popOpen && activeSource"
          ref="popRef"
          :class="['pc-cited__pop', { 'pc-cited__pop--ready': isPositioned }]"
          :style="floatingStyles"
        >
          <div class="pc-cited__pop-num">Source {{ activeN }}</div>
          <div class="pc-cited__pop-title">{{ activeSource.title }}</div>
          <div v-if="activeSource.snippet" class="pc-cited__pop-snippet">
            {{ activeSource.snippet }}
          </div>
          <ArrowLink
            v-if="activeSource.href"
            :href="activeSource.href"
            arrow="up-right"
            size="sm"
            class="pc-cited__pop-link"
          >{{ activeSource.linkLabel || "Open file" }}</ArrowLink>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.pc-cited__answer {
  font-family: var(--display);
  font-size: 15px;
  line-height: 1.7;
  letter-spacing: -0.15px;
  color: var(--ink);
  white-space: pre-wrap;
}

/* inline citation - a small, quiet circle that wakes up on hover / when open */
.pc-cited__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  margin: 0 1px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--lavender) 30%, var(--paper));
  color: var(--ink-60);
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  vertical-align: middle;
  cursor: pointer;
  outline: none;
  transition: background 120ms ease, color 120ms ease, box-shadow 120ms ease;
}
.pc-cited__chip:hover {
  background: color-mix(in srgb, var(--lavender) 60%, var(--paper));
  color: var(--midnight);
}
.pc-cited__chip--active {
  background: var(--lavender);
  color: var(--midnight);
}
.pc-cited__chip:focus-visible { box-shadow: var(--focus-ring); }

/* sources list */
.pc-cited__sources {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--ink-08);
}
.pc-cited__sources-head {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  padding: 0 10px;
}
/* a full-width, comfortably-tall control with the library's hover / press feel */
.pc-cited__sources-head--toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: var(--radius-sharp);
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: background 120ms ease, box-shadow 120ms ease;
}
.pc-cited__sources-head--toggle:hover { background: var(--ink-04); }
.pc-cited__sources-head--toggle:active { background: var(--ink-08); }
.pc-cited__sources-head--toggle:focus-visible { box-shadow: var(--focus-ring); }
.pc-cited__sources-count {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--ink-40);
}
.pc-cited__sources-chevron {
  margin-left: auto;
  font-size: 14px;
  color: var(--ink-40);
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1), color 120ms ease;
}
.pc-cited__sources-head--toggle:hover .pc-cited__sources-chevron { color: var(--ink-60); }
.pc-cited__sources-chevron--open { transform: rotate(180deg); }

/* collapse via grid-template-rows so it animates both open and closed */
.pc-cited__sources-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 240ms cubic-bezier(0.4, 0, 0.2, 1);
}
.pc-cited__sources-wrap--open { grid-template-rows: 1fr; }
.pc-cited__sources-list {
  min-height: 0;
  overflow: hidden;
}
.pc-cited__sources-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}
/* rows start nudged left + faded; the stagger delay (set per row) makes them
   slide in one after another as the list expands */
.pc-cited__source {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius-sharp);
  opacity: 0;
  translate: -10px 0;
  transition:
    background 140ms ease,
    opacity 280ms ease var(--pc-cited-stagger, 0ms),
    translate 300ms cubic-bezier(0.4, 0, 0.2, 1) var(--pc-cited-stagger, 0ms);
}
.pc-cited__sources-wrap--open .pc-cited__source {
  opacity: 1;
  translate: 0 0;
}
.pc-cited__source--lit { background: color-mix(in srgb, var(--lavender) 18%, var(--paper)); }

@media (prefers-reduced-motion: reduce) {
  .pc-cited__source { transition: background 140ms ease; opacity: 1; translate: 0 0; }
}
.pc-cited__source-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--lavender) 36%, var(--paper));
  color: var(--ink);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
}
.pc-cited__source-main { min-width: 0; }
.pc-cited__source-link { margin-top: 6px; }
.pc-cited__source-title {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.pc-cited__source-snippet {
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-60);
  letter-spacing: -0.13px;
}

/* source popover */
.pc-cited__pop {
  position: absolute;
  z-index: 9000;
  width: 280px;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
  padding: 12px 14px;
  opacity: 0;
  visibility: hidden;
}
.pc-cited__pop--ready {
  visibility: visible;
  animation: pc-cited-in 140ms ease-out forwards;
}
.pc-cited-pop-leave-active.pc-cited__pop--ready {
  animation: pc-cited-out 120ms ease-in forwards;
}
@keyframes pc-cited-in {
  from { opacity: 0; translate: 0 -5px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-cited-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 -5px; }
}
.pc-cited__pop-num {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  margin-bottom: 4px;
}
.pc-cited__pop-title {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.pc-cited__pop-snippet {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-60);
  letter-spacing: -0.13px;
}
.pc-cited__pop-link { margin-top: 8px; }
</style>
