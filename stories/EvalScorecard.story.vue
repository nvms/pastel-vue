<script setup>
import EvalScorecard from "../src/components/EvalScorecard.vue"
import Card from "../src/components/Card.vue"

const results = [
  { status: "passed", score: 0.96 },
  { status: "passed", score: 0.88 },
  { status: "passed", score: 0.91 },
  { status: "passed", score: 0.84 },
  { status: "passed", score: 0.99 },
  { status: "passed", score: 0.79 },
  { status: "passed", score: 0.93 },
  { status: "passed", score: 0.87 },
  { status: "passed", score: 0.9 },
  { status: "passed", score: 0.82 },
  { status: "passed", score: 0.95 },
  { status: "passed", score: 0.86 },
  { status: "failed", score: 0.41 },
  { status: "failed", score: 0.62 },
  { status: "error" },
]

const running = [
  { status: "passed", score: 0.92 },
  { status: "passed", score: 0.88 },
  { status: "failed", score: 0.5 },
  { status: "running" },
  { status: "running" },
  { status: "pending" },
  { status: "pending" },
  { status: "pending" },
]
</script>

<template>
  <Story title="EvalScorecard">
    <Variant title="Completed run">
      <Card padded style="max-width: 460px;">
        <EvalScorecard name="Recipe extraction" :results="results" />
      </Card>
    </Variant>

    <Variant title="Run in progress">
      <Card padded style="max-width: 460px;">
        <EvalScorecard name="Nightly regression" :results="running" />
      </Card>
    </Variant>
  </Story>
</template>
