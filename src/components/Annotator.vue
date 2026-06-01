<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"
import { Icon } from "@iconify/vue"
import Avatar from "./Avatar.vue"
import Button from "./Button.vue"
import Tooltip from "./Tooltip.vue"
import { useClickOutside } from "../composables/useClickOutside.js"

const props = defineProps({
  // the source document, plain text
  text: { type: String, default: "" },
  /**
   * annotations: [{ id, start, end, resolved, comments: [comment] }]
   * comment: { id, author, body, time }  (time is an ISO string)
   */
  modelValue: { type: Array, default: () => [] },
  // author applied to comments created in this session
  currentUser: { type: String, default: "You" },
  // view-only - no creating, replying, resolving or deleting
  readonly: { type: Boolean, default: false },
})
const emit = defineEmits(["update:modelValue"])

const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

const mkComment = (body) => ({
  id: newId(),
  author: props.currentUser,
  body,
  time: new Date().toISOString(),
})

const relTime = (iso) => {
  const then = new Date(iso).getTime()
  const s = Math.floor((Date.now() - then) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const update = (next) => emit("update:modelValue", next)
const updateAnn = (id, fn) => update(props.modelValue.map((a) => (a.id === id ? fn(a) : a)))

// alternating runs of plain text and annotated (highlighted) text
const runs = computed(() => {
  const anns = props.modelValue
    .filter((a) => a.end > a.start)
    .slice()
    .sort((a, b) => a.start - b.start)
  const out = []
  let cursor = 0
  for (const a of anns) {
    const s = Math.max(cursor, a.start)
    const e = Math.min(props.text.length, a.end)
    if (s > cursor) out.push({ type: "text", start: cursor, text: props.text.slice(cursor, s) })
    if (e > s) out.push({ type: "annotation", start: s, text: props.text.slice(s, e), ann: a })
    cursor = Math.max(cursor, e)
  }
  if (cursor < props.text.length) {
    out.push({ type: "text", start: cursor, text: props.text.slice(cursor) })
  }
  return out
})

/* ---- offset mapping ---- */
const docRef = ref(null)
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

/* ---- creating a comment from a selection ---- */
const createRef = ref(null)
const draftRef = ref(null)
const createOpen = ref(false)
const createMode = ref("button") // button | composer
const pending = ref(null)
const draft = ref("")

// a virtual reference so floating-ui can keep the composer inside the viewport
const createAnchor = ref(null)
const { floatingStyles: createStyles, isPositioned: createReady } = useFloating(
  createAnchor,
  createRef,
  {
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  },
)

const closeCreate = () => {
  createOpen.value = false
  createMode.value = "button"
  draft.value = ""
  pending.value = null
}

const onMouseUp = () => {
  if (props.readonly) return
  requestAnimationFrame(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { closeCreate(); return }
    const range = sel.getRangeAt(0)
    if (!docRef.value || !docRef.value.contains(range.commonAncestorContainer)) {
      closeCreate()
      return
    }
    const a = pointToOffset(range.startContainer, range.startOffset)
    const b = pointToOffset(range.endContainer, range.endOffset)
    if (a == null || b == null) { closeCreate(); return }
    const start = Math.max(0, Math.min(a, b))
    const end = Math.min(props.text.length, Math.max(a, b))
    if (end - start < 1) { closeCreate(); return }
    pending.value = { start, end }
    const rect = range.getBoundingClientRect()
    createAnchor.value = { getBoundingClientRect: () => rect }
    createMode.value = "button"
    createOpen.value = true
  })
}

const toComposer = () => {
  createMode.value = "composer"
  nextTick(() => draftRef.value?.focus())
}
const submitCreate = () => {
  const body = draft.value.trim()
  if (!body || !pending.value) return
  update([
    ...props.modelValue,
    {
      id: newId(),
      start: pending.value.start,
      end: pending.value.end,
      resolved: false,
      comments: [mkComment(body)],
    },
  ])
  window.getSelection()?.removeAllRanges()
  closeCreate()
}

/* ---- the thread popover ---- */
const threadRef = ref(null)
const anchorEl = ref(null)
const threadOpen = ref(false)
const activeId = ref(null)
const replyDraft = ref("")

const activeAnn = computed(() => props.modelValue.find((a) => a.id === activeId.value) || null)

const { floatingStyles: threadStyles, isPositioned: threadReady } = useFloating(
  anchorEl,
  threadRef,
  {
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 10 })],
  },
)
useClickOutside([threadRef, anchorEl], () => { threadOpen.value = false })

