<script setup>
import { ref } from "vue"
import Breadcrumbs from "../src/components/Breadcrumbs.vue"
import { NavIcon } from "./nav-icons.js"

const picked = ref(null)
</script>

<template>
  <Story title="Breadcrumbs">
    <Variant title="Default">
      <Breadcrumbs :items="[
        { label: 'Venues', to: '/venues' },
        { label: 'West Kitchen', to: '/venues/west-kitchen' },
        { label: 'FDA Food Code § 3-501.14' },
      ]" />
    </Variant>

    <Variant title="Chevron separator + icons">
      <Breadcrumbs
        separator="›"
        :items="[
          { label: 'Home', to: '/', icon: 'home' },
          { label: 'Workflows', to: '/workflows', icon: 'workflows' },
          { label: 'Recipe intake', to: '/workflows/intake' },
          { label: 'v2.1' },
        ]"
      >
        <template #icon="{ item }">
          <NavIcon :name="item.icon" :size="13" />
        </template>
      </Breadcrumbs>
    </Variant>

    <Variant title="Collapsed (long path)">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <Breadcrumbs
          separator="›"
          :max-items="4"
          :items="[
            { label: 'Venues' },
            { label: 'Colorado' },
            { label: 'West Kitchen' },
            { label: 'Mains' },
            { label: 'Station 16' },
            { label: 'Chef Whitfield' },
            { label: 'Recipe 2026-RCP-2401' },
          ]"
          @select="(item) => (picked = item.label)"
        />
        <p style="margin: 0; font-size: 13px; color: var(--ink-60);">
          Click the <code>…</code> to open the collapsed crumbs.
          Selected: <code>{{ picked || '(none)' }}</code>
        </p>
      </div>
    </Variant>
  </Story>
</template>
