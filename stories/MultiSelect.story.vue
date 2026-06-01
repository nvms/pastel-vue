<script setup>
import { ref } from "vue"
import MultiSelect from "../src/components/MultiSelect.vue"
import Field from "../src/components/Field.vue"
import Badge from "../src/components/Badge.vue"
import Button from "../src/components/Button.vue"

const tags = ref(["pending", "active"])
const venues = ref([])
const colorPicked = ref(["lavender"])

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "failed", label: "Failed" },
]

const venueOptions = [
  { value: "cherry-creek", label: "Cherry Creek" },
  { value: "union-station", label: "Union Station" },
  { value: "highlands", label: "Highlands" },
  { value: "pearl-district", label: "Pearl District" },
  { value: "rino", label: "RiNo" },
  { value: "lodo", label: "LoDo" },
  { value: "wash-park", label: "Wash Park" },
  { value: "capitol-hill", label: "Capitol Hill" },
  { value: "berkeley", label: "Berkeley" },
  { value: "sloans-lake", label: "Sloan's Lake" },
]

const colorOptions = [
  { value: "lavender", label: "Lavender", hex: "#bdbbff" },
  { value: "pink", label: "Pink", hex: "#ffd6f5" },
  { value: "blue", label: "Blue", hex: "#d6e1ff" },
  { value: "peach", label: "Peach", hex: "#ffd6a8" },
  { value: "midnight", label: "Midnight", hex: "#010120" },
]
</script>

<template>
  <Story title="MultiSelect">
    <Variant title="Basic">
      <div style="max-width: 320px;">
        <Field label="Status">
          <MultiSelect v-model="tags" :options="statusOptions" placeholder="Any status" />
        </Field>
      </div>
    </Variant>

    <Variant title="Searchable">
      <div style="max-width: 320px;">
        <Field label="Venues" hint="Pick one or more venues">
          <MultiSelect
            v-model="venues"
            :options="venueOptions"
            placeholder="All venues"
            searchable
            search-placeholder="Search venues..."
          />
        </Field>
      </div>
    </Variant>

    <Variant title="Render prop (scoped slot)">
      <div style="max-width: 320px;">
        <Field label="Brand color">
          <MultiSelect
            v-model="colorPicked"
            :options="colorOptions"
            placeholder="Pick colors"
            searchable
          >
            <template #option="{ option }">
              <span style="display: inline-flex; align-items: center; gap: 10px;">
                <span :style="{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '3px', background: option.hex, border: '1px solid var(--ink-08)' }" />
                <span>{{ option.label }}</span>
                <code style="font-family: var(--mono); font-size: 11px; color: var(--ink-40); margin-left: 8px;">{{ option.hex }}</code>
              </span>
            </template>
            <template #footer="{ close }">
              <div style="display: flex; justify-content: flex-end;">
                <Button size="sm" variant="primary" @click="close">Done</Button>
              </div>
            </template>
          </MultiSelect>
        </Field>
      </div>
    </Variant>

    <Variant title="Count-only trigger">
      <div style="max-width: 320px;">
        <MultiSelect
          v-model="venues"
          :options="venueOptions"
          placeholder="All venues"
          count-only
          searchable
        />
      </div>
    </Variant>
  </Story>
</template>