const openThread = (ann, e) => {
  closeCreate()
  activeId.value = ann.id
  anchorEl.value = e.currentTarget
  replyDraft.value = ""
  threadOpen.value = true
}
const onMarkKey = (ann, e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    openThread(ann, e)
  }
}
const submitReply = () => {
  const body = replyDraft.value.trim()
  if (!body || !activeId.value) return
  updateAnn(activeId.value, (a) => ({ ...a, comments: [...a.comments, mkComment(body)] }))
  replyDraft.value = ""
}
const deleteComment = (c) => {
  const ann = activeAnn.value
  if (!ann) return
  const remaining = ann.comments.filter((x) => x.id !== c.id)
  if (remaining.length === 0) {
    threadOpen.value = false
    update(props.modelValue.filter((a) => a.id !== ann.id))
  } else {
    updateAnn(ann.id, (a) => ({ ...a, comments: remaining }))
  }
}
const toggleResolve = () => {
  if (activeId.value) updateAnn(activeId.value, (a) => ({ ...a, resolved: !a.resolved }))
}
const deleteThread = () => {
  if (!activeId.value) return
  const id = activeId.value
  threadOpen.value = false
  update(props.modelValue.filter((a) => a.id !== id))
}

/* ---- dismissal ---- */
const onDocMouseDown = (e) => {
  if (createRef.value && createRef.value.contains(e.target)) return
  closeCreate()
}
const onKeydown = (e) => {
  if (e.key !== "Escape") return
  closeCreate()
  threadOpen.value = false
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
  <div ref="docRef" class="pc-annotator" @mouseup="onMouseUp">
    <template v-for="(run, i) in runs" :key="i">
      <span
        v-if="run.type === 'text'"
        :data-offset="run.start"
      >{{ run.text }}</span>
      <span
        v-else
        :class="[
          'pc-annotator__mark',
          {
            'pc-annotator__mark--resolved': run.ann.resolved,
            'pc-annotator__mark--active': threadOpen && activeId === run.ann.id,
          },
        ]"
        :data-offset="run.start"
        role="button"
        tabindex="0"
        :aria-label="`${run.ann.comments.length} comment thread`"
        @click="openThread(run.ann, $event)"
        @keydown="onMarkKey(run.ann, $event)"
      >{{ run.text }}</span>
    </template>
  </div>

  <!-- create: a Comment button that expands into a composer -->
  <Teleport to="body">
    <Transition name="pc-anno-pop">
      <div
        v-if="createOpen"
        ref="createRef"
        :class="['pc-annotator__create', 'pc-annotator__pop', { 'pc-annotator__pop--ready': createReady }]"
        :style="createStyles"
      >
        <Button
          v-if="createMode === 'button'"
          size="sm"
          icon="lucide:message-square-plus"
          @click="toComposer"
        >
          Comment
        </Button>
        <div v-else class="pc-annotator__composer">
          <textarea
            ref="draftRef"
            v-model="draft"
            class="pc-annotator__textarea"
            placeholder="Add a comment…"
            rows="3"
          />
          <div class="pc-annotator__actions">
            <Button variant="outline" size="sm" @click="closeCreate">Cancel</Button>
            <Button size="sm" :disabled="!draft.trim()" @click="submitCreate">
              Add comment
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- thread popover -->
  <Teleport to="body">
    <Transition name="pc-anno-pop">
      <div
        v-if="threadOpen && activeAnn"
        ref="threadRef"
        :class="['pc-annotator__thread', 'pc-annotator__pop', { 'pc-annotator__pop--ready': threadReady }]"
        :style="threadStyles"
      >
        <div class="pc-annotator__thread-head">
          <span class="pc-annotator__thread-title">
            {{ activeAnn.comments.length }}
            {{ activeAnn.comments.length === 1 ? "comment" : "comments" }}
          </span>
          <div v-if="!readonly" class="pc-annotator__thread-actions">
            <Tooltip :text="activeAnn.resolved ? 'Reopen thread' : 'Resolve thread'">
              <Button
                variant="outline"
                size="sm"
                :icon="activeAnn.resolved ? 'lucide:rotate-ccw' : 'lucide:check'"
                @click="toggleResolve"
              />
            </Tooltip>
            <Tooltip text="Delete thread">
              <Button variant="danger" size="sm" icon="lucide:trash-2" @click="deleteThread" />
            </Tooltip>
          </div>
        </div>

        <div v-if="activeAnn.resolved" class="pc-annotator__resolved">
          <Icon icon="lucide:check-circle-2" />
          Resolved
        </div>

        <div class="pc-annotator__comments pc-scroll">
          <div v-for="c in activeAnn.comments" :key="c.id" class="pc-annotator__comment">
            <Avatar :name="c.author" size="sm" tone="lavender" />
            <div class="pc-annotator__comment-main">
              <div class="pc-annotator__comment-meta">
                <span class="pc-annotator__comment-author">{{ c.author }}</span>
                <span class="pc-annotator__comment-time">{{ relTime(c.time) }}</span>
                <span v-if="!readonly" class="pc-annotator__comment-del">
                  <Tooltip text="Delete comment">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="lucide:x"
                      @click="deleteComment(c)"
                    />
                  </Tooltip>
                </span>
              </div>
              <div class="pc-annotator__comment-text">{{ c.body }}</div>
            </div>
          </div>
        </div>

        <div v-if="!readonly" class="pc-annotator__reply">
          <textarea
            v-model="replyDraft"
            class="pc-annotator__textarea"
            placeholder="Reply…"
            rows="2"
          />
          <div class="pc-annotator__actions">
            <Button size="sm" :disabled="!replyDraft.trim()" @click="submitReply">Reply</Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pc-annotator {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--display);
  font-size: 15px;
  line-height: 1.8;
  letter-spacing: -0.15px;
  color: var(--ink);
}

