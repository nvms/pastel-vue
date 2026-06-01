<script setup>
import ConfidenceMeter from "../src/components/ConfidenceMeter.vue"
</script>

<template>
  <Story title="ConfidenceMeter">
    <Variant title="Levels">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <ConfidenceMeter :value="0.93" />
        <ConfidenceMeter :value="0.64" />
        <ConfidenceMeter :value="0.28" />
      </div>
    </Variant>

    <Variant title="With label">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <ConfidenceMeter :value="1" label="Relevance" :label-width="96" />
        <ConfidenceMeter :value="0.55" label="Confidence" :label-width="96" />
      </div>
    </Variant>

    <Variant title="Sizes">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <ConfidenceMeter :value="0.72" size="sm" />
        <ConfidenceMeter :value="0.72" size="md" />
      </div>
    </Variant>

    <Variant title="No value readout">
      <ConfidenceMeter :value="0.5" :show-value="false" label="Match" />
    </Variant>
  </Story>
</template>
