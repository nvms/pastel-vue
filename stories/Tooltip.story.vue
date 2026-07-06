<script setup>
import Tooltip from "../src/components/Tooltip.vue"
import Button from "../src/components/Button.vue"
</script>

<template>
  <Story title="Tooltip">
    <Variant title="Placements">
      <div style="display: grid; grid-template-columns: repeat(4, auto); gap: 24px; padding: 80px;">
        <Tooltip text="Top tooltip" placement="top"><Button>Top</Button></Tooltip>
        <Tooltip text="Bottom tooltip" placement="bottom"><Button>Bottom</Button></Tooltip>
        <Tooltip text="Left tooltip" placement="left"><Button>Left</Button></Tooltip>
        <Tooltip text="Right tooltip" placement="right"><Button>Right</Button></Tooltip>
      </div>
    </Variant>
    <Variant title="Long content">
      <div style="padding: 140px 80px;">
        <Tooltip placement="top">
          <Button>Hover</Button>
          <template #content>
            Resting the dough overnight in the fridge slows fermentation, which deepens
            the flavor and makes the crumb more open. If you are short on time, two hours
            at room temperature works, but the crust will brown faster than you expect,
            so keep an eye on it after the first fifteen minutes.
          </template>
        </Tooltip>
      </div>
    </Variant>
  </Story>
</template>
