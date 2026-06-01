<script setup>
import { ref } from "vue"
import Redactor from "../src/components/Redactor.vue"
import Card from "../src/components/Card.vue"
import Switch from "../src/components/Switch.vue"

const docText = `STAFF ONBOARDING RECORD

Marcus Halloway joined the Cherry Creek kitchen as a line cook on March 12, 2026. Home address on file: 4417 Cedar Hollow Lane.

The employee's date of birth is 08/14/1991 and the last four digits of the payroll ID are 6042. Emergency contact is Elena Voss, reachable at 200 Harbor Street.

Record reviewed by the kitchen manager on the 14th day of March, 2026.`

const mark = (phrase, reason) => {
  const start = docText.indexOf(phrase)
  return { start, end: start + phrase.length, reason }
}

const base = [
  mark("Marcus Halloway", "PII"),
  mark("4417 Cedar Hollow Lane", "PII"),
  mark("Elena Voss", "PII"),
  mark("08/14/1991", "PII"),
  mark("6042", "Confidential"),
  mark("200 Harbor Street", "PII"),
]

const reasons = ["PII", "Restricted", "Confidential", "Other"]

const editRedactions = ref(base.map((r) => ({ ...r })))
const revealRedactions = ref(base.map((r) => ({ ...r })))
const revealOn = ref(false)
</script>

<template>
  <Story title="Redactor">
    <Variant title="Editable">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 10px;">
        <Card padded>
          <Redactor v-model="editRedactions" :text="docText" :reasons="reasons" />
        </Card>
        <p style="margin: 0; font-size: 13px; color: var(--ink-60);">
          Select any text to redact it. Click a block to set a reason or remove it.
          <strong>{{ editRedactions.length }}</strong> redactions.
        </p>
      </div>
    </Variant>

    <Variant title="Read-only">
      <div style="max-width: 560px;">
        <Card padded>
          <Redactor :model-value="base" :text="docText" readonly />
        </Card>
      </div>
    </Variant>

    <Variant title="Reveal toggle">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 12px;">
        <label style="display: inline-flex; align-items: center; gap: 10px; font-size: 14px;">
          <Switch v-model="revealOn" />
          Reveal redacted content
        </label>
        <Card padded>
          <Redactor
            v-model="revealRedactions"
            :text="docText"
            :reasons="reasons"
            :reveal="revealOn"
          />
        </Card>
      </div>
    </Variant>
  </Story>
</template>
