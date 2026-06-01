<script setup>
import { ref, computed } from "vue"
import Button from "./Button.vue"

const props = defineProps({
  // the source document, plain text
  text: { type: String, default: "" },
  // chunks: [{ start, end, tokens? }] - ranges may overlap
  chunks: { type: Array, default: () => [] },
  // list   - every chunk stacked, compact, all visible at once
  // stepper - one chunk at a time, hover to preview / click to pin
  view: { type: String, default: "list" },
})

const clamp = (n) => Math.max(0, Math.min(props.text.length, n))

const ordered = computed(() =>
  props.chunks
    .map((c) => ({ s: clamp(c.start), e: clamp(c.end), tokens: c.tokens }))
    .filter((c) => c.e > c.s)
    .sort((a, b) => a.s - b.s),
)

const documentHasOverlap = computed(() => {
  const list = ordered.value
  for (let i = 0; i < list.length - 1; i++) {
    if (list[i].e > list[i + 1].s) return true
  }
  return false
})

const totalTokens = computed(() => {
  let has = false
  let sum = 0
  for (const c of props.chunks) {
    if (c.tokens != null) { has = true; sum += c.tokens }
  }
  return has ? sum : null
})

// resolve a chunk's overlap regions: the slice shared with the previous chunk
// and the slice shared with the next
const resolveChunk = (i) => {
  const list = ordered.value
  if (i == null || i < 0 || i >= list.length) return null
  const c = list[i]
  const prev = list[i - 1]
  const next = list[i + 1]
  let ovStart = c.s
  if (prev && prev.e > c.s) ovStart = Math.min(prev.e, c.e)
  let ovEnd = c.e
  if (next && next.s < c.e) ovEnd = Math.max(next.s, c.s)
  if (ovEnd < ovStart) ovEnd = ovStart
  return { ...c, ovStart, ovEnd }
}

const chunkDetail = (c) => {
  const chars = c.e - c.s
  return c.tokens != null ? `${c.tokens} tokens · ${chars} chars` : `${chars} chars`
}

/* ---- list view ---- */
const listChunks = computed(() =>
  ordered.value.map((_, i) => {
    const c = resolveChunk(i)
    const t = props.text
    const runs = []
    if (c.ovStart > c.s) runs.push({ text: t.slice(c.s, c.ovStart), overlap: true })
    if (c.ovEnd > c.ovStart) runs.push({ text: t.slice(c.ovStart, c.ovEnd), overlap: false })
    if (c.e > c.ovEnd) runs.push({ text: t.slice(c.ovEnd, c.e), overlap: true })
    return { index: i, runs, detail: chunkDetail(c) }
  }),
)

/* ---- stepper view ---- */
const previewIndex = ref(null)
const selectedIndex = ref(0)

const clampIdx = (i) => Math.min(Math.max(0, i), Math.max(0, ordered.value.length - 1))
const pinnedIdx = computed(() => clampIdx(selectedIndex.value))
const hoveredIdx = computed(() =>
  previewIndex.value == null ? null : clampIdx(previewIndex.value),
)
const pinned = computed(() => resolveChunk(pinnedIdx.value))
const hovered = computed(() =>
  hoveredIdx.value == null ? null : resolveChunk(hoveredIdx.value),
)
const headerIdx = computed(() =>
  hoveredIdx.value != null ? hoveredIdx.value : pinnedIdx.value,
)
const stepperDetail = computed(() => {
  const c = hovered.value || pinned.value
  return c ? chunkDetail(c) : ""
})

const baseSegments = computed(() => {
  const list = ordered.value
  const t = props.text
  if (!list.length) return [{ text: t, start: 0, end: t.length, zone: null }]
  const bset = new Set([0, t.length])
  for (const c of list) { bset.add(c.s); bset.add(c.e) }
  const bounds = [...bset].sort((a, b) => a - b)
  const out = []
  let zonePtr = -1
  for (let i = 0; i < bounds.length - 1; i++) {
    const p = bounds[i]
    const q = bounds[i + 1]
    if (q <= p) continue
    while (zonePtr + 1 < list.length && list[zonePtr + 1].s <= p) zonePtr++
    out.push({ text: t.slice(p, q), start: p, end: q, zone: zonePtr >= 0 ? zonePtr : null })
  }
  return out
})

const kindFor = (seg, chunk) => {
  if (!chunk || seg.start < chunk.s || seg.end > chunk.e) return null
  if (seg.start >= chunk.ovStart && seg.end <= chunk.ovEnd) return "body"
  return "overlap"
}

const segments = computed(() =>
  baseSegments.value.map((seg) => {
    const hk = kindFor(seg, hovered.value)
    if (hk) return { text: seg.text, zone: seg.zone, cls: `hover-${hk}` }
    const pk = kindFor(seg, pinned.value)
    if (pk) return { text: seg.text, zone: seg.zone, cls: `pin-${pk}` }
    return { text: seg.text, zone: seg.zone, cls: "plain" }
  }),
)

const goPrev = () => { selectedIndex.value = Math.max(0, pinnedIdx.value - 1) }
const goNext = () => {
  selectedIndex.value = Math.min(ordered.value.length - 1, pinnedIdx.value + 1)
}
const onSegEnter = (seg) => { previewIndex.value = seg.zone }
const onSegClick = (seg) => { if (seg.zone != null) selectedIndex.value = seg.zone }
const onLeave = () => { previewIndex.value = null }
</script>

