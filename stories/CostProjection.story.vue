<script setup>
import CostProjection from "../src/components/CostProjection.vue"
import Card from "../src/components/Card.vue"
</script>

<template>
  <Story title="CostProjection">
    <Variant title="From a week of usage">
      <Card padded style="max-width: 340px;">
        <CostProjection :cost="48.2" :period-days="7" />
      </Card>
    </Variant>

    <Variant title="From a full month">
      <Card padded style="max-width: 340px;">
        <CostProjection :cost="1240" :period-days="30" />
      </Card>
    </Variant>

    <Variant title="From a single day">
      <Card padded style="max-width: 340px;">
        <CostProjection :cost="6.75" :period-days="1" />
      </Card>
    </Variant>
  </Story>
</template>
