<script setup>
import { ref } from "vue"
import RetrievedChunks from "../src/components/RetrievedChunks.vue"

const results = [
  {
    source: "short-ribs.pdf",
    chunk: 12,
    score: 0.94,
    text: "Braise the short ribs covered at 300°F until the meat pulls easily from the bone. Once cooled, portion the ribs and reserve the strained liquid for the sauce.",
  },
  {
    source: "short-ribs.pdf",
    chunk: 7,
    score: 0.79,
    text: "This recipe yields twelve (12) portions and keeps for up to four days once properly cooled, unless adjusted per the latest revision.",
  },
  {
    source: "revision-2.pdf",
    chunk: 3,
    score: 0.61,
    text: "Step 9 is revised to extend the braise time from two hours to three hours, effective as of this revision.",
  },
  {
    source: "technique-guide.pdf",
    chunk: 19,
    score: 0.37,
    text: "Letting the finished braise rest overnight lets the flavor deepen and makes the surface fat easy to lift off the next day.",
  },
]

const picked = ref(null)
</script>

<template>
  <Story title="RetrievedChunks">
    <Variant title="Ranked results">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 10px;">
        <RetrievedChunks :results="results" @select="(r) => (picked = r.source)" />
        <p style="margin: 0; font-size: 13px; color: var(--ink-60);">
          Selected: <code>{{ picked || "(none)" }}</code>
        </p>
      </div>
    </Variant>

    <Variant title="Non-interactive">
      <div style="max-width: 560px;">
        <RetrievedChunks :results="results" :interactive="false" />
      </div>
    </Variant>
  </Story>
</template>
