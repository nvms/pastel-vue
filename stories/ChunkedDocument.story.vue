<script setup>
import ChunkedDocument from "../src/components/ChunkedDocument.vue"
import Card from "../src/components/Card.vue"

const docText = `This braised short rib recipe is built for a twelve-portion batch and comes together in a single heavy pot. Season the ribs at about one and one-half percent salt by weight the night before, then sear them on all sides over high heat until deeply browned, roughly ten minutes total.

Add the mirepoix and braising liquid, bring everything to a gentle simmer, then cover the pot and move it to a 300°F oven. Braise for about three hours, until the meat pulls easily from the bone, basting once or twice along the way.

Cool the braise properly before storing it. Once cooled it keeps for up to four days, and the flavor deepens after the first day; lift off the firm surface fat before reheating gently for service.`

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
