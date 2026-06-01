<script setup>
import { ref } from "vue"
import Banner from "../src/components/Banner.vue"
import Button from "../src/components/Button.vue"
import ArrowLink from "../src/components/ArrowLink.vue"

const trial = ref(true)
const maintenance = ref(true)
const announce = ref(true)
const danger = ref(true)
</script>

<template>
  <Story title="Banner">
    <Variant title="Variants">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <Banner variant="info" title="Heads up" message="A new model is available for evaluation runs." />
        <Banner variant="success" title="All systems normal" message="Ingest queue caught up 4 minutes ago." />
        <Banner variant="warning" title="Trial expires in 3 days" message="Upgrade to keep your evaluation history." />
        <Banner variant="danger" title="Read-only mode" message="The primary database is failing over. Writes are paused." />
        <Banner variant="neutral" message="Scheduled maintenance window starts tonight at 22:00 UTC." />
        <Banner variant="announce" title="Pastel 1.4 is out" message="New Wizard, MenuBar, Collapsible, and Banner components." />
      </div>
    </Variant>

    <Variant title="With actions">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <Banner
          v-model="trial"
          variant="warning"
          title="Trial expires in 3 days"
          dismissible
        >
          <template #default>
            You have used 84% of your evaluation quota this cycle.
          </template>
          <template #actions>
            <ArrowLink href="#" size="sm">Compare plans</ArrowLink>
            <Button size="sm" variant="primary">Upgrade</Button>
          </template>
        </Banner>

        <Banner
          v-model="maintenance"
          variant="info"
          title="Maintenance tonight"
          message="Workers will restart at 22:00 UTC. Expect a 90 second pause."
          dismissible
        >
          <template #actions>
            <ArrowLink href="#" size="sm">Status page</ArrowLink>
          </template>
        </Banner>
      </div>
    </Variant>

    <Variant title="Centered">
      <Banner
        v-model="announce"
        variant="announce"
        align="center"
        title="Pastel 1.4 is out"
        message="Wizard, MenuBar, Collapsible, Banner."
        dismissible
      >
        <template #actions>
          <ArrowLink href="#" size="sm" arrow="up-right">Release notes</ArrowLink>
        </template>
      </Banner>
    </Variant>

    <Variant title="Sticky at top">
      <div style="height: 360px; overflow: auto; border: 1px solid var(--ink-08); border-radius: 8px;">
        <Banner variant="warning" sticky title="Read-only mode" message="Writes are paused during failover.">
          <template #actions>
            <ArrowLink href="#" size="sm">Status</ArrowLink>
          </template>
        </Banner>
        <div style="padding: 24px;">
          <p v-for="n in 12" :key="n" style="margin: 0 0 14px; color: var(--ink-60);">
            Scroll body content here. The banner stays pinned to the top of its scroll container.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Dismiss animates out">
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <Banner
          v-model="danger"
          variant="danger"
          title="Database failover"
          message="Reads are unaffected. Writes will resume automatically."
          dismissible
        />
        <div>
          <Button v-if="!danger" size="sm" variant="outline" @click="danger = true">Bring it back</Button>
        </div>
      </div>
    </Variant>
  </Story>
</template>
