<script setup>
import CostByModel from "../src/components/CostByModel.vue"
import Card from "../src/components/Card.vue"

const usage = [
  { model: "gpt-5.5", inputTokens: 4200000, outputTokens: 820000 },
  { model: "claude-sonnet-4-6", inputTokens: 1100000, outputTokens: 300000 },
  { model: "gemini-2.5-flash-lite", inputTokens: 8000000, outputTokens: 2000000 },
  { model: "claude-haiku-4-5-20251001", inputTokens: 2400000, outputTokens: 600000 },
]

const single = [
  { model: "gpt-5.5", inputTokens: 6400000, outputTokens: 1300000 },
]
</script>

<template>
  <Story title="CostByModel">
    <Variant title="Usage by model">
      <Card padded style="max-width: 480px;">
        <CostByModel :usage="usage" />
      </Card>
    </Variant>

    <Variant title="Single model">
      <Card padded style="max-width: 480px;">
        <CostByModel :usage="single" />
      </Card>
    </Variant>
  </Story>
</template>
