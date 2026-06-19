<script setup>
import EmptyState from "../src/components/EmptyState.vue"
import Panel from "../src/components/Panel.vue"
import Button from "../src/components/Button.vue"
import ArrowLink from "../src/components/ArrowLink.vue"
import { Icon } from "@iconify/vue"
</script>

<template>
  <Story title="EmptyState">
    <!-- the big, full-page treatment: centered, generous, an icon chip and a primary action -->
    <Variant title="Full page (lg, centered)">
      <div style="border: 1px solid var(--ink-08); border-radius: 8px;">
        <EmptyState
          size="lg"
          icon="lucide:inbox"
          title="No evaluation runs yet"
          description="When a run finishes, its scorecards and traces land here. Kick one off to see how your prompts hold up."
        >
          <Button variant="outline">View docs</Button>
          <Button variant="primary">Start a run</Button>
        </EmptyState>
      </div>
    </Variant>

    <!-- the default: a section that came up empty inside a page -->
    <Variant title="Default (md, centered)">
      <Panel title="Recent runs">
        <EmptyState
          icon="lucide:flask-conical"
          title="Nothing to show"
          description="No runs in the last 30 days. Adjust the range or start a new run."
        >
          <Button size="sm" variant="primary">New run</Button>
        </EmptyState>
      </Panel>
    </Variant>

    <!-- the small, left-aligned treatment for a narrow side panel -->
    <Variant title="Side panel (sm, left-aligned)">
      <div style="display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: start;">
        <Panel title="Citations">
          <EmptyState
            size="sm"
            align="start"
            layout="row"
            icon="lucide:quote"
            title="No citations"
            description="Sources referenced by the answer will appear here."
          >
            <ArrowLink href="#" size="sm">How citations work</ArrowLink>
          </EmptyState>
        </Panel>
        <Panel title="Answer">
          <div style="padding: 16px; color: var(--ink-60); font-size: 14px;">
            The main content sits beside the empty side panel. A small, left-aligned
            empty state reads as a quiet placeholder rather than a full-page event.
          </div>
        </Panel>
      </div>
    </Variant>

    <!-- bordered, inset look for an empty drop region or list area -->
    <Variant title="Bordered inset (sm, left-aligned)">
      <div style="max-width: 420px;">
        <EmptyState
          size="sm"
          align="start"
          layout="row"
          bordered
          icon="lucide:list-plus"
          title="No filters applied"
          description="Add a filter to narrow the table down."
        >
          <Button size="sm" variant="subtle">Add filter</Button>
        </EmptyState>
      </div>
    </Variant>

    <!-- the same content at all three sizes, both alignments, for comparison -->
    <Variant title="Sizes and alignment">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div
          v-for="a in ['center', 'start']"
          :key="a"
          style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;"
        >
          <div
            v-for="s in ['sm', 'md', 'lg']"
            :key="s"
            style="border: 1px solid var(--ink-08); border-radius: 8px;"
          >
            <EmptyState
              :size="s"
              :align="a"
              icon="lucide:search-x"
              title="No matches"
              :description="`align=${a}, size=${s}`"
            />
          </div>
        </div>
      </div>
    </Variant>

    <!-- icon slot for full control, here a colored pastel glyph -->
    <Variant title="Custom icon slot">
      <EmptyState
        align="start"
        layout="row"
        title="Inbox zero"
        description="You're all caught up. Nothing needs your attention right now."
      >
        <template #icon>
          <Icon icon="lucide:sparkles" style="color: var(--magenta);" />
        </template>
        <Button size="sm" variant="ghost">Refresh</Button>
      </EmptyState>
    </Variant>

    <!-- emoji and plain glyphs still work without iconify -->
    <Variant title="Emoji / glyph icon">
      <EmptyState icon="∅" title="No runs yet" description="When an intake starts, it'll show up here.">
        <Button variant="primary">Start a run</Button>
      </EmptyState>
    </Variant>
  </Story>
</template>
