<script setup>
import { ref } from "vue"
import Timeline from "../src/components/Timeline.vue"
import Card from "../src/components/Card.vue"
import Badge from "../src/components/Badge.vue"

const opened = ref(null)

const caseEvents = [
  {
    title: "Matter opened",
    time: "Mar 4",
    description: "Intake form submitted by R. Alvarez and assigned to the contracts team.",
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
    title: "Conflict check cleared",
    time: "Mar 7",
    description: "No conflicts found across the active client roster.",
    status: "done",
    icon: "lucide:shield-check",
  },
  {
    title: "Under review",
    time: "Mar 11",
    description: "Lead associate is drafting the first-pass redline.",
    status: "active",
    icon: "lucide:pen-line",
  },
  {
    title: "Client approval",
    time: "Pending",
    description: "Awaiting sign-off before the matter can be closed.",
    status: "default",
    icon: "lucide:circle-dashed",
  },
]

const clickableEvents = [
  {
    title: "Matter opened",
    time: "Mar 4",
    description: "Intake submitted by R. Alvarez. Click to open the intake record.",
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
    title: "Conflict check cleared",
    time: "Mar 7",
    description: "No conflicts found. Click for the full conflict report.",
    status: "done",
    icon: "lucide:shield-check",
    clickable: true,
  },
  {
    title: "Under review",
    time: "Mar 11",
    description: "Lead associate is drafting the first-pass redline.",
    status: "active",
    icon: "lucide:pen-line",
    clickable: true,
  },
  {
    title: "Awaiting client approval",
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
    <Variant title="Case history">
      <Card padded style="max-width: 460px;">
        <Timeline :items="caseEvents" />
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
        <Timeline :items="caseEvents.slice(0, 3)">
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
