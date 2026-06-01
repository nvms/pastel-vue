<script setup>
import { ref, computed } from "vue"
import ListDetail from "../src/components/ListDetail.vue"
import Button from "../src/components/Button.vue"
import Badge from "../src/components/Badge.vue"
import SectionLabel from "../src/components/SectionLabel.vue"
import MonoLabel from "../src/components/MonoLabel.vue"

const rules = [
  {
    id: "cook-poultry",
    group: "Cook temperatures",
    title: "Poultry - 165°F",
    summary: "Poultry must reach an internal temperature of 165°F, held for at least 15 seconds, before it goes out for service.",
    citation: "FDA Food Code § 3-401.11(A)(2)",
    citationHref: "https://example.com/foodcode/3-401-11",
    citationSource: "FDA 2022 Food Code",
    audience: "Line cook",
    structured: { tempF: 165, holdSeconds: 15 },
    lastEdited: "2026-02-11",
  },
  {
    id: "cool-two-stage",
    group: "Cooling & holding",
    title: "Two-stage cooling",
    summary: "Cooked food must cool from 135°F to 70°F within 2 hours, then from 70°F to 41°F within 4 more hours.",
    citation: "FDA Food Code § 3-501.14",
    citationHref: "https://example.com/foodcode/3-501-14",
    citationSource: "FDA 2022 Food Code",
    audience: "Line cook",
    structured: { stageOne: "135F-to-70F-in-2h", stageTwo: "70F-to-41F-in-4h" },
    lastEdited: "2026-02-14",
  },
  {
    id: "store-raw-below",
    group: "Storage & separation",
    title: "Raw below ready-to-eat",
    summary: "Store raw animal foods on the lowest shelves, below and away from ready-to-eat foods, to prevent cross-contamination.",
    citation: "FDA Food Code § 3-302.11(A)",
    citationHref: "https://example.com/foodcode/3-302-11",
    citationSource: "FDA 2022 Food Code",
    audience: "Kitchen manager",
    structured: { rule: "raw-below-ready-to-eat", shelf: "lowest" },
    lastEdited: "2026-01-30",
  },
  {
    id: "cost-plate",
    group: "Costing",
    title: "Plate cost target",
    summary: "Target food cost is 28-32% of menu price. Flag any dish above the band for a recipe or pricing review.",
    citation: "Culinary standards handbook - Costing",
    citationHref: "https://example.com/handbook/costing",
    citationSource: "Culinary standards handbook",
    audience: "Sous chef",
    structured: { lowPct: 28, highPct: 32 },
    lastEdited: "2026-02-02",
  },
  {
    id: "cost-waste",
    group: "Costing",
    title: "Trim and waste allowance",
    summary: "Build a 4-6% trim-and-waste allowance into each recipe yield so plated portions stay on spec.",
    citation: "Culinary standards handbook - Yields",
    citationHref: "https://example.com/handbook/yields",
    citationSource: "Culinary standards handbook",
    audience: "Sous chef",
    structured: { lowPct: 4, highPct: 6, perRecipe: true },
    lastEdited: "2026-02-08",
  },
  {
    id: "cook-ground",
    group: "Cook temperatures",
    title: "Ground meat - 155°F",
    summary: "Ground beef and other comminuted meats must reach 155°F, held for 17 seconds, before service.",
    citation: "FDA Food Code § 3-401.11(A)(1)",
    citationHref: "https://example.com/foodcode/3-401-11-a-1",
    citationSource: "FDA 2022 Food Code",
    audience: "Line cook",
    structured: { tempF: 155, holdSeconds: 17 },
    lastEdited: "2026-01-21",
  },
  {
    id: "cook-whole",
    group: "Cook temperatures",
    title: "Whole cuts - 145°F",
    summary: "Whole cuts of beef and pork must reach 145°F, held for 15 seconds, then rest for at least 3 minutes off the heat.",
    citation: "FDA Food Code § 3-401.11(B)",
    citationHref: "https://example.com/foodcode/3-401-11-b",
    citationSource: "FDA 2022 Food Code",
    audience: "Sous chef",
    structured: { tempF: 145, holdSeconds: 15, restMinutes: 3 },
    lastEdited: "2026-01-18",
  },
  {
    id: "hold-hot",
    group: "Cooling & holding",
    title: "Hot holding - 135°F",
    summary: "Hot foods on the line must be held at 135°F or above. Check and log temperatures every two hours.",
    citation: "FDA Food Code § 3-501.16(A)(1)",
    citationHref: "https://example.com/foodcode/3-501-16-a-1",
    citationSource: "FDA 2022 Food Code",
    audience: "Line cook",
    structured: { minTempF: 135, logEveryHours: 2 },
    lastEdited: "2026-02-04",
  },
  {
    id: "hold-cold",
    group: "Cooling & holding",
    title: "Cold holding - 41°F",
    summary: "Cold foods must be held at 41°F or below in the rail and walk-in. Pull and chill anything that drifts above.",
    citation: "FDA Food Code § 3-501.16(A)(2)",
    citationHref: "https://example.com/foodcode/3-501-16-a-2",
    citationSource: "FDA 2022 Food Code",
    audience: "Line cook",
    structured: { maxTempF: 41, applies: "rail-and-walk-in" },
    lastEdited: "2026-02-01",
  },
  {
    id: "store-date-mark",
    group: "Storage & separation",
    title: "Date marking (FIFO)",
    summary: "Ready-to-eat food held more than 24 hours must be date-marked and used within 7 days, counting the prep day as day one.",
    citation: "FDA Food Code § 3-501.17",
    citationHref: "https://example.com/foodcode/3-501-17",
    citationSource: "FDA 2022 Food Code",
    audience: "Kitchen manager",
    structured: { maxDays: 7, label: "date-mark", rotation: "FIFO" },
    lastEdited: "2026-02-09",
  },
  {
    id: "store-allergen",
    group: "Storage & separation",
    title: "Allergen separation",
    summary: "Keep the nine major allergens segregated in storage and label every decanted container with its contents.",
    citation: "ServSafe Manager Manual - Allergens",
    citationHref: "https://example.com/servsafe/allergens",
    citationSource: "ServSafe Manager Manual",
    audience: "Kitchen manager",
    structured: { allergens: 9, labeling: "required" },
    lastEdited: "2026-01-25",
  },
]

