<script setup>
import Spinner from "../src/components/Spinner.vue"
</script>

<template>
  <Story title="Spinner">
    <Variant title="Sizes">
      <div style="display: flex; gap: 20px; align-items: center;">
        <Spinner :size="14" />
        <Spinner :size="20" />
        <Spinner :size="28" />
        <Spinner :size="40" />
      </div>
    </Variant>

    <Variant title="Color">
      <div style="display: flex; gap: 20px; align-items: center;">
        <span style="color: var(--ink)"><Spinner :size="24" /></span>
        <span style="color: var(--ink-40)"><Spinner :size="24" /></span>
        <span style="color: var(--lavender)"><Spinner :size="24" /></span>
        <span style="color: var(--status-failed)"><Spinner :size="24" /></span>
      </div>
    </Variant>

    <Variant title="On a dark surface">
      <div
        style="display: flex; gap: 20px; align-items: center; padding: 24px;
               border-radius: var(--radius-comfy); background: var(--midnight)"
      >
        <Spinner :size="16" light />
        <Spinner :size="24" light />
        <Spinner :size="32" light />
      </div>
    </Variant>

    <Variant title="Inline with text">
      <div style="display: flex; gap: 8px; align-items: center; color: var(--ink-60)">
        <Spinner :size="14" />
        <span>Generating response…</span>
      </div>
    </Variant>
  </Story>
</template>
