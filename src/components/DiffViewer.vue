<script setup>
import { computed } from "vue"
import { diffLines, diffWordsWithSpace } from "diff"
import ScrollArea from "./ScrollArea.vue"
import { tokenizeCode, resolveLanguage } from "../syntax.js"

const props = defineProps({
  oldText: { type: String, default: "" },
  newText: { type: String, default: "" },
  mode: { type: String, default: "split" }, // split | unified
  oldLabel: { type: String, default: "Original" },
  newLabel: { type: String, default: "Modified" },
  showLineNumbers: { type: Boolean, default: true },
  // language for syntax highlighting, e.g. "javascript", "json", "css" -
  // empty means plain text
  language: { type: String, default: "" },
  // cap the body height (px) - the diff scrolls vertically past it
  maxHeight: { type: Number, default: 0 },
})

const resolvedLang = computed(() => resolveLanguage(props.language))

// jsdiff line parts carry one-or-more lines joined by "\n" - split them back
// into individual lines, dropping the empty tail a trailing newline produces
const partLines = (value) => {
  if (value === "") return []
  const lines = value.split("\n")
  if (lines.length > 1 && lines[lines.length - 1] === "" && value.endsWith("\n")) {
    lines.pop()
  }
  return lines
}

const mergeSegments = (segs) => {
  const out = []
  for (const s of segs) {
    const prev = out[out.length - 1]
    if (prev && prev.changed === s.changed) prev.text += s.text
    else out.push({ ...s })
  }
  return out
}

// word-level diff between two changed lines - highlights only the tokens that
// actually moved
const intraLineDiff = (oldLine, newLine) => {
  const parts = diffWordsWithSpace(oldLine, newLine)
  const oldSegs = []
  const newSegs = []
  let equalLen = 0
  for (const p of parts) {
    if (p.added) {
      newSegs.push({ text: p.value, changed: true })
    } else if (p.removed) {
      oldSegs.push({ text: p.value, changed: true })
    } else {
      oldSegs.push({ text: p.value, changed: false })
      newSegs.push({ text: p.value, changed: false })
      equalLen += p.value.length
    }
  }
  // when the lines barely overlap, token highlighting is just noise -
  // let the row tint carry the change instead
  const total = Math.max(oldLine.length, newLine.length, 1)
  if (equalLen / total < 0.25) {
    return {
      oldSegs: [{ text: oldLine, changed: false }],
      newSegs: [{ text: newLine, changed: false }],
    }
  }
  return { oldSegs: mergeSegments(oldSegs), newSegs: mergeSegments(newSegs) }
}

// flat list of diff entries, each either a context line, a paired change,
// or an unpaired add / remove
const entries = computed(() => {
  const oldText = props.oldText.replace(/\n$/, "")
  const newText = props.newText.replace(/\n$/, "")
  const parts = diffLines(oldText, newText)

  let oNum = 0
  let nNum = 0
  const lines = []
  for (const part of parts) {
    for (const text of partLines(part.value)) {
      if (part.added) lines.push({ type: "ins", oldNum: null, newNum: ++nNum, text })
      else if (part.removed) lines.push({ type: "del", oldNum: ++oNum, newNum: null, text })
      else lines.push({ type: "equal", oldNum: ++oNum, newNum: ++nNum, text })
    }
  }

  const out = []
  let k = 0
  while (k < lines.length) {
    if (lines[k].type === "equal") {
      out.push({ kind: "equal", ...lines[k] })
      k++
      continue
    }
    const block = []
    while (k < lines.length && lines[k].type !== "equal") { block.push(lines[k]); k++ }
    const dels = block.filter((l) => l.type === "del")
    const inss = block.filter((l) => l.type === "ins")
    const paired = Math.min(dels.length, inss.length)
    for (let p = 0; p < paired; p++) {
      const intra = intraLineDiff(dels[p].text, inss[p].text)
      out.push({
        kind: "change",
        del: { oldNum: dels[p].oldNum, text: dels[p].text, segments: intra.oldSegs },
        ins: { newNum: inss[p].newNum, text: inss[p].text, segments: intra.newSegs },
      })
    }
    for (let p = paired; p < dels.length; p++) {
      out.push({ kind: "del", oldNum: dels[p].oldNum, text: dels[p].text })
    }
    for (let p = paired; p < inss.length; p++) {
      out.push({ kind: "ins", newNum: inss[p].newNum, text: inss[p].text })
    }
  }
  return out
})

