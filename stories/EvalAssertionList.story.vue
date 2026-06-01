<script setup>
import { ref, computed } from "vue"
import EvalAssertionList from "../src/components/EvalAssertionList.vue"
import CodeBlock from "../src/components/CodeBlock.vue"
import Card from "../src/components/Card.vue"

const checks = ref([
  { type: "contains", value: "braise", caseSensitive: false },
  { type: "regex", pattern: "\\d{2,3}°F", flags: "" },
  {
    type: "llm-judge",
    criteria: "The answer cites the correct step number and stays concise.",
    model: "claude-sonnet-4-6",
    threshold: 0.7,
  },
  { type: "similarity", reference: "Braise the short ribs covered at 300°F until the meat pulls from the bone.", threshold: 0.82 },
  { type: "latency", maxMs: 5000 },
])

const empty = ref([])

const checksJson = computed(() => JSON.stringify(checks.value, null, 2))
const emptyJson = computed(() => JSON.stringify(empty.value, null, 2))
</script>

<template>
  <Story title="EvalAssertionList">
    <Variant title="Editing a real set of checks">
      <div style="max-width: 600px; display: flex; flex-direction: column; gap: 16px;">
        <Card padded>
          <EvalAssertionList v-model="checks" />
        </Card>
        <CodeBlock :code="checksJson" language="json" filename="checks.json" />
      </div>
    </Variant>

    <Variant title="Start empty">
      <div style="max-width: 600px; display: flex; flex-direction: column; gap: 16px;">
        <Card padded>
          <EvalAssertionList v-model="empty" />
        </Card>
        <CodeBlock :code="emptyJson" language="json" filename="checks.json" />
      </div>
    </Variant>
  </Story>
</template>
