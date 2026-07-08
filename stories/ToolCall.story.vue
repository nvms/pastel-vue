<script setup>
import { ref, markRaw } from "vue"
import ToolCall from "../src/components/ToolCall.vue"
import ItemList from "../src/components/ItemList.vue"
import Card from "../src/components/Card.vue"
import Button from "../src/components/Button.vue"

// 100 collapsed calls, each carrying a large JSON payload - a transcript from an
// agent that has been running for a while. collapsed cards must stay cheap no
// matter how much text they hold
const STATIONS = ["grill", "pastry", "garde-manger", "saucier", "walk-in", "expo"]
const makeBigPayload = (seed) => ({
  station: STATIONS[seed % 6],
  service: seed % 2 ? "dinner" : "lunch",
  covers: 40 + (seed % 60),
  courses: Array.from({ length: 40 }, (_, i) => ({
    id: `course_${seed}_${i}`,
    name: `${STATIONS[(seed + i) % 6]} course ${i + 1}`,
    fireAt: `${17 + (i % 5)}:${String((i * 7) % 60).padStart(2, "0")}`,
    restMinutes: (i % 12) + 2,
    par: { prepped: (i * 3) % 24, needed: (i * 5) % 30, unit: i % 2 ? "portions" : "trays" },
    allergens: ["dairy", "gluten", "shellfish", "nuts"].slice(0, (seed + i) % 4),
    notes: `hold tray ${i + 1} until the eight-tops are seated, then fire in waves of six plates so nothing waits under the lamp longer than four minutes`,
  })),
  tookMs: 120 + (seed % 400),
})
// markRaw keeps histoire's deep state watcher (and any consumer-side deep
// reactivity) from walking these huge payload graphs on every update
const manyCalls = markRaw(Array.from({ length: 100 }, (_, i) => ({
  name: `kitchen.plan_${STATIONS[i % 6].replace(/-/g, "_")}`,
  input: { station: STATIONS[i % 6], date: "today", depth: "full" },
  output: makeBigPayload(i),
  durationMs: 180 + (i % 900),
})))

// the production shape: a long transcript of heavy collapsed tool calls with
// animated item lists interleaved. the list entrance animations must stay
// smooth no matter how much collapsed payload surrounds them
const makeListItems = (seed) =>
  Array.from({ length: 6 }, (_, i) => ({
    label: `${STATIONS[(seed + i) % 6]} batch ${i + 1}`,
    icon: "lucide:chef-hat",
    meta: `${((seed + i) % 55) + 5}m ago`,
    status: { label: ["Ready", "Resting", "Queued", "Plated"][i % 4], tone: ["positive", "warning", "neutral", "info"][i % 4] },
    value: `m${seed}-${i}`,
  }))
const listKey = ref(0)
const replayEntrances = () => { listKey.value++ }

// hand-written source for the stress variants. without this, histoire generates
// source by serializing every prop - megabytes of JSON - and then syntax
// highlights it, which can stall the story view for many seconds
const STRESS_SOURCE = `<ToolCall
  v-for="(c, i) in manyCalls"
  :key="i"
  :name="c.name"
  icon="lucide:chef-hat"
  :input="c.input"
  :output="c.output"
  :duration-ms="c.durationMs"
  :default-open="false"
  :animate-in="false"
/>`

const MIXED_SOURCE = `<template v-for="(c, i) in manyCalls" :key="i">
  <ToolCall
    :name="c.name"
    icon="lucide:chef-hat"
    :input="c.input"
    :output="c.output"
    :duration-ms="c.durationMs"
    :default-open="false"
    :animate-in="false"
  />
  <Card v-if="i % 10 === 9">
    <ItemList :items="makeListItems(i)" :actions="[deleteAction]" compact />
  </Card>
</template>`

// a payload in the millions of characters - the full variant clips what it
// renders and says so, the slim variant never renders it at all
const hugeOutput = markRaw({
  transcript: Array.from({ length: 4000 }, (_, i) =>
    `${STATIONS[i % 6]} station check ${i}: par levels reviewed, walk-in temperature logged at ${2 + (i % 3)}C, mise verified against the prep sheet, and tray rotation confirmed for the evening service window`,
  ),
})

const bigOutput = {
  query: "spatial-index rebuild",
  matches: Array.from({ length: 12 }, (_, i) => ({
    id: `node_${1000 + i}`,
    score: Number((0.99 - i * 0.07).toFixed(3)),
    bbox: [i * 4, i * 4, i * 4 + 16, i * 4 + 16],
    tags: ["prep", i % 2 ? "dinner" : "lunch", `station-${i % 4}`],
  })),
  tookMs: 38,
  cacheHit: false,
}
</script>

