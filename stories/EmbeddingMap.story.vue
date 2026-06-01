<script setup>
import EmbeddingMap from "../src/components/EmbeddingMap.vue"
import Card from "../src/components/Card.vue"

// deterministic clustered points so the story is stable across reloads
const build = () => {
  let s = 98765
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
  const clusters = [
    { name: "Recipes", cx: 0.26, cy: 0.68 },
    { name: "Prep cards", cx: 0.72, cy: 0.62 },
    { name: "Food-safety standards", cx: 0.5, cy: 0.24 },
  ]
  const pts = []
  clusters.forEach((c) => {
    for (let i = 0; i < 16; i++) {
      pts.push({
        x: c.cx + (rnd() - 0.5) * 0.3,
        y: c.cy + (rnd() - 0.5) * 0.3,
        cluster: c.name,
        label: `${c.name} · doc ${i + 1}`,
      })
    }
  })
  return pts
}

const points = build()
const query = { x: 0.44, y: 0.58, label: "Query: braising steps" }
const neighbors = points
  .map((p, i) => ({ i, d: (p.x - query.x) ** 2 + (p.y - query.y) ** 2 }))
  .sort((a, b) => a.d - b.d)
  .slice(0, 6)
  .map((o) => o.i)

const plain = points.map((p) => ({ x: p.x, y: p.y, label: p.label }))
</script>

<template>
  <Story title="EmbeddingMap">
    <Variant title="Clustered">
      <Card padded style="display: inline-block;">
        <EmbeddingMap :points="points" />
      </Card>
    </Variant>

    <Variant title="Query + nearest neighbours">
      <Card padded style="display: inline-block;">
        <EmbeddingMap :points="points" :query="query" :neighbors="neighbors" />
      </Card>
    </Variant>

    <Variant title="No clusters">
      <Card padded style="display: inline-block;">
        <EmbeddingMap :points="plain" :width="420" :height="280" />
      </Card>
    </Variant>
  </Story>
</template>
