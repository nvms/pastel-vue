<script setup>
import { computed, ref, watch } from "vue"
import { Icon } from "@iconify/vue"
import Button from "./Button.vue"
import ScrollArea from "./ScrollArea.vue"

const props = defineProps({
  /**
   * steps: [{
   *   key,                  // unique id
   *   label,                // step title
   *   description?,         // small caption under the label in the rail
   *   optional?: boolean,   // shows "Optional" tag and enables Skip
   *   status?: 'error'      // explicit override; otherwise derived from completed/current
   * }]
   */
  steps: { type: Array, required: true },
  modelValue: { type: [String, Number], default: null }, // current step key
  completed: { type: Array, default: () => [] },          // array of completed keys
  skipped: { type: Array, default: () => [] },            // array of skipped keys
  // when true, you can only revisit completed steps; can't jump ahead
  linear: { type: Boolean, default: true },
  // when false, disables Next / Finish (e.g., form invalid)
  canAdvance: { type: Boolean, default: true },
  // hide the built-in footer entirely (you bring your own)
  hideFooter: { type: Boolean, default: false },
  // label overrides
  backLabel: { type: String, default: "Back" },
  nextLabel: { type: String, default: "Next" },
  skipLabel: { type: String, default: "Skip" },
  finishLabel: { type: String, default: "Finish" },
})
const emit = defineEmits([
  "update:modelValue", "update:completed", "update:skipped",
  "next", "back", "skip", "complete", "change",
])

// derive an internal "current key" from modelValue, falling back to first step
const currentKey = computed({
  get: () => props.modelValue ?? props.steps[0]?.key,
  set: (k) => emit("update:modelValue", k),
})

const indexOf = (k) => props.steps.findIndex(s => s.key === k)
const currentIndex = computed(() => indexOf(currentKey.value))
const currentStep = computed(() => props.steps[currentIndex.value] ?? null)
const isLast = computed(() => currentIndex.value === props.steps.length - 1)
const isFirst = computed(() => currentIndex.value <= 0)

const isCompleted = (key) => props.completed.includes(key)
const isSkipped = (key) => props.skipped.includes(key)

const markerIconFor = (step, i) => {
  const s = statusOf(step, i)
  if (s === "done") return "lucide:check"
  if (s === "error") return "lucide:alert-triangle"
  if (s === "skipped") return "lucide:chevrons-right"
  return null
}

const statusOf = (step, i) => {
  if (step.status === "error") return "error"
  if (isCompleted(step.key)) return "done"
  if (isSkipped(step.key)) return "skipped"
  if (i === currentIndex.value) return "current"
  return "upcoming"
}

const canJumpTo = (i) => {
  if (i === currentIndex.value) return false
  if (!props.linear) return true
  const step = props.steps[i]
  if (isCompleted(step.key) || isSkipped(step.key)) return true
  if (i < currentIndex.value) return true
  return false
}

const jumpTo = (i) => {
  if (!canJumpTo(i)) return
  const next = props.steps[i].key
  currentKey.value = next
  emit("change", { key: next, index: i })
}

// direction tracks slide direction for the content transition
const direction = ref(1)
watch(currentIndex, (n, o) => { direction.value = n >= o ? 1 : -1 })

const markCompleted = (key) => {
  if (props.completed.includes(key)) return props.completed
  return [...props.completed, key]
}
const unmarkCompleted = (key) => props.completed.filter(k => k !== key)
const unmarkSkipped = (key) => props.skipped.filter(k => k !== key)

const onBack = () => {
  if (isFirst.value) return
  const target = props.steps[currentIndex.value - 1].key
  emit("back", { from: currentKey.value, to: target })
  currentKey.value = target
}

const onNext = () => {
  if (!props.canAdvance) return
  const fromKey = currentKey.value
  const nextCompleted = markCompleted(fromKey)
  emit("update:completed", nextCompleted)
  if (props.skipped.includes(fromKey)) emit("update:skipped", unmarkSkipped(fromKey))
  if (isLast.value) {
    emit("complete", { completed: nextCompleted })
    return
  }
  const target = props.steps[currentIndex.value + 1].key
  emit("next", { from: fromKey, to: target })
  currentKey.value = target
}

const markSkipped = (key) => {
  if (props.skipped.includes(key)) return props.skipped
  return [...props.skipped, key]
}

const onSkip = () => {
  if (isLast.value || !currentStep.value?.optional) return
  const fromKey = currentKey.value
  const target = props.steps[currentIndex.value + 1].key
  emit("update:skipped", markSkipped(fromKey))
  if (props.completed.includes(fromKey)) emit("update:completed", unmarkCompleted(fromKey))
  emit("skip", { from: fromKey, to: target })
  currentKey.value = target
}
</script>

