<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"
import { Icon } from "@iconify/vue"
import { useClickOutside } from "../composables/useClickOutside.js"

const props = defineProps({
  // the source document, plain text
  text: { type: String, default: "" },
  // redactions: [{ start, end, reason? }] - character offsets into `text`
  modelValue: { type: Array, default: () => [] },
  // view-only - no creating or removing redactions
  readonly: { type: Boolean, default: false },
  // show redacted text (marked) instead of solid blocks
  reveal: { type: Boolean, default: false },
  // optional reason categories offered when managing a redaction
  reasons: { type: Array, default: () => [] },
})
const emit = defineEmits(["update:modelValue"])

// sort + merge overlapping ranges so the model stays clean
const normalize = (list) => {
  const sorted = list.filter((r) => r.end > r.start).sort((a, b) => a.start - b.start)
  const merged = []
  for (const r of sorted) {
    const last = merged[merged.length - 1]
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end)
      if (!last.reason && r.reason) last.reason = r.reason
    } else {
      merged.push({ start: r.start, end: r.end, reason: r.reason })
    }
  }
  return merged
}

// mask every character except spaces and newlines, so the redacted run still
// wraps naturally but the real characters never reach the DOM
const maskOf = (s) => s.replace(/[^\n ]/g, "█")

// alternating runs of plain text and redacted text. a redaction run only ever
// carries its mask - the real substring is sliced on demand, and only when the
// caller has explicitly turned reveal on
const runs = computed(() => {
  const reds = props.modelValue
    .filter((r) => r.end > r.start)
    .slice()
    .sort((a, b) => a.start - b.start)
  const out = []
  let cursor = 0
  for (const r of reds) {
    const s = Math.max(cursor, r.start)
    const e = Math.min(props.text.length, r.end)
    if (s > cursor) {
      out.push({ type: "text", start: cursor, text: props.text.slice(cursor, s) })
    }
    if (e > s) {
      out.push({ type: "redaction", start: s, end: e, mask: maskOf(props.text.slice(s, e)), red: r })
    }
    cursor = Math.max(cursor, e)
  }
  if (cursor < props.text.length) {
    out.push({ type: "text", start: cursor, text: props.text.slice(cursor) })
  }
  return out
})

const sameRange = (a, b) => a.start === b.start && a.end === b.end

const addRedaction = (start, end, reason) => {
  emit("update:modelValue", normalize([...props.modelValue, { start, end, reason }]))
}
const removeRedaction = (red) => {
  emit("update:modelValue", props.modelValue.filter((r) => !sameRange(r, red)))
}
const setReason = (red, reason) => {
  emit("update:modelValue", props.modelValue.map((r) => (sameRange(r, red) ? { ...r, reason } : r)))
}

const ariaFor = (red) => (red.reason ? `Redacted, reason: ${red.reason}` : "Redacted")

/* ---- creating a redaction from a text selection ---- */
const docRef = ref(null)
const toolbarRef = ref(null)
const toolbarOpen = ref(false)
const toolbarPos = ref({ top: 0, left: 0 })
const pending = ref(null)

// map a DOM (node, offset) point back to a character offset in `text`
const pointToOffset = (node, offset) => {
  let el = node.nodeType === 3 ? node.parentElement : node
  while (el && el !== docRef.value && (!el.dataset || el.dataset.offset == null)) {
    el = el.parentElement
  }
  if (!el || !el.dataset || el.dataset.offset == null) return null
  const base = parseInt(el.dataset.offset, 10)
  if (node.nodeType === 3) return base + offset
  return base + (offset > 0 ? (el.textContent ? el.textContent.length : 0) : 0)
}

const onMouseUp = () => {
  if (props.readonly) return
  requestAnimationFrame(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { toolbarOpen.value = false; return }
    const range = sel.getRangeAt(0)
    if (!docRef.value || !docRef.value.contains(range.commonAncestorContainer)) {
      toolbarOpen.value = false
      return
    }
    const a = pointToOffset(range.startContainer, range.startOffset)
    const b = pointToOffset(range.endContainer, range.endOffset)
    if (a == null || b == null) { toolbarOpen.value = false; return }
    const start = Math.max(0, Math.min(a, b))
    const end = Math.min(props.text.length, Math.max(a, b))
    if (end - start < 1) { toolbarOpen.value = false; return }
    pending.value = { start, end }
    const rect = range.getBoundingClientRect()
    toolbarPos.value = { top: rect.top, left: rect.left + rect.width / 2 }
    toolbarOpen.value = true
  })
}

