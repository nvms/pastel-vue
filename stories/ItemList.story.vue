<script setup>
import { ref } from "vue"
import ItemList from "../src/components/ItemList.vue"
import Card from "../src/components/Card.vue"

const makeFiles = () => [
  { label: "fall-tasting-menu.pdf", icon: "lucide:file-text", meta: "2.4 MB", status: { label: "Final", tone: "positive" }, value: "f1" },
  { label: "duck-confit-recipe.docx", icon: "lucide:file-text", meta: "88 KB", status: "Draft", value: "f2" },
  { label: "plating-photos.zip", icon: "lucide:file-archive", meta: "14.1 MB", value: "f3" },
  { label: "food-cost-sheet.xlsx", icon: "lucide:file-spreadsheet", meta: "320 KB", status: { label: "Shared", tone: "info" }, value: "f4" },
  { label: "wine-pairings.pdf", icon: "lucide:file-text", meta: "112 KB", status: { label: "In review", tone: "warning" }, value: "f5" },
]

const files = ref(makeFiles())
const multiFiles = ref(makeFiles())
const compactFiles = ref(makeFiles())
const log = ref("")

const DELETE = { name: "delete", icon: "lucide:trash-2", label: "Delete", variant: "danger", confirm: true }

function removeFrom(listRef, value) {
  listRef.value = listRef.value.filter((f) => f.value !== value)
}

function onDelete(listRef) {
  return ({ item }) => removeFrom(listRef, item.value)
}

function onMultiAction(listRef) {
  return ({ action, item }) => {
    if (action === "delete") return removeFrom(listRef, item.value)
    log.value = `${action} -> ${item.label}`
  }
}

function reset() {
  files.value = makeFiles()
  multiFiles.value = makeFiles()
  compactFiles.value = makeFiles()
  log.value = ""
}
</script>

<template>
  <Story title="ItemList">
    <!-- the core case: hover a row, the delete button slides in from the right,
         clicking it asks for confirmation before removing the file -->
    <Variant title="Files with delete">
      <div style="max-width: 560px;">
        <Card style="overflow: hidden;">
          <ItemList :items="files" :actions="[DELETE]" @action="onDelete(files)" />
        </Card>
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          Hover a row to reveal delete. <button class="pc-reset" @click="reset">Reset list</button>
        </p>
      </div>
    </Variant>

    <!-- several actions per row; only delete asks to confirm -->
    <Variant title="Multiple actions">
      <div style="max-width: 560px;">
        <Card style="overflow: hidden;">
          <ItemList
            :items="multiFiles"
            :actions="[
              { name: 'download', icon: 'lucide:download', label: 'Download' },
              { name: 'rename', icon: 'lucide:pencil', label: 'Rename' },
              { name: 'delete', icon: 'lucide:trash-2', label: 'Delete', variant: 'danger', confirm: { message: 'This file will be permanently deleted.' } },
            ]"
            @action="onMultiAction(multiFiles)"
          />
        </Card>
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          Last action: <code>{{ log || "none" }}</code> ·
          <button class="pc-reset" @click="reset">Reset list</button>
        </p>
      </div>
    </Variant>

    <!-- compact rows for dense lists -->
    <Variant title="Compact">
      <div style="max-width: 560px;">
        <Card style="overflow: hidden;">
          <ItemList :items="compactFiles" :actions="[DELETE]" compact @action="onDelete(compactFiles)" />
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