const stats = computed(() => {
  let add = 0
  let del = 0
  for (const e of entries.value) {
    if (e.kind === "ins") add++
    else if (e.kind === "del") del++
    else if (e.kind === "change") { add++; del++ }
  }
  return { add, del }
})

// walk two segmentations of the same line in lockstep, emitting pieces split at
// every boundary of either side
const mergeSyntaxDiff = (syn, diff) => {
  const out = []
  let si = 0
  let di = 0
  let so = 0
  let dOff = 0
  while (si < syn.length && di < diff.length) {
    const s = syn[si]
    const d = diff[di]
    const take = Math.min(s.text.length - so, d.text.length - dOff)
    if (take <= 0) break
    out.push({ text: s.text.slice(so, so + take), type: s.type, changed: d.changed })
    so += take
    dOff += take
    if (so >= s.text.length) { si++; so = 0 }
    if (dOff >= d.text.length) { di++; dOff = 0 }
  }
  return out
}

// for code lines: combine Prism syntax tokens with the word-diff so each piece
// carries both a syntax color and whether it changed
const buildCodeTokens = (text, segments, tone) => {
  let syn = tokenizeCode(text, props.language)
  if (!syn || (text.length && syn.length === 0)) syn = [{ text, type: null }]
  const diff = segments && segments.length ? segments : [{ text, changed: false }]
  const merged = mergeSyntaxDiff(syn, diff)
  for (let i = 0; i < merged.length; i++) {
    const t = merged[i]
    if (!t.changed) continue
    t.tone = tone
    t.runStart = i === 0 || !merged[i - 1].changed
    t.runEnd = i === merged.length - 1 || !merged[i + 1].changed
  }
  return merged
}

const cell = (kind, num, text, segments) => {
  const c = { kind, num, text: text == null ? "" : text, segments: null, tokens: null }
  if (kind === "empty") return c
  if (resolvedLang.value) {
    c.tokens = buildCodeTokens(c.text, segments, kind)
  } else {
    c.segments = segments || null
  }
  return c
}

const splitRows = computed(() =>
  entries.value.map((e) => {
    if (e.kind === "equal") {
      return {
        left: cell("equal", e.oldNum, e.text),
        right: cell("equal", e.newNum, e.text),
      }
    }
    if (e.kind === "change") {
      return {
        left: cell("del", e.del.oldNum, e.del.text, e.del.segments),
        right: cell("ins", e.ins.newNum, e.ins.text, e.ins.segments),
      }
    }
    if (e.kind === "del") {
      return { left: cell("del", e.oldNum, e.text), right: cell("empty") }
    }
    return { left: cell("empty"), right: cell("ins", e.newNum, e.text) }
  }),
)

const unifiedRows = computed(() => {
  const rows = []
  for (const e of entries.value) {
    if (e.kind === "equal") {
      rows.push({ ...cell("equal", null, e.text), oldNum: e.oldNum, newNum: e.newNum })
    } else if (e.kind === "del") {
      rows.push({ ...cell("del", null, e.text), oldNum: e.oldNum, newNum: null })
    } else if (e.kind === "ins") {
      rows.push({ ...cell("ins", null, e.text), oldNum: null, newNum: e.newNum })
    } else {
      rows.push({ ...cell("del", null, e.del.text, e.del.segments), oldNum: e.del.oldNum, newNum: null })
      rows.push({ ...cell("ins", null, e.ins.text, e.ins.segments), oldNum: null, newNum: e.ins.newNum })
    }
  }
  return rows
})

const signOf = (kind) => (kind === "del" ? "-" : kind === "ins" ? "+" : "")
</script>