const applyRedaction = () => {
  if (!pending.value) return
  addRedaction(pending.value.start, pending.value.end, undefined)
  window.getSelection()?.removeAllRanges()
  toolbarOpen.value = false
  pending.value = null
}

/* ---- managing an existing redaction ---- */
const menuOpen = ref(false)
const activeRed = ref(null)
const anchorEl = ref(null)
const menuRef = ref(null)

const { floatingStyles, isPositioned } = useFloating(anchorEl, menuRef, {
  placement: "bottom-start",
  whileElementsMounted: autoUpdate,
  middleware: [offset(6), flip(), shift({ padding: 8 })],
})
useClickOutside([menuRef, anchorEl], () => { menuOpen.value = false })

const openMenu = (red, e) => {
  activeRed.value = red
  anchorEl.value = e.currentTarget
  menuOpen.value = true
}
const onBlockKey = (red, e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    openMenu(red, e)
  }
}
const chooseReason = (reason) => {
  if (activeRed.value) setReason(activeRed.value, reason)
  menuOpen.value = false
}
const removeActive = () => {
  if (activeRed.value) removeRedaction(activeRed.value)
  menuOpen.value = false
}

const onDocMouseDown = (e) => {
  if (toolbarRef.value && toolbarRef.value.contains(e.target)) return
  toolbarOpen.value = false
}
const onKeydown = (e) => {
  if (e.key !== "Escape") return
  menuOpen.value = false
  toolbarOpen.value = false
}
onMounted(() => {
  document.addEventListener("mousedown", onDocMouseDown)
  document.addEventListener("keydown", onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMouseDown)
  document.removeEventListener("keydown", onKeydown)
})
</script>

<template>
  <div
    ref="docRef"
    :class="['pc-redactor', { 'pc-redactor--readonly': readonly }]"
    @mouseup="onMouseUp"
  >
    <template v-for="(run, i) in runs" :key="i">
      <span
        v-if="run.type === 'text'"
        class="pc-redactor__text"
        :data-offset="run.start"
      >{{ run.text }}</span>
      <span
        v-else
        :class="[
          'pc-redactor__mark',
          {
            'pc-redactor__mark--revealed': reveal,
            'pc-redactor__mark--interactive': !readonly,
          },
        ]"
        :data-offset="run.start"
        :role="readonly ? undefined : 'button'"
        :tabindex="readonly ? undefined : 0"
        :aria-label="ariaFor(run.red)"
        @click="!readonly && openMenu(run.red, $event)"
        @keydown="!readonly && onBlockKey(run.red, $event)"
      >{{ reveal ? text.slice(run.start, run.end) : run.mask }}</span>
    </template>
  </div>

  <!-- selection toolbar - appears above a fresh text selection -->
  <Teleport to="body">
    <Transition name="pc-redactor-toolbar">
      <div
        v-if="toolbarOpen"
        ref="toolbarRef"
        class="pc-redactor__toolbar"
        :style="{ top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px` }"
      >
        <button type="button" class="pc-redactor__redact-btn" @click="applyRedaction">
          Redact selection
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- per-redaction menu -->
  <Teleport to="body">
    <Transition name="pc-redactor-menu">
      <div
        v-if="menuOpen"
        ref="menuRef"
        :class="['pc-redactor__menu', { 'pc-redactor__menu--ready': isPositioned }]"
        role="menu"
        :style="floatingStyles"
      >
      <template v-if="reasons.length">
        <div class="pc-redactor__menu-label">Reason</div>
        <button
          v-for="r in reasons"
          :key="r"
          type="button"
          class="pc-redactor__menu-item"
          role="menuitemradio"
          :aria-checked="activeRed && activeRed.reason === r"
          @click="chooseReason(r)"
        >
          <span>{{ r }}</span>
          <Icon
            v-if="activeRed && activeRed.reason === r"
            icon="lucide:check"
            class="pc-redactor__menu-check"
          />
        </button>
        <button
          v-if="activeRed && activeRed.reason"
          type="button"
          class="pc-redactor__menu-item pc-redactor__menu-item--muted"
          @click="chooseReason(undefined)"
        >
          No reason
        </button>
        <div class="pc-redactor__menu-divider" />
      </template>
      <button
        type="button"
        class="pc-redactor__menu-item pc-redactor__menu-item--danger"
        @click="removeActive"
      >
        <Icon icon="lucide:trash-2" />
        <span>Remove redaction</span>
      </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pc-redactor {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--display);
  font-size: 15px;
  line-height: 1.75;
  letter-spacing: -0.15px;
  color: var(--ink);
}

