<script setup>
import { Icon } from "@iconify/vue"
import {
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarCheckboxItem,
  MenubarItemIndicator,
} from "reka-ui"

defineProps({
  /**
   * menus: [{
   *   key?, label,
   *   items: [{
   *     label, icon?, value?, shortcut?, danger?, disabled?,
   *     divider?: true,
   *     checked?: boolean | undefined,   // renders as a checkable item
   *     items?: [...]                     // nested submenu (one level)
   *   }]
   * }]
   * shortcut: string or array of key tokens, e.g. ["⌘", "⇧", "N"]
   */
  menus: { type: Array, default: () => [] },
  size: { type: String, default: "md" }, // sm | md
  bordered: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  tinted: { type: Boolean, default: false },
  modelValue: { type: String, default: undefined },
})
const emit = defineEmits(["select", "update:modelValue"])

const onSelect = (item) => {
  if (item.disabled) return
  emit("select", item)
}

// switching menus by hovering refocuses the newly opened panel, which reka portals to
// <body> - so the previous menu's dismiss layer sees that focus as "outside" and closes,
// wiping the open state. treat focus landing on our own surfaces (the bar or any of our
// portaled panels) as internal and block the dismiss. real outside clicks (pointerdown)
// still dismiss as usual
const onInteractOutside = (e) => {
  const orig = e?.detail?.originalEvent
  if (orig?.type === "pointerdown") return
  if (orig?.target?.closest?.(".pc-menubar, .pc-mb-menu")) e.preventDefault()
}

const keysOf = (s) => Array.isArray(s) ? s : (s == null ? [] : [s])
</script>

<template>
  <MenubarRoot
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :class="[
      'pc-menubar',
      `pc-menubar--${size}`,
      { 'pc-menubar--bordered': bordered, 'pc-menubar--sticky': sticky, 'pc-menubar--tinted': tinted },
    ]"
  >
    <div v-if="$slots.leading" class="pc-menubar__group pc-menubar__leading"><slot name="leading" /></div>

    <div class="pc-menubar__menus">
      <MenubarMenu v-for="(menu, i) in menus" :key="menu.key ?? menu.label ?? i">
        <MenubarTrigger class="pc-menubar__trigger">{{ menu.label }}</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent
            class="pc-mb-menu"
            :align="'start'"
            :side-offset="4"
            :collision-padding="8"
            @interact-outside="onInteractOutside"
          >
            <template v-for="(item, j) in menu.items" :key="j">
              <MenubarSeparator v-if="item.divider" class="pc-mb-menu__divider" />

              <MenubarSub v-else-if="item.items && item.items.length">
                <MenubarSubTrigger
                  class="pc-mb-menu__item"
                  :class="{ 'pc-mb-menu__item--disabled': item.disabled }"
                  :disabled="item.disabled"
                >
                  <span class="pc-mb-menu__icon">
                    <Icon v-if="item.icon" :icon="item.icon" />
                  </span>
                  <span class="pc-mb-menu__label">{{ item.label }}</span>
                  <Icon icon="lucide:chevron-right" class="pc-mb-menu__chevron" aria-hidden="true" />
                </MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent class="pc-mb-menu" :side-offset="4" :collision-padding="8">
                    <template v-for="(sub, k) in item.items" :key="k">
                      <MenubarSeparator v-if="sub.divider" class="pc-mb-menu__divider" />
                      <MenubarItem
                        v-else
                        class="pc-mb-menu__item"
                        :class="{ 'pc-mb-menu__item--danger': sub.danger, 'pc-mb-menu__item--disabled': sub.disabled }"
                        :disabled="sub.disabled"
                        @select="onSelect(sub)"
                      >
                        <span class="pc-mb-menu__icon">
                          <Icon v-if="sub.icon" :icon="sub.icon" />
                        </span>
                        <span class="pc-mb-menu__label">{{ sub.label }}</span>
                        <span v-if="sub.shortcut" class="pc-mb-menu__shortcut">
                          <kbd v-for="(key, ki) in keysOf(sub.shortcut)" :key="ki" class="pc-mb-menu__key">{{ key }}</kbd>
                        </span>
                      </MenubarItem>
                    </template>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>

              <MenubarCheckboxItem
                v-else-if="item.checked !== undefined"
                :model-value="item.checked"
                class="pc-mb-menu__item"
                :class="{ 'pc-mb-menu__item--disabled': item.disabled }"
                :disabled="item.disabled"
                @select="onSelect(item)"
              >
                <span class="pc-mb-menu__icon">
                  <MenubarItemIndicator>
                    <Icon icon="lucide:check" />
                  </MenubarItemIndicator>
                </span>
                <span class="pc-mb-menu__label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="pc-mb-menu__shortcut">
                  <kbd v-for="(key, ki) in keysOf(item.shortcut)" :key="ki" class="pc-mb-menu__key">{{ key }}</kbd>
                </span>
              </MenubarCheckboxItem>

              <MenubarItem
                v-else
                class="pc-mb-menu__item"
                :class="{ 'pc-mb-menu__item--danger': item.danger, 'pc-mb-menu__item--disabled': item.disabled }"
                :disabled="item.disabled"
                @select="onSelect(item)"
              >
                <span class="pc-mb-menu__icon">
                  <Icon v-if="item.icon" :icon="item.icon" />
                </span>
                <span class="pc-mb-menu__label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="pc-mb-menu__shortcut">
                  <kbd v-for="(key, ki) in keysOf(item.shortcut)" :key="ki" class="pc-mb-menu__key">{{ key }}</kbd>
                </span>
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </div>

    <div v-if="$slots.trailing" class="pc-menubar__group pc-menubar__trailing"><slot name="trailing" /></div>
  </MenubarRoot>
