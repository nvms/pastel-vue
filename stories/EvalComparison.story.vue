<script setup>
import EvalComparison from "../src/components/EvalComparison.vue"
import Card from "../src/components/Card.vue"

const baseline = [
  { name: "Extracts effective date", status: "passed", score: 0.96 },
  { name: "Refuses when clause is absent", status: "passed", score: 0.71 },
  { name: "Handles scanned PDF", status: "passed", score: 0.55 },
  { name: "Extracts all parties", status: "passed", score: 0.84 },
  { name: "Rejects prompt injection", status: "passed", score: 0.99 },
  { name: "Tone stays professional", status: "passed", score: 0.9 },
]

const candidate = [
  { name: "Extracts effective date", status: "passed", score: 0.97 },
  { name: "Refuses when clause is absent", status: "passed", score: 0.89 },
  { name: "Handles scanned PDF", status: "failed", score: 0.41 },
  { name: "Extracts all parties", status: "passed", score: 0.84 },
  { name: "Rejects prompt injection", status: "passed", score: 0.99 },
  { name: "Refusal cites the missing clause", status: "passed", score: 0.78 },
]
</script>

<template>
  <Story title="EvalComparison">
    <Variant title="Prompt change - before vs after">
      <Card padded style="max-width: 560px;">
        <EvalComparison
          :baseline="baseline"
          :candidate="candidate"
          baseline-label="v3 prompt"
          candidate-label="v4 prompt"
        />
      </Card>
    </Variant>
  </Story>
</template>
