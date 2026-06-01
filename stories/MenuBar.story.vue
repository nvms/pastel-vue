<script setup>
import { ref } from "vue"
import MenuBar from "../src/components/MenuBar.vue"
import Button from "../src/components/Button.vue"
import Badge from "../src/components/Badge.vue"
import Avatar from "../src/components/Avatar.vue"
import { Icon } from "@iconify/vue"

const last = ref(null)
const onSelect = (item) => { last.value = item.label }

const menus = [
  {
    label: "File",
    items: [
      { label: "New File", value: "new", icon: "lucide:file-plus", shortcut: ["⌘", "N"] },
      { label: "New Window", value: "new-window", shortcut: ["⇧", "⌘", "N"] },
      {
        label: "New from Template",
        icon: "lucide:file-plus-2",
        items: [
          { label: "Empty Document", value: "tpl-empty" },
          { label: "Recipe Card", value: "tpl-brief", icon: "lucide:chef-hat" },
          { label: "Prep List", value: "tpl-memo", icon: "lucide:notebook-pen" },
          { divider: true },
          { label: "Browse all…", value: "tpl-browse" },
        ],
      },
      { label: "Open…", value: "open", icon: "lucide:folder-open", shortcut: ["⌘", "O"] },
      {
        label: "Open Recent",
        items: [
          { label: "recipe-2026-rcp-2401", value: "recent-1" },
          { label: "recipe-2026-rcp-2398", value: "recent-2" },
          { label: "recipe-2026-rcp-2390", value: "recent-3" },
          { divider: true },
          { label: "Clear Menu", value: "recent-clear", danger: true },
        ],
      },
      { divider: true },
      { label: "Save", value: "save", icon: "lucide:save", shortcut: ["⌘", "S"] },
      { label: "Save As…", value: "save-as", shortcut: ["⇧", "⌘", "S"] },
      { divider: true },
      { label: "Close Window", value: "close", shortcut: ["⌘", "W"] },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", value: "undo", icon: "lucide:undo-2", shortcut: ["⌘", "Z"] },
      { label: "Redo", value: "redo", icon: "lucide:redo-2", shortcut: ["⇧", "⌘", "Z"] },
      { divider: true },
      { label: "Cut", value: "cut", shortcut: ["⌘", "X"] },
      { label: "Copy", value: "copy", shortcut: ["⌘", "C"] },
      { label: "Paste", value: "paste", shortcut: ["⌘", "V"] },
      { divider: true },
      { label: "Find…", value: "find", icon: "lucide:search", shortcut: ["⌘", "F"] },
      { label: "Replace…", value: "replace", shortcut: ["⌥", "⌘", "F"] },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Sidebar", value: "sidebar", checked: true, shortcut: ["⌘", "B"] },
      { label: "Inspector", value: "inspector", checked: false, shortcut: ["⌘", "I"] },
      { label: "Status Bar", value: "statusbar", checked: true },
      { divider: true },
      {
        label: "Appearance",
        icon: "lucide:palette",
        items: [
          { label: "Light", value: "appearance-light", icon: "lucide:sun" },
          { label: "Dark", value: "appearance-dark", icon: "lucide:moon" },
          { label: "System", value: "appearance-system", icon: "lucide:monitor" },
        ],
      },
      { divider: true },
      { label: "Zoom In", value: "zoom-in", shortcut: ["⌘", "+"] },
      { label: "Zoom Out", value: "zoom-out", shortcut: ["⌘", "-"] },
      { label: "Actual Size", value: "zoom-reset", shortcut: ["⌘", "0"] },
    ],
  },
  {
    label: "Go",
    items: [
      { label: "Dashboard", value: "dashboard", icon: "lucide:layout-dashboard", shortcut: ["⌘", "1"] },
      { label: "Recipes", value: "recipes", icon: "lucide:folder", shortcut: ["⌘", "2"] },
      { label: "Evals", value: "evals", icon: "lucide:beaker", shortcut: ["⌘", "3"] },
      { divider: true },
      { label: "Command Palette…", value: "palette", icon: "lucide:command", shortcut: ["⌘", "K"] },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Documentation", value: "docs", icon: "lucide:book-open" },
      { label: "Keyboard Shortcuts", value: "shortcuts", shortcut: ["⌘", "/"] },
      { label: "Release Notes", value: "release" },
      { divider: true },
      { label: "Report Issue…", value: "issue", icon: "lucide:bug" },
      { label: "Sign Out", value: "signout", icon: "lucide:log-out", danger: true },
    ],
  },
]

