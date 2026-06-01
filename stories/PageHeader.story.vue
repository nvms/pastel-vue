<script setup>
import PageHeader from "../src/components/PageHeader.vue"
import Breadcrumbs from "../src/components/Breadcrumbs.vue"
import Button from "../src/components/Button.vue"
</script>

<template>
  <Story title="PageHeader">
    <Variant title="Large (editorial)">
      <PageHeader
        size="large"
        eyebrow="Evaluations"
        title="Continuous evaluation"
        subtitle="A workflow is correct when the suite says it is. Every model swap, rule change, and workflow promotion re-runs the curated golden set and re-scores every step. A step graduates to autonomous only after its confidence holds across runs."
      />
    </Variant>

    <Variant title="Large with breadcrumbs + actions">
      <PageHeader
        size="large"
        eyebrow="Evaluations"
        title="Continuous evaluation"
        subtitle="Every model swap, rule change, and workflow promotion re-runs the curated golden set and re-scores every step."
      >
        <template #breadcrumbs>
          <Breadcrumbs separator="›" :items="[
            { label: 'Home', to: '/' },
            { label: 'Verify' },
            { label: 'Evaluations' },
          ]" />
        </template>
        <template #actions>
          <Button variant="outline">Export</Button>
          <Button variant="primary">Run suite</Button>
        </template>
      </PageHeader>
    </Variant>

    <Variant title="Default size">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        subtitle="A snapshot of the last 24 hours across all jurisdictions."
      >
        <template #actions>
          <Button variant="outline" size="sm">Export</Button>
          <Button variant="primary" size="sm">New run</Button>
        </template>
      </PageHeader>
    </Variant>
  </Story>
</template>
