<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import Wizard from "../src/components/Wizard.vue"
import Card from "../src/components/Card.vue"
import Field from "../src/components/Field.vue"
import Select from "../src/components/Select.vue"
import Switch from "../src/components/Switch.vue"
import Callout from "../src/components/Callout.vue"
import Badge from "../src/components/Badge.vue"
import ProgressBar from "../src/components/ProgressBar.vue"
import Button from "../src/components/Button.vue"
import KeyValue from "../src/components/KeyValue.vue"
import ArrowLink from "../src/components/ArrowLink.vue"

const steps = [
  { key: "ingest",  label: "Upload document",   description: "Drag in a PDF or image to start." },
  { key: "ocr",     label: "Run OCR",           description: "Extract text with the selected engine." },
  { key: "extract", label: "Extract with LLM",  description: "Pull structured fields from the recognized text.", optional: true },
  { key: "review",  label: "Review and finish", description: "Confirm the result before saving." },
]

const current = ref("ingest")
const completed = ref([])
const skipped = ref([])

const file = ref({ name: "complaint-2026-EVN-2401.pdf", size: "1.2 MB", pages: 14 })
const engine = ref("textract")
const denoise = ref(true)
const model = ref("claude-opus-4-7")
const preset = ref("case-header")
const presets = [
  { value: "case-header", label: "Case header fields" },
  { value: "parties",     label: "Parties and counsel" },
  { value: "dates",       label: "Key dates and deadlines" },
  { value: "custom",      label: "Custom schema" },
]
const engineLabel = computed(() =>
  engine.value === "textract" ? "AWS Textract"
    : engine.value === "gcv" ? "Google Cloud Vision"
    : "Tesseract"
)
const modelLabel = computed(() =>
  model.value === "claude-opus-4-7" ? "Claude Opus 4.7" : "Claude Sonnet 4.6"
)
const presetLabel = computed(() => presets.find(p => p.value === preset.value)?.label ?? "")

const fields = ref([
  { key: "Caption",      value: "State of Colorado v. R. Watanabe" },
  { key: "Case Number",  value: "2026-EVN-2401" },
  { key: "Filed",        value: "2026-05-18" },
  { key: "Court",        value: "Denver County District" },
])

const canAdvance = computed(() => {
  if (current.value === "ingest") return !!file.value
  return true
})
const onComplete = () => { alert("Pipeline complete - file saved.") }

const replaceFile = () => {
  file.value = { name: "redaction-final-v3.pdf", size: "2.4 MB", pages: 22 }
}
</script>

