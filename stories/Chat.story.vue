<script setup>
import { ref, nextTick } from "vue"
import ChatThread from "../src/components/ChatThread.vue"
import ChatScroller from "../src/components/ChatScroller.vue"
import ChatMessage from "../src/components/ChatMessage.vue"
import ChatComposer from "../src/components/ChatComposer.vue"
import PromptMenu from "../src/components/PromptMenu.vue"
import TypingIndicator from "../src/components/TypingIndicator.vue"
import ToolCall from "../src/components/ToolCall.vue"
import Button from "../src/components/Button.vue"

// working-chat state: a heterogeneous list of items, not just messages.
// each item carries a `kind` so a custom tool-call block can sit between turns
const items = ref([
  { kind: "msg", role: "assistant", name: "Sous", text: "Morning. Want me to pull today's prep list?" },
  { kind: "msg", role: "user", name: "You", text: "Yeah, and check what's low in the walk-in." },
  { kind: "tool", tool: "inventory.scan", input: { location: "walk-in" }, output: { belowPar: ["cream", "shallots", "lemons"], checked: 42 } },
  { kind: "msg", role: "assistant", name: "Sous", text: "Cream, shallots, and lemons are below par. I added them to the order draft." },
])
const draft = ref("")
const replying = ref(false)

function send(value) {
  items.value.push({ kind: "msg", role: "user", name: "You", text: value })
  draft.value = ""
  replying.value = true
  setTimeout(() => {
    const idx = items.value.length
    items.value.push({ kind: "msg", role: "assistant", name: "Sous", text: "", streaming: true })
    replying.value = false
    streamReply(idx, "On it. I will fold that into the prep plan and flag anything that conflicts with tonight's covers.")
  }, 1400)
}

const composerDraft = ref("")
const loadingDraft = ref("Generating the summary now…")
const busy = ref(false)

// prompt menu: selecting an item drops its text into the composer, then focuses
// the box so the user can tweak and send. nothing is sent automatically
const promptDraft = ref("")
const promptComposer = ref(null)
const PROMPTS = [
  { label: "Plan tonight's prep", text: "Walk me through the prep list for tonight's service, ordered by station.", icon: "lucide:clipboard-list" },
  { label: "Cost a dish", text: "Break down the food cost for the duck course and flag anything above target.", icon: "lucide:calculator" },
  { label: "What's low?", text: "Check the walk-in and tell me what's below par so I can build an order.", icon: "lucide:package-search" },
  { label: "Draft a special", text: "Suggest a special using what's about to turn, with a rough plate cost.", icon: "lucide:sparkles" },
]
function insertPrompt(text) {
  promptDraft.value = text
  nextTick(() => promptComposer.value?.focus())
}

// an agent status report with the structure LLM output actually has: bold
// section labels, inline-code state names, a numbered list of findings
const AUDIT = `Audit complete.

**Station state:** The brioche is in a proofing hold (\`proof_wait_overnight\`) that ends in 10 hours. This state is incorrect. The baker reported a warm proof, which should have started a 2-hour clock, not a 10-hour clock.

**Documents:** A two-hour proof card is on file. It appears correct.

**History and findings:** The batch history shows a series of errors, all originating with me.

1. I repeatedly misread the station state, telling the baker the dough was waiting on *shape and pan* when it was actually waiting on the *warm proof*.
2. The baker correctly reported the warm proof multiple times.
3. When I finally advanced the batch, I selected the wrong transition, or the system routed it incorrectly. The batch entered an overnight cold-proof hold, contrary to the warm proof that was reported.

This combination of my own error and an incorrect state transition requires human intervention. The batch is on the wrong path and I cannot correct it myself.`

const NOTES = `## Duck course, second seating

Par levels to update before service:

\`\`\`json
{ "cream": 6, "shallots": 4, "lemons": 12 }
\`\`\`

| Station | Fire | Rest |
| --- | --- | --- |
| Grill | 5:50 | 12 min |
| Grill | 7:45 | 12 min |

> Hold the second tray until the eight-tops are seated.

Full timing lives on [the prep board](https://example.com/prep).`

// streaming markdown: the same audit text growing in bursts, re-rendered as
// markdown each tick
const mdStream = ref("")
let mdTimer = null
function streamMarkdown() {
  if (mdTimer) clearInterval(mdTimer)
  mdStream.value = ""
  let i = 0
  mdTimer = setInterval(() => {
    i += 4 + Math.floor((i % 11) / 3)
    mdStream.value = AUDIT.slice(0, i)
    if (i >= AUDIT.length) { clearInterval(mdTimer); mdTimer = null }
  }, 24)
}

