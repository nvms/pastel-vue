<script setup>
import CostEstimator from "../src/components/CostEstimator.vue"
import Card from "../src/components/Card.vue"
</script>

<template>
  <Story title="CostEstimator">
    <Variant title="Estimate monthly cost">
      <Card padded style="max-width: 420px;">
        <CostEstimator />
      </Card>
      <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
        Pick a model and drag the sliders - nothing to type.
      </p>
    </Variant>
  </Story>
</template>