<template>
  <Story title="Wizard">
    <Variant title="Document pipeline">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; height: 580px;">
        <Wizard
          v-model="current"
          v-model:completed="completed"
          v-model:skipped="skipped"
          :steps="steps"
          :can-advance="canAdvance"
          @complete="onComplete"
        >
          <!-- step 1: upload -->
          <template #step-ingest>
            <div class="upload">
              <div class="upload__zone">
                <Icon icon="lucide:file-text" class="upload__icon" />
                <div class="upload__file">
                  <div class="upload__name">{{ file.name }}</div>
                  <div class="upload__meta">
                    <Badge variant="active">Ready</Badge>
                    <span>{{ file.size }}</span>
                    <span class="upload__dot">·</span>
                    <span>{{ file.pages }} pages</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" icon="lucide:repeat" @click="replaceFile">Replace</Button>
              </div>
              <div class="upload__footer">
                <ArrowLink href="#" size="sm">View supported file types</ArrowLink>
              </div>
            </div>
          </template>

          <!-- step 2: ocr -->
          <template #step-ocr>
            <div class="form">
              <Field label="OCR engine" hint="Cloud engines are faster on long documents.">
                <Select
                  v-model="engine"
                  :options="[
                    { value: 'textract',  label: 'AWS Textract' },
                    { value: 'gcv',       label: 'Google Cloud Vision' },
                    { value: 'tesseract', label: 'Tesseract (local)' },
                  ]"
                />
              </Field>
              <Field label="Denoise scanned pages" hint="Improves accuracy on low-quality scans.">
                <Switch v-model="denoise" />
              </Field>
            </div>
          </template>

          <!-- step 3: extract -->
          <template #step-extract>
            <div class="form">
              <div class="form__grid">
                <Field label="Model">
                  <Select
                    v-model="model"
                    :options="[
                      { value: 'claude-opus-4-7',   label: 'Claude Opus 4.7' },
                      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
                    ]"
                  />
                </Field>
                <Field label="Schema preset">
                  <Select v-model="preset" :options="presets" />
                </Field>
              </div>
              <div class="form__footer">
                <ArrowLink href="#" size="sm">Manage model presets</ArrowLink>
              </div>
            </div>
          </template>

          <!-- step 4: review -->
          <template #step-review>
            <div class="review">
              <Card class="review__summary">
                <div class="review__row">
                  <span class="review__label">File</span>
                  <span class="review__value">{{ file.name }}</span>
                </div>
                <div class="review__row">
                  <span class="review__label">Pages</span>
                  <span class="review__value">{{ file.pages }}</span>
                </div>
                <div class="review__row">
                  <span class="review__label">OCR engine</span>
                  <span class="review__value">{{ engineLabel }}</span>
                </div>
                <div class="review__row">
                  <span class="review__label">Extraction</span>
                  <span class="review__value">
                    <template v-if="skipped.includes('extract')">Skipped</template>
                    <template v-else>{{ modelLabel }} · {{ presetLabel }}</template>
                  </span>
                </div>
              </Card>

              <Card style="padding: 20px;">
                <div class="review__section-label">Extracted fields</div>
                <KeyValue :items="fields" />
              </Card>
            </div>
          </template>
        </Wizard>
      </div>
    </Variant>

    <Variant title="With explicit error state">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; height: 460px;">
        <Wizard
          :model-value="'ocr'"
          :completed="['ingest']"
          :steps="[
            { key: 'ingest', label: 'Upload document' },
            { key: 'ocr', label: 'Run OCR', status: 'error', description: 'Engine timed out.' },
            { key: 'extract', label: 'Extract with LLM', optional: true },
            { key: 'review', label: 'Review and finish' },
          ]"
        >
          <template #step-ocr>
            <Callout tone="danger" title="OCR engine timed out">
              The Textract job did not complete within 60s. Retry, or switch engines.
            </Callout>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
              <Button variant="outline">Switch engine</Button>
              <Button variant="primary" icon="lucide:rotate-cw">Retry</Button>
            </div>
          </template>
        </Wizard>
      </div>
    </Variant>

    <Variant title="Non-linear (free navigation)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; height: 460px;">
        <Wizard
          :model-value="'extract'"
          :completed="['ingest', 'ocr', 'extract']"
          :linear="false"
          :steps="steps"
        >
          <template #default="{ step }">
            <Callout tone="info">
              Free navigation: any step can be jumped to. Currently on
              <strong>{{ step?.label }}</strong>.
            </Callout>
            <div style="margin-top: 16px;">
              <ProgressBar :value="68" />
              <div style="margin-top: 8px; font-size: 13px; color: var(--ink-60);">
                Pipeline 68% complete.
              </div>
            </div>
          </template>
        </Wizard>
      </div>
    </Variant>
  </Story>
</template>

<style scoped>
/* upload step - a real drop-zone affordance */
.upload {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.upload__zone {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border: 1px dashed var(--ink-20);
  border-radius: var(--radius-comfy);
  background:
    radial-gradient(80% 140% at 0% 0%, rgba(189, 187, 255, 0.18), transparent 70%),
    radial-gradient(70% 140% at 100% 100%, rgba(214, 225, 255, 0.22), transparent 72%),
    var(--paper);
}
.upload__icon {
  font-size: 32px;
  color: var(--ink-40);
  flex-shrink: 0;
}
.upload__file { flex: 1; min-width: 0; }
.upload__name {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.16px;
  color: var(--ink);
  margin-bottom: 4px;
}
.upload__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-60);
}
.upload__dot { color: var(--ink-20); }
.upload__footer { padding: 0 2px; }

/* form steps */
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 520px;
}
.form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.form__footer { padding-top: 2px; }

/* review step */
.review {
  display: grid;
  gap: 16px;
}
.review__summary { padding: 6px 0; }
.review__row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: baseline;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--ink-08);
}
.review__row:last-child { border-bottom: 0; }
.review__label {
  font-family: var(--mono);
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  font-weight: 500;
  color: var(--ink-40);
}
.review__value {
  font-size: 14px;
  letter-spacing: -0.14px;
  color: var(--ink);
}
.review__section-label {
  font-family: var(--mono);
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  font-weight: 500;
  color: var(--ink-40);
  margin-bottom: 10px;
}
</style>