</template>

<style>
/* unscoped: content is portaled and must be reachable from body */
.pc-menubar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  min-height: 38px;
  background: var(--paper);
  font-family: var(--display);
  letter-spacing: -0.14px;
}
.pc-menubar--sm { min-height: 32px; padding: 2px 8px; gap: 6px; }
.pc-menubar--bordered { border-bottom: 1px solid var(--ink-08); }
.pc-menubar--sticky { position: sticky; top: 0; z-index: 5; }
.pc-menubar--tinted {
  background:
    radial-gradient(80% 140% at 0% 0%, rgba(189, 187, 255, 0.28), transparent 70%),
    radial-gradient(70% 140% at 100% 0%, rgba(214, 225, 255, 0.32), transparent 72%),
    var(--paper);
}

.pc-menubar__group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.pc-menubar__leading { padding-right: 6px; margin-right: 2px; border-right: 1px solid var(--ink-08); }
.pc-menubar__trailing { margin-left: auto; padding-left: 6px; }

.pc-menubar__menus { display: flex; align-items: center; gap: 2px; }

.pc-menubar__trigger {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 14px;
  font-family: var(--display);
  letter-spacing: -0.14px;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sharp);
  cursor: default;
  user-select: none;
  outline: none;
  transition: background 120ms ease, color 120ms ease;
}
.pc-menubar--sm .pc-menubar__trigger { height: 24px; padding: 0 8px; font-size: 13px; }
.pc-menubar__trigger:hover { background: var(--ink-04); }
.pc-menubar__trigger:focus-visible { box-shadow: var(--focus-ring); }
.pc-menubar__trigger[data-state="open"] { background: var(--midnight); color: var(--paper-on-dark); }

/* dropdown - mirrors ContextMenu */
.pc-mb-menu {
  z-index: 9000;
  background: var(--paper);
  border: 1px solid var(--ink-08);
  border-radius: var(--radius-comfy);
  box-shadow: var(--shadow-medium);
  padding: 4px;
  min-width: 220px;
  font-size: 14px;
  font-family: var(--display);
  letter-spacing: -0.14px;
  color: var(--ink);
  outline: none;
}
.pc-mb-menu[data-state="open"] { animation: pc-mb-menu-in 120ms ease-out; }
.pc-mb-menu[data-state="closed"] { animation: pc-mb-menu-out 110ms ease-in forwards; }
@keyframes pc-mb-menu-in {
  from { opacity: 0; translate: 0 -4px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes pc-mb-menu-out {
  from { opacity: 1; translate: 0 0; }
  to { opacity: 0; translate: 0 -4px; }
}

.pc-mb-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--radius-sharp);
  cursor: default;
  outline: none;
  user-select: none;
  color: var(--ink);
  transition: background 120ms ease;
}
.pc-mb-menu__item[data-highlighted],
.pc-mb-menu__item[data-state="open"] { background: var(--ink-04); }
.pc-mb-menu__item--danger { color: var(--status-failed); }
.pc-mb-menu__item--danger[data-highlighted] { background: var(--status-failed-bg); }
.pc-mb-menu__item:active { background: var(--ink-08); }
.pc-mb-menu__item--danger:active {
  background: color-mix(in srgb, var(--status-failed) 18%, var(--paper));
}
.pc-mb-menu__item--disabled,
.pc-mb-menu__item[data-disabled] { color: var(--ink-40); pointer-events: none; }

.pc-mb-menu__icon {
  width: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  color: var(--ink-60);
}
.pc-mb-menu__item--danger .pc-mb-menu__icon { color: var(--status-failed); }
.pc-mb-menu__label { flex: 1; white-space: nowrap; }

/* shortcut keycaps - system font renders ⌘ ⇧ ⌥ ⌫ glyphs cleanly */
.pc-mb-menu__shortcut {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}
.pc-mb-menu__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--ink-04);
  color: var(--ink-60);
  font-family: ui-sans-serif, -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}
.pc-mb-menu__chevron {
  font-size: 15px;
  color: var(--ink-40);
  flex-shrink: 0;
}
.pc-mb-menu__divider {
  height: 1px;
  background: var(--ink-08);
  margin: 4px 2px;
  border: 0;
}
</style>
