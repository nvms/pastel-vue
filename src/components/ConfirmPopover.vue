<script setup>
import { Icon } from "@iconify/vue"
import Popover from "./Popover.vue"
import Button from "./Button.vue"

const props = defineProps({
  title: { type: String, default: "" },
  message: { type: String, default: "" },
  confirmLabel: { type: String, default: "Confirm" },
  cancelLabel: { type: String, default: "Cancel" },
  variant: { type: String, default: "primary" }, // primary | danger
  placement: { type: String, default: "top" },
  offset: { type: Number, default: 8 },
  // optional leading icon, e.g. "lucide:trash-2"
  icon: { type: String, default: "" },
})

const emit = defineEmits(["confirm", "cancel", "open", "close"])

const onConfirm = (close) => { emit("confirm"); close() }
const onCancel = (close) => { emit("cancel"); close() }
</script>

<template>
  <Popover :placement="placement" :offset="offset" @open="emit('open')" @close="emit('close')">
    <template #trigger="{ open }">
      <slot name="trigger" :open="open" />
    </template>

    <template #default="{ close }">
      <div class="pc-confirm" :class="`pc-confirm--${variant}`">
        <div v-if="icon || title" class="pc-confirm__head">
          <Icon v-if="icon" :icon="icon" class="pc-confirm__icon" aria-hidden="true" />
          <span v-if="title" class="pc-confirm__title">{{ title }}</span>
        </div>

        <p class="pc-confirm__message"><slot>{{ message }}</slot></p>

        <div class="pc-confirm__actions">
          <Button variant="outline" size="sm" @click="onCancel(close)">{{ cancelLabel }}</Button>
          <Button :variant="variant === 'danger' ? 'danger' : 'primary'" size="sm" @click="onConfirm(close)">
            {{ confirmLabel }}
          </Button>
        </div>
      </div>
    </template>
  </Popover>
</template>

<style scoped>
.pc-confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
  max-width: 280px;
}

.pc-confirm__head { display: flex; align-items: center; gap: 8px; }
.pc-confirm__icon { font-size: 16px; color: var(--ink-60); flex-shrink: 0; }
.pc-confirm--danger .pc-confirm__icon { color: var(--status-failed); }
.pc-confirm__title {
  font-family: var(--display);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.14px;
  color: var(--ink);
}

.pc-confirm__message {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-60);
}

.pc-confirm__actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 2px; }
</style>