<template>
  <div :class="['pc-diff', 'pc-syntax', `pc-diff--${mode}`, { 'pc-diff--no-nums': !showLineNumbers }]">
    <div class="pc-diff__header">
      <div class="pc-diff__labels">
        <span v-if="oldLabel" class="pc-diff__label">{{ oldLabel }}</span>
        <svg
          v-if="oldLabel && newLabel"
          class="pc-diff__arrow"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h9M8.5 4l4 4-4 4"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-if="newLabel" class="pc-diff__label">{{ newLabel }}</span>
      </div>
      <div class="pc-diff__stats">
        <span class="pc-diff__stat pc-diff__stat--add">+{{ stats.add }}</span>
        <span class="pc-diff__stat pc-diff__stat--del">&minus;{{ stats.del }}</span>
      </div>
    </div>

    <component
      :is="maxHeight > 0 ? ScrollArea : 'div'"
      :max-height="maxHeight > 0 ? maxHeight : undefined"
      class="pc-diff__body"
    >
      <!-- split: two aligned columns -->
      <div v-if="mode === 'split'" class="pc-diff__grid pc-diff__grid--split">
        <template v-for="(row, ri) in splitRows" :key="ri">
          <div
            v-if="showLineNumbers"
            :class="['pc-diff__num', `pc-diff__cell--${row.left.kind}`]"
          >{{ row.left.num }}</div>
          <div :class="['pc-diff__code', `pc-diff__cell--${row.left.kind}`]">
            <span v-if="row.left.kind !== 'empty'" class="pc-diff__sign">{{ signOf(row.left.kind) }}</span>
            <span v-if="row.left.kind !== 'empty'" class="pc-diff__text">
              <template v-if="row.left.tokens">
                <span
                  v-for="(tk, ti) in row.left.tokens"
                  :key="ti"
                  :class="['token', tk.type, tk.changed && [
                    'pc-diff__ctok', `pc-diff__ctok--${tk.tone}`,
                    { 'pc-diff__ctok--start': tk.runStart, 'pc-diff__ctok--end': tk.runEnd },
                  ]]"
                >{{ tk.text }}</span>
              </template>
              <template v-else-if="row.left.segments">
                <span
                  v-for="(seg, si) in row.left.segments"
                  :key="si"
                  :class="{ 'pc-diff__tok pc-diff__tok--del': seg.changed }"
                >{{ seg.text }}</span>
              </template>
              <template v-else>{{ row.left.text }}</template>
            </span>
          </div>

          <div
            v-if="showLineNumbers"
            :class="['pc-diff__num', `pc-diff__cell--${row.right.kind}`]"
          >{{ row.right.num }}</div>
          <div :class="['pc-diff__code', `pc-diff__cell--${row.right.kind}`]">
            <span v-if="row.right.kind !== 'empty'" class="pc-diff__sign">{{ signOf(row.right.kind) }}</span>
            <span v-if="row.right.kind !== 'empty'" class="pc-diff__text">
              <template v-if="row.right.tokens">
                <span
                  v-for="(tk, ti) in row.right.tokens"
                  :key="ti"
                  :class="['token', tk.type, tk.changed && [
                    'pc-diff__ctok', `pc-diff__ctok--${tk.tone}`,
                    { 'pc-diff__ctok--start': tk.runStart, 'pc-diff__ctok--end': tk.runEnd },
                  ]]"
                >{{ tk.text }}</span>
              </template>
              <template v-else-if="row.right.segments">
                <span
                  v-for="(seg, si) in row.right.segments"
                  :key="si"
                  :class="{ 'pc-diff__tok pc-diff__tok--ins': seg.changed }"
                >{{ seg.text }}</span>
              </template>
              <template v-else>{{ row.right.text }}</template>
            </span>
          </div>
        </template>
      </div>

      <!-- unified: a single column -->
      <div v-else class="pc-diff__grid pc-diff__grid--unified">
        <template v-for="(row, ri) in unifiedRows" :key="ri">
          <div
            v-if="showLineNumbers"
            :class="['pc-diff__num', `pc-diff__cell--${row.kind}`]"
          >{{ row.oldNum }}</div>
          <div
            v-if="showLineNumbers"
            :class="['pc-diff__num', `pc-diff__cell--${row.kind}`]"
          >{{ row.newNum }}</div>
          <div :class="['pc-diff__code', `pc-diff__cell--${row.kind}`]">
            <span class="pc-diff__sign">{{ signOf(row.kind) }}</span>
            <span class="pc-diff__text">
              <template v-if="row.tokens">
                <span
                  v-for="(tk, ti) in row.tokens"
                  :key="ti"
                  :class="['token', tk.type, tk.changed && [
                    'pc-diff__ctok', `pc-diff__ctok--${tk.tone}`,
                    { 'pc-diff__ctok--start': tk.runStart, 'pc-diff__ctok--end': tk.runEnd },
                  ]]"
                >{{ tk.text }}</span>
              </template>
              <template v-else-if="row.segments">
                <span
                  v-for="(seg, si) in row.segments"
                  :key="si"
                  :class="{ [`pc-diff__tok pc-diff__tok--${row.kind}`]: seg.changed }"
                >{{ seg.text }}</span>
              </template>
              <template v-else>{{ row.text }}</template>
            </span>
          </div>
        </template>
      </div>
    </component>
  </div>
