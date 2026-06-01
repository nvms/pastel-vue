<script setup>
import ChunkedDocument from "../src/components/ChunkedDocument.vue"
import Card from "../src/components/Card.vue"

const docText = `This Master Services Agreement is entered into between the Provider and the Client as of the Effective Date. The Provider shall deliver the services described in Schedule A within thirty business days. Any delay beyond this period entitles the Client to a pro-rata refund of fees already paid.

The Client agrees to provide all necessary materials, access, and approvals in a timely manner. Fees are invoiced monthly and are due within fifteen days of the invoice date. Late payments accrue interest at one and one-half percent per month until paid in full.

Confidential information disclosed by either party shall not be shared with third parties without prior written consent. This obligation survives termination of the Agreement for a period of three years.`

// sliding-window chunks with overlap
const chunkText = (text, size, overlap) => {
  const out = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(text.length, start + size)
    out.push({ start, end, tokens: Math.round((end - start) / 4) })
    if (end >= text.length) break
    start = end - overlap
  }
  return out
}

const overlapping = chunkText(docText, 240, 50)
const tight = chunkText(docText, 200, 0)
</script>

<template>
  <Story title="ChunkedDocument">
    <Variant title="List view">
      <Card padded style="max-width: 640px;">
        <ChunkedDocument :text="docText" :chunks="overlapping" />
      </Card>
    </Variant>

    <Variant title="List view - no overlap">
      <Card padded style="max-width: 640px;">
        <ChunkedDocument :text="docText" :chunks="tight" />
      </Card>
    </Variant>

    <Variant title="Stepper view">
      <Card padded style="max-width: 640px;">
        <ChunkedDocument :text="docText" :chunks="overlapping" view="stepper" />
      </Card>
      <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
        Hover the document to preview a chunk (amber); click to pin it (lavender).
        The deeper band at each end is the overlap with the adjacent chunk.
      </p>
    </Variant>
  </Story>
</template>
