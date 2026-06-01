<script setup>
import { ref } from "vue"
import Table from "../src/components/Table.vue"
import Badge from "../src/components/Badge.vue"
import Card from "../src/components/Card.vue"

// --- rich recipe registry (reproduces the prototype table) ---
const workflowColumns = [
  { key: "name", label: "Recipe", primary: true, subtitle: "code" },
  { key: "venue", label: "Venue" },
  { key: "version", label: "Version", mono: true },
  { key: "status", label: "Status" },
  { key: "signedBy", label: "Chef sign-off" },
  { key: "signed", label: "Approved" },
  { key: "onMenu", label: "On the menu", align: "right" },
]
const workflowRows = [
  { id: 1, name: "Cherry Creek Braised Short Ribs", code: "RCP_DENVER_SHORTRIBS", venue: "Denver, CO", version: "v3", status: "active", signedBy: "Theodora Whitfield", signed: "Apr 22, 2026", onMenu: 16 },
  { id: 2, name: "Phoenix Tasting Menu (legacy)", code: "RCP_PHOENIX_LEGACY", venue: "Phoenix, AZ", version: "v7", status: "active", signedBy: "Marisol Reyna", signed: "Feb 14, 2026", onMenu: 0 },
  { id: 3, name: "Austin Brisket Standard", code: "RCP_AUSTIN_STD", venue: "Austin, TX", version: "v2", status: "paused", signedBy: "Devon Carter", signed: "Mar 03, 2026", onMenu: 4 },
  { id: 4, name: "Nashville Hot Chicken Draft", code: "RCP_NASHVILLE_DRAFT", venue: "Nashville, TN", version: "v1", status: "draft", signedBy: "-", signed: "-", onMenu: 0 },
  { id: 5, name: "Portland Cedar Salmon", code: "RCP_PORTLAND_SALMON", venue: "Portland, OR", version: "v5", status: "failed", signedBy: "Imani Okafor", signed: "Jan 30, 2026", onMenu: 2 },
]

// --- generic minimal table ---
const genericColumns = [
  { key: "dish", label: "Dish" },
  { key: "venue", label: "Venue" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated", align: "right" },
]
const genericRows = [
  { id: 1, dish: "Braised Short Ribs", venue: "West Kitchen", status: "active", updated: "2m ago" },
  { id: 2, dish: "Cedar Plank Salmon", venue: "Highlands", status: "paused", updated: "1h ago" },
  { id: 3, dish: "Nashville Hot Chicken", venue: "Union Station", status: "failed", updated: "yesterday" },
  { id: 4, dish: "Smoked Brisket Plate", venue: "Pearl District", status: "draft", updated: "3 days ago" },
]

const lastClicked = ref(null)
</script>

<template>
  <Story title="Table">
    <Variant title="Recipe registry (rich)">
      <Card style="overflow: hidden;">
        <Table :columns="workflowColumns" :rows="workflowRows" clickable @row-click="r => lastClicked = r.name">
          <template #cell-status="{ value }">
            <Badge :variant="value">{{ value }}</Badge>
          </template>
        </Table>
      </Card>
      <div style="margin-top: 12px; font-size: 13px; color: var(--ink-60);">
        Row clicked: <code>{{ lastClicked || "(none)" }}</code>
      </div>
    </Variant>

    <Variant title="Generic (minimal)">
      <Card style="overflow: hidden;">
        <Table :columns="genericColumns" :rows="genericRows">
          <template #cell-status="{ value }">
            <Badge :variant="value">{{ value }}</Badge>
          </template>
        </Table>
      </Card>
    </Variant>

    <Variant title="Compact density">
      <Card style="overflow: hidden;">
        <Table :columns="workflowColumns" :rows="workflowRows" compact>
          <template #cell-status="{ value }">
            <Badge :variant="value">{{ value }}</Badge>
          </template>
        </Table>
      </Card>
    </Variant>

    <Variant title="Empty">
      <Card style="overflow: hidden;">
        <Table :columns="genericColumns" :rows="[]" empty="No dishes match these filters" />
      </Card>
    </Variant>
  </Story>
</template>
