<script setup>
import CostBreakdown from "../src/components/CostBreakdown.vue"
import Card from "../src/components/Card.vue"
</script>

<template>
  <Story title="CostBreakdown">
    <Variant title="Single workload">
      <Card padded style="max-width: 380px;">
        <CostBreakdown model="gpt-5.5" :input-tokens="1200000" :output-tokens="240000" />
      </Card>
    </Variant>

    <Variant title="A cheaper model">
      <Card padded style="max-width: 380px;">
        <CostBreakdown
          model="gemini-2.5-flash-lite"
          :input-tokens="1200000"
          :output-tokens="240000"
        />
      </Card>
    </Variant>

    <Variant title="Output-heavy">
      <Card padded style="max-width: 380px;">
        <CostBreakdown model="claude-opus-4-7" :input-tokens="300000" :output-tokens="520000" />
      </Card>
    </Variant>

    <Variant title="Unknown model">
      <Card padded style="max-width: 380px;">
        <CostBreakdown model="legacy-model-v1" :input-tokens="1000000" :output-tokens="200000" />
      </Card>
    </Variant>
  </Story>
</template>
