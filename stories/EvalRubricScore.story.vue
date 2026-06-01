<script setup>
import EvalRubricScore from "../src/components/EvalRubricScore.vue"
import Card from "../src/components/Card.vue"

const rubric5 = [
  { label: "Accuracy", score: 4, max: 5 },
  { label: "Completeness", score: 3, max: 5 },
  { label: "Format adherence", score: 5, max: 5 },
  { label: "No hallucination", score: 5, max: 5 },
  { label: "Conciseness", score: 4, max: 5 },
]

const rubric01 = [
  { label: "Faithfulness", score: 0.92 },
  { label: "Relevance", score: 0.78 },
  { label: "Coherence", score: 0.85 },
  { label: "Safety", score: 0.99 },
]
</script>

<template>
  <Story title="EvalRubricScore">
    <Variant title="Five-point rubric">
      <Card padded style="max-width: 400px;">
        <EvalRubricScore :criteria="rubric5" />
      </Card>
    </Variant>

    <Variant title="Zero-to-one scorers">
      <Card padded style="max-width: 400px;">
        <EvalRubricScore :criteria="rubric01" />
      </Card>
    </Variant>
  </Story>
</template>
