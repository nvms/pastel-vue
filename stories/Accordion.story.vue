<script setup>
import { ref } from "vue"
import Accordion from "../src/components/Accordion.vue"

const open = ref("workflow")

const items = [
  {
    key: "intake",
    eyebrow: "Step 1",
    label: "Intake",
    content: "We pull the ingredient list, the cost sheet, and the spec. The model extracts the allergen class and the cooling window - a head chef signs off before anything advances.",
  },
  {
    key: "workflow",
    eyebrow: "Step 2",
    label: "Workflow synthesis",
    content: "The system reads the venue's food-safety standards and prep guidelines and proposes a routing plan: which prep cards to publish, in what order, and on what calendar.",
  },
  {
    key: "publish",
    eyebrow: "Step 3",
    label: "Publishing",
    content: "Prep cards are populated from the recipe state and sent through the appropriate channel (line printer, prep list, tablet). We track confirmations and surface conflicts back to the head chef.",
  },
  {
    key: "service",
    eyebrow: "Step 4",
    label: "Service",
    disabled: true,
    content: "Service prep would render here.",
  },
]
</script>

<template>
  <Story title="Accordion">
    <Variant title="Bordered (single)">
      <div style="max-width: 640px;">
        <Accordion v-model="open" :items="items" />
      </div>
    </Variant>

    <Variant title="Multiple open">
      <div style="max-width: 640px;">
        <Accordion type="multiple" :items="items" :modelValue="['intake', 'workflow']" />
      </div>
    </Variant>

    <Variant title="Flush (no outer border)">
      <div style="max-width: 640px;">
        <Accordion variant="flush" :items="items" />
      </div>
    </Variant>
  </Story>
</template>
