<script setup>
import PipelineStatus from "../src/components/PipelineStatus.vue"
import Card from "../src/components/Card.vue"

const ingest = [
  { label: "Upload", status: "done", detail: "14 files" },
  { label: "Chunk", status: "done", detail: "182 chunks" },
  { label: "Embed", status: "running", detail: "118 / 182" },
  { label: "Index", status: "queued" },
]

const failed = [
  { label: "Upload", status: "done", detail: "9 files" },
  { label: "Chunk", status: "done", detail: "96 chunks" },
  { label: "Embed", status: "failed", detail: "rate limited" },
  { label: "Index", status: "queued" },
]

const complete = [
  { label: "Upload", status: "done", detail: "30 files" },
  { label: "Chunk", status: "done", detail: "410 chunks" },
  { label: "Embed", status: "done", detail: "410 vectors" },
  { label: "Index", status: "done", detail: "ready" },
]
</script>

<template>
  <Story title="PipelineStatus">
    <Variant title="Horizontal">
      <Card padded style="max-width: 600px;">
        <PipelineStatus :stages="ingest" />
      </Card>
    </Variant>

    <Variant title="Failed stage">
      <Card padded style="max-width: 600px;">
        <PipelineStatus :stages="failed" />
      </Card>
    </Variant>

    <Variant title="Complete">
      <Card padded style="max-width: 600px;">
        <PipelineStatus :stages="complete" />
      </Card>
    </Variant>

    <Variant title="Vertical">
      <Card padded style="max-width: 320px;">
        <PipelineStatus :stages="ingest" orientation="vertical" />
      </Card>
    </Variant>
  </Story>
</template>
