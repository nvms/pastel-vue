<script setup>
import { computed, ref } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"

const props = defineProps({
  // data: [{ date: "YYYY-MM-DD", value: Number }]
  data: { type: Array, default: () => [] },
  // number of week columns to render
  weeks: { type: Number, default: 26 },
  // last day shown - defaults to today
  endDate: { type: [String, Date], default: null },
  // value mapped to the deepest cell - 0 derives it from the data
  max: { type: Number, default: 0 },
  cellSize: { type: Number, default: 13 },
  cellGap: { type: Number, default: 3 },
  label: { type: String, default: "" },
  showLegend: { type: Boolean, default: true },
  // show a tooltip on hover for cells that carry data
  tooltip: { type: Boolean, default: false },
  // optional unit appended to the value in the tooltip, e.g. "preps"
  unit: { type: String, default: "" },
})

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""]

const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const parseDate = (d) => {
  if (d instanceof Date) return stripTime(d)
  if (typeof d === "string") {
    const [y, m, day] = d.split("-").map(Number)
    return new Date(y, m - 1, day)
  }
  return stripTime(new Date())
}
const keyOf = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
const addDays = (dt, n) => {
  const r = new Date(dt)
  r.setDate(dt.getDate() + n)
  return r
}

const valueMap = computed(() => {
  const m = {}
  for (const d of props.data) m[d.date] = d.value
  return m
})
const maxValue = computed(() => {
  if (props.max > 0) return props.max
  let mx = 0
  for (const d of props.data) mx = Math.max(mx, d.value)
  return mx || 1
})
const level = (v) => {
  if (v <= 0) return 0
  const r = v / maxValue.value
  if (r <= 0.25) return 1
  if (r <= 0.5) return 2
  if (r <= 0.75) return 3
  return 4
}

const columns = computed(() => {
  const end = parseDate(props.endDate)
  const lastColStart = addDays(end, -end.getDay())
  const cols = []
  for (let c = props.weeks - 1; c >= 0; c--) {
    const start = addDays(lastColStart, -c * 7)
    const days = []
    for (let dow = 0; dow < 7; dow++) {
      const dt = addDays(start, dow)
      const future = dt > end
      const value = valueMap.value[keyOf(dt)] || 0
      days.push({ key: keyOf(dt), dt, value, future, level: future ? -1 : level(value) })
    }
    cols.push({ start, days })
  }
  return cols
})

// month label above the first column of each month, skipping cramped repeats
const monthLabels = computed(() => {
  const labels = []
  let prevMonth = -1
  let lastCol = -99
  columns.value.forEach((col, i) => {
    const m = col.start.getMonth()
    if (m !== prevMonth) {
      prevMonth = m
      if (i - lastCol >= 3) {
        labels.push({ col: i, text: MONTHS[m] })
        lastCol = i
      }
    }
  })
  return labels
})

const prettyDate = (dt) =>
  `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`

const rootStyle = computed(() => ({
  "--pc-hm-cell": `${props.cellSize}px`,
  "--pc-hm-gap": `${props.cellGap}px`,
}))

// a single shared tooltip that follows the hovered cell
const hoverEl = ref(null)
const hoverDay = ref(null)
const tipRef = ref(null)
const { floatingStyles, isPositioned } = useFloating(hoverEl, tipRef, {
  placement: "top",
  whileElementsMounted: autoUpdate,
  middleware: [offset(7), flip(), shift({ padding: 6 })],
})

// only cells with actual data are worth a tooltip
const hasTooltip = (day) => props.tooltip && !day.future && day.value > 0

const onCellEnter = (day, e) => {
  if (!hasTooltip(day)) return
  hoverDay.value = day
  hoverEl.value = e.currentTarget
}
const onCellLeave = () => {
  hoverDay.value = null
  hoverEl.value = null
}
</script>

