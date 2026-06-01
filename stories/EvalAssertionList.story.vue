<script setup>
import { ref, computed } from "vue"
import EvalAssertionList from "../src/components/EvalAssertionList.vue"
import CodeBlock from "../src/components/CodeBlock.vue"
import Card from "../src/components/Card.vue"

const checks = ref([
  { type: "contains", value: "termination", caseSensitive: false },
  { type: "regex", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "" },
  {
    type: "llm-judge",
    criteria: "The answer cites the correct section number and uses formal tone.",
    model: "claude-sonnet-4-6",
    threshold: 0.7,
  },
  { type: "similarity", reference: "Either party may terminate with 60 days written notice.", threshold: 0.82 },
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
