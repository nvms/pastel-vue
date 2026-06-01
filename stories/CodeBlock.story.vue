<script setup>
import CodeBlock from "../src/components/CodeBlock.vue"

const js = `import { computed, ref } from "vue"

// running total with an optional tax rate
export function useCart(items) {
  const taxRate = ref(0)
  const subtotal = computed(() =>
    items.reduce((sum, it) => sum + it.price, 0)
  )
  const total = computed(() => subtotal.value * (1 + taxRate.value))
  return { subtotal, total, taxRate }
}`

const py = `from datetime import date

def days_until(target: date) -> int:
    """Whole days from today until target."""
    delta = target - date.today()
    return max(delta.days, 0)`

const css = `.card {
  padding: 24px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(1, 1, 32, 0.08);
}`

const json = `{
  "name": "intake-service",
  "version": "2.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`

const long = Array.from({ length: 40 }, (_, i) =>
  `const item${i + 1} = registry.resolve("item-${i + 1}")`
).join("\n")
</script>

<template>
  <Story title="CodeBlock">
    <Variant title="With filename">
      <div style="max-width: 620px;">
        <CodeBlock :code="js" language="javascript" filename="use-cart.js" />
      </div>
    </Variant>

    <Variant title="Languages">
      <div style="max-width: 620px; display: flex; flex-direction: column; gap: 18px;">
        <CodeBlock :code="py" language="python" filename="dates.py" />
        <CodeBlock :code="css" language="css" filename="card.css" />
        <CodeBlock :code="json" language="json" filename="package.json" />
      </div>
    </Variant>

    <Variant title="Highlighted lines">
      <div style="max-width: 620px;">
        <CodeBlock
          :code="js"
          language="javascript"
          filename="use-cart.js"
          :highlight-lines="[7, 8, 9]"
        />
      </div>
    </Variant>

    <Variant title="No line numbers">
      <div style="max-width: 620px;">
        <CodeBlock :code="css" language="css" :show-line-numbers="false" />
      </div>
    </Variant>

    <Variant title="Plain text (no language)">
      <div style="max-width: 620px;">
        <CodeBlock
          :code="'$ npm install pastel-vue\n$ npm run story:dev'"
          :show-line-numbers="false"
        />
      </div>
    </Variant>

    <Variant title="Scrollable (max height)">
      <div style="max-width: 620px;">
        <CodeBlock :code="long" language="javascript" filename="registry.js" :max-height="240" />
      </div>
    </Variant>
  </Story>
</template>
