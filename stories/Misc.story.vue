<script setup>
import Spinner from "../src/components/Spinner.vue"
import Kbd from "../src/components/Kbd.vue"
import Divider from "../src/components/Divider.vue"
</script>

<template>
  <Story title="Misc">
    <Variant title="Spinner">
      <div style="display: flex; gap: 16px; align-items: center;">
        <Spinner :size="14" />
        <Spinner :size="20" />
      </div>
    </Variant>
    <Variant title="Kbd">
      <div>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.</div>
    </Variant>
    <Variant title="Divider">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div>Above</div>
        <Divider />
        <div>Below</div>
      </div>
    </Variant>
  </Story>
</template>
