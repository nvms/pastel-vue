<script setup>
import { ref } from "vue"
import Combobox from "../src/components/Combobox.vue"
import Field from "../src/components/Field.vue"

const venue = ref("cherry-creek")
const chef = ref(null)
const venueB = ref("cherry-creek")

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

const chefs = [
  { value: "c1", label: "Theodora Whitfield", station: "Cherry Creek" },
  { value: "c2", label: "Marcus Reyes", station: "Union Station" },
  { value: "c3", label: "Ife Adebayo", station: "Highlands" },
  { value: "c4", label: "Daniela Park", station: "Pearl District" },
]
</script>

<template>
  <Story title="Combobox">
    <Variant title="Searchable (default)">
      <div style="max-width: 320px;">
        <Field label="Venue">
          <Combobox v-model="venue" :options="venueOptions" placeholder="Search venues..." />
        </Field>
      </div>
    </Variant>

    <Variant title="Single select (not searchable)">
      <div style="max-width: 320px;">
        <Field label="Venue" hint="No typing - click to pick from the list">
          <Combobox
            v-model="venueB"
            :options="venueOptions"
            :searchable="false"
            placeholder="Select a venue"
          />
        </Field>
      </div>
    </Variant>

    <Variant title="Custom item render">
      <div style="max-width: 360px;">
        <Field label="Assigned chef">
          <Combobox v-model="chef" :options="chefs" placeholder="Search chefs...">
            <template #option="{ option }">
              <span style="flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                <span>{{ option.label }}</span>
                <span class="pc-mono" style="color: var(--ink-60); font-size: 10px; letter-spacing: 0.06em;">{{ option.station }}</span>
              </span>
            </template>
          </Combobox>
        </Field>
      </div>
    </Variant>
  </Story>
</template>
