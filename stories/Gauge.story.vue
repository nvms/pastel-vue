<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import Gauge from "../src/components/Gauge.vue"
import Card from "../src/components/Card.vue"

const live = ref(34)
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    live.value = live.value >= 100 ? 8 : live.value + 7
  }, 900)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <Story title="Gauge">
    <Variant title="Basic">
      <Gauge :value="68" label="Complete" />
    </Variant>

    <Variant title="Live value">
      <Gauge :value="live" variant="lavender" label="Ingesting" />
    </Variant>

    <Variant title="Variants">
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <Gauge :value="62" variant="default" label="Default" />
        <Gauge :value="62" variant="lavender" label="Lavender" />
        <Gauge :value="78" variant="success" label="Success" />
        <Gauge :value="46" variant="warning" label="Warning" />
        <Gauge :value="23" variant="danger" label="Danger" />
      </div>
    </Variant>

    <Variant title="Sizes">
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <Gauge :value="70" :size="72" :thickness="11" />
        <Gauge :value="70" :size="112" />
        <Gauge :value="70" :size="160" :thickness="7" label="Capacity" />
      </div>
    </Variant>

    <Variant title="Custom format">
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <Gauge
          :value="184"
          :max="250"
          variant="success"
          label="Matters"
          :format-value="(v) => `${v}`"
        />
        <Gauge
          :value="3.4"
          :max="5"
          variant="lavender"
          label="Rating"
          :format-value="(v) => v.toFixed(1)"
        />
      </div>
    </Variant>

    <Variant title="In cards">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <Card padded style="display: flex; align-items: center; gap: 16px; width: 260px;">
          <Gauge :value="91" :size="84" :thickness="10" variant="success" />
          <div>
            <div style="font-family: var(--display); font-size: 18px; font-weight: 500;">SLA met</div>
            <div style="font-size: 13px; color: var(--ink-60);">Last 30 days</div>
          </div>
        </Card>
        <Card padded style="display: flex; align-items: center; gap: 16px; width: 260px;">
          <Gauge :value="42" :size="84" :thickness="10" variant="warning" />
          <div>
            <div style="font-family: var(--display); font-size: 18px; font-weight: 500;">Storage used</div>
            <div style="font-size: 13px; color: var(--ink-60);">8.4 GB of 20 GB</div>
          </div>
        </Card>
      </div>
    </Variant>
  </Story>
</template>
