<script setup>
import { ref } from "vue"
import Annotator from "../src/components/Annotator.vue"
import Card from "../src/components/Card.vue"

const docText = `BRAISED SHORT RIBS

Sear the seasoned ribs on all sides over high heat for about ten (10) minutes, until deeply browned on every face.

Add the mirepoix and braising liquid, then cover the pot and braise at 300°F. Plan on about three (3) hours, until the meat pulls from the bone.

The braise should rest overnight before slicing and reheating for service.`

const at = (phrase) => {
  const start = docText.indexOf(phrase)
  return { start, end: start + phrase.length }
}
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString()

const seed = [
  {
    id: "a1",
    ...at("ten (10) minutes"),
    resolved: false,
    comments: [
      { id: "c1", author: "Dana Reyes", body: "Is 10 minutes enough to brown all four faces evenly?", time: hoursAgo(26) },
      { id: "c2", author: "Marcus Lee", body: "Pastry wants closer to 14. Worth a test.", time: hoursAgo(20) },
      { id: "c3", author: "You", body: "Agreed - I'll bump it to 14.", time: hoursAgo(3) },
    ],
  },
  {
    id: "a2",
    ...at("braising liquid"),
    resolved: false,
    comments: [
      { id: "c4", author: "Dana Reyes", body: "Should we spec red wine or stock here?", time: hoursAgo(5) },
    ],
  },
  {
    id: "a3",
    ...at("three (3) hours"),
    resolved: true,
    comments: [
      { id: "c5", author: "Marcus Lee", body: "Confirm this matches our standard braise time.", time: hoursAgo(50) },
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