</template>

<style scoped>
.pc-diff {
  --pc-diff-num: 46px;
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  overflow: hidden;
  background: var(--paper);
}

.pc-diff__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 12px;
  background: var(--ink-04);
  border-bottom: 1px solid var(--ink-08);
}
.pc-diff__labels {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.pc-diff__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pc-diff__arrow { width: 13px; height: 13px; color: var(--ink-40); flex-shrink: 0; }
.pc-diff__stats { display: flex; gap: 8px; flex-shrink: 0; }
.pc-diff__stat {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.pc-diff__stat--add { color: var(--status-active); }
.pc-diff__stat--del { color: var(--status-failed); }

.pc-diff__body { width: 100%; }

.pc-diff__grid { display: grid; }
.pc-diff__grid--split {
  grid-template-columns: var(--pc-diff-num) minmax(0, 1fr) var(--pc-diff-num) minmax(0, 1fr);
}
.pc-diff__grid--unified {
  grid-template-columns: var(--pc-diff-num) var(--pc-diff-num) minmax(0, 1fr);
}
.pc-diff--no-nums.pc-diff--split .pc-diff__grid--split {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
.pc-diff--no-nums.pc-diff--unified .pc-diff__grid--unified {
  grid-template-columns: minmax(0, 1fr);
}

.pc-diff__num {
  padding: 1px 8px;
  text-align: right;
  font-family: var(--mono);
  font-size: 10.5px;
  line-height: 1.65;
  color: var(--ink-40);
  background: var(--paper);
  border-right: 1px solid var(--ink-08);
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.pc-diff__code {
  display: flex;
  gap: 6px;
  padding: 1px 10px 1px 6px;
  background: var(--paper);
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.65;
}
.pc-diff__sign {
  flex-shrink: 0;
  width: 1ch;
  text-align: center;
  color: var(--ink-40);
  user-select: none;
}
.pc-diff__text {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
  color: var(--ink);
}

/* row tints */
.pc-diff__cell--del { background: color-mix(in srgb, var(--status-failed) 10%, var(--paper)); }
.pc-diff__cell--ins { background: color-mix(in srgb, var(--status-active) 10%, var(--paper)); }
.pc-diff__cell--empty {
  background: var(--ink-04);
  border-right-color: transparent;
}
.pc-diff__num.pc-diff__cell--del { background: color-mix(in srgb, var(--status-failed) 17%, var(--paper)); }
.pc-diff__num.pc-diff__cell--ins { background: color-mix(in srgb, var(--status-active) 17%, var(--paper)); }

.pc-diff__cell--del .pc-diff__sign { color: var(--status-failed); }
.pc-diff__cell--ins .pc-diff__sign { color: var(--status-active); }

/* word-level highlights inside a changed line (plain-text mode) */
.pc-diff__tok {
  border-radius: 2px;
  padding: 0 1px;
}
.pc-diff__tok--del { background: color-mix(in srgb, var(--status-failed) 26%, var(--paper)); }
.pc-diff__tok--ins { background: color-mix(in srgb, var(--status-active) 26%, var(--paper)); }

/* word-level highlights inside a changed code line - a continuous band so it
   reads as one highlight even though it is split across syntax tokens */
.pc-diff__ctok--del { background: color-mix(in srgb, var(--status-failed) 24%, var(--paper)); }
.pc-diff__ctok--ins { background: color-mix(in srgb, var(--status-active) 24%, var(--paper)); }
.pc-diff__ctok--start { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }
.pc-diff__ctok--end { border-top-right-radius: 2px; border-bottom-right-radius: 2px; }
</style>
