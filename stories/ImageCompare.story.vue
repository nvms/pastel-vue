<script setup>
import { ref } from "vue"
import ImageCompare from "../src/components/ImageCompare.vue"

// Lorem Picsum - stable photos by seed, with blur / grayscale params built in
const shot = (seed) => `https://picsum.photos/seed/${seed}/960/600`

const enhanceBefore = `${shot("alpine-ridge")}?blur=5`
const enhanceAfter = shot("alpine-ridge")

const gradeBefore = `${shot("alpine-harbor")}?grayscale`
const gradeAfter = shot("alpine-harbor")

const a = ref(50)
const b = ref(50)
const c = ref(28)
</script>

<template>
  <Story title="ImageCompare">
    <Variant title="Enhance (blur to sharp)">
      <div style="max-width: 520px;">
        <ImageCompare
          v-model="a"
          :before="enhanceBefore"
          :after="enhanceAfter"
          before-label="Blurred"
          after-label="Enhanced"
          alt="Landscape, before and after enhancement"
        />
        <p style="margin-top: 10px; font-size: 13px; color: var(--ink-60);">
          Drag the handle, or focus it and use the arrow keys.
        </p>
      </div>
    </Variant>

    <Variant title="Color grade (grayscale to color)">
      <div style="max-width: 520px;">
        <ImageCompare
          v-model="b"
          :before="gradeBefore"
          :after="gradeAfter"
          before-label="Original"
          after-label="Graded"
          alt="Photo, grayscale versus color"
        />
      </div>
    </Variant>

    <Variant title="Custom start position">
      <div style="max-width: 520px;">
        <ImageCompare
          v-model="c"
          :before="enhanceBefore"
          :after="enhanceAfter"
        />
      </div>
    </Variant>

    <Variant title="No labels">
      <div style="max-width: 520px;">
        <ImageCompare
          v-model="a"
          :before="enhanceBefore"
          :after="enhanceAfter"
          :show-labels="false"
        />
      </div>
    </Variant>
  </Story>
</template>
