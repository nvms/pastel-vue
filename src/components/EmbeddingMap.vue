<script setup>
import { ref, computed } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"

const props = defineProps({
  // points: [{ x, y, label?, cluster? }] - x/y are pre-reduced coordinates
  points: { type: Array, default: () => [] },
  // optional highlighted query point: { x, y, label? }
  query: { type: Object, default: null },
  // indices into `points` to draw as the query's nearest neighbours
  neighbors: { type: Array, default: () => [] },
  width: { type: Number, default: 480 },
  height: { type: Number, default: 320 },
  showLegend: { type: Boolean, default: true },
})

const PALETTE = ["#bdbbff", "#a3c4f3", "#f6b8dd", "#9fd9bd", "#ffcd94", "#c9b6ec"]
const PAD = 20

const allPts = computed(() =>
  props.query ? [...props.points, props.query] : props.points,
)

const bounds = computed(() => {
  const pts = allPts.value
  if (!pts.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  return { minX, maxX, minY, maxY }
})

const project = (p) => {
  const b = bounds.value
  const w = props.width - PAD * 2
  const h = props.height - PAD * 2
  const sx = b.maxX - b.minX || 1
  const sy = b.maxY - b.minY || 1
  return {
    x: PAD + ((p.x - b.minX) / sx) * w,
    y: PAD + (1 - (p.y - b.minY) / sy) * h,
  }
}

const clusterColors = computed(() => {
  const map = {}
  let i = 0
  for (const p of props.points) {
    if (p.cluster != null && !(p.cluster in map)) {
      map[p.cluster] = PALETTE[i % PALETTE.length]
      i++
    }
  }
  return map
})
const colorOf = (p) => (p.cluster != null ? clusterColors.value[p.cluster] : PALETTE[0])

const plotted = computed(() =>
  props.points.map((p, i) => ({ ...p, ...project(p), color: colorOf(p), index: i })),
)
const plottedQuery = computed(() =>
  props.query ? { ...props.query, ...project(props.query) } : null,
)
const neighborLines = computed(() => {
  if (!plottedQuery.value) return []
  return props.neighbors
    .map((idx) => plotted.value[idx])
    .filter(Boolean)
    .map((n) => ({ x1: plottedQuery.value.x, y1: plottedQuery.value.y, x2: n.x, y2: n.y }))
})
const legend = computed(() =>
  Object.entries(clusterColors.value).map(([name, color]) => ({ name, color })),
)

// shared hover tooltip
const hoverPt = ref(null)
const hoverEl = ref(null)
const tipRef = ref(null)
const { floatingStyles, isPositioned } = useFloating(hoverEl, tipRef, {
  placement: "top",
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
})
const onEnter = (pt, e) => {
  hoverPt.value = pt
  hoverEl.value = e.currentTarget
}
const onLeave = () => {
  hoverPt.value = null
  hoverEl.value = null
}
</script>

<template>
  <div class="pc-embmap">
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="pc-embmap__svg"
    >
      <!-- neighbour links -->
      <line
        v-for="(ln, i) in neighborLines"
        :key="`n${i}`"
        :x1="ln.x1"
        :y1="ln.y1"
        :x2="ln.x2"
        :y2="ln.y2"
        class="pc-embmap__link"
      />

      <!-- points -->
      <circle
        v-for="pt in plotted"
        :key="pt.index"
        :cx="pt.x"
        :cy="pt.y"
        r="5"
        :fill="pt.color"
        class="pc-embmap__point"
        @mouseenter="onEnter(pt, $event)"
        @mouseleave="onLeave"
      />

      <!-- query point -->
      <template v-if="plottedQuery">
        <circle
          :cx="plottedQuery.x"
          :cy="plottedQuery.y"
          r="12"
          class="pc-embmap__query-ring"
        />
        <circle
          :cx="plottedQuery.x"
          :cy="plottedQuery.y"
          r="7"
          class="pc-embmap__query"
          @mouseenter="onEnter(plottedQuery, $event)"
          @mouseleave="onLeave"
        />
      </template>
    </svg>

    <div v-if="showLegend && legend.length" class="pc-embmap__legend">
      <div v-for="c in legend" :key="c.name" class="pc-embmap__legend-item">
        <span class="pc-embmap__legend-dot" :style="{ background: c.color }" />
        <span class="pc-embmap__legend-name">{{ c.name }}</span>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hoverPt"
        ref="tipRef"
        class="pc-embmap__tip"
        role="tooltip"
        :style="[floatingStyles, { opacity: isPositioned ? 1 : 0 }]"
      >
        <span class="pc-embmap__tip-label">{{ hoverPt.label || "Point" }}</span>
        <span v-if="hoverPt.cluster != null" class="pc-embmap__tip-cluster">
          {{ hoverPt.cluster }}
        </span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pc-embmap {
  display: inline-flex;
  flex-direction: column;
  gap: 14px;
}
.pc-embmap__svg {
  display: block;
  background: var(--ink-04);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
}

.pc-embmap__link {
  stroke: var(--ink-20);
  stroke-width: 1.5;
}
.pc-embmap__point {
  cursor: pointer;
  stroke: var(--paper);
  stroke-width: 1.5;
  transition: r 100ms ease;
}
.pc-embmap__point:hover { stroke: var(--ink-40); }

.pc-embmap__query-ring {
  fill: none;
  stroke: var(--midnight);
  stroke-opacity: 0.25;
  stroke-width: 1.5;
}
.pc-embmap__query {
  fill: var(--midnight);
  stroke: var(--paper);
  stroke-width: 2;
  cursor: pointer;
}

.pc-embmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
}
.pc-embmap__legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
.pc-embmap__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pc-embmap__legend-name {
  font-size: 13px;
  color: var(--ink-60);
  letter-spacing: -0.13px;
}

.pc-embmap__tip {
  position: absolute;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--midnight);
  color: var(--paper-on-dark);
  padding: 7px 10px;
  border-radius: var(--radius-sharp);
  box-shadow: var(--shadow-medium);
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 90ms ease;
}
.pc-embmap__tip-label {
  font-family: var(--display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.12px;
}
.pc-embmap__tip-cluster {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 9px;
  color: var(--paper-on-dark-60);
}
</style>
