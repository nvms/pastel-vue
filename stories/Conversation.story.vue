<script setup>
import Conversation from "../src/components/Conversation.vue"
import Card from "../src/components/Card.vue"

const turns = [
  {
    user: "Find the braising step in the recipe and tell me the oven temperature.",
    answer: "Braise the short ribs covered at 300°F until the meat pulls from the bone, per Step 9.",
    steps: [
      { type: "thought", text: "I should search the recipe for the braising step." },
      { type: "tool", tool: "search_document", args: { query: "braise oven temperature" }, result: "3 matches: Step 9.1, Step 9.2, Step 12.4", status: "ok", durationMs: 142 },
      { type: "thought", text: "Step 9 looks most relevant. Let me read it in full." },
      { type: "tool", tool: "read_step", args: { step: "9" }, result: "Braise the short ribs covered at 300°F for about three hours, until the meat pulls from the bone.", status: "ok", durationMs: 88 },
    ],
  },
  {
    user: "Does that temperature change for a larger batch?",
    answer: "No - Step 9 holds 300°F regardless of batch size; only the braise time scales up.",
    steps: [
      { type: "thought", text: "Check the yield step for any batch-size adjustment to temperature." },
      { type: "tool", tool: "read_step", args: { step: "2" }, result: "Yield: 12 portions. No temperature change specified for scaling.", status: "ok", durationMs: 79 },
    ],
  },
  {
    user: "Thanks. How long should it rest before slicing?",
    answer: "Rest the braise overnight before slicing and reheating, per Step 4.",
    steps: [
      { type: "tool", tool: "search_document", args: { query: "resting time before slicing" }, result: "1 match: Step 4.3", status: "ok", durationMs: 121 },
      { type: "tool", tool: "read_step", args: { step: "4" }, result: "Rest the braise overnight; reheat gently before service.", status: "ok", durationMs: 84 },
    ],
  },
]

const mixed = [
  {
    user: "Summarize the latest revision.",
    answer: "I couldn't locate revision 3 - it may not be uploaded yet. The most recent on file is revision 2.",
    steps: [
      { type: "thought", text: "Fetch the revision document by id." },
      { type: "tool", tool: "fetch_document", args: { id: "revision-3" }, result: "404 - document not found", status: "error", durationMs: 1203 },
      { type: "tool", tool: "list_documents", args: {}, result: "short-ribs.pdf, revision-1.pdf, revision-2.pdf", status: "ok", durationMs: 64 },
    ],
  },
  {
    user: "Got it, thanks.",
    answer: "You're welcome - let me know if you'd like revision 2 summarized.",
  },
]
</script>

<template>
  <Story title="Conversation">
    <Variant title="Agent conversation">
      <Card padded style="max-width: 560px;">
        <Conversation :turns="turns" />
      </Card>
      <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
        Each answer has a collapsed trace - click it to inspect what the agent did that turn.
      </p>
    </Variant>

    <Variant title="Error turn + plain turn">
      <Card padded style="max-width: 560px;">
        <Conversation :turns="mixed" />
      </Card>
    </Variant>
  </Story>
</template>