// streaming demo: grow a source string in irregular bursts, like real tokens
const SAMPLE = "For tonight's service I'd run the duck in two passes so the second seating gets it freshly rested. Pull the first tray at 5:50, let it rest while the 7:30 eight-tops are seated, then fire the rest. That keeps every plate within a few minutes of resting time instead of holding a full tray under the lamp."
const streamText = ref("")
let streamTimer = null
function streamSample() {
  if (streamTimer) clearInterval(streamTimer)
  streamText.value = ""
  let i = 0
  streamTimer = setInterval(() => {
    // irregular burst sizes to mimic a real token stream
    i += 2 + Math.floor((i % 7) / 2)
    streamText.value = SAMPLE.slice(0, i)
    if (i >= SAMPLE.length) { clearInterval(streamTimer); streamTimer = null }
  }, 55)
}

// one source feeding four bubbles, each with a different reveal style
const REVEALS = ["fade", "blur", "typewriter"]
const revealText = ref("")
let revealTimer = null
function streamReveals() {
  if (revealTimer) clearInterval(revealTimer)
  revealText.value = ""
  let i = 0
  revealTimer = setInterval(() => {
    i += 2
    revealText.value = SAMPLE.slice(0, i)
    if (i >= SAMPLE.length) { clearInterval(revealTimer); revealTimer = null }
  }, 55)
}

// working-chat reply now streams in token by token
function streamReply(idx, full) {
  let i = 0
  const t = setInterval(() => {
    i += 3
    // reassign the array slot so the change is reactive
    items.value[idx] = { ...items.value[idx], text: full.slice(0, i) }
    if (i >= full.length) clearInterval(t)
  }, 50)
}
</script>

