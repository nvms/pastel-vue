<script setup>
import { computed } from "vue"
import Input from "./Input.vue"
import NumberInput from "./NumberInput.vue"
import Select from "./Select.vue"
import Combobox from "./Combobox.vue"
import Checkbox from "./Checkbox.vue"
import Button from "./Button.vue"
import Tooltip from "./Tooltip.vue"
import { DEFAULT_MODEL_PRICING } from "../pricing.js"

const props = defineProps({
  // assertion: { type, ...config } - shape varies by type
  modelValue: { type: Object, default: () => ({ type: "equals", expected: "" }) },
  // models available to the llm-judge type
  models: { type: Array, default: () => DEFAULT_MODEL_PRICING },
  removable: { type: Boolean, default: true },
})
const emit = defineEmits(["update:modelValue", "remove"])

const TYPES = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "regex", label: "Regex" },
  { value: "json", label: "JSON" },
  { value: "llm-judge", label: "LLM judge" },
  { value: "similarity", label: "Similarity" },
  { value: "latency", label: "Latency" },
]

// a one-line read-only preview of the assertion's configured value, so the
// head reads like a sentence rather than a sparse strip
const summary = computed(() => {
  const v = props.modelValue
  switch (v.type) {
    case "equals":
      return v.expected ? `"${v.expected}"` : null
    case "contains":
      return v.value
        ? `"${v.value}"${v.caseSensitive ? " - case sensitive" : ""}`
        : null
    case "regex":
      return v.pattern ? `/${v.pattern}/${v.flags || ""}` : null
    case "json":
      return v.schema || "any valid JSON"
    case "llm-judge":
      return v.criteria ? `${v.criteria} (≥ ${v.threshold})` : null
    case "similarity":
      return v.reference ? `≈ "${v.reference}" (≥ ${v.threshold})` : null
    case "latency":
      return `< ${v.maxMs}ms`
    default:
      return null
  }
})

const summaryPlaceholder = computed(() => {
  switch (props.modelValue.type) {
    case "equals": return "set expected value"
    case "contains": return "set substring"
    case "regex": return "set pattern"
    case "llm-judge": return "set criteria"
    case "similarity": return "set reference"
    default: return ""
  }
})

const defaults = (type) => {
  switch (type) {
    case "equals": return { type, expected: "" }
    case "contains": return { type, value: "", caseSensitive: false }
    case "regex": return { type, pattern: "", flags: "" }
    case "json": return { type, schema: "" }
    case "llm-judge":
      return { type, criteria: "", model: props.models[0]?.id || "", threshold: 0.7 }
    case "similarity": return { type, reference: "", threshold: 0.8 }
    case "latency": return { type, maxMs: 5000 }
    default: return { type }
  }
}

const setField = (field, value) =>
  emit("update:modelValue", { ...props.modelValue, [field]: value })
const setType = (newType) => emit("update:modelValue", defaults(newType))

const modelOptions = computed(() =>
  props.models.map((m) => ({ value: m.id, label: m.label })),
)
</script>

