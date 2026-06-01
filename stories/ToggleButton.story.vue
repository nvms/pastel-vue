<script setup>
import { ref } from "vue"
import ToggleButton from "../src/components/ToggleButton.vue"

const wrap = ref(false)
const bold = ref(true)
const italic = ref(false)
const underline = ref(false)
const tests = ref({ unit: true, integration: false, e2e: false })
const size = ref(true)
</script>

<template>
  <Story title="ToggleButton">
    <Variant title="Single toggle">
      <ToggleButton v-model="wrap">Word wrap</ToggleButton>
    </Variant>

    <Variant title="Icon only">
      <div style="display: flex; gap: 8px;">
        <ToggleButton v-model="bold" icon="lucide:bold" aria-label="Bold" />
        <ToggleButton v-model="italic" icon="lucide:italic" aria-label="Italic" />
        <ToggleButton v-model="underline" icon="lucide:underline" aria-label="Underline" />
      </div>
    </Variant>

    <Variant title="Icon with label">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ToggleButton v-model="tests.unit" icon="lucide:flask-conical">Unit</ToggleButton>
        <ToggleButton v-model="tests.integration" icon="lucide:link">Integration</ToggleButton>
        <ToggleButton v-model="tests.e2e" icon="lucide:network">End-to-end</ToggleButton>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div style="display: flex; gap: 8px; align-items: center;">
        <ToggleButton v-model="size" size="sm">Small</ToggleButton>
        <ToggleButton v-model="size">Medium</ToggleButton>
        <ToggleButton v-model="size" size="lg">Large</ToggleButton>
      </div>
    </Variant>

    <Variant title="Disabled">
      <div style="display: flex; gap: 8px;">
        <ToggleButton :model-value="false" disabled>Off (disabled)</ToggleButton>
        <ToggleButton :model-value="true" disabled>On (disabled)</ToggleButton>
      </div>
    </Variant>
  </Story>
</template>