<template>
  <Story title="ToolCall">
    <!-- the common case: a couple of named inputs, a small object output -->
    <Variant title="Default">
      <div style="max-width: 600px;">
        <ToolCall
          name="reservations.count"
          icon="lucide:calendar-check"
          :input="{ date: 'today', service: 'dinner' }"
          :output="{ covers: 86, largeParties: 2 }"
          :duration-ms="240"
        />
      </div>
    </Variant>

    <!-- scales down: a single primitive output reads cleanly too -->
    <Variant title="Simple in and out">
      <div style="max-width: 600px;">
        <ToolCall
          name="math.evaluate"
          icon="lucide:calculator"
          :input="{ expression: '(86 * 0.314) / 12' }"
          :output="2.25"
          :duration-ms="6"
        />
      </div>
    </Variant>

    <!-- scales up: many inputs and a large nested JSON output that scrolls -->
    <Variant title="Many inputs, large output">
      <div style="max-width: 600px;">
        <ToolCall
          name="retrieval.search"
          icon="lucide:search"
          :input="{
            index: 'recipes-v3',
            query: 'braise shallots',
            topK: 12,
            filters: { station: 'sauce', allergens: ['none'] },
            rerank: true,
          }"
          :output="bigOutput"
          :duration-ms="38"
        />
      </div>
    </Variant>

    <!-- free-text output wraps rather than scrolling sideways -->
    <Variant title="Text output">
      <div style="max-width: 600px;">
        <ToolCall
          name="web.fetch"
          icon="lucide:globe"
          :input="{ url: 'https://example.com/menu' }"
          output="Fall tasting menu: heirloom squash veloute, duck two ways with quince, brown butter financier. Prices held from last quarter. Note the duck course drives food cost above target and should be reviewed before the winter changeover."
          :duration-ms="1240"
        />
      </div>
    </Variant>

    <!-- states -->
    <Variant title="Running">
      <div style="max-width: 600px;">
        <ToolCall
          name="inventory.scan"
          icon="lucide:boxes"
          status="running"
          :input="{ location: 'walk-in' }"
        />
      </div>
    </Variant>

    <Variant title="Error">
      <div style="max-width: 600px;">
        <ToolCall
          name="pos.sync"
          icon="lucide:credit-card"
          status="error"
          :input="{ terminal: 'front-2' }"
          :output="{ code: 'ETIMEDOUT', message: 'Terminal did not respond within 5000ms', retryable: true }"
          :duration-ms="5000"
        />
      </div>
    </Variant>

    <!-- slim: one tight line per call, no body ever - for transcripts where the
         payloads are enormous or not worth showing -->
    <Variant title="Slim">
      <div style="max-width: 480px; display: flex; flex-direction: column; gap: 6px;">
        <ToolCall variant="slim" name="inventory.scan" icon="lucide:boxes" :duration-ms="240" :output="hugeOutput" />
        <ToolCall variant="slim" name="reservations.count" icon="lucide:calendar-check" :duration-ms="82" />
        <ToolCall variant="slim" name="menu.publish_recipe" icon="lucide:chef-hat" status="running" />
        <ToolCall variant="slim" name="pos.sync" icon="lucide:credit-card" status="error" :duration-ms="5000" />
        <ToolCall variant="slim" name="pantry.discard_expired" icon="lucide:trash-2" status="pending" />
      </div>
    </Variant>

    <!-- a multi-megabyte output: the body clips at maxChars and says what it cut -->
    <Variant title="Huge output (truncated)">
      <div style="max-width: 600px;">
        <ToolCall
          name="kitchen.audit_full"
          icon="lucide:clipboard-list"
          :input="{ scope: 'all stations', depth: 'exhaustive' }"
          :output="hugeOutput"
          :duration-ms="8200"
          :default-open="false"
        />
      </div>
    </Variant>

    <Variant title="Non-collapsible">
      <div style="max-width: 600px;">
        <ToolCall
          name="clock.now"
          icon="lucide:clock"
          :collapsible="false"
          :output="{ iso: '2026-06-19T18:30:00Z', tz: 'America/New_York' }"
        />
      </div>
    </Variant>

    <!-- 100 collapsed calls, each holding a large JSON payload. scroll and hover
         should stay smooth; a collapsed card does not render its body at all -->
    <Variant title="Stress (100 collapsed, big JSON)" :source="STRESS_SOURCE">
      <div style="max-width: 640px; display: flex; flex-direction: column; gap: 8px;">
        <ToolCall
          v-for="(c, i) in manyCalls"
          :key="i"
          :name="c.name"
          icon="lucide:chef-hat"
          :input="c.input"
          :output="c.output"
          :duration-ms="c.durationMs"
          :default-open="false"
          :animate-in="false"
        />
      </div>
    </Variant>

    <!-- the production shape: heavy collapsed tool calls with animated item lists
         interleaved. "replay entrances" remounts the lists so their staggered
         entrance runs again on top of all the tool call weight -->
    <Variant title="Stress (mixed transcript)" :source="MIXED_SOURCE">
      <div style="max-width: 640px; display: flex; flex-direction: column; gap: 8px;">
        <Button variant="outline" size="sm" style="align-self: flex-start; margin-bottom: 4px;" @click="replayEntrances">
          Replay list entrances
        </Button>
        <template v-for="(c, i) in manyCalls" :key="i">
          <ToolCall
            :name="c.name"
            icon="lucide:chef-hat"
            :input="c.input"
            :output="c.output"
            :duration-ms="c.durationMs"
            :default-open="false"
            :animate-in="false"
          />
          <Card v-if="i % 10 === 9" style="overflow: hidden; margin: 4px 0;">
            <ItemList
              :key="`list-${i}-${listKey}`"
              :items="makeListItems(i)"
              :actions="[{ name: 'delete', icon: 'lucide:trash-2', label: 'Delete', variant: 'danger', confirm: true }]"
              compact
            />
          </Card>
        </template>
      </div>
    </Variant>
  </Story>
</template>