.pc-redactor__text { color: var(--ink); }

/* solid block - a redacted run with its text hidden */
.pc-redactor__mark {
  background: var(--midnight);
  color: transparent;
  border-radius: var(--radius-sharp);
  padding: 0 3px;
  user-select: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: box-shadow 120ms ease;
}
.pc-redactor__mark--interactive { cursor: pointer; outline: none; }
.pc-redactor__mark--interactive:hover {
  box-shadow: 0 0 0 1.5px var(--lavender);
}
.pc-redactor__mark--interactive:focus-visible {
  box-shadow: var(--focus-ring);
}

/* revealed - text shown, marked as pending redaction */
.pc-redactor__mark--revealed {
  background: color-mix(in srgb, var(--status-paused) 15%, var(--paper));
  color: var(--ink);
  border-radius: 2px;
  padding: 0 2px;
  border-bottom: 1.5px dashed var(--status-paused);
  user-select: text;
}
.pc-redactor__mark--revealed.pc-redactor__mark--interactive:hover {
  box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--status-paused) 50%, transparent);
}

/* selection toolbar */
.pc-redactor__toolbar {
  position: fixed;
  z-index: 9000;
  transform: translate(-50%, calc(-100% - 8px));
  background: var(--midnight);
  border-radius: var(--radius-comfy);
  padding: 4px;
  box-shadow: var(--shadow-medium);
}
/* transform handles placement, so motion animates the translate property */
.pc-redactor-toolbar-enter-active { animation: pc-redactor-toolbar-in 120ms ease-out; }
.pc-redactor-toolbar-leave-active { animation: pc-redactor-toolbar-out 110ms ease-in forwards; }
@keyframes pc-redactor-toolbar-in {
  from { opacity: 0; translate: 0 4px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-redactor-toolbar-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 4px; }
}
.pc-redactor__redact-btn {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: var(--radius-sharp);
  background: transparent;
  color: var(--paper-on-dark);
  font-family: var(--display);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.13px;
  cursor: pointer;
  outline: none;
  transition: background 120ms ease;
}
.pc-redactor__redact-btn:hover { background: var(--paper-on-dark-12); }
.pc-redactor__redact-btn:focus-visible { box-shadow: var(--focus-ring-on-dark); }

/* redaction menu */
.pc-redactor__menu {
  position: absolute;
  z-index: 9000;
  min-width: 184px;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
  padding: 4px;
  opacity: 0;
  visibility: hidden;
}
/* floating-ui drives position via transform, so the enter/exit motion animates
   the translate property to avoid clobbering it - matches DropdownMenu */
.pc-redactor__menu--ready {
  visibility: visible;
  animation: pc-redactor-menu-in 120ms ease-out forwards;
}
.pc-redactor-menu-leave-active.pc-redactor__menu--ready {
  animation: pc-redactor-menu-out 110ms ease-in forwards;
}
@keyframes pc-redactor-menu-in {
  from { opacity: 0; translate: 0 -4px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-redactor-menu-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 -4px; }
}
.pc-redactor__menu-label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  padding: 6px 10px 4px;
}
.pc-redactor__menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--radius-sharp);
  background: transparent;
  font-family: var(--display);
  font-size: 13px;
  letter-spacing: -0.13px;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: background 120ms ease;
}
.pc-redactor__menu-item:hover { background: var(--ink-04); }
.pc-redactor__menu-item:focus-visible { box-shadow: var(--focus-ring); }
.pc-redactor__menu-item--muted { color: var(--ink-60); }
.pc-redactor__menu-item--danger { color: var(--status-failed); }
.pc-redactor__menu-item--danger:hover { background: var(--status-failed-bg); }
.pc-redactor__menu-item--danger { justify-content: flex-start; }
.pc-redactor__menu-check { color: var(--ink-60); font-size: 14px; }
.pc-redactor__menu-divider {
  height: 1px;
  background: var(--ink-08);
  margin: 4px 2px;
}
</style>
