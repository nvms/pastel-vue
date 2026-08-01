<script setup>
import { ref } from "vue"
import RadioGroup from "../src/components/RadioGroup.vue"

const verticalChoice = ref("balanced")
const horizontalChoice = ref("weekly")

const modes = [
  { value: "fast", label: "Fast" },
  { value: "balanced", label: "Balanced" },
  { value: "thorough", label: "Thorough" },
]

const schedules = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]
</script>

<template>
  <Story title="RadioGroup">
    <Variant title="Vertical">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <RadioGroup v-model="verticalChoice" :options="modes" />
        <span style="font-size: 13px; color: var(--ink-60);">
          Selected: {{ verticalChoice }}
        </span>
      </div>
    </Variant>

    <Variant title="Horizontal">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <RadioGroup
          v-model="horizontalChoice"
          :options="schedules"
          direction="horizontal"
        />
        <span style="font-size: 13px; color: var(--ink-60);">
          Selected: {{ horizontalChoice }}
        </span>
      </div>
    </Variant>

    <Variant title="Disabled">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <RadioGroup model-value="balanced" :options="modes" disabled />
        <RadioGroup
          model-value="weekly"
          :options="schedules"
          direction="horizontal"
          disabled
        />
      </div>
    </Variant>
  </Story>
</template>
