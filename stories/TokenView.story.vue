<script setup>
import { ref } from "vue"
import TokenView from "../src/components/TokenView.vue"
import Textarea from "../src/components/Textarea.vue"
import Card from "../src/components/Card.vue"

const clause = `The Provider shall deliver the services described in Schedule A within thirty (30) business days of the Effective Date. Late payments accrue interest at 1.5% per month.`

const codey = `function totalTokens(messages) {
  return messages.reduce((sum, m) => sum + m.tokens, 0)
}`

const live = ref("Paste or type any text here to see how it tokenizes.")
</script>

<template>
  <Story title="TokenView">
    <Variant title="A clause">
      <Card padded style="max-width: 560px;">
        <TokenView :text="clause" />
      </Card>
    </Variant>

    <Variant title="Code">
      <Card padded style="max-width: 560px;">
        <TokenView :text="codey" />
      </Card>
    </Variant>

    <Variant title="Highlights only (no summary)">
      <Card padded style="max-width: 560px;">
        <TokenView :text="clause" :show-summary="false" />
      </Card>
    </Variant>

    <Variant title="cl100k_base encoding">
      <Card padded style="max-width: 560px;">
        <TokenView :text="clause" encoding="cl100k_base" />
      </Card>
    </Variant>

    <Variant title="Live (type to tokenize)">
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 14px;">
        <Textarea v-model="live" :rows="4" placeholder="Type some text…" />
        <Card padded>
          <TokenView :text="live" />
        </Card>
      </div>
    </Variant>
  </Story>
</template>
