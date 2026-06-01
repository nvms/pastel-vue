<script setup>
import ActivityHeatmap from "../src/components/ActivityHeatmap.vue"
import Card from "../src/components/Card.vue"

// deterministic pseudo-random series so the story is stable across reloads
const buildData = (days, seed) => {
  const out = []
  let s = seed
  const end = new Date()
  for (let i = days - 1; i >= 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const r = s / 4294967296
    const dt = new Date(end)
    dt.setDate(end.getDate() - i)
    const dow = dt.getDay()
    // quieter on weekends, occasional zero days
    const weekendDamp = dow === 0 || dow === 6 ? 0.35 : 1
    const value = r < 0.18 ? 0 : Math.round(r * 11 * weekendDamp)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    out.push({ date: key, value })
  }
  return out
}

const halfYear = buildData(190, 7)
const fullYear = buildData(380, 42)
</script>

<template>
  <Story title="ActivityHeatmap">
    <Variant title="Half year">
      <Card padded style="display: inline-block;">
        <ActivityHeatmap :data="halfYear" :weeks="26" label="Prep activity" />
      </Card>
    </Variant>

    <Variant title="Full year">
      <Card padded style="display: inline-block;">
        <ActivityHeatmap :data="fullYear" :weeks="53" label="Recipe reviews" />
      </Card>
    </Variant>

    <Variant title="With tooltips">
      <Card padded style="display: inline-block;">
        <ActivityHeatmap
          :data="halfYear"
          :weeks="26"
          label="Prep activity"
          tooltip
          unit="preps"
        />
      </Card>
      <p style="margin-top: 12px; font-size: 13px; color: var(--ink-60);">
        Hover a cell that has data to see its tooltip. Empty days stay quiet.
      </p>
    </Variant>

    <Variant title="Compact">
      <ActivityHeatmap
        :data="halfYear"
        :weeks="20"
        :cell-size="10"
        :cell-gap="2"
        :show-legend="false"
      />
    </Variant>

    <Variant title="Large cells">
      <Card padded style="display: inline-block;">
        <ActivityHeatmap
          :data="halfYear"
          :weeks="18"
          :cell-size="18"
          :cell-gap="4"
          label="Intake volume"
        />
      </Card>
    </Variant>
  </Story>
</template>
