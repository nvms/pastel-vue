<script setup>
import { ref } from "vue"
import Switch from "../src/components/Switch.vue"

const a = ref(false)
const b = ref(true)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// success path: stays in place + spinner while loading, then flips on success
const backups = ref(false)
const backupsLoading = ref(false)
async function toggleBackups(next) {
  backupsLoading.value = true
  await sleep(1300)
  backups.value = next // succeeded -> apply
  backupsLoading.value = false
}

// failure path: same spinner, but the value is left unchanged so it stays put
const risky = ref(false)
const riskyLoading = ref(false)
async function toggleRisky() {
  riskyLoading.value = true
  await sleep(1300)
  riskyLoading.value = false // failed -> leave value as-is
}
</script>

<template>
  <Story title="Switch">
    <Variant title="Basic">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <Switch v-model="a" label="Notifications" />
        <Switch v-model="b" label="Auto-save" />
        <Switch :model-value="false" disabled label="Disabled" />
        <Switch :model-value="true" disabled label="Disabled (on)" />
      </div>
    </Variant>

    <Variant title="Async loading">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 440px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <Switch
            :model-value="backups"
            :loading="backupsLoading"
            label="Enable nightly backups (succeeds)"
            @update:model-value="toggleBackups"
          />
          <span style="font-size: 12px; color: var(--ink-40); padding-left: 40px;">
            off → spinner (still off) → on
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <Switch
            :model-value="risky"
            :loading="riskyLoading"
            label="Connect service (fails)"
            @update:model-value="toggleRisky"
          />
          <span style="font-size: 12px; color: var(--ink-40); padding-left: 40px;">
            off → spinner (still off) → stays off
          </span>
        </div>

        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          The handler holds the switch in place with a spinner while the async work runs, then
          flips the value only on success. On failure it leaves the value unchanged, so the
          thumb never moves.
        </p>
      </div>
    </Variant>
  </Story>
</template>
