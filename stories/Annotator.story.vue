<script setup>
import { ref } from "vue"
import Annotator from "../src/components/Annotator.vue"
import Card from "../src/components/Card.vue"

const docText = `SERVICES AGREEMENT

The Provider shall deliver the services described in Schedule A within thirty (30) business days of the Effective Date. Any delay beyond this period entitles the Client to a pro-rata refund.

The Client agrees to provide all necessary materials and access. Fees are due within fifteen (15) days of invoice. Late payments accrue interest at 1.5% per month.

This Agreement may be terminated by either party with sixty (60) days written notice.`

const at = (phrase) => {
  const start = docText.indexOf(phrase)
  return { start, end: start + phrase.length }
}
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString()

const seed = [
  {
    id: "a1",
    ...at("thirty (30) business days"),
    resolved: false,
    comments: [
      { id: "c1", author: "Dana Reyes", body: "Is 30 days realistic given the Schedule A scope?", time: hoursAgo(26) },
      { id: "c2", author: "Marcus Lee", body: "Procurement wants 45. Worth pushing back.", time: hoursAgo(20) },
      { id: "c3", author: "You", body: "Agreed - I'll redline it to 45.", time: hoursAgo(3) },
    ],
  },
  {
    id: "a2",
    ...at("pro-rata refund"),
    resolved: false,
    comments: [
      { id: "c4", author: "Dana Reyes", body: "Should we cap the refund amount?", time: hoursAgo(5) },
    ],
  },
  {
    id: "a3",
    ...at("1.5% per month"),
    resolved: true,
    comments: [
      { id: "c5", author: "Marcus Lee", body: "Confirm this matches our standard terms.", time: hoursAgo(50) },
      { id: "c6", author: "You", body: "Confirmed - standard.", time: hoursAgo(48) },
    ],
  },
]

const clone = (list) => list.map((a) => ({ ...a, comments: a.comments.map((c) => ({ ...c })) }))

const editable = ref(clone(seed))
</script>

<template>
  <Story title="Annotator">
    <Variant title="Editable">
      <div style="max-width: 600px; display: flex; flex-direction: column; gap: 10px;">
        <Card padded>
          <Annotator v-model="editable" :text="docText" current-user="You" />
        </Card>
        <p style="margin: 0; font-size: 13px; color: var(--ink-60);">
          Select any text to start a comment. Click a highlight to open its thread -
          reply, resolve, or delete from there.
        </p>
      </div>
    </Variant>

    <Variant title="Read-only">
      <div style="max-width: 600px;">
        <Card padded>
          <Annotator :model-value="seed" :text="docText" readonly />
        </Card>
      </div>
    </Variant>
  </Story>
</template>
