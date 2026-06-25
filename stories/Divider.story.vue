<script setup>
import Divider from "../src/components/Divider.vue"
</script>

<template>
  <Story title="Divider">
    <Variant title="Horizontal">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>Above</div>
        <Divider />
        <div>Below</div>
      </div>
    </Variant>

    <Variant title="Dashed">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>Above</div>
        <Divider dashed />
        <div>Below</div>
      </div>
    </Variant>

    <Variant title="Vertical">
      <div style="display: flex; align-items: center; gap: 12px; height: 40px;">
        <span>Left</span>
        <Divider vertical />
        <span>Middle</span>
        <Divider vertical dashed />
        <span>Right</span>
      </div>
    </Variant>
  </Story>
</template>
