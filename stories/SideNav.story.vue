<script setup>
import { ref } from "vue"
import SideNav from "../src/components/SideNav.vue"
import Avatar from "../src/components/Avatar.vue"
import { NavIcon } from "./nav-icons.js"

const a = ref("overview")
const b = ref("overview")
const c = ref("overview")
const d = ref("overview")

const sectionsBare = [
  {
    title: "Operate",
    items: [
      { key: "inbox", label: "Inbox", badge: 4 },
      { key: "overview", label: "Overview" },
      { key: "intakes", label: "Intake runs" },
      { key: "recipes", label: "Recipes" },
    ],
  },
  {
    title: "Configure",
    items: [
      { key: "venues", label: "Venues" },
      { key: "workflows", label: "Workflows" },
      { key: "forms", label: "Prep cards" },
    ],
  },
]

const sectionsIcons = [
  {
    title: "Operate",
    items: [
      { key: "inbox", label: "Inbox", icon: "inbox", badge: 4 },
      { key: "overview", label: "Overview", icon: "overview" },
      { key: "intakes", label: "Intake runs", icon: "intakes" },
      { key: "recipes", label: "Recipes", icon: "recipes" },
    ],
  },
  {
    title: "Configure",
    items: [
      { key: "venues", label: "Venues", icon: "venues" },
      { key: "workflows", label: "Workflows", icon: "workflows" },
      { key: "forms", label: "Prep cards", icon: "forms" },
    ],
  },
  {
    title: "Verify",
    items: [{ key: "evals", label: "Evaluations", icon: "evaluations" }],
  },
]

const frame = "width: 280px; height: 540px; border: 1px solid var(--ink-08); border-radius: 8px; overflow: hidden;"
</script>

<template>
  <Story title="SideNav">
    <Variant title="Minimal (no indicators, no icons)">
      <div :style="frame">
        <SideNav :sections="sectionsBare" :active-key="a" @select="a = $event.key" />
      </div>
    </Variant>

    <Variant title="With indicator dots">
      <div :style="frame">
        <SideNav :sections="sectionsBare" :active-key="b" indicators @select="b = $event.key" />
      </div>
    </Variant>

    <Variant title="With icons">
      <div :style="frame">
        <SideNav :sections="sectionsIcons" :active-key="c" @select="c = $event.key">
          <template #icon="{ item }">
            <NavIcon :name="item.icon" />
          </template>
        </SideNav>
      </div>
    </Variant>

    <Variant title="With header + footer (full shell)">
      <div :style="frame">
        <SideNav :sections="sectionsIcons" :active-key="d" @select="d = $event.key">
          <template #icon="{ item }">
            <NavIcon :name="item.icon" />
          </template>
          <template #header>
            <div>
              <div style="font-size: 18px; font-weight: 500; letter-spacing: -0.5px;">Pastel</div>
              <div class="pc-mono" style="color: var(--ink-60); font-size: 10px;">Kitchen workflow</div>
            </div>
          </template>
          <template #footer>
            <div style="display: flex; align-items: center; gap: 10px;">
              <Avatar name="Maya Chen" size="sm" interactive />
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 13px;">Maya Chen</div>
                <div class="pc-mono" style="color: var(--ink-60); font-size: 9px;">PM Admin</div>
              </div>
            </div>
          </template>
        </SideNav>
      </div>
    </Variant>

    <Variant title="Tinted header">
      <div :style="frame">
        <SideNav :sections="sectionsIcons" :active-key="d" tinted-header @select="d = $event.key">
          <template #icon="{ item }">
            <NavIcon :name="item.icon" />
          </template>
          <template #header>
            <div>
              <div style="font-size: 18px; font-weight: 500; letter-spacing: -0.5px;">Pastel</div>
              <div class="pc-mono" style="color: var(--ink-60); font-size: 10px;">Kitchen workflow</div>
            </div>
          </template>
          <template #footer>
            <div style="display: flex; align-items: center; gap: 10px;">
              <Avatar name="Maya Chen" size="sm" interactive />
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 13px;">Maya Chen</div>
                <div class="pc-mono" style="color: var(--ink-60); font-size: 9px;">PM Admin</div>
              </div>
            </div>
          </template>
        </SideNav>
      </div>
    </Variant>

    <Variant title="Icon via scoped slot (custom render)">
      <div :style="frame">
        <SideNav
          :sections="[{
            title: 'Sources',
            items: [
              { key: 'foodcode', label: 'Food Code', accent: '#bdbbff' },
              { key: 'allergens', label: 'Allergen guide', accent: '#ffd6f5' },
              { key: 'forms', label: 'Prep cards', accent: '#d6e1ff' },
            ],
          }]"
          :active-key="'foodcode'"
        >
          <template #icon="{ item }">
            <span
              :style="{ width: '14px', height: '14px', borderRadius: '3px', background: item.accent, display: 'inline-block', flexShrink: 0, border: '1px solid var(--ink-08)' }"
            />
          </template>
        </SideNav>
      </div>
    </Variant>
  </Story>
</template>
