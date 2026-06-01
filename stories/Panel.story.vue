<script setup>
import { ref } from "vue"
import Panel from "../src/components/Panel.vue"
import PanelSection from "../src/components/PanelSection.vue"
import KeyValue from "../src/components/KeyValue.vue"
import Select from "../src/components/Select.vue"
import Stat from "../src/components/Stat.vue"
import Badge from "../src/components/Badge.vue"
import SectionLabel from "../src/components/SectionLabel.vue"
import Input from "../src/components/Input.vue"
import Combobox from "../src/components/Combobox.vue"
import Field from "../src/components/Field.vue"
import Button from "../src/components/Button.vue"
import Divider from "../src/components/Divider.vue"
import Kbd from "../src/components/Kbd.vue"
import Avatar from "../src/components/Avatar.vue"
import ArrowLink from "../src/components/ArrowLink.vue"

const boundModel = ref("sonnet")
const modelOptions = [
  { value: "sonnet", label: "claude-sonnet-4-6 · recommended · Balanced" },
  { value: "haiku", label: "claude-haiku-4-5 · fast · Economical" },
  { value: "opus", label: "claude-opus-4-7 · highest quality" },
]

const city = ref("Boulder")
const state = ref("CO")
const presets = [
  { code: "CO", city: "Boulder" },
  { code: "TX", city: "Austin" },
  { code: "TN", city: "Nashville" },
  { code: "OR", city: "Portland" },
  { code: "NC", city: "Charlotte" },
]
const applyPreset = (p) => { city.value = p.city; state.value = p.code }

const stateOptions = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
]

const steps = [
  { name: "draft_prep_card", wf: "RCP_DENVER_SHORTRIBS" },
  { name: "draft_cost_sheet", wf: "RCP_DENVER_SHORTRIBS" },
]

const reviewItems = [
  { tag: "Card", label: "Drafted prep card (PC 101)", path: "RECIPE.STEPS.DRAFT_PREP_CARD.OUTPUT.PREPCARDPDFURL" },
  { tag: "Fields", label: "Mapped ingredients preview", path: "RECIPE.STEPS.DRAFT_PREP_CARD.OUTPUT.MAPPEDINGREDIENTS" },
  { tag: "Standard", label: "Cited food-safety standard", path: "STANDARDS.HOLDING" },
  { tag: "Amount", label: "Plate cost breakdown", path: "RECIPE.FOODCOSTCENTS + RECIPE.WASTECENTS × 2" },
]

const intakeRows = [
  { label: "Intake workflow", value: "Denver Weekly Prep Intake · v2", link: true },
  { label: "Spawns", value: "Cherry Creek Braised Short Ribs · v3", link: true },
  { label: "Schedule", value: "Every Monday, 07:00 MT" },
  { label: "Last run", value: "Apr 12, 2026, 3:14 AM", link: true },
  { label: "Runs to date", value: "3" },
]
</script>