<template>
  <!-- list: every chunk stacked, compact -->
  <div v-if="view !== 'stepper'" class="pc-chunkdoc">
    <div class="pc-chunkdoc__summary">
      <span class="pc-chunkdoc__summary-count">
        {{ ordered.length }} {{ ordered.length === 1 ? "chunk" : "chunks" }}
      </span>
      <span v-if="totalTokens != null" class="pc-chunkdoc__summary-tokens">
        {{ totalTokens.toLocaleString() }} tokens
      </span>
    </div>

    <div class="pc-chunkdoc__list">
      <div v-for="ch in listChunks" :key="ch.index" class="pc-chunkdoc__item">
        <div class="pc-chunkdoc__item-head">
          <span class="pc-chunkdoc__item-num">Chunk {{ ch.index + 1 }}</span>
          <span class="pc-chunkdoc__item-detail">{{ ch.detail }}</span>
        </div>
        <div class="pc-chunkdoc__item-text">
          <span
            v-for="(run, ri) in ch.runs"
            :key="ri"
            :class="{ 'pc-chunkdoc__ov': run.overlap }"
          >{{ run.text }}</span>
        </div>
      </div>
    </div>

    <div v-if="documentHasOverlap" class="pc-chunkdoc__legend">
      <span class="pc-chunkdoc__legend-item">
        <span class="pc-chunkdoc__swatch pc-chunkdoc__ov" />
        Overlap with adjacent chunk
      </span>
    </div>
  </div>

  <!-- stepper: one chunk at a time, hover to preview / click to pin -->
  <div v-else class="pc-chunkdoc">
    <div class="pc-chunkdoc__head">
      <Button
        variant="outline"
        size="sm"
        icon="lucide:chevron-left"
        :disabled="pinnedIdx <= 0"
        @click="goPrev"
      />
      <div class="pc-chunkdoc__pos">
        <div class="pc-chunkdoc__pos-label">
          Chunk {{ headerIdx + 1 }}
          <span class="pc-chunkdoc__pos-total">/ {{ ordered.length }}</span>
        </div>
        <div v-if="stepperDetail" class="pc-chunkdoc__pos-detail">{{ stepperDetail }}</div>
      </div>
      <Button
        variant="outline"
        size="sm"
        icon="lucide:chevron-right"
        :disabled="pinnedIdx >= ordered.length - 1"
        @click="goNext"
      />
    </div>

    <div class="pc-chunkdoc__body" @mouseleave="onLeave">
      <span
        v-for="(seg, i) in segments"
        :key="i"
        :class="[
          'pc-chunkdoc__run',
          `pc-chunkdoc__run--${seg.cls}`,
          { 'pc-chunkdoc__run--hot': seg.zone != null },
        ]"
        @mouseenter="onSegEnter(seg)"
        @click="onSegClick(seg)"
      >{{ seg.text }}</span>
    </div>

    <div v-if="documentHasOverlap" class="pc-chunkdoc__legend">
      <span class="pc-chunkdoc__legend-item">
        <span class="pc-chunkdoc__swatch pc-chunkdoc__run--pin-body" />
        Chunk body
      </span>
      <span class="pc-chunkdoc__legend-item">
        <span class="pc-chunkdoc__swatch pc-chunkdoc__run--pin-overlap" />
        Overlap with adjacent chunk
      </span>
    </div>
  </div>
</template>

<style scoped>
.pc-chunkdoc {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---- list view ---- */
.pc-chunkdoc__summary {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.pc-chunkdoc__summary-count {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-chunkdoc__summary-tokens {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}

.pc-chunkdoc__list { display: flex; flex-direction: column; }
.pc-chunkdoc__item {
  padding: 14px 0;
  border-top: 1px solid var(--ink-08);
}
.pc-chunkdoc__item:first-child { border-top: 0; padding-top: 0; }
.pc-chunkdoc__item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.pc-chunkdoc__item-num {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink);
}
.pc-chunkdoc__item-detail {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}
.pc-chunkdoc__item-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--display);
  font-size: 14px;
  line-height: 1.65;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.pc-chunkdoc__ov {
  background: color-mix(in srgb, var(--lavender) 40%, var(--paper));
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* ---- stepper view ---- */
.pc-chunkdoc__head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pc-chunkdoc__pos {
  flex: 1;
  text-align: center;
  min-width: 0;
}
.pc-chunkdoc__pos-label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink);
}
.pc-chunkdoc__pos-total { color: var(--ink-40); }
.pc-chunkdoc__pos-detail {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-60);
  margin-top: 2px;
}

.pc-chunkdoc__body {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--display);
  font-size: 15px;
  line-height: 1.85;
  letter-spacing: -0.15px;
  color: var(--ink);
}

.pc-chunkdoc__run { transition: background 140ms ease; }
.pc-chunkdoc__run--hot { cursor: pointer; }
.pc-chunkdoc__run--pin-body,
.pc-chunkdoc__run--pin-overlap,
.pc-chunkdoc__run--hover-body,
.pc-chunkdoc__run--hover-overlap {
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.pc-chunkdoc__run--pin-body { background: color-mix(in srgb, var(--lavender) 30%, var(--paper)); }
.pc-chunkdoc__run--pin-overlap { background: color-mix(in srgb, var(--lavender) 62%, var(--paper)); }
.pc-chunkdoc__run--hover-body { background: color-mix(in srgb, #ffcd94 56%, var(--paper)); }
.pc-chunkdoc__run--hover-overlap { background: color-mix(in srgb, #ffcd94 84%, var(--paper)); }

/* ---- shared legend ---- */
.pc-chunkdoc__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}
.pc-chunkdoc__legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--ink-60);
  letter-spacing: -0.12px;
}
.pc-chunkdoc__swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
