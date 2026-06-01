<script setup>
import { ref } from "vue"
import Avatar from "../src/components/Avatar.vue"

const clicks = ref(0)
</script>

<template>
  <Story title="Avatar">
    <Variant title="Sizes">
      <div style="display: flex; align-items: flex-end; gap: 12px;">
        <Avatar name="Aiyana Khan" size="xs" />
        <Avatar name="Aiyana Khan" size="sm" />
        <Avatar name="Aiyana Khan" size="md" />
        <Avatar name="Aiyana Khan" size="lg" />
        <Avatar name="Aiyana Khan" size="xl" />
      </div>
    </Variant>

    <Variant title="Tones (no gradients)">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Avatar name="Maya Chen" tone="dark" />
        <Avatar name="Marcus Reyes" tone="neutral" />
        <Avatar name="Ife Adebayo" tone="invert" />
        <Avatar name="Daniela Park" tone="lavender" />
      </div>
    </Variant>

    <Variant title="Interactive (clickable, pushes down on press)">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Avatar name="Maya Chen" tone="dark" interactive @click="clicks++" />
        <Avatar name="Marcus Reyes" tone="neutral" interactive @click="clicks++" />
        <Avatar name="Ife Adebayo" tone="invert" interactive @click="clicks++" />
        <Avatar name="Daniela Park" tone="lavender" shape="square" interactive @click="clicks++" />
        <Avatar size="lg" interactive src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face" alt="Person" @click="clicks++" />
      </div>
      <div style="margin-top: 14px; color: var(--ink-60); font-size: 13px;">
        Clicks: <code>{{ clicks }}</code> — press one and watch it dip like the icon buttons. Tab to one for the focus ring.
      </div>
    </Variant>

    <Variant title="Shapes">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Avatar name="Theodora Whitfield" shape="circle" tone="dark" size="lg" />
        <Avatar name="Theodora Whitfield" shape="square" tone="dark" size="lg" />
      </div>
    </Variant>

    <Variant title="Image">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Avatar size="lg" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face" alt="Person" />
        <Avatar size="lg" shape="square" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face" alt="Person" />
      </div>
    </Variant>

    <Variant title="Fallback (no name, no src)">
      <div style="display: flex; gap: 12px; align-items: center;">
        <Avatar tone="neutral" />
        <Avatar tone="dark" size="lg" />
        <Avatar tone="invert" size="xl" />
      </div>
    </Variant>

    <Variant title="In context (key-value with avatar)">
      <div style="display: flex; align-items: center; gap: 10px; max-width: 320px;">
        <Avatar name="Theodora Whitfield" size="md" />
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 14px; letter-spacing: -0.14px;">Theodora Whitfield</div>
          <div class="pc-mono" style="color: var(--ink-60); font-size: 10px; letter-spacing: 0.06em;">Signed v2.1 · 2026-04-22</div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