<template>
  <Story title="Panel">
    <!-- ---- Reproduction of the model summary card ---- -->
    <Variant title="Model summary card">
      <Panel gradient style="max-width: 460px;">
        <template #header>
          <h3 class="pc-panel__title" style="font-size: 24px; font-weight: 500; letter-spacing: -0.4px; margin: 0;">
            Prep card drafting
          </h3>
          <p style="margin: 6px 0 0; color: var(--ink-60); font-size: 15px; line-height: 1.45;">
            Generates the prep card, cost sheet, plating guide, and allergen sheet PDFs by mapping recipe
            data into the card schema. Plate costs are computed in code; the model fills typed slots.
          </p>
        </template>

        <PanelSection label="Where it runs">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div v-for="s in steps" :key="s.name" style="display: flex; align-items: center; gap: 10px;">
              <Badge>Step</Badge>
              <span style="font-family: var(--mono); font-size: 13px;">{{ s.name }}</span>
              <span style="color: var(--ink-40);">·</span>
              <span style="font-family: var(--mono); font-size: 12px; color: var(--ink-40); letter-spacing: 0.04em;">{{ s.wf }}</span>
            </div>
          </div>
        </PanelSection>

        <PanelSection label="Bound model">
          <Select v-model="boundModel" :options="modelOptions" style="width: 100%;" />
          <div style="margin-top: 10px;">
            <KeyValue
              layout="divided"
              boxed
              :items="[
                { label: 'Provider', value: 'Anthropic · Balanced' },
                { label: 'Pricing', value: '$3.00 / 1M in · $15.00 / 1M out' },
                { label: 'Context', value: '1M tokens' },
                { label: 'Released', value: 'Feb 25, 2026' },
              ]"
            />
          </div>
        </PanelSection>

        <PanelSection>
          <div style="display: flex; gap: 56px;">
            <Stat label="Monthly calls" value="1,840" size="md" />
            <Stat label="Monthly cost" value="$142.30" size="md" />
          </div>
        </PanelSection>
      </Panel>
    </Variant>

    <!-- ---- Reproduction of the venue wizard step ---- -->
    <Variant title="Wizard step">
      <Panel style="max-width: 860px;">
        <template #header>
          <SectionLabel size="md">Venue</SectionLabel>
        </template>
        <template #aside>
          <Badge>Step 1 of 4</Badge>
        </template>

        <PanelSection gradient>
          <div style="display: flex; gap: 12px; align-items: flex-end;">
            <Field label="City" style="flex: 1;">
              <Input v-model="city" size="lg" />
            </Field>
            <Field label="State" style="width: 180px;">
              <Combobox v-model="state" :options="stateOptions" placeholder="Search states" size="lg" />
            </Field>
            <Button variant="primary" size="lg" icon="lucide:arrow-right">Begin ingestion</Button>
          </div>

          <div class="presets">
            <SectionLabel>Recent venues</SectionLabel>
            <div class="presets__chips">
              <button
                v-for="p in presets"
                :key="p.code"
                type="button"
                :class="['pc-preset', { 'pc-preset--active': p.city === city && p.code === state }]"
                @click="applyPreset(p)"
              >
                <Avatar shape="square" tone="dark" size="sm">{{ p.code }}</Avatar>
                <span class="pc-preset__city">{{ p.city }}</span>
                <span class="pc-preset__code">{{ p.code }}</span>
              </button>
            </div>
          </div>
        </PanelSection>

        <PanelSection tone="muted">
          <div class="models-row">
            <div class="models-row__group">
              <div class="models-row__cell">
                <SectionLabel>Drafting</SectionLabel>
                <Kbd>claude-sonnet-4-6</Kbd>
              </div>
              <div class="models-row__cell">
                <SectionLabel>Extraction</SectionLabel>
                <Kbd>claude-haiku-4-5</Kbd>
              </div>
              <div class="models-row__cell">
                <SectionLabel>Judge</SectionLabel>
                <Kbd>claude-opus-4-7</Kbd>
              </div>
            </div>
            <ArrowLink href="#" arrow="up-right" mono size="sm">Configure models</ArrowLink>
          </div>
        </PanelSection>
      </Panel>
    </Variant>

    <!-- ---- Plain panel ---- -->
    <Variant title="Plain (no header gradient)">
      <Panel title="Recipe settings" description="Control how this recipe behaves at runtime." style="max-width: 520px;">
        <PanelSection label="General">
          <KeyValue :items="[
            { label: 'Version', value: 'v2.1' },
            { label: 'Status', value: 'Active' },
            { label: 'Owner', value: 'Theodora Whitfield' },
          ]" />
        </PanelSection>
        <PanelSection label="Limits" tone="muted">
          <KeyValue layout="divided" :items="[
            { label: 'Max retries', value: '3' },
            { label: 'Timeout', value: '120s' },
          ]" />
        </PanelSection>
      </Panel>
    </Variant>

    <!-- ---- Reproduction of the head chef review / sign-off panel ---- -->
    <Variant title="Review / sign-off panel">
      <Panel accent="lavender" gradient elevated style="max-width: 900px;">
        <template #header>
          <div class="rev-tagline">
            <Badge variant="solid" size="md">Action required · Head Chef</Badge>
            <span class="rev-tagline__who">Theodora Whitfield (CO-48217)</span>
          </div>
          <h2 class="rev-title">Chef review (prep card)</h2>
          <p class="rev-desc">
            Hard sign-off step. The head chef sees the rendered prep card alongside the recipe data,
            the food-safety standard, and the plate-cost breakdown. They can approve, reject
            with a reason, or send back for revision.
          </p>
        </template>

        <PanelSection label="What you're reviewing">
          <div class="rev-rows">
            <div v-for="r in reviewItems" :key="r.tag" class="rev-row">
              <Badge>{{ r.tag }}</Badge>
              <span class="rev-row__label">{{ r.label }}</span>
              <span class="rev-row__path">{{ r.path }}</span>
            </div>
          </div>
        </PanelSection>

        <PanelSection>
          <div class="rev-actions">
            <Button variant="primary">Approve and sign</Button>
            <Button variant="danger" hint="+ Notes">Send back for revision</Button>
            <Button variant="danger" hint="+ Reason">Reject - keep off the menu</Button>
          </div>
        </PanelSection>
      </Panel>
    </Variant>

    <!-- ---- Reproduction of the intake summary panel ---- -->
    <Variant title="Intake summary panel">
      <Panel gradient style="max-width: 720px;">
        <template #header>
          <SectionLabel size="md">West Kitchen</SectionLabel>
          <h2 class="intake-title">Denver, CO</h2>
        </template>
        <template #aside>
          <Badge variant="active">Active</Badge>
        </template>

        <PanelSection>
          <KeyValue layout="divided" :dividers="false" compact :items="intakeRows">
            <template #value="{ item }">
              <a v-if="item.link" class="intake-link">{{ item.value }}</a>
              <span v-else>{{ item.value }}</span>
            </template>
          </KeyValue>

          <Divider dashed style="margin: 18px 0;" />

          <div class="intake-actions">
            <Button variant="outline">Filter runs</Button>
            <Button variant="primary">Run intake now</Button>
          </div>
        </PanelSection>
      </Panel>
    </Variant>
  </Story>
