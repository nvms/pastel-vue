<script setup>
import { ref, computed, onBeforeUnmount } from "vue"
import { Icon } from "@iconify/vue"
import ScrollArea from "./ScrollArea.vue"
import { tokenizeCode } from "../syntax.js"

const props = defineProps({
  code: { type: String, default: "" },
  language: { type: String, default: "" },
  // optional header label
  filename: { type: String, default: "" },
  showLineNumbers: { type: Boolean, default: true },
  copyable: { type: Boolean, default: true },
  // 1-based line numbers to emphasize
  highlightLines: { type: Array, default: () => [] },
  // cap the body height (px) - the block scrolls past it
  maxHeight: { type: Number, default: 0 },
})

const codeText = computed(() => props.code.replace(/\n$/, ""))

// per-line token arrays - tokenize the whole block once (correct for
// multi-line constructs) then split the flat token stream on newlines
const lines = computed(() => {
  const raw = codeText.value
  const flat = tokenizeCode(raw, props.language)
  if (!flat) return raw.split("\n").map((text) => [{ text, type: null }])
  const out = []
  let current = []
  for (const tok of flat) {
    const parts = tok.text.split("\n")
    parts.forEach((part, i) => {
      if (i > 0) { out.push(current); current = [] }
      if (part) current.push({ text: part, type: tok.type })
    })
  }
  out.push(current)
  return out
})

const isHot = (n) => props.highlightLines.includes(n)
const showHeader = computed(() => !!props.filename || props.copyable)

const copied = ref(false)
let copyTimer = null
const copy = async () => {
  try {
    await navigator.clipboard.writeText(codeText.value)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 1600)
  } catch {
    // clipboard unavailable - ignore
  }
}
onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <div class="pc-codeblock pc-syntax">
    <div v-if="showHeader" class="pc-codeblock__header">
      <span v-if="filename" class="pc-codeblock__filename">{{ filename }}</span>
      <span v-else-if="language" class="pc-codeblock__lang">{{ language }}</span>
      <span v-else />
      <button
        v-if="copyable"
        type="button"
        :class="['pc-codeblock__copy', { 'pc-codeblock__copy--done': copied }]"
        @click="copy"
      >
        <Transition name="pc-copy" mode="out-in">
          <span :key="copied" class="pc-codeblock__copy-inner">
            <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" />
            {{ copied ? "Copied" : "Copy" }}
          </span>
        </Transition>
      </button>
    </div>

    <component
      :is="maxHeight > 0 ? ScrollArea : 'div'"
      :max-height="maxHeight > 0 ? maxHeight : undefined"
      class="pc-codeblock__body"
    >
      <div
        :class="['pc-codeblock__grid', { 'pc-codeblock__grid--no-nums': !showLineNumbers }]"
      >
        <template v-for="(line, i) in lines" :key="i">
          <div
            v-if="showLineNumbers"
            :class="['pc-codeblock__num', { 'pc-codeblock__num--hot': isHot(i + 1) }]"
          >{{ i + 1 }}</div>
          <div :class="['pc-codeblock__line', { 'pc-codeblock__line--hot': isHot(i + 1) }]">
            <span
              v-for="(tk, ti) in line"
              :key="ti"
              :class="['token', tk.type]"
            >{{ tk.text }}</span>
          </div>
        </template>
      </div>
    </component>
  </div>
</template>

<style scoped>
.pc-codeblock {
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  overflow: hidden;
  background: var(--paper);
}

.pc-codeblock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 10px 8px 14px;
  background: var(--ink-04);
  border-bottom: 1px solid var(--ink-08);
}
.pc-codeblock__filename {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: -0.12px;
  color: var(--ink);
}
.pc-codeblock__lang {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-40);
}
.pc-codeblock__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* hold the wider "Copied" width so the label swap never jolts the layout */
  min-width: 76px;
  height: 26px;
  padding: 0 9px;
  border-radius: var(--radius-sharp);
  background: transparent;
  color: var(--ink-60);
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 60ms ease;
}
.pc-codeblock__copy:hover { background: var(--ink-08); color: var(--ink); }
.pc-codeblock__copy:active { transform: translateY(1px); }
.pc-codeblock__copy:focus-visible { box-shadow: var(--focus-ring); }
.pc-codeblock__copy--done { color: var(--status-active); }
.pc-codeblock__copy :deep(svg) { width: 13px; height: 13px; }

.pc-codeblock__copy-inner { display: inline-flex; align-items: center; gap: 5px; }

/* directional cross-fade between Copy and Copied */
.pc-copy-enter-active,
.pc-copy-leave-active { transition: opacity 110ms ease, transform 110ms ease; }
.pc-copy-enter-from { opacity: 0; transform: translateY(3px); }
.pc-copy-leave-to { opacity: 0; transform: translateY(-3px); }
@media (prefers-reduced-motion: reduce) {
  .pc-copy-enter-active,
  .pc-copy-leave-active { transition: none; }
}

.pc-codeblock__body { width: 100%; }

.pc-codeblock__grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 10px 0;
}
.pc-codeblock__grid--no-nums { grid-template-columns: minmax(0, 1fr); }

.pc-codeblock__num {
  padding: 0 14px 0 14px;
  text-align: right;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.7;
  color: var(--ink-20);
  user-select: none;
  font-variant-numeric: tabular-nums;
}
.pc-codeblock__num--hot { color: var(--status-paused); }

.pc-codeblock__line {
  padding: 0 16px;
  min-height: 1.7em;
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
  color: var(--ink);
}
.pc-codeblock__num--hot,
.pc-codeblock__line--hot {
  background: color-mix(in srgb, var(--lavender) 22%, var(--paper));
}
</style>
