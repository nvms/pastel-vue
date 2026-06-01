<script setup>
import { ref } from "vue"
import DiffViewer from "../src/components/DiffViewer.vue"
import ToggleGroup from "../src/components/ToggleGroup.vue"

const clauseOld = `This braised short rib recipe yields eight (8) portions
and braises for about two (2) hours.
Season the ribs with one percent salt by weight.
Reserve the braising liquid for the sauce.`

const clauseNew = `This braised short rib recipe yields twelve (12) portions
and braises for about three (3) hours.
Season the ribs with one and one-half percent salt by weight.
Strain and reserve the braising liquid for the pan sauce.`

const configOld = `server:
  host: localhost
  port: 3000
  timeout: 30
cache:
  enabled: false
logging:
  level: info`

const configNew = `server:
  host: 0.0.0.0
  port: 8080
  timeout: 30
  retries: 3
cache:
  enabled: true
  ttl: 600
logging:
  level: debug`

const codeOld = `function total(items) {
  let sum = 0
  for (const item of items) {
    sum += item.price
  }
  return sum
}`

const codeNew = `function total(items, taxRate = 0) {
  // fold the line items into a running total
  const sum = items.reduce((acc, item) => acc + item.price, 0)
  return sum * (1 + taxRate)
}`

const pyOld = `def greet(name):
    print("Hello, " + name)
    return None`

const pyNew = `def greet(name, loud=False):
    msg = f"Hello, {name}"
    print(msg.upper() if loud else msg)`

const cssOld = `.btn {
  padding: 8px 16px;
  background: #eeeeee;
  border-radius: 4px;
}`

const cssNew = `.btn {
  padding: 10px 20px;
  background: #6c5ce7;
  border-radius: 8px;
  color: white;
}`

const rustOld = `fn sum(items: &[i32]) -> i32 {
    let mut total = 0;
    for n in items {
        total += n;
    }
    total
}`

const rustNew = `fn sum(items: &[i32]) -> i32 {
    items.iter().sum()
}`

const mode = ref("split")
const codeMode = ref("unified")
</script>

<template>
  <Story title="DiffViewer">
    <Variant title="Split">
      <div style="max-width: 880px;">
        <DiffViewer
          :old-text="clauseOld"
          :new-text="clauseNew"
          old-label="Draft v1"
          new-label="Draft v2"
        />
      </div>
    </Variant>

    <Variant title="Unified">
      <div style="max-width: 620px;">
        <DiffViewer
          :old-text="clauseOld"
          :new-text="clauseNew"
          mode="unified"
          old-label="Draft v1"
          new-label="Draft v2"
        />
      </div>
    </Variant>

    <Variant title="Mode toggle">
      <div style="max-width: 880px; display: flex; flex-direction: column; gap: 12px;">
        <ToggleGroup
          v-model="mode"
          size="sm"
          :options="[
            { value: 'split', label: 'Split' },
            { value: 'unified', label: 'Unified' },
          ]"
        />
        <DiffViewer
          :old-text="configOld"
          :new-text="configNew"
          :mode="mode"
          old-label="config.yml"
          new-label="config.yml (staged)"
        />
      </div>
    </Variant>

    <Variant title="Generic - config file">
      <div style="max-width: 880px;">
        <DiffViewer
          :old-text="configOld"
          :new-text="configNew"
          old-label="config.yml"
          new-label="config.yml (staged)"
        />
      </div>
    </Variant>

    <Variant title="No line numbers">
      <div style="max-width: 620px;">
        <DiffViewer
          :old-text="clauseOld"
          :new-text="clauseNew"
          mode="unified"
          :show-line-numbers="false"
        />
      </div>
    </Variant>

    <Variant title="Code diff (syntax highlighting)">
      <div style="max-width: 880px; display: flex; flex-direction: column; gap: 12px;">
        <ToggleGroup
          v-model="codeMode"
          size="sm"
          :options="[
            { value: 'split', label: 'Split' },
            { value: 'unified', label: 'Unified' },
          ]"
        />
        <DiffViewer
          :old-text="codeOld"
          :new-text="codeNew"
          :mode="codeMode"
          language="javascript"
          old-label="total.js"
          new-label="total.js (working)"
        />
      </div>
    </Variant>

    <Variant title="Code diff - Python">
      <div style="max-width: 880px;">
        <DiffViewer
          :old-text="pyOld"
          :new-text="pyNew"
          language="python"
          old-label="greet.py"
          new-label="greet.py (working)"
        />
      </div>
    </Variant>

    <Variant title="Code diff - CSS">
      <div style="max-width: 880px;">
        <DiffViewer
          :old-text="cssOld"
          :new-text="cssNew"
          language="css"
          old-label="button.css"
          new-label="button.css (working)"
        />
      </div>
    </Variant>

    <Variant title="Code diff - Rust">
      <div style="max-width: 620px;">
        <DiffViewer
          :old-text="rustOld"
          :new-text="rustNew"
          mode="unified"
          language="rust"
          old-label="sum.rs"
          new-label="sum.rs (working)"
        />
      </div>
    </Variant>

    <Variant title="No labels (stats only)">
      <div style="max-width: 880px;">
        <DiffViewer
          :old-text="codeOld"
          :new-text="codeNew"
          language="javascript"
          old-label=""
          new-label=""
        />
      </div>
    </Variant>

    <Variant title="Scrollable (max height)">
      <div style="max-width: 620px;">
        <DiffViewer
          :old-text="configOld"
          :new-text="configNew"
          mode="unified"
          :max-height="180"
        />
      </div>
    </Variant>
  </Story>
</template>
