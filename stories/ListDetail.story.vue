<script setup>
import { ref, computed } from "vue"
import ListDetail from "../src/components/ListDetail.vue"
import Button from "../src/components/Button.vue"
import Badge from "../src/components/Badge.vue"
import SectionLabel from "../src/components/SectionLabel.vue"
import MonoLabel from "../src/components/MonoLabel.vue"

const rules = [
  {
    id: "notice-5-day",
    group: "Notice periods",
    title: "5-Day Notice (Non-Payment)",
    summary: "Tenant must be served a 5-day notice to pay or vacate before a Special Detainer action can be filed.",
    citation: "ARS § 33-1368(B)",
    citationHref: "https://example.gov/ars/33-1368",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { days: 5, action: "pay-or-vacate" },
    lastEdited: "2026-02-11",
  },
  {
    id: "method-service",
    group: "Methods of service",
    title: "Method of service",
    summary: "Hand-delivered through a licensed process server. Maricopa requires hand filing with the court.",
    citation: "AZ R. CIV. P. 4.1",
    citationHref: "https://example.gov/azcivp/4.1",
    citationSource: "Maricopa County Justice Court - Local Rules",
    audience: "Attorney",
    structured: { primary: "personal", mustHandFile: true },
    lastEdited: "2026-02-14",
  },
  {
    id: "filing-venue",
    group: "Filing venues",
    title: "Filing venue",
    summary: "Filed in the Maricopa County Justice Court precinct that contains the rental property.",
    citation: "ARS § 22-201",
    citationHref: "https://example.gov/ars/22-201",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { court: "Justice Court", precinctRule: "rental-property-location" },
    lastEdited: "2026-01-30",
  },
  {
    id: "filing-fee",
    group: "Fees",
    title: "Filing fee",
    summary: "Special Detainer filing fee is $35 in Maricopa County Justice Court.",
    citation: "Maricopa Court Fee Schedule",
    citationHref: "https://example.gov/maricopa/fees",
    citationSource: "Maricopa County Justice Court - Fee Schedule",
    audience: "Attorney",
    structured: { amountUSD: 35, court: "Maricopa Justice Court" },
    lastEdited: "2026-02-02",
  },
  {
    id: "service-fee",
    group: "Fees",
    title: "Service fee",
    summary: "Process server fees vary by county - Maricopa licensed servers typically charge $75 - $125 per attempt.",
    citation: "Maricopa Process Server Rates",
    citationHref: "https://example.gov/maricopa/server-fees",
    citationSource: "Maricopa Process Server Association",
    audience: "Attorney",
    structured: { lowUSD: 75, highUSD: 125, perAttempt: true },
    lastEdited: "2026-02-08",
  },
  {
    id: "notice-10-day",
    group: "Notice periods",
    title: "10-Day Notice (Lease Violation)",
    summary: "For material breach of lease that is curable, tenant must be given 10 days to cure.",
    citation: "ARS § 33-1368(A)",
    citationHref: "https://example.gov/ars/33-1368-a",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { days: 10, action: "cure-or-quit" },
    lastEdited: "2026-01-21",
  },
  {
    id: "notice-immediate",
    group: "Notice periods",
    title: "Immediate Notice (Material/Irreparable)",
    summary: "Tenant may be served an immediate notice to vacate for irreparable breach (illegal drug activity, gang activity).",
    citation: "ARS § 33-1368(A)(2)",
    citationHref: "https://example.gov/ars/33-1368-a-2",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { days: 0, action: "vacate-immediately" },
    lastEdited: "2026-01-18",
  },
  {
    id: "method-posting",
    group: "Methods of service",
    title: "Posting and mailing",
    summary: "If personal service is attempted and unsuccessful, the notice may be posted in a conspicuous place and mailed by certified mail.",
    citation: "ARS § 33-1313",
    citationHref: "https://example.gov/ars/33-1313",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { primary: "posting", requiresPriorAttempt: true, mailing: "certified" },
    lastEdited: "2026-02-04",
  },
  {
    id: "method-alternate",
    group: "Methods of service",
    title: "Alternate service",
    summary: "Court-approved alternate service may be permitted if other methods fail. Requires motion and judicial order.",
    citation: "AZ R. CIV. P. 4.1(m)",
    citationHref: "https://example.gov/azcivp/4.1m",
    citationSource: "Arizona Rules of Civil Procedure",
    audience: "Attorney",
    structured: { primary: "alternate", requiresMotion: true },
    lastEdited: "2026-02-01",
  },
  {
    id: "venue-justice",
    group: "Filing venues",
    title: "Justice court jurisdiction",
    summary: "Justice court has jurisdiction over Special Detainer actions where the monthly rent is less than $25,000.",
    citation: "ARS § 22-201(B)",
    citationHref: "https://example.gov/ars/22-201-b",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { courtType: "Justice", monthlyRentCapUSD: 25000 },
    lastEdited: "2026-02-09",
  },
  {
    id: "venue-superior",
    group: "Filing venues",
    title: "Superior court venue",
    summary: "Superior court is the venue when rent exceeds $25,000/month or for cases involving title to real property.",
    citation: "ARS § 12-1175",
    citationHref: "https://example.gov/ars/12-1175",
    citationSource: "Arizona Revised Statutes",
    audience: "Attorney",
    structured: { courtType: "Superior", monthlyRentFloorUSD: 25000 },
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

const selectedId = ref("method-service")
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