<template>
  <div class="pc-wizard">
    <aside class="pc-wizard__rail" aria-label="Wizard steps">
      <ScrollArea height="100%">
      <ol class="pc-wizard__steps">
        <li
          v-for="(step, i) in steps"
          :key="step.key"
          :class="['pc-wizard__step', `pc-wizard__step--${statusOf(step, i)}`,
                   { 'pc-wizard__step--last': i === steps.length - 1,
                     'pc-wizard__step--jumpable': canJumpTo(i) }]"
        >
          <button
            type="button"
            class="pc-wizard__step-btn"
            :disabled="!canJumpTo(i) && i !== currentIndex"
            :aria-current="i === currentIndex ? 'step' : undefined"
            @click="jumpTo(i)"
          >
            <span class="pc-wizard__marker" aria-hidden="true">
              <span class="pc-wizard__marker-layer pc-wizard__marker-layer--num"
                    :class="{ 'pc-wizard__marker-layer--on': !markerIconFor(step, i) }">
                {{ i + 1 }}
              </span>
              <span class="pc-wizard__marker-layer pc-wizard__marker-layer--icon"
                    :class="{ 'pc-wizard__marker-layer--on': !!markerIconFor(step, i) }">
                <Icon v-if="markerIconFor(step, i)" :icon="markerIconFor(step, i)" />
              </span>
            </span>
            <span class="pc-wizard__step-body">
              <span class="pc-wizard__step-head">
                <span class="pc-wizard__step-label">{{ step.label }}</span>
                <span v-if="statusOf(step, i) === 'skipped'" class="pc-wizard__step-skipped">Skipped</span>
                <span v-else-if="step.optional" class="pc-wizard__step-optional">Optional</span>
              </span>
              <span v-if="step.description" class="pc-wizard__step-desc">{{ step.description }}</span>
            </span>
          </button>
        </li>
      </ol>
      </ScrollArea>
    </aside>

    <section class="pc-wizard__panel">
      <header v-if="currentStep && ($slots.header || currentStep.label)" class="pc-wizard__panel-head">
        <slot name="header" :step="currentStep" :index="currentIndex">
          <div class="pc-wizard__panel-eyebrow">
            Step {{ currentIndex + 1 }} of {{ steps.length }}
          </div>
          <h2 class="pc-wizard__panel-title">{{ currentStep.label }}</h2>
          <p v-if="currentStep.description" class="pc-wizard__panel-desc">{{ currentStep.description }}</p>
        </slot>
      </header>

      <ScrollArea class="pc-wizard__panel-body" height="100%">
        <div class="pc-wizard__panel-clip">
          <Transition :name="direction === 1 ? 'pc-wizard-fwd' : 'pc-wizard-back'" mode="out-in">
            <div :key="currentKey" class="pc-wizard__panel-content">
              <slot :name="`step-${currentKey}`" :step="currentStep" :index="currentIndex">
                <slot :step="currentStep" :index="currentIndex" />
              </slot>
            </div>
          </Transition>
        </div>
      </ScrollArea>

      <footer v-if="!hideFooter" class="pc-wizard__footer">
        <slot
          name="footer"
          :step="currentStep"
          :index="currentIndex"
          :isFirst="isFirst"
          :isLast="isLast"
          :canAdvance="canAdvance"
          :back="onBack"
          :next="onNext"
          :skip="onSkip"
        >
          <Button variant="ghost" :disabled="isFirst" @click="onBack">{{ backLabel }}</Button>
          <div class="pc-wizard__footer-spacer" />
          <Button
            v-if="currentStep?.optional && !isLast"
            variant="outline"
            @click="onSkip"
          >{{ skipLabel }}</Button>
          <Button variant="primary" :disabled="!canAdvance" @click="onNext">
            {{ isLast ? finishLabel : nextLabel }}
          </Button>
        </slot>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.pc-wizard {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: stretch;
  background: var(--paper);
  font-family: var(--display);
  letter-spacing: -0.14px;
  color: var(--ink);
  /* fill the parent so the footer can pin to the bottom */
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

/* rail */
.pc-wizard__rail {
  padding: 20px 4px 20px 8px;
  border-right: 1px solid var(--ink-08);
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.pc-wizard__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pc-wizard__step {
  position: relative;
}

.pc-wizard__step-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 10px 12px;
  border: 0;
  background: transparent;
  border-radius: var(--radius-sharp);
  text-align: left;
  cursor: default;
  outline: none;
  transition: background 140ms ease;
}
.pc-wizard__step--jumpable .pc-wizard__step-btn { cursor: pointer; }
.pc-wizard__step--jumpable .pc-wizard__step-btn:hover { background: var(--ink-04); }
.pc-wizard__step-btn:focus-visible { box-shadow: var(--focus-ring); }
.pc-wizard__step-btn:disabled { cursor: default; }

/* connector line - lives behind the markers */
.pc-wizard__step:not(.pc-wizard__step--last)::after {
  content: "";
  position: absolute;
  left: calc(10px + 13px);
  top: 38px;
  bottom: -6px;
  width: 2px;
  background: var(--ink-08);
  border-radius: 1px;
  z-index: 0;
}
.pc-wizard__step--done:not(.pc-wizard__step--last)::after {
  background: color-mix(in srgb, var(--status-active) 50%, var(--paper));
}
.pc-wizard__step--skipped:not(.pc-wizard__step--last)::after {
  background: repeating-linear-gradient(
    to bottom,
    var(--ink-20) 0 4px,
    transparent 4px 8px
  );
}

/* marker */
.pc-wizard__marker {
  position: relative;
  z-index: 1;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  background: var(--paper);
  color: var(--ink-60);
  box-shadow: inset 0 0 0 1.5px var(--ink-20);
  transition: background 200ms ease, color 200ms ease, box-shadow 200ms ease;
}
.pc-wizard__marker-layer {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  opacity: 0;
  transition: opacity 160ms ease;
  pointer-events: none;
}
.pc-wizard__marker-layer--on { opacity: 1; }
.pc-wizard__marker-layer--icon { font-size: 14px; }
.pc-wizard__step--current .pc-wizard__marker {
  background: var(--midnight);
  color: var(--paper-on-dark);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--lavender) 32%, transparent);
}
.pc-wizard__step--done .pc-wizard__marker {
  background: var(--status-active);
  color: #fff;
  box-shadow: none;
  font-size: 14px;
}
.pc-wizard__step--error .pc-wizard__marker {
  background: var(--status-failed-bg);
  color: var(--status-failed);
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--status-failed) 50%, transparent);
}
.pc-wizard__step--skipped .pc-wizard__marker {
  background: var(--paper);
  color: var(--ink-40);
  box-shadow: inset 0 0 0 1.5px var(--ink-08);
  font-size: 14px;
}

