<script setup>
import { ref } from "vue"
import RecordList from "../src/components/RecordList.vue"
import Card from "../src/components/Card.vue"

const makeDocs = () => [
  { label: "fall-tasting-menu.pdf", description: "Edited 2 hours ago by Chef Lena", icon: "lucide:file-text", meta: "2.4 MB", status: { label: "Final", tone: "positive" }, value: "d1" },
  { label: "duck-confit-recipe.docx", description: "Edited yesterday by Chef Marco", icon: "lucide:file-text", meta: "88 KB", status: "Draft", value: "d2" },
  { label: "plating-photos.zip", description: "Uploaded last week", icon: "lucide:file-archive", meta: "14.1 MB", value: "d3" },
  { label: "food-cost-sheet.xlsx", description: "Shared with the kitchen team", icon: "lucide:file-spreadsheet", meta: "320 KB", status: { label: "Shared", tone: "info" }, value: "d4" },
  { label: "wine-pairings.pdf", description: "Awaiting sommelier sign-off", icon: "lucide:file-text", meta: "112 KB", status: { label: "In review", tone: "warning" }, value: "d5" },
]

const docs = ref(makeDocs())
const compactDocs = ref(makeDocs())
const popoverDocs = ref(makeDocs())
const opened = ref("")

const makeSources = () => [
  { label: "Classic French technique", description: { text: "escoffier.edu", icon: "lucide:badge-check", iconTone: "positive", href: "#" }, icon: "lucide:globe", value: "s1" },
  { label: "Regional Italian pasta", description: { text: "lacucinaitaliana.com", href: "#" }, icon: "lucide:globe", value: "s2" },
  { label: "Nordic fermentation", description: "noma.dk", icon: "lucide:globe", value: "s3" },
]
const sources = ref(makeSources())
const viewed = ref("")

const VIEW = { name: "view", icon: "lucide:eye", label: "View" }
const DELETE = { name: "delete", icon: "lucide:trash-2", label: "Delete", variant: "danger", confirm: true }

function onSourceAction({ action, item }) {
  if (action === "delete") return removeFrom(sources, item.value)
  viewed.value = item.label
}

function removeFrom(listRef, value) {
  listRef.value = listRef.value.filter((d) => d.value !== value)
}

function reset() {
  docs.value = makeDocs()
  compactDocs.value = makeDocs()
  popoverDocs.value = makeDocs()
  sources.value = makeSources()
  opened.value = ""
  viewed.value = ""
}
</script>

<template>
  <Story title="RecordList">
    <!-- two lines on the left, the file name is clickable; delete reveals on hover -->
    <Variant title="Clickable records">
      <div style="max-width: 600px;">
        <Card style="overflow: hidden;">
          <RecordList
            :items="docs"
            :actions="[DELETE]"
            @select="opened = $event.label"
            @action="({ item }) => removeFrom(docs, item.value)"
          />
        </Card>
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          Opened: <code>{{ opened || "nothing yet" }}</code> ·
          <button class="pc-reset" @click="reset">Reset list</button>
        </p>
      </div>
    </Variant>

    <!-- confirm inline with a popover instead of a centered modal -->
    <Variant title="Popover confirm">
      <div style="max-width: 600px;">
        <Card style="overflow: hidden;">
          <RecordList
            :items="popoverDocs"
            :actions="[DELETE]"
            confirm-style="popover"
            @action="({ item }) => removeFrom(popoverDocs, item.value)"
          />
        </Card>
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          Delete asks for confirmation in an inline popover. ·
          <button class="pc-reset" @click="reset">Reset list</button>
        </p>
      </div>
    </Variant>

    <!-- subtext with a verified badge and a linked domain, like a source list -->
    <Variant title="Verified sources">
      <div style="max-width: 600px;">
        <Card style="overflow: hidden;">
          <RecordList :items="sources" :actions="[VIEW, DELETE]" @action="onSourceAction" />
        </Card>
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          The first row's subtext has a colored verified badge and is a link. Hover a row for the
          view and delete actions. Viewed: <code>{{ viewed || "nothing yet" }}</code> ·
          <button class="pc-reset" @click="reset">Reset list</button>
        </p>
      </div>
    </Variant>

    <!-- names as real links via href -->
    <Variant title="Names as links">
      <div style="max-width: 600px;">
        <Card style="overflow: hidden;">
          <RecordList
            :items="makeDocs().map((d) => ({ ...d, href: '#' + d.value }))"
            :animate="false"
          />
        </Card>
      </div>
    </Variant>

    <!-- compact rows still carry both lines -->
    <Variant title="Compact">
      <div style="max-width: 600px;">
        <Card style="overflow: hidden;">
          <RecordList
            :items="compactDocs"
            :actions="[DELETE]"
            compact
            @action="({ item }) => removeFrom(compactDocs, item.value)"
          />
        </Card>
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
.pc-reset {
  border: 0;
  background: none;
  color: var(--midnight);
  font: inherit;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
</style>
