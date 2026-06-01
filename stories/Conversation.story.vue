<script setup>
import Conversation from "../src/components/Conversation.vue"
import Card from "../src/components/Card.vue"

const turns = [
  {
    user: "Find the termination clause in the MSA and tell me the notice period.",
    answer: "Either party can terminate the MSA with 60 days written notice, per Section 9.",
    steps: [
      { type: "thought", text: "I should search the document for terms related to termination." },
      { type: "tool", tool: "search_document", args: { query: "termination notice" }, result: "3 matches: §9.1, §9.2, §12.4", status: "ok", durationMs: 142 },
      { type: "thought", text: "Section 9 looks most relevant. Let me read it in full." },
      { type: "tool", tool: "read_section", args: { section: "9" }, result: "Either party may terminate this Agreement with sixty (60) days written notice.", status: "ok", durationMs: 88 },
    ],
  },
  {
    user: "Does that notice period apply during the first year?",
    answer: "Yes - Section 9 places no restriction on the first year, so the 60-day notice applies for the full term.",
    steps: [
      { type: "thought", text: "Check the term clause for any first-year lock-in or carve-out." },
      { type: "tool", tool: "read_section", args: { section: "2" }, result: "Term: 24 months from the Effective Date. No lock-in specified.", status: "ok", durationMs: 79 },
    ],
  },
  {
    user: "Thanks. What's the late-payment interest rate?",
    answer: "Late payments accrue interest at 1.5% per month, per Section 4.",
    steps: [
      { type: "tool", tool: "search_document", args: { query: "late payment interest" }, result: "1 match: §4.3", status: "ok", durationMs: 121 },
      { type: "tool", tool: "read_section", args: { section: "4" }, result: "Late payments accrue interest at 1.5% per month until paid in full.", status: "ok", durationMs: 84 },
    ],
  },
]

const mixed = [
  {
    user: "Summarize the latest amendment.",
    answer: "I couldn't locate amendment 3 - it may not be uploaded yet. The most recent on file is amendment 2.",
    steps: [
      { type: "thought", text: "Fetch the amendment document by id." },
      { type: "tool", tool: "fetch_document", args: { id: "amendment-3" }, result: "404 - document not found", status: "error", durationMs: 1203 },
      { type: "tool", tool: "list_documents", args: {}, result: "msa.pdf, amendment-1.pdf, amendment-2.pdf", status: "ok", durationMs: 64 },
    ],
  },
  {
    user: "Got it, thanks.",
    answer: "You're welcome - let me know if you'd like amendment 2 summarized.",
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
