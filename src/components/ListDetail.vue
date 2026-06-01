<script setup>
import ScrollArea from "./ScrollArea.vue"

defineProps({
  // any CSS dimension for the list column; the detail column takes the rest
  listWidth: { type: String, default: "38%" },
  // bounded height so each pane can scroll independently; pass any CSS length
  height: { type: String, default: "560px" },
  // strip internal padding so the slot content can manage its own gutter
  bare: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="pc-listdetail"
    :style="{ '--pc-ld-list-w': listWidth, '--pc-ld-h': height }"
  >
    <div class="pc-listdetail__pane pc-listdetail__list">
      <ScrollArea class="pc-listdetail__scroll" height="100%">
        <div :class="['pc-listdetail__inner', { 'pc-listdetail__inner--bare': bare }]">
          <slot name="list" />
        </div>
      </ScrollArea>
    </div>
    <div class="pc-listdetail__pane pc-listdetail__detail">
      <ScrollArea class="pc-listdetail__scroll" height="100%">
        <div :class="['pc-listdetail__inner', { 'pc-listdetail__inner--bare': bare }]">
          <slot name="detail" />
        </div>
      </ScrollArea>
    </div>
  </div>
</template>

<style scoped>
.pc-listdetail {
  display: grid;
  grid-template-columns: var(--pc-ld-list-w) 1fr;
  grid-template-rows: 1fr;
  height: var(--pc-ld-h);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  background: var(--paper);
  overflow: hidden;
}
.pc-listdetail__pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.pc-listdetail__list { border-right: 1px solid var(--ink-08); }
.pc-listdetail__scroll { flex: 1; min-height: 0; }
.pc-listdetail__inner { padding: 20px 22px; }
.pc-listdetail__inner--bare { padding: 0; }
</style>
