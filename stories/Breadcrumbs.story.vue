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
        { label: 'Jurisdictions', to: '/jurisdictions' },
        { label: 'Denver County', to: '/jurisdictions/denver' },
        { label: 'C.R.S. 13-40-104' },
      ]" />
    </Variant>

    <Variant title="Chevron separator + icons">
      <Breadcrumbs
        separator="›"
        :items="[
          { label: 'Home', to: '/', icon: 'home' },
          { label: 'Workflows', to: '/workflows', icon: 'workflows' },
          { label: 'Eviction intake', to: '/workflows/intake' },
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
            { label: 'Jurisdictions' },
            { label: 'Colorado' },
            { label: 'Denver County' },
            { label: 'County Court' },
            { label: 'Division 16' },
            { label: 'Hon. Whitfield' },
            { label: 'Case 2026-EVN-2401' },
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
