<script setup>
import { ref } from "vue"
import Timeline from "../src/components/Timeline.vue"
import Card from "../src/components/Card.vue"
import Badge from "../src/components/Badge.vue"

const opened = ref(null)

const recipeEvents = [
  {
    title: "Recipe drafted",
    time: "Mar 4",
    description: "Draft submitted by R. Alvarez and assigned to the development kitchen.",
    status: "done",
    icon: "lucide:folder-plus",
  },
  {
    title: "Documents ingested",
    time: "Mar 6",
    description: "14 source files processed and indexed for review.",
    status: "done",
    icon: "lucide:file-check-2",
  },
  {
    title: "Allergen check cleared",
    time: "Mar 7",
    description: "No allergen conflicts found across the current menu.",
    status: "done",
    icon: "lucide:shield-check",
  },
  {
    title: "Under review",
    time: "Mar 11",
    description: "Sous chef is testing the first-pass recipe.",
    status: "active",
    icon: "lucide:pen-line",
  },
  {
    title: "Chef approval",
    time: "Pending",
    description: "Awaiting sign-off before the recipe goes on the menu.",
    status: "default",
    icon: "lucide:circle-dashed",
  },
]

const clickableEvents = [
  {
    title: "Recipe drafted",
    time: "Mar 4",
    description: "Draft submitted by R. Alvarez. Click to open the draft record.",
    status: "done",
    icon: "lucide:folder-plus",
    clickable: true,
  },
  {
    title: "Documents ingested",
    time: "Mar 6",
    description: "14 source files processed. Click to inspect the ingestion run.",
    status: "done",
    icon: "lucide:file-check-2",
    clickable: true,
  },
  {
    title: "Allergen check cleared",
    time: "Mar 7",
    description: "No allergen conflicts found. Click for the full allergen report.",
    status: "done",
    icon: "lucide:shield-check",
    clickable: true,
  },
  {
    title: "Under review",
    time: "Mar 11",
    description: "Sous chef is testing the first-pass recipe.",
    status: "active",
    icon: "lucide:pen-line",
    clickable: true,
  },
  {
    title: "Awaiting chef approval",
    time: "Pending",
    description: "Not actionable yet, so this row is not clickable.",
    status: "default",
    icon: "lucide:circle-dashed",
  },
]

const plainEvents = [
  { title: "Created the workflow", time: "09:02", status: "done" },
  { title: "Added three reviewers", time: "09:14", status: "done" },
  { title: "Ingestion running", time: "09:30", status: "active" },
  { title: "Validation flagged 2 items", time: "09:41", status: "warning" },
  { title: "Export blocked", time: "09:55", status: "danger" },
  { title: "Scheduled re-run", time: "Tomorrow", status: "default" },
]
</script>

<template>
  <Story title="Timeline">
    <Variant title="Recipe history">
      <Card padded style="max-width: 460px;">
        <Timeline :items="recipeEvents" />
      </Card>
    </Variant>

    <Variant title="Status dots">
      <div style="max-width: 380px;">
        <Timeline :items="plainEvents" />
      </div>
    </Variant>

    <Variant title="Clickable events">
      <Card padded style="max-width: 460px;">
        <Timeline :items="clickableEvents" @select="(item) => (opened = item.title)" />
      </Card>
      <p style="margin-top: 12px; font-size: 13px; color: var(--ink-60);">
        Opened: <code>{{ opened || "(none)" }}</code>
      </p>
    </Variant>

    <Variant title="Custom content slot">
      <div style="max-width: 440px;">
        <Timeline :items="recipeEvents.slice(0, 3)">
          <template #title="{ item }">
            <span style="display: inline-flex; align-items: center; gap: 8px;">
              {{ item.title }}
              <Badge variant="active" size="sm">done</Badge>
            </span>
          </template>
        </Timeline>
      </div>
    </Variant>
  </Story>
</template>
