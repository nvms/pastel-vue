<script setup>
import { ref } from "vue"
import RetrievedChunks from "../src/components/RetrievedChunks.vue"

const results = [
  {
    source: "msa-acme.pdf",
    chunk: 12,
    score: 0.94,
    text: "Either party may terminate this Agreement with sixty (60) days written notice. Upon termination, the Client shall pay for all services rendered through the termination date.",
  },
  {
    source: "msa-acme.pdf",
    chunk: 7,
    score: 0.79,
    text: "This Agreement shall commence on the Effective Date and continue for a period of twenty-four (24) months unless terminated earlier in accordance with Section 9.",
  },
  {
    source: "amendment-2.pdf",
    chunk: 3,
    score: 0.61,
    text: "Section 9 is amended to extend the notice period from thirty days to sixty days, effective as of the date of this amendment.",
  },
  {
    source: "nda-globex.pdf",
    chunk: 19,
    score: 0.37,
    text: "Confidentiality obligations survive termination of this Agreement for a period of three years.",
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
