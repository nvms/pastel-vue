<script setup>
import { ref } from "vue"
import CitedAnswer from "../src/components/CitedAnswer.vue"
import Card from "../src/components/Card.vue"

const collapsible = ref(true)

const answer = `The agreement runs for twenty-four months from the Effective Date [1], and either party may terminate it with sixty days written notice [2]. The notice period was originally thirty days but was extended by a later amendment [3].

Late payments accrue interest at 1.5% per month [1], and confidentiality obligations survive termination for three years [4].`

const sources = [
  {
    title: "MSA - Acme Corp, §2 Term & Fees",
    snippet: "This Agreement shall commence on the Effective Date and continue for twenty-four (24) months. Late payments accrue interest at 1.5% per month.",
    href: "#",
    linkLabel: "msa-acme.pdf",
  },
  {
    title: "MSA - Acme Corp, §9 Termination",
    snippet: "Either party may terminate this Agreement with sixty (60) days written notice.",
    href: "#",
    linkLabel: "msa-acme.pdf",
  },
  {
    title: "Amendment No. 2",
    snippet: "Section 9 is amended to extend the notice period from thirty days to sixty days.",
    href: "#",
    linkLabel: "Download amendment",
  },
  {
    title: "NDA - Globex, §5 Survival",
    snippet: "Confidentiality obligations survive termination of this Agreement for a period of three years.",
    href: "#",
  },
]
</script>

<template>
  <Story title="CitedAnswer">
    <Variant title="Answer with citations">
      <Card padded style="max-width: 600px;">
        <CitedAnswer :answer="answer" :sources="sources" />
      </Card>
      <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
        Click a citation to peek at its source; hover to highlight it in the list.
      </p>
    </Variant>

    <Variant title="Collapsible sources">
      <Card padded style="max-width: 600px;">
        <CitedAnswer
          :answer="answer"
          :sources="sources"
          :collapsible-sources="collapsible"
        />
      </Card>
      <template #controls>
        <HstCheckbox v-model="collapsible" title="Collapsible sources" />
      </template>
    </Variant>

    <Variant title="No sources list">
      <Card padded style="max-width: 600px;">
        <CitedAnswer
          answer="Retrieval found no grounding for this claim, so it is shown without citations."
          :sources="[]"
        />
      </Card>
    </Variant>
  </Story>
</template>