<template>
  <Story title="Chat">
    <!-- the atom: a single bubble, content via slot so anything can live inside -->
    <Variant title="ChatMessage roles">
      <ChatThread style="max-width: 560px;">
        <ChatMessage role="system" text="Conversation started · gpt-4o" />
        <ChatMessage role="assistant" name="Sous" timestamp="9:01 AM"
          text="Good morning. I can help plan prep, track inventory, and cost the menu." />
        <ChatMessage role="user" name="You" timestamp="9:02 AM"
          text="What's the food cost on the fall tasting menu right now?" />
        <ChatMessage role="assistant" name="Sous" timestamp="9:02 AM"
          text="It's tracking at 31.4% - two points over target. The duck course is the main driver." />
      </ChatThread>
    </Variant>

    <!-- avatars, and rich slotted content rather than plain text -->
    <Variant title="Avatars and rich content">
      <ChatThread style="max-width: 560px;">
        <ChatMessage role="user" name="Dana Lewis"
          avatar="https://i.pravatar.cc/64?img=47" timestamp="2:14 PM"
          text="Can you give me the steps to clarify a consommé?" />
        <ChatMessage role="assistant" name="Sous" timestamp="2:14 PM">
          <p style="margin: 0 0 8px;">A raft does the work. The short version:</p>
          <ol style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px;">
            <li>Whisk egg whites with mirepoix and ground meat.</li>
            <li>Stir into cold stock, then bring up slowly without boiling.</li>
            <li>Let the raft form, ladle through a chinois lined with cloth.</li>
          </ol>
        </ChatMessage>
      </ChatThread>
    </Variant>

    <!-- the markdown prop: model output renders as formatted markdown -->
    <Variant title="Markdown">
      <ChatThread style="max-width: 640px;">
        <ChatMessage role="user" name="You" text="Audit the brioche batch and give me its current state." />
        <ChatMessage role="assistant" name="Sous" markdown :text="AUDIT" />
        <ChatMessage role="user" name="You" markdown text="Thanks. Post the **final** timing when you have it - and keep `proof_wait_overnight` out of it this time." />
        <ChatMessage role="assistant" name="Sous" markdown :text="NOTES" />
      </ChatThread>
    </Variant>

    <!-- streaming + markdown: the growing text re-renders as markdown each tick -->
    <Variant title="Streaming markdown">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 640px;">
        <Button variant="outline" size="sm" style="align-self: flex-start;" @click="streamMarkdown">
          Stream the audit
        </Button>
        <ChatThread>
          <ChatMessage v-if="mdStream" role="assistant" name="Sous" :text="mdStream" streaming markdown />
        </ChatThread>
      </div>
    </Variant>

    <!-- the point: custom components interleave between messages -->
    <Variant title="Interleaved tool call">
      <ChatThread style="max-width: 560px;">
        <ChatMessage role="user" name="You" text="How many covers are we booked for tonight?" />

        <!-- a real library component, dropped straight between two messages -->
        <ToolCall
          name="reservations.count"
          icon="lucide:calendar-check"
          :input="{ date: 'today', service: 'dinner' }"
          :output="{ covers: 86, largeParties: [{ time: '7:30', size: 8 }, { time: '7:30', size: 8 }] }"
          :duration-ms="240"
        />

        <ChatMessage role="assistant" name="Sous"
          text="86 covers, with two 8-tops at 7:30. I'd fire the duck in two waves." />
      </ChatThread>
    </Variant>

    <!-- typing indicator, standalone and dressed as an incoming bubble -->
    <Variant title="TypingIndicator">
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 560px;">
        <TypingIndicator />
        <TypingIndicator label="Sous is thinking" />
        <ChatMessage role="assistant" name="Sous">
          <TypingIndicator />
        </ChatMessage>
      </div>
    </Variant>

    <!-- the streaming fade-in: text reveals at a paced rate, trailing edge fades -->
    <Variant title="Streaming text">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px;">
        <Button variant="outline" size="sm" style="align-self: flex-start;" @click="streamSample">
          Stream a reply
        </Button>
        <ChatThread>
          <ChatMessage role="user" name="You" text="How should I time the duck for two seatings?" />
          <ChatMessage v-if="streamText" role="assistant" name="Sous" :text="streamText" streaming />
        </ChatThread>
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          The source grows in irregular bursts; the pacer reveals it smoothly and the leading
          edge fades and unblurs as it lands. Respects prefers-reduced-motion.
        </p>
      </div>
    </Variant>

    <!-- the reveal prop: same paced stream, four different character treatments -->
    <Variant title="Streaming reveals">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 580px;">
        <Button variant="outline" size="sm" style="align-self: flex-start;" @click="streamReveals">
          Stream all four
        </Button>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div v-for="r in REVEALS" :key="r" style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-family: var(--mono); font-size: 11px; color: var(--ink-40); text-transform: uppercase; letter-spacing: 0.08em;">{{ r }}</span>
            <ChatMessage role="assistant" name="Sous" :text="revealText" streaming :reveal="r" />
          </div>
        </div>
      </div>
    </Variant>

    <!-- composer on its own: auto-grow, Enter to send, loading send button -->
    <Variant title="ChatComposer">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px;">
        <ChatComposer v-model="composerDraft" placeholder="Ask about prep, inventory, or cost…" />

        <ChatComposer v-model="loadingDraft" :loading="busy" @submit="busy = true">
          <template #lead>
            <Button icon="lucide:paperclip" variant="ghost" size="sm" aria-label="Attach" />
          </template>
          <template #actions>
            <Button icon="lucide:mic" variant="ghost" size="sm" aria-label="Voice" />
          </template>
        </ChatComposer>
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          Enter sends, Shift+Enter adds a newline. The textarea grows up to eight rows.
        </p>
      </div>
    </Variant>

    <!-- prompt menu in the actions slot: opens upward, fills the box on click -->
    <Variant title="Composer with prompt menu">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px;">
        <ChatComposer ref="promptComposer" v-model="promptDraft" placeholder="Message Sous…">
          <template #actions>
            <PromptMenu :prompts="PROMPTS" @select="insertPrompt" />
          </template>
        </ChatComposer>
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          The button opens a menu of predefined prompts. Selecting one fills the composer
          and focuses it - it does not send.
        </p>
      </div>
    </Variant>

    <!-- everything together: a live, sending chat with a typing indicator -->
    <Variant title="Working chat">
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 560px; height: 460px;">
        <ChatScroller style="flex: 1;">
          <template v-for="(it, i) in items" :key="i">
            <ChatMessage v-if="it.kind === 'msg'" :role="it.role" :name="it.name" :show-name="false" :show-avatar="false" :text="it.text" :streaming="it.streaming" />
            <ToolCall
              v-else
              :name="it.tool"
              icon="lucide:boxes"
              :input="it.input"
              :output="it.output"
              :default-open="false"
            />
          </template>
          <ChatMessage v-if="replying" role="assistant" name="Sous" :show-name="false" :show-avatar="false">
            <TypingIndicator />
          </ChatMessage>
        </ChatScroller>
        <ChatComposer v-model="draft" :loading="replying" placeholder="Message Sous…" @submit="send" />
      </div>
    </Variant>
  </Story>
</template>