const grouped = computed(() => {
  const order = []
  const by = new Map()
  for (const r of rules) {
    if (!by.has(r.group)) {
      by.set(r.group, [])
      order.push(r.group)
    }
    by.get(r.group).push(r)
  }
  return order.map((g) => ({ group: g, items: by.get(g) }))
})

const selectedId = ref("cool-two-stage")
const selected = computed(() => rules.find((r) => r.id === selectedId.value) || null)
</script>

<template>
  <Story title="ListDetail">
    <Variant title="Rule browser">
      <ListDetail list-width="42%" height="640px">
        <template #list>
          <div class="rules-list">
            <section v-for="g in grouped" :key="g.group">
              <SectionLabel>{{ g.group }}</SectionLabel>
              <div class="rules-list__items">
                <button
                  v-for="r in g.items"
                  :key="r.id"
                  type="button"
                  :class="['rule-card', { 'rule-card--active': r.id === selectedId }]"
                  @click="selectedId = r.id"
                >
                  <div class="rule-card__title">{{ r.title }}</div>
                  <div class="rule-card__summary">{{ r.summary }}</div>
                  <div class="rule-card__meta">
                    <MonoLabel as="span" class="rule-card__cite">{{ r.citation }}</MonoLabel>
                    <Badge variant="active">{{ r.audience }}</Badge>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </template>

        <template #detail>
          <div v-if="selected" class="rule-detail">
            <header class="rule-detail__head">
              <div>
                <MonoLabel>Rule detail</MonoLabel>
                <h2 class="rule-detail__title">{{ selected.title }}</h2>
              </div>
              <div class="rule-detail__actions">
                <Button variant="outline" size="sm" icon="lucide:pencil">Edit rule</Button>
              </div>
            </header>

            <section class="rule-detail__section">
              <MonoLabel>Summary</MonoLabel>
              <p class="rule-detail__summary">{{ selected.summary }}</p>
            </section>

            <section class="rule-detail__section">
              <MonoLabel>Structured value</MonoLabel>
              <dl class="kv">
                <div v-for="(v, k) in selected.structured" :key="k" class="kv__row">
                  <dt class="kv__key">{{ k }}</dt>
                  <dd class="kv__val">{{ v }}</dd>
                </div>
              </dl>
            </section>

            <section class="rule-detail__section">
              <MonoLabel>Citation</MonoLabel>
              <div class="citation">
                <a :href="selected.citationHref" target="_blank" rel="noreferrer" class="citation__primary">
                  {{ selected.citation }}
                </a>
                <div class="citation__source">↪ {{ selected.citationSource }}</div>
              </div>
            </section>

            <footer class="rule-detail__footer">
              <MonoLabel>Last edited {{ selected.lastEdited }}</MonoLabel>
            </footer>
          </div>
        </template>
      </ListDetail>
    </Variant>
  </Story>
</template>

<style scoped>
.rules-list { display: flex; flex-direction: column; gap: 22px; }
.rules-list__items { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

.rule-card {
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-comfy);
  padding: 12px 14px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  outline: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rule-card:hover { background: var(--ink-04); }
.rule-card:focus-visible { box-shadow: var(--focus-ring); }
.rule-card--active {
  background: var(--paper);
  border-color: var(--midnight);
  box-shadow: 0 0 0 1px var(--midnight);
}

.rule-card__title {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--ink);
}
.rule-card__summary {
  font-size: 13px;
  line-height: 1.45;
  color: var(--ink-60);
  letter-spacing: -0.13px;
}
.rule-card__meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.rule-card__cite {
  padding: 2px 6px;
  background: var(--ink-04);
  border-radius: var(--badge-radius);
}

.rule-detail { display: flex; flex-direction: column; gap: 20px; }
.rule-detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.rule-detail__title {
  margin: 6px 0 0;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.56px;
  line-height: 1.15;
  color: var(--ink);
}
.rule-detail__actions { flex-shrink: 0; }
.rule-detail__section { display: flex; flex-direction: column; gap: 8px; }
.rule-detail__summary {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: -0.15px;
  color: var(--ink);
}

.kv {
  margin: 0;
  display: flex;
  flex-direction: column;
  background: var(--ink-04);
  border-radius: var(--radius-sharp);
  overflow: hidden;
}
.kv__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--paper);
}
.kv__row:last-child { border-bottom: 0; }
.kv__key {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-60);
}
.kv__val {
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
}

.citation {
  background: var(--ink-04);
  border-radius: var(--radius-sharp);
  padding: 10px 12px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.citation__primary { color: var(--ink); text-decoration: none; }
.citation__primary:hover { text-decoration: underline; }
.citation__source { font-size: 12px; color: var(--ink-60); }

.rule-detail__footer { margin-top: 4px; }
</style>
