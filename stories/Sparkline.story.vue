<script setup>
import Sparkline from "../src/components/Sparkline.vue"
import Card from "../src/components/Card.vue"

const climbing = [4, 6, 5, 8, 7, 11, 10, 14, 13, 18, 22, 21, 26]
const dipping = [28, 26, 27, 22, 24, 19, 20, 15, 16, 12, 9, 11, 7]
const choppy = [12, 18, 9, 22, 14, 27, 11, 25, 16, 30, 13, 24, 19]
const calm = [14, 15, 14, 16, 15, 16, 15, 17, 16, 17, 16, 18, 17]

// soft per-variant pastel gradient wash for the full-bleed background cards,
// in the spirit of the Callout component
const bgWash = {
  default:
    "radial-gradient(70% 90% at 100% 0%, rgba(214, 225, 255, 0.42), transparent 70%), " +
    "radial-gradient(60% 80% at 0% 100%, rgba(189, 187, 255, 0.18), transparent 70%), var(--paper)",
  lavender:
    "radial-gradient(75% 95% at 0% 0%, rgba(189, 187, 255, 0.44), transparent 72%), " +
    "radial-gradient(55% 70% at 100% 100%, rgba(214, 225, 255, 0.22), transparent 70%), var(--paper)",
  success:
    "radial-gradient(70% 85% at 0% 0%, rgba(189, 187, 255, 0.22), transparent 70%), " +
    "radial-gradient(65% 85% at 100% 100%, rgba(214, 225, 255, 0.36), transparent 70%), var(--paper)",
  warning:
    "radial-gradient(70% 85% at 0% 0%, rgba(255, 224, 200, 0.55), transparent 72%), " +
    "radial-gradient(60% 75% at 100% 100%, rgba(255, 214, 245, 0.30), transparent 70%), var(--paper)",
  danger:
    "radial-gradient(75% 90% at 0% 0%, rgba(252, 228, 226, 0.85), transparent 72%), " +
    "radial-gradient(55% 70% at 100% 100%, rgba(255, 214, 245, 0.22), transparent 70%), var(--paper)",
}

const bgCards = [
  { label: "Total recipes", value: "1,284", data: climbing, variant: "default" },
  { label: "Active reviewers", value: "17", data: calm, variant: "lavender" },
  { label: "Recipes added", value: "248", data: climbing, variant: "success" },
  { label: "Pending review", value: "32", data: choppy, variant: "warning" },
  { label: "Avg. cycle time", value: "6.2d", data: dipping, variant: "danger" },
]
</script>

<template>
  <Story title="Sparkline">
    <Variant title="Variants">
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <Sparkline :data="climbing" variant="default" />
        <Sparkline :data="climbing" variant="lavender" />
        <Sparkline :data="climbing" variant="success" />
        <Sparkline :data="dipping" variant="warning" />
        <Sparkline :data="dipping" variant="danger" />
      </div>
    </Variant>

    <Variant title="Line only">
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <Sparkline :data="choppy" :area="false" variant="default" />
        <Sparkline :data="choppy" :area="false" :dot="false" variant="lavender" />
      </div>
    </Variant>

    <Variant title="Sizes">
      <div style="display: flex; align-items: flex-end; gap: 24px;">
        <Sparkline :data="climbing" :width="80" :height="24" />
        <Sparkline :data="climbing" :width="160" :height="44" />
        <Sparkline :data="climbing" :width="280" :height="72" :stroke-width="3" />
      </div>
    </Variant>

    <Variant title="In a stat card">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <Card padded style="width: 220px;">
          <div style="font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; color: var(--ink-60);">
            Recipes added
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: 10px;">
            <div style="font-family: var(--display); font-size: 34px; font-weight: 500; letter-spacing: -0.7px;">248</div>
            <Sparkline :data="climbing" variant="success" :width="100" :height="38" />
          </div>
        </Card>
        <Card padded style="width: 220px;">
          <div style="font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; color: var(--ink-60);">
            Avg. cycle time
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: 10px;">
            <div style="font-family: var(--display); font-size: 34px; font-weight: 500; letter-spacing: -0.7px;">6.2d</div>
            <Sparkline :data="dipping" variant="danger" :width="100" :height="38" />
          </div>
        </Card>
        <Card padded style="width: 220px;">
          <div style="font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; color: var(--ink-60);">
            Active reviewers
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: 10px;">
            <div style="font-family: var(--display); font-size: 34px; font-weight: 500; letter-spacing: -0.7px;">17</div>
            <Sparkline :data="calm" variant="lavender" :width="100" :height="38" />
          </div>
        </Card>
      </div>
    </Variant>

    <Variant title="Card background fill">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <Card
          v-for="card in bgCards"
          :key="card.label"
          :style="{
            position: 'relative',
            overflow: 'hidden',
            width: '240px',
            height: '132px',
            background: bgWash[card.variant],
          }"
        >
          <Sparkline
            :data="card.data"
            :variant="card.variant"
            :width="240"
            :height="132"
            bleed
            style="position: absolute; inset: 0; opacity: 0.55;"
          />
          <div style="position: relative; padding: 16px;">
            <div style="font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; color: var(--ink-60);">
              {{ card.label }}
            </div>
            <div style="font-family: var(--display); font-size: 38px; font-weight: 500; letter-spacing: -0.9px; margin-top: 6px;">
              {{ card.value }}
            </div>
          </div>
        </Card>
      </div>
    </Variant>
  </Story>
</template>
