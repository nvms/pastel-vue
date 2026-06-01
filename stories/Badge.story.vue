<script setup>
import Badge from "../src/components/Badge.vue"
</script>

<template>
  <Story title="Badge">
    <Variant title="Variants">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <Badge>Default</Badge>
        <Badge variant="active" dot>Active</Badge>
        <Badge variant="warning" dot>Warning</Badge>
        <Badge variant="paused" dot>Paused</Badge>
        <Badge variant="failed" dot>Failed</Badge>
        <Badge variant="draft">Draft</Badge>
      </div>
    </Variant>
  </Story>
</template>
