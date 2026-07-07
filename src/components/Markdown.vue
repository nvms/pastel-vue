<script setup>
import { computed } from "vue"
import { renderMarkdown } from "../markdown.js"

const props = defineProps({
  source: { type: String, default: "" },
  // treat single newlines as line breaks, which is what chat content expects
  breaks: { type: Boolean, default: true },
})

const html = computed(() => renderMarkdown(props.source, { breaks: props.breaks }))
</script>

<template>
  <div class="pc-markdown" v-html="html" />
</template>

<style>
/* unscoped because the content comes from v-html. colors lean on currentColor
   so the same markup reads correctly on light bubbles and the dark user bubble */
.pc-markdown {
  font-size: inherit;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.pc-markdown > :first-child { margin-top: 0; }
.pc-markdown > :last-child { margin-bottom: 0; }

.pc-markdown p { margin: 0 0 10px; }

.pc-markdown h1,
.pc-markdown h2,
.pc-markdown h3,
.pc-markdown h4,
.pc-markdown h5,
.pc-markdown h6 {
  margin: 14px 0 6px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.2px;
}
.pc-markdown h1 { font-size: 1.25em; }
.pc-markdown h2 { font-size: 1.15em; }
.pc-markdown h3 { font-size: 1.05em; }
.pc-markdown h4,
.pc-markdown h5,
.pc-markdown h6 { font-size: 1em; }

.pc-markdown ul,
.pc-markdown ol {
  margin: 0 0 10px;
  padding-left: 22px;
}
.pc-markdown li { margin: 3px 0; }
.pc-markdown li > p { margin: 0; }
.pc-markdown li > ul,
.pc-markdown li > ol { margin-bottom: 0; }

.pc-markdown code {
  font-family: var(--mono);
  font-size: 0.88em;
  padding: 1px 5px;
  border-radius: 4px;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.pc-markdown__pre {
  margin: 0 0 10px;
  padding: 9px 11px;
  border-radius: var(--radius-sharp);
  background: color-mix(in srgb, currentColor 6%, transparent);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-20) transparent;
}
.pc-markdown__pre code {
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}

.pc-markdown blockquote {
  margin: 0 0 10px;
  padding: 2px 0 2px 11px;
  border-left: 2px solid color-mix(in srgb, currentColor 25%, transparent);
  color: color-mix(in srgb, currentColor 68%, transparent);
}
.pc-markdown blockquote > :last-child { margin-bottom: 0; }

.pc-markdown a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
  transition: text-decoration-color 140ms ease;
}
.pc-markdown a:hover { text-decoration-color: currentColor; }

.pc-markdown hr {
  border: 0;
  border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  margin: 12px 0;
}

.pc-markdown table {
  border-collapse: collapse;
  margin: 0 0 10px;
  font-size: 0.93em;
}
.pc-markdown th,
.pc-markdown td {
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  padding: 4px 9px;
  text-align: left;
}
.pc-markdown th { font-weight: 600; }

.pc-markdown img { max-width: 100%; border-radius: var(--radius-sharp); }
</style>
