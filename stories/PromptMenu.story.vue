<script setup>
import { ref } from "vue"
import PromptMenu from "../src/components/PromptMenu.vue"
import Button from "../src/components/Button.vue"
import Input from "../src/components/Input.vue"

const lastSimple = ref("")
const lastRich = ref("")
const lastCustom = ref("")

const SIMPLE = [
  "Summarize this thread",
  "List the action items",
  "Draft a reply",
  "Translate to Spanish",
]

const RICH = [
  { label: "Plan tonight's prep", text: "Walk me through the prep list for tonight's service, ordered by station.", description: "Ordered by station, with timing", icon: "lucide:clipboard-list" },
  { label: "Cost a dish", text: "Break down the food cost for the duck course and flag anything above target.", description: "Itemized, flags anything over target", icon: "lucide:calculator" },
  { label: "What's low?", text: "Check the walk-in and tell me what's below par.", description: "Scans the walk-in against par levels", icon: "lucide:package-search" },
]
</script>

<template>
  <Story title="PromptMenu">
    <!-- the panel opens upward, so give each variant headroom above it -->
    <Variant title="Plain prompts">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 160px;">
        <PromptMenu :prompts="SIMPLE" @select="lastSimple = $event" />
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          Selected: <code>{{ lastSimple || "nothing yet" }}</code>
        </p>
      </div>
    </Variant>

    <Variant title="With descriptions">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 200px;">
        <PromptMenu :prompts="RICH" @select="lastRich = $event" />
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          Inserted text: <code>{{ lastRich || "nothing yet" }}</code>
        </p>
      </div>
    </Variant>

    <Variant title="Custom trigger">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 160px;">
        <PromptMenu :prompts="SIMPLE" placement="top-start" @select="lastCustom = $event">
          <template #trigger="{ toggle, open }">
            <Button variant="outline" size="sm" icon="lucide:wand-2" :aria-expanded="open" @click="toggle">
              Suggestions
            </Button>
          </template>
        </PromptMenu>
        <Input :model-value="lastCustom" placeholder="Selection lands here…" readonly style="max-width: 320px;" />
      </div>
    </Variant>
  </Story>
</template>