.pc-wizard__step-body { display: flex; flex-direction: column; min-width: 0; padding-top: 3px; }
.pc-wizard__step-head { display: flex; align-items: baseline; gap: 8px; }
.pc-wizard__step-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-60);
  letter-spacing: -0.16px;
  transition: color 140ms ease;
}
.pc-wizard__step--current .pc-wizard__step-label,
.pc-wizard__step--done .pc-wizard__step-label,
.pc-wizard__step--error .pc-wizard__step-label { color: var(--ink); }
.pc-wizard__step--skipped .pc-wizard__step-label {
  color: var(--ink-40);
  text-decoration: line-through;
  text-decoration-color: var(--ink-20);
  text-decoration-thickness: 1px;
}

.pc-wizard__step-optional,
.pc-wizard__step-skipped {
  font-family: var(--mono);
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.08em;
  font-weight: 500;
  color: var(--ink-40);
  padding: 2px 5px;
  border-radius: 3px;
  background: var(--ink-04);
}
.pc-wizard__step-skipped {
  color: var(--ink-60);
  background: color-mix(in srgb, var(--lavender) 22%, var(--paper));
}
.pc-wizard__step-desc {
  margin-top: 3px;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-40);
  letter-spacing: -0.12px;
}
.pc-wizard__step--current .pc-wizard__step-desc { color: var(--ink-60); }

/* panel */
.pc-wizard__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* required so the inner flex body can scroll instead of expanding the column */
  min-height: 0;
  height: 100%;
  padding: 24px 28px 24px 0;
}
.pc-wizard__panel-head { margin-bottom: 18px; }
.pc-wizard__panel-eyebrow {
  font-family: var(--mono);
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  font-weight: 500;
  color: var(--ink-40);
  margin-bottom: 8px;
}
.pc-wizard__panel-title {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.4px;
  line-height: 1.15;
  margin: 0;
}
.pc-wizard__panel-desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-60);
  letter-spacing: -0.14px;
  max-width: 60ch;
}
.pc-wizard__panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.pc-wizard__panel-clip {
  /* contains the per-step slide translation so it never feeds horizontal overflow
     back to the ScrollArea viewport */
  overflow-x: clip;
  width: 100%;
  min-height: 100%;
}
.pc-wizard__panel-content { min-height: 100%; }

/* footer */
.pc-wizard__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--ink-08);
}
.pc-wizard__footer-spacer { flex: 1; }

/* panel content transitions - direction-aware slide+fade */
.pc-wizard-fwd-enter-active,
.pc-wizard-fwd-leave-active,
.pc-wizard-back-enter-active,
.pc-wizard-back-leave-active {
  transition: opacity 220ms ease, translate 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pc-wizard-fwd-enter-from { opacity: 0; translate: 16px 0; }
.pc-wizard-fwd-leave-to   { opacity: 0; translate: -16px 0; }
.pc-wizard-back-enter-from { opacity: 0; translate: -16px 0; }
.pc-wizard-back-leave-to   { opacity: 0; translate: 16px 0; }

@media (prefers-reduced-motion: reduce) {
  .pc-wizard__marker-layer { transition: none; }
  .pc-wizard-fwd-enter-active, .pc-wizard-fwd-leave-active,
  .pc-wizard-back-enter-active, .pc-wizard-back-leave-active {
    transition: opacity 160ms ease;
  }
  .pc-wizard-fwd-enter-from, .pc-wizard-fwd-leave-to,
  .pc-wizard-back-enter-from, .pc-wizard-back-leave-to { translate: 0 0; }
}
</style>
