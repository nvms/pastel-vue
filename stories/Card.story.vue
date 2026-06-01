<script setup>
import Card from "../src/components/Card.vue"
import SectionLabel from "../src/components/SectionLabel.vue"
import Stat from "../src/components/Stat.vue"
</script>

<template>
  <Story title="Card">
    <Variant title="Basic">
      <Card padded style="max-width: 360px;">
        <SectionLabel>Project</SectionLabel>
        <h3 style="margin: 8px 0 6px;">Inference API</h3>
        <p style="font-size: 14px; color: var(--ink-60); margin: 0;">A streaming endpoint with response shaping and retries.</p>
      </Card>
    </Variant>
    <Variant title="Elevated, interactive">
      <Card padded elevated interactive style="max-width: 360px;">
        <Stat label="Throughput" value="1,420" caption="Requests / sec" size="md" />
      </Card>
    </Variant>
  </Story>
</template>