<template>
  <div :class="['pc-heatmap', { 'pc-heatmap--tooltip': tooltip }]" :style="rootStyle">
    <div v-if="label" class="pc-heatmap__label">{{ label }}</div>

    <div class="pc-heatmap__months">
      <span
        v-for="ml in monthLabels"
        :key="ml.col"
        class="pc-heatmap__month"
        :style="{ left: `calc(${ml.col} * (var(--pc-hm-cell) + var(--pc-hm-gap)))` }"
      >{{ ml.text }}</span>
    </div>

    <div class="pc-heatmap__body">
      <div class="pc-heatmap__weekdays">
        <span v-for="(wd, i) in WEEKDAYS" :key="i" class="pc-heatmap__weekday">{{ wd }}</span>
      </div>

      <div class="pc-heatmap__grid">
        <div v-for="(col, ci) in columns" :key="ci" class="pc-heatmap__col">
          <span
            v-for="day in col.days"
            :key="day.key"
            :class="[
              'pc-heatmap__cell',
              day.future ? 'pc-heatmap__cell--empty' : `pc-heatmap__cell--l${day.level}`,
            ]"
            @mouseenter="onCellEnter(day, $event)"
            @mouseleave="onCellLeave"
          />
        </div>
      </div>
    </div>

    <div v-if="showLegend" class="pc-heatmap__legend">
      <span class="pc-heatmap__legend-text">Less</span>
      <span class="pc-heatmap__cell pc-heatmap__cell--l0" />
      <span class="pc-heatmap__cell pc-heatmap__cell--l1" />
      <span class="pc-heatmap__cell pc-heatmap__cell--l2" />
      <span class="pc-heatmap__cell pc-heatmap__cell--l3" />
      <span class="pc-heatmap__cell pc-heatmap__cell--l4" />
      <span class="pc-heatmap__legend-text">More</span>
    </div>

    <Teleport to="body">
      <div
        v-if="hoverDay"
        ref="tipRef"
        class="pc-heatmap__tip"
        role="tooltip"
        :style="[floatingStyles, { opacity: isPositioned ? 1 : 0 }]"
      >
        <span class="pc-heatmap__tip-value">
          {{ unit ? `${hoverDay.value} ${unit}` : hoverDay.value }}
        </span>
        <span class="pc-heatmap__tip-date">{{ prettyDate(hoverDay.dt) }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pc-heatmap {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}
.pc-heatmap__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
  margin-bottom: 2px;
}

/* month strip - labels absolutely placed over the columns */
.pc-heatmap__months {
  position: relative;
  height: 13px;
  margin-left: calc(28px);
}
.pc-heatmap__month {
  position: absolute;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  white-space: nowrap;
}

.pc-heatmap__body { display: flex; gap: 6px; }

.pc-heatmap__weekdays {
  width: 22px;
  display: flex;
  flex-direction: column;
  gap: var(--pc-hm-gap);
}
.pc-heatmap__weekday {
  height: var(--pc-hm-cell);
  display: flex;
  align-items: center;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  line-height: 1;
}

.pc-heatmap__grid { display: flex; gap: var(--pc-hm-gap); }
.pc-heatmap__col { display: flex; flex-direction: column; gap: var(--pc-hm-gap); }

.pc-heatmap__cell {
  width: var(--pc-hm-cell);
  height: var(--pc-hm-cell);
  border-radius: 2px;
  background: var(--ink-04);
  transition: box-shadow 120ms ease;
}
.pc-heatmap__cell--empty { background: transparent; }
.pc-heatmap__cell--l0 { background: var(--ink-04); }
.pc-heatmap__cell--l1 { background: color-mix(in srgb, var(--lavender) 32%, var(--paper)); }
.pc-heatmap__cell--l2 { background: color-mix(in srgb, var(--lavender) 58%, var(--paper)); }
.pc-heatmap__cell--l3 { background: color-mix(in srgb, var(--lavender) 86%, var(--paper)); }
.pc-heatmap__cell--l4 { background: color-mix(in srgb, var(--lavender) 78%, var(--midnight)); }
.pc-heatmap--tooltip .pc-heatmap__grid .pc-heatmap__cell:not(.pc-heatmap__cell--empty):hover {
  box-shadow: inset 0 0 0 1.5px var(--ink-20);
}

.pc-heatmap__legend {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
  margin-left: 28px;
}
.pc-heatmap__legend .pc-heatmap__cell { transition: none; }
.pc-heatmap__legend-text {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
  padding: 0 4px;
}

/* shared hover tooltip */
.pc-heatmap__tip {
  position: absolute;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--midnight);
  color: var(--paper-on-dark);
  padding: 5px 9px;
  border-radius: var(--radius-sharp);
  box-shadow: var(--shadow-soft);
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 90ms ease;
}
.pc-heatmap__tip-value {
  font-family: var(--display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.12px;
}
.pc-heatmap__tip-date {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 9px;
  color: var(--paper-on-dark-60);
}
</style>