<template>
  <div class="pc-assertion">
    <div class="pc-assertion__head">
      <Combobox
        :model-value="modelValue.type"
        :options="TYPES"
        :searchable="false"
        :clearable="false"
        size="sm"
        class="pc-assertion__type"
        @update:model-value="setType"
      />
      <div class="pc-assertion__summary">
        <span v-if="summary" class="pc-assertion__summary-text">{{ summary }}</span>
        <span
          v-else
          class="pc-assertion__summary-text pc-assertion__summary-text--muted"
        >{{ summaryPlaceholder }}</span>
      </div>
      <Tooltip v-if="removable" text="Remove check">
        <Button
          variant="ghost"
          size="sm"
          icon="lucide:x"
          class="pc-assertion__remove"
          aria-label="Remove check"
          @click="emit('remove')"
        />
      </Tooltip>
    </div>

    <div class="pc-assertion__body">
      <template v-if="modelValue.type === 'equals'">
        <div class="pc-assertion__field">
          <div class="pc-assertion__label">Expected</div>
          <Input
            :model-value="modelValue.expected"
            size="sm"
            placeholder="What the output must equal"
            @update:model-value="(v) => setField('expected', v)"
          />
        </div>
      </template>

      <template v-else-if="modelValue.type === 'contains'">
        <div class="pc-assertion__field">
          <div class="pc-assertion__label">Substring</div>
          <Input
            :model-value="modelValue.value"
            size="sm"
            placeholder="Text that must appear in the output"
            @update:model-value="(v) => setField('value', v)"
          />
        </div>
        <Checkbox
          :model-value="modelValue.caseSensitive"
          label="Case sensitive"
          @update:model-value="(v) => setField('caseSensitive', v)"
        />
      </template>

      <template v-else-if="modelValue.type === 'regex'">
        <div class="pc-assertion__grid pc-assertion__grid--regex">
          <div class="pc-assertion__field">
            <div class="pc-assertion__label">Pattern</div>
            <Input
              :model-value="modelValue.pattern"
              size="sm"
              placeholder="A JavaScript regular expression"
              @update:model-value="(v) => setField('pattern', v)"
            />
          </div>
          <div class="pc-assertion__field">
            <div class="pc-assertion__label">Flags</div>
            <Input
              :model-value="modelValue.flags"
              size="sm"
              placeholder="gi"
              @update:model-value="(v) => setField('flags', v)"
            />
          </div>
        </div>
      </template>

      <template v-else-if="modelValue.type === 'json'">
        <div class="pc-assertion__field">
          <div class="pc-assertion__label">JSON schema</div>
          <Input
            :model-value="modelValue.schema"
            size="sm"
            placeholder="Optional JSON schema for validating shape"
            @update:model-value="(v) => setField('schema', v)"
          />
        </div>
      </template>

      <template v-else-if="modelValue.type === 'llm-judge'">
        <div class="pc-assertion__field">
          <div class="pc-assertion__label">Criteria</div>
          <Input
            :model-value="modelValue.criteria"
            size="sm"
            placeholder="What the judge should evaluate"
            @update:model-value="(v) => setField('criteria', v)"
          />
        </div>
        <div class="pc-assertion__grid pc-assertion__grid--judge">
          <div class="pc-assertion__field">
            <div class="pc-assertion__label">Judge model</div>
            <Select
              :model-value="modelValue.model"
              :options="modelOptions"
              size="sm"
              @update:model-value="(v) => setField('model', v)"
            />
          </div>
          <div class="pc-assertion__field">
            <div class="pc-assertion__label">Pass threshold</div>
            <NumberInput
              :model-value="modelValue.threshold"
              :min="0" :max="1" :step="0.05"
              size="sm"
              @update:model-value="(v) => setField('threshold', v)"
            />
          </div>
        </div>
      </template>

      <template v-else-if="modelValue.type === 'similarity'">
        <div class="pc-assertion__field">
          <div class="pc-assertion__label">Reference</div>
          <Input
            :model-value="modelValue.reference"
            size="sm"
            placeholder="Text to compare against"
            @update:model-value="(v) => setField('reference', v)"
          />
        </div>
        <div class="pc-assertion__field pc-assertion__field--narrow">
          <div class="pc-assertion__label">Similarity threshold</div>
          <NumberInput
            :model-value="modelValue.threshold"
            :min="0" :max="1" :step="0.05"
            size="sm"
            @update:model-value="(v) => setField('threshold', v)"
          />
        </div>
      </template>

      <template v-else-if="modelValue.type === 'latency'">
        <div class="pc-assertion__field pc-assertion__field--narrow">
          <div class="pc-assertion__label">Max duration (ms)</div>
          <NumberInput
            :model-value="modelValue.maxMs"
            :min="100" :max="60000" :step="100"
            size="sm"
            @update:model-value="(v) => setField('maxMs', v)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pc-assertion {
  width: 100%;
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  background: var(--paper);
  transition: border-color 160ms ease, box-shadow 160ms ease;
  box-sizing: border-box;
}
.pc-assertion:hover { border-color: var(--ink-20); }
.pc-assertion:focus-within {
  border-color: var(--midnight);
  box-shadow: var(--focus-ring);
}

.pc-assertion__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--ink-04);
}
.pc-assertion__type { width: 160px; flex-shrink: 0; }
.pc-assertion__summary {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0 4px;
}
.pc-assertion__summary-text {
  display: block;
  width: 100%;
  font-size: 13px;
  letter-spacing: -0.13px;
  color: var(--ink-60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pc-assertion__summary-text--muted { color: var(--ink-40); }
.pc-assertion__remove { color: var(--ink-40); }
.pc-assertion:hover .pc-assertion__remove,
.pc-assertion:focus-within .pc-assertion__remove { color: var(--ink); }

.pc-assertion__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
}

.pc-assertion__field { display: flex; flex-direction: column; gap: 6px; }
.pc-assertion__field--narrow { max-width: 200px; }
.pc-assertion__label {
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 9px;
  font-weight: 500;
  color: var(--ink-40);
}

.pc-assertion__grid { display: grid; gap: 12px; }
.pc-assertion__grid--regex { grid-template-columns: 1fr 110px; }
.pc-assertion__grid--judge { grid-template-columns: 1fr 160px; }
</style>