</template>

<style scoped>
.presets {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed var(--ink-08);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.presets__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pc-preset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-sharp);
  background: var(--paper);
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: -0.14px;
  color: var(--ink);
  cursor: pointer;
  outline: none;
  transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, transform 60ms ease;
}
.pc-preset:hover { border-color: var(--ink-20); background: var(--ink-04); }
.pc-preset:focus-visible { box-shadow: var(--focus-ring); border-color: var(--midnight); }
.pc-preset:active { transform: translateY(1px); }
.pc-preset--active { border-color: var(--midnight); background: var(--ink-04); }
.pc-preset__city { font-weight: 500; }
.pc-preset__code {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-40);
}

.models-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.models-row__group { display: flex; gap: 36px; }
.models-row__cell { display: flex; flex-direction: column; gap: 8px; }

/* review / sign-off panel */
.rev-tagline { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.rev-tagline__who {
  font-family: var(--mono);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink-40);
}
.rev-title {
  margin: 14px 0 0;
  font-family: var(--display);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.7px;
  line-height: 1.1;
  color: var(--ink);
}
.rev-desc {
  margin: 10px 0 0;
  font-size: 17px;
  line-height: 1.5;
  letter-spacing: -0.18px;
  color: var(--ink);
  max-width: 760px;
}
.rev-rows { display: flex; flex-direction: column; gap: 10px; }
.rev-row { display: flex; align-items: baseline; gap: 12px; }
.rev-row__label { font-size: 16px; font-weight: 500; letter-spacing: -0.2px; }
.rev-row__path {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--ink-40);
}
.rev-actions { display: flex; gap: 12px; flex-wrap: wrap; }

/* intake summary panel */
.intake-title {
  margin: 6px 0 0;
  font-family: var(--display);
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.6px;
  line-height: 1.1;
  color: var(--ink);
}
.intake-link {
  color: var(--ink);
  border-bottom: 1px solid var(--ink-20);
  padding-bottom: 1px;
  cursor: pointer;
  transition: border-color 120ms ease;
}
.intake-link:hover { border-bottom-color: var(--ink); }
.intake-actions { display: flex; gap: 10px; }
</style>
