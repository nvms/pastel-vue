<script setup>
import { ref } from "vue"
import ConfirmPopover from "../src/components/ConfirmPopover.vue"
import Button from "../src/components/Button.vue"

const log = ref("")
const dishes = ref(["Duck confit", "Coq au vin", "Bouillabaisse"])

function removeDish(d) {
  dishes.value = dishes.value.filter((x) => x !== d)
  log.value = `Deleted ${d}`
}
</script>

<template>
  <Story title="ConfirmPopover">
    <!-- the core case: a destructive confirm anchored to a delete button -->
    <Variant title="Delete confirmation">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 120px;">
        <ConfirmPopover
          message="Delete this dish? This cannot be undone."
          confirm-label="Delete"
          variant="danger"
          @confirm="log = 'Confirmed delete'"
          @cancel="log = 'Cancelled'"
        >
          <template #trigger>
            <Button icon="lucide:trash-2" variant="danger" size="sm">Delete dish</Button>
          </template>
        </ConfirmPopover>
        <p style="font-size: 13px; color: var(--ink-60); margin: 0;">
          Result: <code>{{ log || "nothing yet" }}</code>
        </p>
      </div>
    </Variant>

    <!-- with a title and a leading icon -->
    <Variant title="With title and icon">
      <div style="padding-top: 140px;">
        <ConfirmPopover
          title="Delete recipe?"
          message="The recipe and its photos will be permanently removed."
          confirm-label="Delete"
          variant="danger"
          icon="lucide:trash-2"
          @confirm="log = 'Recipe deleted'"
        >
          <template #trigger>
            <Button icon="lucide:trash-2" variant="ghost" size="sm" aria-label="Delete recipe" />
          </template>
        </ConfirmPopover>
      </div>
    </Variant>

    <!-- a non-destructive (primary) confirm -->
    <Variant title="Primary confirm">
      <div style="padding-top: 120px;">
        <ConfirmPopover
          message="Publish tonight's menu to the floor?"
          confirm-label="Publish"
          placement="bottom-start"
          @confirm="log = 'Menu published'"
        >
          <template #trigger>
            <Button variant="primary" size="sm" icon="lucide:send">Publish menu</Button>
          </template>
        </ConfirmPopover>
      </div>
    </Variant>

    <!-- live list: each row's delete pops a confirm and actually removes the dish -->
    <Variant title="In a list">
      <div style="max-width: 360px; padding-top: 60px;">
        <div
          v-for="d in dishes"
          :key="d"
          style="display: flex; align-items: center; justify-content: space-between; padding: 10px 4px; border-bottom: 1px solid var(--ink-08);"
        >
          <span style="font-size: 14px;">{{ d }}</span>
          <ConfirmPopover
            :message="`Delete ${d}?`"
            confirm-label="Delete"
            variant="danger"
            placement="left"
            @confirm="removeDish(d)"
          >
            <template #trigger>
              <Button icon="lucide:trash-2" variant="ghost" size="sm" :aria-label="`Delete ${d}`" />
            </template>
          </ConfirmPopover>
        </div>
        <p v-if="!dishes.length" style="font-size: 13px; color: var(--ink-60);">All dishes deleted.</p>
      </div>
    </Variant>
  </Story>
</template>
