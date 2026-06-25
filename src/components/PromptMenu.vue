<script setup>
import { ref, computed } from "vue"
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue"
import { Icon } from "@iconify/vue"
import { useClickOutside } from "../composables/useClickOutside.js"
import Button from "./Button.vue"

const props = defineProps({
  // each item is a string, or { label, text, description?, icon? }. a bare
  // string is both the label and the inserted text
  prompts: { type: Array, default: () => [] },
  // iconify name for the default trigger button
  icon: { type: String, default: "lucide:sparkles" },
  placement: { type: String, default: "top-end" },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: "Prompt suggestions" }, // aria-label for the trigger
})

const emit = defineEmits(["select"])

const items = computed(() =>
  props.prompts.map((p) =>
    typeof p === "string" ? { label: p, text: p } : { ...p, label: p.label ?? p.text },
  ),
)

const open = ref(false)
const triggerRef = ref(null)
const floatingRef = ref(null)

const { floatingStyles, isPositioned } = useFloating(triggerRef, floatingRef, {
  placement: computed(() => props.placement),
  whileElementsMounted: autoUpdate,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
})

useClickOutside([triggerRef, floatingRef], () => { open.value = false })

const toggle = () => { if (!props.disabled) open.value = !open.value }

const onSelect = (item) => {
  emit("select", item.text)
  open.value = false
}
</script>

<template>
  <span ref="triggerRef" class="pc-promptmenu__trigger">
    <slot name="trigger" :open="open" :toggle="toggle">
      <Button
        :icon="icon"
        variant="ghost"
        size="sm"
        :disabled="disabled"
        :aria-label="label"
        :aria-expanded="open"
        @click="toggle"
      />
    </slot>
  </span>

  <Teleport to="body">
    <Transition name="pc-promptmenu">
      <div
        v-if="open"
        ref="floatingRef"
        :class="['pc-promptmenu', { 'pc-promptmenu--ready': isPositioned }]"
        :style="floatingStyles"
        role="menu"
        @keydown.esc="open = false"
      >
        <button
          v-for="(item, i) in items"
          :key="i"
          type="button"
          class="pc-promptmenu__item"
          role="menuitem"
          @click="onSelect(item)"
        >
          <Icon v-if="item.icon" :icon="item.icon" class="pc-promptmenu__icon" aria-hidden="true" />
          <span class="pc-promptmenu__body">
            <span class="pc-promptmenu__label">{{ item.label }}</span>
            <span v-if="item.description" class="pc-promptmenu__desc">{{ item.description }}</span>
          </span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pc-promptmenu__trigger { display: inline-flex; }

.pc-promptmenu {
  position: absolute;
  z-index: 8500;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
  padding: 4px;
  min-width: 240px;
  max-width: 360px;
  font-size: 14px;
  opacity: 0;
  visibility: hidden;
}
.pc-promptmenu--ready {
  visibility: visible;
  animation: pc-promptmenu-in 130ms ease-out forwards;
}
.pc-promptmenu-leave-active.pc-promptmenu--ready {
  animation: pc-promptmenu-out 110ms ease-in forwards;
}
/* opens upward, so it rises into place from just below */
@keyframes pc-promptmenu-in {
  from { opacity: 0; translate: 0 6px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-promptmenu-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .pc-promptmenu--ready { animation: none; opacity: 1; }
  .pc-promptmenu-leave-active.pc-promptmenu--ready { animation: none; opacity: 0; }
}

.pc-promptmenu__item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sharp);
  color: var(--ink);
  text-align: left;
  outline: none;
  transition: background 120ms ease;
}
.pc-promptmenu__item:hover { background: var(--ink-04); }
.pc-promptmenu__item:focus-visible { background: var(--ink-04); }
.pc-promptmenu__item:active { background: var(--ink-08); }

.pc-promptmenu__icon { font-size: 15px; color: var(--ink-60); flex-shrink: 0; margin-top: 1px; }

.pc-promptmenu__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pc-promptmenu__label {
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: -0.14px;
  line-height: 1.3;
}
.pc-promptmenu__desc {
  font-size: 12px;
  color: var(--ink-60);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
