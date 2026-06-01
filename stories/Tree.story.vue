<script setup>
import { ref } from "vue"
import Tree from "../src/components/Tree.vue"
import Card from "../src/components/Card.vue"

const expanded = ref(["sources", "standards"])
const selected = ref("fc-3-401-11")

const items = [
  {
    key: "sources",
    label: "Sources",
    icon: "▣",
    children: [
      {
        key: "standards",
        label: "Food-safety standards",
        icon: "§",
        badge: 14,
        children: [
          { key: "fc-3-401-11", label: "FDA Food Code § 3-401.11 - Cook temperatures" },
          { key: "fc-3-501-14", label: "FDA Food Code § 3-501.14 - Cooling" },
          { key: "fc-3-501-16", label: "FDA Food Code § 3-501.16 - Hot/cold holding" },
        ],
      },
      {
        key: "rules",
        label: "House rules",
        icon: "§",
        children: [
          { key: "hr-3", label: "ServSafe Manager Manual Ch. 3" },
          { key: "hr-12", label: "ServSafe Manager Manual Ch. 12" },
        ],
      },
      {
        key: "forms",
        label: "Prep sheets",
        icon: "▢",
        children: [
          { key: "ps-101", label: "PS 101 - Mise en place" },
          { key: "ps-104", label: "PS 104 - Line check", disabled: true },
        ],
      },
    ],
  },
  {
    key: "workflows",
    label: "Workflows",
    icon: "⇄",
    children: [
      { key: "wf-intake", label: "Intake → Test" },
      { key: "wf-service", label: "Service prep" },
    ],
  },
  { key: "models", label: "Models", icon: "◇" },
]
</script>

<template>
  <Story title="Tree">
    <Variant title="With icons + badges">
      <Card padded style="max-width: 420px;">
        <Tree
          :items="items"
          v-model:expanded="expanded"
          v-model:selected="selected"
        />
      </Card>
    </Variant>

    <Variant title="Minimal">
      <Card padded style="max-width: 360px;">
        <Tree
          :items="[
            { key: 'a', label: 'Documents', children: [
              { key: 'a1', label: 'Recipes', children: [
                { key: 'a1a', label: 'Braised-short-rib.pdf' },
                { key: 'a1b', label: 'Cost-sheet.pdf' },
              ]},
              { key: 'a2', label: 'Photos' },
            ]},
            { key: 'b', label: 'Correspondence' },
          ]"
          :expanded="['a', 'a1']"
          selected="a1a"
        />
      </Card>
    </Variant>
  </Story>
</template>
