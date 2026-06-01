<script setup>
import EntityCard from "../src/components/EntityCard.vue"

const venues = [
  {
    monogram: "CO", title: "Denver, CO", subtitle: "West Kitchen",
    status: "active", statusVariant: "active",
    metrics: [
      { label: "Standards", value: 8 },
      { label: "On the menu", value: 16 },
      { label: "Recipes version", value: "v3", mono: true },
    ],
    footer: "Chef sign-off: Theodora Whitfield",
  },
  {
    monogram: "AZ", title: "Phoenix, AZ", subtitle: "Desert Venue",
    status: "active", statusVariant: "active",
    metrics: [
      { label: "Standards", value: 12 },
      { label: "On the menu", value: 0 },
      { label: "Recipes version", value: "v7", mono: true },
    ],
    footer: "Chef sign-off: Marisol Reyna",
  },
  {
    monogram: "TN", title: "Nashville, TN", subtitle: "Music Row",
    status: "draft", statusVariant: "draft",
    metrics: [
      { label: "Standards", value: 3 },
      { label: "On the menu", value: 0 },
      { label: "Recipes version", value: "-", mono: true },
    ],
    footer: "Not yet signed off",
  },
]
</script>

<template>
  <Story title="EntityCard">
    <Variant title="Venue card (reproduction)">
      <div style="max-width: 360px;">
        <EntityCard v-bind="venues[0]" interactive />
      </div>
    </Variant>

    <Variant title="Grid of cards">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        <EntityCard
          v-for="j in venues"
          :key="j.title"
          v-bind="j"
          :gradient="j.status === 'active'"
          interactive
        />
      </div>
    </Variant>

    <Variant title="Custom monogram colors">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        <EntityCard
          monogram="NY"
          title="New York, NY"
          subtitle="Union Station"
          status="active"
          status-variant="active"
          monogram-bg="#010120"
          monogram-color="#ffffff"
          :metrics="[
            { label: 'Standards', value: 32 },
            { label: 'On the menu', value: 184 },
            { label: 'Recipes version', value: 'v9', mono: true },
          ]"
          footer="Chef sign-off: Ezekiel Vanderhoof"
        />
        <EntityCard
          monogram="WA"
          title="Seattle, WA"
          subtitle="Pike Place"
          status="active"
          status-variant="active"
          monogram-bg="#ef2cc1"
          monogram-color="#ffffff"
          :metrics="[
            { label: 'Standards', value: 14 },
            { label: 'On the menu', value: 42 },
            { label: 'Recipes version', value: 'v4', mono: true },
          ]"
          footer="Chef sign-off: Imani Hollingsworth"
        />
      </div>
    </Variant>

    <Variant title="Custom footer slot">
      <div style="max-width: 360px;">
        <EntityCard
          monogram="OR"
          title="Portland, OR"
          subtitle="Pearl District"
          status="active"
          status-variant="active"
          :metrics="[
            { label: 'Standards', value: 21 },
            { label: 'On the menu', value: 9 },
            { label: 'Recipes version', value: 'v5', mono: true },
          ]"
        >
          <template #footer>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--status-active);" />
              Synced 4 minutes ago
            </span>
          </template>
        </EntityCard>
      </div>
    </Variant>

    <Variant title="Many metrics - card grows with its container">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- wide container: 6 metrics, long labels, no wrapping -->
        <div style="max-width: 620px;">
          <EntityCard
            monogram="CO"
            title="Denver, CO"
            subtitle="West Kitchen"
            status="active"
            status-variant="active"
            :metrics="[
              { label: 'Standards', value: 8 },
              { label: 'Dishes on the menu this quarter', value: 16 },
              { label: 'Recipes version', value: 'v3', mono: true },
              { label: 'Prep cards', value: 12 },
              { label: 'Average days from draft to menu', value: 21 },
              { label: 'Eval pass', value: '96%' },
            ]"
            footer="Chef sign-off: Theodora Whitfield"
          />
        </div>

        <!-- narrow container with long labels: drop to 2 columns so they fit -->
        <div style="max-width: 360px;">
          <EntityCard
            monogram="AZ"
            title="Phoenix, AZ"
            subtitle="Desert Venue"
            status="active"
            status-variant="active"
            :metric-columns="2"
            :metrics="[
              { label: 'Standards', value: 12 },
              { label: 'Dishes on the menu this quarter', value: 9 },
              { label: 'Average days from draft to menu', value: 18 },
              { label: 'Eval pass rate', value: '94%' },
            ]"
            footer="Chef sign-off: Marisol Reyna"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>

