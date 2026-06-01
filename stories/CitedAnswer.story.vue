<script setup>
import { ref } from "vue"
import CitedAnswer from "../src/components/CitedAnswer.vue"
import Card from "../src/components/Card.vue"

const collapsible = ref(true)

const answer = `The braise yields twelve portions and keeps for up to four days once properly cooled [1], and the ribs cook covered at 300°F until the meat pulls from the bone [2]. The braise time was originally two hours but was extended to three in a later revision [3].

Season the ribs at about 1.5% salt by weight the night before [1], and let the finished braise rest overnight so the flavor deepens [4].`

const sources = [
  {
    title: "Braised Short Ribs - Yield & Seasoning",
    snippet: "This recipe yields twelve (12) portions and keeps for up to four days once properly cooled. Season the ribs at about 1.5% salt by weight.",
    href: "#",
    linkLabel: "short-ribs.pdf",
  },
  {
    title: "Braised Short Ribs - Braising",
    snippet: "Braise the short ribs covered at 300°F until the meat pulls easily from the bone.",
    href: "#",
    linkLabel: "short-ribs.pdf",
  },
  {
    title: "Revision No. 2",
    snippet: "Step 9 is revised to extend the braise time from two hours to three hours.",
    href: "#",
    linkLabel: "Download revision",
  },
  {
    title: "Resting & Storage - technique guide",
    snippet: "Let the finished braise rest overnight; the flavor deepens after the first day.",
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
