<script setup>
import { ref } from "vue"
import Collapsible from "../src/components/Collapsible.vue"
import Field from "../src/components/Field.vue"
import Input from "../src/components/Input.vue"
import Switch from "../src/components/Switch.vue"
import Select from "../src/components/Select.vue"

const open = ref(false)
const notify = ref(true)
const visibility = ref("private")
</script>

<template>
  <Story title="Collapsible">
    <Variant title="Bordered">
      <div style="max-width: 520px;">
        <Collapsible label="Advanced options" :default-open="false">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <Field label="Webhook URL">
              <Input placeholder="https://example.com/hook" />
            </Field>
            <Field label="Notify on completion">
              <Switch v-model="notify" />
            </Field>
          </div>
        </Collapsible>
      </div>
    </Variant>

    <Variant title="With eyebrow">
      <div style="max-width: 520px;">
        <Collapsible eyebrow="Section 03" label="Visibility and access" default-open>
          <Field label="Who can see this">
            <Select
              v-model="visibility"
              :options="[
                { value: 'private', label: 'Only me' },
                { value: 'team',    label: 'My team' },
                { value: 'public',  label: 'Anyone with the link' },
              ]"
            />
          </Field>
        </Collapsible>
      </div>
    </Variant>

    <Variant title="Flush">
      <div style="max-width: 520px;">
        <Collapsible variant="flush" label="What counts as a billable token?">
          Input and output tokens are both billed. Cached reads bill at 10% of
          the input rate. System prompts and tool definitions count against
          input tokens on every request unless cached.
        </Collapsible>
      </div>
    </Variant>

    <Variant title="Ghost (inline)">
      <div style="max-width: 520px;">
        <p style="margin: 0 0 8px; color: var(--ink); font-size: 14px;">
          The job ran in 1.2s using Claude Opus 4.7.
        </p>
        <Collapsible variant="ghost" size="sm" label="Show timing details">
          <pre style="margin: 0; font-family: var(--mono); font-size: 12px; color: var(--ink-60);">
queue:    18ms
prefill: 412ms
decode:  734ms
post:     36ms</pre>
        </Collapsible>
      </div>
    </Variant>

    <Variant title="Controlled">
      <div style="max-width: 520px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 8px;">
          <button @click="open = !open" style="padding: 6px 10px;">
            {{ open ? "Close" : "Open" }} from outside
          </button>
        </div>
        <Collapsible v-model:open="open" label="Controlled disclosure">
          The parent owns the open state. Useful when another control - like a
          checkbox or a "show all" button - should drive the disclosure.
        </Collapsible>
      </div>
    </Variant>

    <Variant title="Disabled">
      <div style="max-width: 520px;">
        <Collapsible label="Locked section" disabled>
          You should never see this content.
        </Collapsible>
      </div>
    </Variant>
  </Story>
</template>
