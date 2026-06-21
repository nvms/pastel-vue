<script setup>
import { ref } from "vue"
import ChatScroller from "../src/components/ChatScroller.vue"
import ChatMessage from "../src/components/ChatMessage.vue"
import ChatComposer from "../src/components/ChatComposer.vue"
import ToolCall from "../src/components/ToolCall.vue"
import Button from "../src/components/Button.vue"

const LINES = [
  "Pull the first duck tray at 5:50 and let it rest.",
  "Shallots are below par - I added them to the order draft.",
  "Two eight-tops at 7:30, so fire the second wave then.",
  "Food cost is at 31.4%, two points over target.",
  "The quince is ripe; swap it into the duck garnish tonight.",
  "Walk-in temp logged at 37F, within range.",
  "Brown butter financiers need 11 minutes at 350.",
  "Consomme raft formed cleanly, ladling now.",
]

const items = ref(
  Array.from({ length: 8 }, (_, i) => ({
    kind: "msg",
    role: i % 2 ? "user" : "assistant",
    name: i % 2 ? "You" : "Sous",
    text: LINES[i % LINES.length],
  })),
)

const draft = ref("")
let n = 0

// stream a long assistant message in, to test pinning during active streaming
function streamLong() {
  const idx = items.value.length
  items.value.push({ kind: "msg", role: "assistant", name: "Sous", text: "", streaming: true })
  const full = LINES.concat(LINES).join(" ")
  let i = 0
  const t = setInterval(() => {
    i += 3
    // reassign the array slot so the change is reactive
    items.value[idx] = { ...items.value[idx], text: full.slice(0, i) }
    if (i >= full.length) clearInterval(t)
  }, 40)
}

function addBurst() {
  for (let k = 0; k < 3; k++) {
    n++
    items.value.push({ kind: "msg", role: "assistant", name: "Sous", text: `Burst message ${n}: ${LINES[n % LINES.length]}` })
  }
}

function send(value) {
  items.value.push({ kind: "msg", role: "user", name: "You", text: value })
  draft.value = ""
}
</script>

<template>
  <Story title="ChatScroller">
    <!-- the main event: a bounded, streaming chat you can fight the scroll on -->
    <Variant title="Pinned streaming">
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 580px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <Button size="sm" variant="outline" @click="streamLong">Stream a long reply</Button>
          <Button size="sm" variant="outline" @click="addBurst">Add 3 messages</Button>
        </div>

        <div style="height: 380px; border: 1px solid var(--ink-08); border-radius: 10px; padding: 14px;">
          <ChatScroller>
            <template v-for="(it, i) in items" :key="i">
              <ChatMessage
                v-if="it.kind === 'msg'"
                :role="it.role"
                :name="it.name"
                :text="it.text"
                :streaming="it.streaming"
              />
            </template>
            <ToolCall
              name="inventory.scan"
              icon="lucide:boxes"
              :input="{ location: 'walk-in', categories: ['dairy', 'produce'] }"
              :output="{ belowPar: ['cream', 'shallots', 'lemons'], checked: 42, ranAt: '17:40' }"
              :default-open="false"
            />
          </ChatScroller>
        </div>

        <ChatComposer v-model="draft" placeholder="Message Sous…" @submit="send" />
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          Start a stream, then scroll up - it stops following and a jump button appears. Scroll
          back to the bottom and it re-pins. Expanding the tool call while pinned keeps you pinned.
        </p>
      </div>
    </Variant>

    <!-- custom overlay via the scoped slot instead of the built-in button -->
    <Variant title="Custom jump overlay">
      <div style="height: 340px; max-width: 580px; border: 1px solid var(--ink-08); border-radius: 10px; padding: 14px;">
        <ChatScroller :show-jump-button="false">
          <ChatMessage
            v-for="(it, i) in items"
            :key="i"
            :role="it.role"
            :name="it.name"
            :text="it.text"
          />
          <template #overlay="{ isAtBottom, scrollToBottom }">
            <Button
              v-if="!isAtBottom"
              size="sm"
              variant="primary"
              icon="lucide:arrow-down"
              style="position: absolute; right: 12px; bottom: 12px;"
              @click="scrollToBottom()"
            >
              Latest
            </Button>
          </template>
        </ChatScroller>
      </div>
    </Variant>
  </Story>
</template>
