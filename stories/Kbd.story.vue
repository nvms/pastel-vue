<script setup>
import Kbd from "../src/components/Kbd.vue"
</script>

<template>
  <Story title="Kbd">
    <Variant title="Default">
      <div>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.</div>
    </Variant>

    <Variant title="Shortcuts">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div>Save: <Kbd>⌘</Kbd> <Kbd>S</Kbd></div>
        <div>Undo: <Kbd>⌘</Kbd> <Kbd>Z</Kbd></div>
        <div>Confirm: <Kbd>Enter</Kbd></div>
        <div>Dismiss: <Kbd>Esc</Kbd></div>
      </div>
    </Variant>
  </Story>
</template>
