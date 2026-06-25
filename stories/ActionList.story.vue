<script setup>
import { ref } from "vue"
import ActionList from "../src/components/ActionList.vue"
import Card from "../src/components/Card.vue"
import SectionLabel from "../src/components/SectionLabel.vue"
import Button from "../src/components/Button.vue"

const STEPS = [
  { label: "Score the duck skin in a tight crosshatch" },
  { label: "Render the fat low and slow before flipping" },
  { label: "Bring proteins to room temperature first" },
  { label: "Deglaze the pan and reduce for the sauce" },
  { label: "Reduce the stock until it coats a spoon" },
  { label: "Rest the breast for half its cooking time" },
  { label: "Season in layers and taste as you go" },
  { label: "Wipe the plate rim before it leaves the pass" },
]

const STATIONS = [
  { label: "Garde manger", subtitle: "Cold apps, salads, and charcuterie", icon: "lucide:salad" },
  { label: "Saucier", subtitle: "Sauces, soups, and sautés", icon: "lucide:soup" },
  { label: "Pâtissier", subtitle: "Breads, pastries, and desserts", icon: "lucide:cake" },
  { label: "Poissonnier", subtitle: "Fish and shellfish preparation", icon: "lucide:fish" },
  { label: "Rôtisseur", subtitle: "Roasts, grills, and fried items", icon: "lucide:flame" },
]

const selected = ref("")
</script>

<template>
  <Story title="ActionList">
    <!-- plain rows, trailing chevron, no subtitle -->
    <Variant title="Without subtitle">
      <div style="max-width: 560px;">
        <ActionList :items="STEPS" @select="selected = $event.label" />
        <p style="font-size: 13px; color: var(--ink-60); margin: 12px 2px 0;">
          Last selected: <code>{{ selected || "nothing yet" }}</code>
        </p>
      </div>
    </Variant>

    <!-- compact: tighter rows for dense lists -->
    <Variant title="Compact">
      <div style="max-width: 560px;">
        <ActionList :items="STEPS" compact @select="selected = $event.label" />
      </div>
    </Variant>

    <!-- same idea, now with muted subtext under each label -->
    <Variant title="With subtitle">
      <div style="max-width: 560px;">
        <ActionList :items="STATIONS" />
      </div>
    </Variant>

    <!-- realistic context: list inside a titled card -->
    <Variant title="Inside a card">
      <div style="max-width: 560px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <SectionLabel>Method steps <span style="color: var(--ink-40)">8</span></SectionLabel>
          <Button variant="outline" size="sm" icon="lucide:wand-2">Re-extract steps</Button>
        </div>
        <Card style="overflow: hidden;">
          <ActionList :items="STEPS" />
        </Card>
      </div>
    </Variant>

    <!-- entrance animation is gated by the animate prop -->
    <Variant title="No entrance animation">
      <div style="max-width: 560px;">
        <ActionList :items="STATIONS" :animate="false" />
      </div>
    </Variant>
  </Story>
</template>
