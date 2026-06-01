<script setup>
import { ref } from "vue"
import Toolbar from "../src/components/Toolbar.vue"
import SearchInput from "../src/components/SearchInput.vue"
import SegmentedControl from "../src/components/SegmentedControl.vue"
import FilterChip from "../src/components/FilterChip.vue"
import MultiSelect from "../src/components/MultiSelect.vue"
import DateRangePicker from "../src/components/DateRangePicker.vue"
import Button from "../src/components/Button.vue"
import Badge from "../src/components/Badge.vue"
import Pagination from "../src/components/Pagination.vue"
import Table from "../src/components/Table.vue"

const q = ref("")
const view = ref("table")
const statusFilter = ref(["active"])
const range = ref({ start: new Date(2026, 4, 1), end: new Date(2026, 4, 31) })
const page = ref(1)
const pageSize = ref(25)

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "failed", label: "Failed" },
]

const columns = [
  { key: "recipe", label: "Recipe" },
  { key: "owner", label: "Owner" },
  { key: "venue", label: "Venue" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated", align: "right" },
]
const rows = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  recipe: `2026-RCP-${String(2400 + i).padStart(4, "0")}`,
  owner: ["A. Khan", "M. Reyes", "R. Watanabe", "J. Park"][i % 4],
  venue: ["Cherry Creek", "Union Station", "Highlands", "Pearl District"][i % 4],
  status: ["active", "paused", "active", "failed"][i % 4],
  updated: `2026-05-${String(i + 1).padStart(2, "0")}`,
}))
</script>

<template>
  <Story title="Toolbar">
    <Variant title="Data-table toolbar (two rows)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;">
        <Toolbar bordered>
          <template #leading>
            <SearchInput v-model="q" placeholder="Search recipes" shortcut="⌘K" />
          </template>

          <template #trailing>
            <SegmentedControl
              v-model="view"
              :options="[
                { value: 'table', label: 'Table' },
                { value: 'cards', label: 'Cards' },
                { value: 'kanban', label: 'Kanban' },
              ]"
              size="sm"
            />
            <Button variant="outline" size="sm">Export</Button>
            <Button variant="primary" size="sm">New recipe</Button>
          </template>

          <template #filters>
            <MultiSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Any status"
              searchable
            />
            <DateRangePicker v-model="range" />
            <FilterChip label="Mine only" :active="true" />
            <FilterChip label="Unsigned" />
            <FilterChip label="High confidence" value="≥ 0.85" removable />
          </template>
        </Toolbar>

        <Table :columns="columns" :rows="rows" compact>
          <template #cell-status="{ value }">
            <Badge :variant="value">{{ value }}</Badge>
          </template>
        </Table>

        <Toolbar bordered size="sm">
          <Pagination
            :page="page"
            :page-size="pageSize"
            :total="248"
            @update:page="p => page = p"
            @update:pageSize="s => pageSize = s"
          />
        </Toolbar>
      </div>
    </Variant>

    <Variant title="Single row, sticky">
      <Toolbar bordered sticky>
        <template #leading><strong style="font-size: 15px;">Recipes</strong></template>
        <Badge variant="active">3 live</Badge>
        <template #trailing>
          <Button variant="outline" size="sm">Filters</Button>
          <Button variant="primary" size="sm">New</Button>
        </template>
      </Toolbar>
    </Variant>

    <Variant title="Two rows with divider">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px;">
        <Toolbar divider>
          <template #leading>
            <strong style="font-size: 15px;">Workflows</strong>
            <Badge>v2.1</Badge>
          </template>
          <template #trailing>
            <Button variant="outline" size="sm">History</Button>
            <Button variant="primary" size="sm">Save draft</Button>
          </template>
          <template #filters>
            <SearchInput v-model="q" placeholder="Filter steps" size="sm" />
            <FilterChip label="AI steps" :active="true" />
            <FilterChip label="Human" />
            <FilterChip label="Tool" />
          </template>
        </Toolbar>
      </div>
    </Variant>
  </Story>
</template>
