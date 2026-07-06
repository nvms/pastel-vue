<script setup>
import { ref } from "vue"
import Drawer from "../src/components/Drawer.vue"
import Button from "../src/components/Button.vue"
import Input from "../src/components/Input.vue"
import Textarea from "../src/components/Textarea.vue"
import Field from "../src/components/Field.vue"
import KeyValue from "../src/components/KeyValue.vue"
import Badge from "../src/components/Badge.vue"
import Combobox from "../src/components/Combobox.vue"

const right = ref(false)
const left = ref(false)
const bottom = ref(false)
const nested = ref(false)
const cuisine = ref(null)
const cuisines = ["Provencal", "Sichuan", "Oaxacan", "Levantine", "Basque", "Keralan"]
</script>

<template>
  <Story title="Drawer">
    <Variant title="Right (detail drawer)">
      <Button variant="primary" @click="right = true">Open recipe 2026-RCP-2401</Button>
      <Drawer v-model="right" side="right" size="md" eyebrow="Recipe detail" title="2026-RCP-2401">
        <KeyValue :items="[
          { label: 'Owner', value: 'Aiyana Khan' },
          { label: 'Venue', value: 'West Kitchen, Denver' },
          { label: 'Approved', value: 'May 14, 2026' },
          { label: 'Confidence', value: '0.92' },
        ]">
          <template #value="{ item }">
            <Badge v-if="item.label === 'Confidence'" variant="active" dot>{{ item.value }}</Badge>
            <span v-else>{{ item.value }}</span>
          </template>
        </KeyValue>

        <p style="margin-top: 16px; color: var(--ink-60); font-size: 14px; line-height: 1.5;">
          The cost sheet was not confirmed within the 48-hour window. Workflow proceeded to publish to the menu.
        </p>

        <template #footer="{ close }">
          <Button variant="outline" @click="close">Cancel</Button>
          <Button variant="primary" @click="close">Open in new tab</Button>
        </template>
      </Drawer>
    </Variant>

    <Variant title="Left (filters)">
      <Button @click="left = true">Open filters</Button>
      <Drawer v-model="left" side="left" size="sm" title="Filters">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <Field label="Search"><Input placeholder="Recipe ID, owner..." /></Field>
          <Field label="Status"><Input placeholder="Any status" /></Field>
        </div>
        <template #footer="{ close }">
          <Button variant="outline" @click="close">Clear</Button>
          <Button variant="primary" @click="close">Apply</Button>
        </template>
      </Drawer>
    </Variant>

    <Variant title="With popover content">
      <Button @click="nested = true">Tag a cuisine</Button>
      <Drawer v-model="nested" side="right" size="sm" title="Tag a cuisine">
        <Field label="Cuisine">
          <Combobox v-model="cuisine" :options="cuisines" placeholder="Pick a cuisine..." />
        </Field>
        <template #footer="{ close }">
          <Button variant="outline" @click="close">Cancel</Button>
          <Button variant="primary" @click="close">Save</Button>
        </template>
      </Drawer>
    </Variant>

    <Variant title="Bottom (quick action)">
      <Button @click="bottom = true">Add a note</Button>
      <Drawer v-model="bottom" side="bottom" size="sm" title="Add a note">
        <Textarea placeholder="Internal note for the recipe file..." :rows="4" />
        <template #footer="{ close }">
          <Button variant="outline" @click="close">Cancel</Button>
          <Button variant="primary" @click="close">Save note</Button>
        </template>
      </Drawer>
    </Variant>
  </Story>
</template>