/* highlight */
.pc-annotator__mark {
  background: color-mix(in srgb, var(--lavender) 32%, var(--paper));
  border-bottom: 2px solid color-mix(in srgb, var(--lavender) 70%, var(--midnight));
  border-radius: 2px 2px 0 0;
  padding: 1px 1px 0;
  cursor: pointer;
  outline: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background 120ms ease;
}
.pc-annotator__mark:hover { background: color-mix(in srgb, var(--lavender) 48%, var(--paper)); }
.pc-annotator__mark--active { background: color-mix(in srgb, var(--lavender) 58%, var(--paper)); }
.pc-annotator__mark:focus-visible { box-shadow: var(--focus-ring); }
.pc-annotator__mark--resolved {
  background: var(--ink-04);
  border-bottom-color: var(--ink-20);
}
.pc-annotator__mark--resolved.pc-annotator__mark--active {
  background: var(--ink-08);
}

/* floating surfaces - positioned by floating-ui, animated in and out.
   the animation uses `translate` so it never clobbers floating-ui's transform */
.pc-annotator__pop {
  position: absolute;
  z-index: 9000;
  opacity: 0;
  visibility: hidden;
}
.pc-annotator__pop--ready {
  visibility: visible;
  animation: pc-anno-in 140ms ease-out forwards;
}
.pc-anno-pop-leave-active.pc-annotator__pop--ready {
  animation: pc-anno-out 120ms ease-in forwards;
}
@keyframes pc-anno-in {
  from { opacity: 0; translate: 0 -5px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-anno-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 -5px; }
}

/* create - the Comment button / composer above a selection */
.pc-annotator__composer {
  width: 288px;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
  padding: 12px;
}

/* thread popover */
.pc-annotator__thread {
  width: 320px;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
}
.pc-annotator__thread-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px 10px 16px;
  border-bottom: 1px solid var(--ink-08);
}
.pc-annotator__thread-title {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-annotator__thread-actions { display: flex; gap: 6px; }

.pc-annotator__resolved {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--status-active-bg);
  color: var(--status-active);
  font-size: 12px;
  font-weight: 500;
}

.pc-annotator__comments {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-height: 260px;
  overflow-y: auto;
}
.pc-annotator__comment { display: flex; gap: 10px; }
.pc-annotator__comment-main { flex: 1; min-width: 0; }
.pc-annotator__comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pc-annotator__comment-author {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}
.pc-annotator__comment-time {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}
/* hover-reveal wrapper around the real Button - stays hidden until the comment
   is hovered (or the button inside takes focus) */
.pc-annotator__comment-del {
  margin-left: auto;
  display: inline-flex;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 120ms ease;
}
.pc-annotator__comment:hover .pc-annotator__comment-del,
.pc-annotator__comment-del:focus-within { opacity: 1; }
.pc-annotator__comment-text {
  margin-top: 3px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: -0.14px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.pc-annotator__reply {
  padding: 12px;
  border-top: 1px solid var(--ink-08);
}

.pc-annotator__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.pc-annotator__textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  padding: 8px 10px;
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-sharp);
  background: var(--paper);
  font-family: var(--display);
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: -0.13px;
  color: var(--ink);
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.pc-annotator__textarea:focus {
  border-color: var(--midnight);
  box-shadow: var(--focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  .pc-annotator__pop--ready,
  .pc-anno-pop-leave-active.pc-annotator__pop--ready { animation-duration: 1ms; }
}
</style>
