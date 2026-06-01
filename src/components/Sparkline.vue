<script setup>
import { computed } from "vue"

const props = defineProps({
  data: { type: Array, default: () => [] },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 36 },
  strokeWidth: { type: Number, default: 2 },
  variant: { type: String, default: "default" }, // default | lavender | success | warning | danger
  // soft gradient fill under the line
  area: { type: Boolean, default: true },
  // dot on the most recent point
  dot: { type: Boolean, default: true },
  // span the full width edge-to-edge (no horizontal inset) - for background fills
  bleed: { type: Boolean, default: false },
  // override the value range - otherwise derived from the data
  min: { type: Number, default: null },
  max: { type: Number, default: null },
})

let _uid = 0
const gid = `pc-spark-grad-${++_uid}`

const points = computed(() => {
  const d = props.data
  if (!d.length) return []
  const lo = props.min != null ? props.min : Math.min(...d)
  const hi = props.max != null ? props.max : Math.max(...d)
  const span = hi - lo || 1
  const pad = props.strokeWidth + 1
  const hPad = props.bleed ? 0 : pad
  const innerW = props.width - hPad * 2
  const innerH = props.height - pad * 2
  const n = d.length
  return d.map((v, i) => ({
    x: hPad + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: pad + (1 - (v - lo) / span) * innerH,
  }))
})

// catmull-rom smoothing -> cubic bezier segments
const linePath = computed(() => {
  const p = points.value
  if (!p.length) return ""
  if (p.length === 1) return `M ${p[0].x} ${p[0].y}`
  const t = 0.18
  let d = `M ${p[0].x} ${p[0].y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
})

const areaPath = computed(() => {
  const p = points.value
  if (p.length < 2) return ""
  return `${linePath.value} L ${p[p.length - 1].x} ${props.height} L ${p[0].x} ${props.height} Z`
})

const lastPoint = computed(() => points.value[points.value.length - 1] || null)
</script>

<template>
  <svg
    :class="['pc-spark', `pc-spark--${variant}`]"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    role="img"
  >
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
        <stop class="pc-spark__stop-top" offset="0" />
        <stop class="pc-spark__stop-bot" offset="1" />
      </linearGradient>
    </defs>
    <path v-if="area && areaPath" :d="areaPath" class="pc-spark__area" :fill="`url(#${gid})`" />
    <path
      :d="linePath"
      class="pc-spark__line"
      :stroke-width="strokeWidth"
      fill="none"
    />
    <circle
      v-if="dot && !bleed && lastPoint"
      :cx="lastPoint.x"
      :cy="lastPoint.y"
      :r="strokeWidth + 1"
      class="pc-spark__dot"
    />
  </svg>
</template>

<style scoped>
.pc-spark { display: block; }

.pc-spark--default { --pc-spark-color: var(--midnight); }
.pc-spark--lavender { --pc-spark-color: var(--lavender); }
.pc-spark--success { --pc-spark-color: color-mix(in srgb, var(--status-active) 70%, white); }
.pc-spark--warning { --pc-spark-color: color-mix(in srgb, var(--status-warning) 70%, white); }
.pc-spark--danger  { --pc-spark-color: color-mix(in srgb, var(--status-failed) 70%, white); }

.pc-spark__line {
  stroke: var(--pc-spark-color);
  stroke-linecap: round;
  stroke-linejoin: round;
}
.pc-spark__area { stroke: none; }
.pc-spark__stop-top { stop-color: var(--pc-spark-color); stop-opacity: 0.22; }
.pc-spark__stop-bot { stop-color: var(--pc-spark-color); stop-opacity: 0; }

.pc-spark__dot {
  fill: var(--pc-spark-color);
  stroke: var(--paper);
  stroke-width: 1.5;
}
</style>
