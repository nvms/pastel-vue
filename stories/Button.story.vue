<script setup>
import { ref } from "vue"
import Button from "../src/components/Button.vue"

const busy = ref(false)
const busyLabel = ref(false)

// simulate an async action that resolves almost instantly
const fastBusy = ref(false)
const instantBusy = ref(false)
async function runFast(flag) {
  flag.value = true
  await new Promise((r) => setTimeout(r, 50))
  flag.value = false
}
</script>

<template>
  <Story title="Button">
    <Variant title="Variants">
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div style="display: flex; gap: 8px; align-items: center;">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </Variant>

    <Variant title="States">
      <div style="display: flex; gap: 8px;">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button variant="danger" disabled>Danger disabled</Button>
      </div>
    </Variant>

    <Variant title="Hint chip">
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <Button variant="primary" hint="⌘S">Save</Button>
        <Button variant="outline" hint="Esc">Cancel</Button>
        <Button variant="danger" hint="+ Notes">Send back for revision</Button>
        <Button variant="danger" hint="+ Reason">Reject - do not file</Button>
      </div>
    </Variant>

    <Variant title="Loading">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Button variant="outline" @click="busy = !busy">
          {{ busy ? "Turn off" : "Turn on" }} loading
        </Button>
        <Button variant="primary" :loading="busy">Save changes</Button>
      </div>
    </Variant>

    <Variant title="Loading label">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Button variant="outline" @click="busyLabel = !busyLabel">
          {{ busyLabel ? "Turn off" : "Turn on" }} loading
        </Button>
        <Button variant="primary" :loading="busyLabel" loading-label="Publishing your workflow…">
          Publish
        </Button>
      </div>
    </Variant>

    <Variant title="Fast async (min hold)">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <Button variant="primary" :loading="fastBusy" loading-label="Saving…" @click="runFast(fastBusy)">
            Save
          </Button>
          <span style="font-size: 13px; color: var(--ink-60);">
            50ms action, default 400ms hold - the spinner stays visible instead of flashing
          </span>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <Button variant="outline" :loading="instantBusy" :min-loading-ms="0" loading-label="Saving…" @click="runFast(instantBusy)">
            Save
          </Button>
          <span style="font-size: 13px; color: var(--ink-60);">
            same 50ms action, min-loading-ms=0 - the old jitter, for comparison
          </span>
        </div>
      </div>
    </Variant>

    <Variant title="Icon button (square)">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <Button icon="lucide:settings" variant="primary" />
          <Button icon="lucide:pencil" variant="outline" />
          <Button icon="lucide:share-2" variant="subtle" />
          <Button icon="lucide:trash-2" variant="danger" />
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <Button icon="lucide:plus" size="sm" />
          <Button icon="lucide:plus" size="md" />
          <Button icon="lucide:plus" size="lg" />
        </div>
        <p style="font-size: 13px; color: var(--ink-60);">
          Each square icon button matches the height of a regular button at the same size.
        </p>
      </div>
    </Variant>

    <Variant title="Icon + label">
      <div style="display: flex; gap: 8px; align-items: center;">
        <Button icon="lucide:plus" variant="primary">New recipe</Button>
        <Button icon="lucide:download" variant="outline">Export</Button>
        <Button icon="lucide:trash-2" variant="danger">Delete</Button>
      </div>
    </Variant>
  </Story>
</template>
