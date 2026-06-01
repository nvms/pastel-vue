<script setup>
import { computed } from "vue"
import { formatUSD } from "../pricing.js"

const props = defineProps({
  // a measured cost (USD) ...
  cost: { type: Number, default: 0 },
  // ... over this many days
  periodDays: { type: Number, default: 7 },
})

const perMonth = computed(() =>
  props.periodDays > 0 ? (props.cost / props.periodDays) * 30.44 : 0,
)
const perYear = computed(() =>
  props.periodDays > 0 ? (props.cost / props.periodDays) * 365 : 0,
)
</script>

<template>
  <div class="pc-costproj">
    <div class="pc-costproj__eyebrow">Projected cost</div>
    <div class="pc-costproj__hero">
      {{ formatUSD(perMonth) }}<span class="pc-costproj__unit">/ month</span>
    </div>
    <div class="pc-costproj__year">
      {{ formatUSD(perYear) }}<span class="pc-costproj__unit">/ year</span>
    </div>
    <div class="pc-costproj__basis">
      From {{ formatUSD(cost) }} measured over
      {{ periodDays }} {{ periodDays === 1 ? "day" : "days" }}
    </div>
  </div>
</template>

<style scoped>
.pc-costproj {
  display: flex;
  flex-direction: column;
}
.pc-costproj__eyebrow {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.pc-costproj__hero {
  font-family: var(--display);
  font-size: 44px;
  font-weight: 500;
  letter-spacing: -1.1px;
  line-height: 1.05;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  margin: 6px 0 2px;
}
.pc-costproj__year {
  font-family: var(--display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.4px;
  color: var(--ink-60);
  font-variant-numeric: tabular-nums;
}
.pc-costproj__unit {
  font-size: 0.42em;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--ink-40);
  margin-left: 0.4em;
}
.pc-costproj__year .pc-costproj__unit { font-size: 0.55em; }
.pc-costproj__basis {
  margin-top: 14px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}
</style>
