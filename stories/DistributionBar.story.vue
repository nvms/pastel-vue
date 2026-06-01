<script setup>
import DistributionBar from "../src/components/DistributionBar.vue"
import Card from "../src/components/Card.vue"

const caseload = [
  { label: "Intake", value: 34 },
  { label: "In review", value: 52 },
  { label: "Awaiting client", value: 28 },
  { label: "Closed", value: 19 },
]

const storage = [
  { label: "Documents", value: 6.4 },
  { label: "Exports", value: 2.1 },
  { label: "Backups", value: 1.3 },
  { label: "Free", value: 10.2, color: "#ececf2" },
]

const split = [
  { label: "Billable", value: 68 },
  { label: "Non-billable", value: 32 },
]

const practice = [
  { label: "Litigation", value: 42, note: "18 active matters, 3 in trial prep" },
  { label: "Corporate", value: 31, note: "12 active matters" },
  { label: "Real estate", value: 18, note: "7 active matters" },
  { label: "Estate", value: 9, note: "4 active matters" },
]
</script>

<template>
  <Story title="DistributionBar">
    <Variant title="Caseload">
      <Card padded style="max-width: 520px;">
        <DistributionBar label="Matters by stage" :segments="caseload" />
      </Card>
    </Variant>

    <Variant title="Custom value format">
      <Card padded style="max-width: 520px;">
        <DistributionBar
          label="Storage used"
          :segments="storage"
          :value-format="(v) => `${v} GB`"
        />
      </Card>
    </Variant>

    <Variant title="Two segments">
      <Card padded style="max-width: 520px;">
        <DistributionBar label="Hours this week" :segments="split" />
      </Card>
    </Variant>

    <Variant title="Taller bar, no legend">
      <Card padded style="max-width: 520px;">
        <DistributionBar :segments="caseload" :height="24" :show-legend="false" />
      </Card>
    </Variant>

    <Variant title="With tooltips">
      <Card padded style="max-width: 520px;">
        <DistributionBar label="Matters by stage" :segments="caseload" tooltip />
      </Card>
      <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
        Hover any segment for its tooltip.
      </p>
    </Variant>

    <Variant title="Custom tooltip content">
      <Card padded style="max-width: 520px;">
        <DistributionBar label="Practice mix" :segments="practice" tooltip>
          <template #tooltip="{ segment }">
            <span style="font-family: var(--display); font-size: 12px; font-weight: 500; letter-spacing: -0.12px;">
              {{ segment.label }} &middot; {{ segment.display }}
            </span>
            <span style="font-size: 11px; color: var(--paper-on-dark-60); line-height: 1.4;">
              {{ segment.raw.note }}
            </span>
          </template>
        </DistributionBar>
      </Card>
    </Variant>
  </Story>
</template>
