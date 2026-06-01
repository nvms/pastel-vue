<script setup>
import Callout from "../src/components/Callout.vue"
import Button from "../src/components/Button.vue"
</script>

<template>
  <Story title="Callout">
    <Variant title="All variants">
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 720px;">
        <Callout variant="info" eyebrow="Edit mode" title="Draft on top of v2.1">
          Talk to the agent on the right to make structural changes. Nothing goes on the menu until the head chef signs off.
        </Callout>
        <Callout variant="success" eyebrow="Promoted to active">
          Cherry Creek is live. Routing you to the venue.
        </Callout>
        <Callout variant="warning" eyebrow="Action required" title="Review extracted standards">
          The ingestion pipeline pulled 14 food-safety standard changes. The head chef should sign off before they go live.
        </Callout>
        <Callout variant="danger" eyebrow="Blocked">
          The prep ticket was not confirmed within the 48-hour window. Workflow paused awaiting human review.
        </Callout>
        <Callout variant="neutral" eyebrow="Tip">
          Click any node in the graph to inspect its inputs and outputs.
        </Callout>
      </div>
    </Variant>

    <Variant title="With actions">
      <Callout variant="info" eyebrow="Edit mode" title="Draft on top of v2.1" style="max-width: 720px;">
        Talk to the agent on the right to make structural changes.
        <template #actions>
          <Button size="sm" variant="outline">Discard</Button>
          <Button size="sm" variant="primary">Save draft</Button>
        </template>
      </Callout>
    </Variant>

    <Variant title="Dismissible">
      <Callout
        variant="success"
        eyebrow="Saved"
        dismissible
        style="max-width: 480px;"
      >
        Your recipe changes were saved as a draft.
      </Callout>
    </Variant>
  </Story>
</template>