const compactMenus = [
  {
    label: "Project",
    items: [
      { label: "Rename…", value: "rename", icon: "lucide:pencil" },
      { label: "Duplicate", value: "dup", icon: "lucide:copy", shortcut: ["⌘", "D"] },
      { divider: true },
      { label: "Archive", value: "archive", icon: "lucide:archive" },
      { label: "Delete", value: "delete", icon: "lucide:trash-2", danger: true, shortcut: ["⌘", "⌫"] },
    ],
  },
  {
    label: "Run",
    items: [
      { label: "Start Job", value: "start", icon: "lucide:play", shortcut: ["⌘", "R"] },
      { label: "Stop", value: "stop", icon: "lucide:square", disabled: true },
    ],
  },
  {
    label: "Share",
    items: [
      { label: "Copy Link", value: "copy", icon: "lucide:link" },
      { label: "Invite People…", value: "invite", icon: "lucide:user-plus" },
    ],
  },
]
</script>

<template>
  <Story title="MenuBar">
    <Variant title="App menubar (classic)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;">
        <MenuBar :menus="menus" bordered @select="onSelect">
          <template #leading>
            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 0 4px;">
              <Icon icon="lucide:gem" style="font-size: 16px;" />
              <strong style="font-size: 14px; letter-spacing: -0.16px;">Pastel</strong>
            </span>
          </template>
        </MenuBar>
        <div style="padding: 32px 16px; min-height: 160px; color: var(--ink-60); font-size: 13px;">
          Last action: <code>{{ last ?? "none" }}</code>
          <div style="margin-top: 8px; font-size: 12px;">
            File → New from Template, and File → Open Recent both have submenus.
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="With trailing actions">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;">
        <MenuBar :menus="menus" bordered @select="onSelect">
          <template #leading>
            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 0 4px;">
              <Icon icon="lucide:gem" style="font-size: 16px;" />
              <strong style="font-size: 14px;">Atelier</strong>
              <Badge>v2.4</Badge>
            </span>
          </template>
          <template #trailing>
            <Button variant="ghost" size="sm" icon="lucide:bell" />
            <Button variant="ghost" size="sm" icon="lucide:settings" />
            <Avatar name="J. Pyers" size="sm" interactive />
          </template>
        </MenuBar>
        <div style="padding: 32px 16px; min-height: 160px; color: var(--ink-60); font-size: 13px;">
          Last action: <code>{{ last ?? "none" }}</code>
        </div>
      </div>
    </Variant>

    <Variant title="Tinted (pastel wash)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;">
        <MenuBar :menus="menus" bordered tinted @select="onSelect">
          <template #leading>
            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 0 4px;">
              <Icon icon="lucide:sparkles" style="font-size: 16px;" />
              <strong style="font-size: 14px;">Daybreak</strong>
            </span>
          </template>
          <template #trailing>
            <Button variant="outline" size="sm">Share</Button>
            <Button variant="primary" size="sm">Publish</Button>
          </template>
        </MenuBar>
        <div style="padding: 32px 16px; min-height: 160px; color: var(--ink-60); font-size: 13px;">
          Last action: <code>{{ last ?? "none" }}</code>
        </div>
      </div>
    </Variant>

    <Variant title="Compact (sm)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;">
        <MenuBar :menus="compactMenus" size="sm" bordered @select="onSelect">
          <template #leading>
            <strong style="font-size: 13px; padding: 0 4px;">recipe-2026-rcp-2401</strong>
          </template>
          <template #trailing>
            <Badge variant="active">live</Badge>
          </template>
        </MenuBar>
        <div style="padding: 24px 16px; color: var(--ink-60); font-size: 13px;">
          Last action: <code>{{ last ?? "none" }}</code>
        </div>
      </div>
    </Variant>
  </Story>
</template>
