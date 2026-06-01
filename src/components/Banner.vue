<script setup>
import { ref, computed, watch } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps({
  variant: { type: String, default: "info" }, // info | success | warning | danger | neutral | announce
  icon: { type: String, default: null },
  title: { type: String, default: "" },
  message: { type: String, default: "" },
  dismissible: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  align: { type: String, default: "start" }, // start | center
  modelValue: { type: Boolean, default: true },
})
const emit = defineEmits(["update:modelValue", "dismiss"])

const internal = ref(props.modelValue)
watch(() => props.modelValue, v => { internal.value = v })

const visible = computed(() => internal.value)

const defaultIcon = computed(() => ({
  info: "lucide:info",
  success: "lucide:check-circle-2",
  warning: "lucide:triangle-alert",
  danger: "lucide:octagon-alert",
  neutral: "lucide:info",
  announce: "lucide:megaphone",
})[props.variant])

const resolvedIcon = computed(() => props.icon ?? defaultIcon.value)

const onDismiss = () => {
  internal.value = false
  emit("update:modelValue", false)
  emit("dismiss")
}

const onEnter = (el, done) => {
  el.style.height = "0"
  el.style.opacity = "0"
  void el.offsetHeight
  const target = el.scrollHeight
  el.style.transition = "height 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease"
  el.style.height = `${target}px`
  el.style.opacity = "1"
  const onEnd = (e) => {
    if (e.propertyName !== "height") return
    el.removeEventListener("transitionend", onEnd)
    done()
  }
  el.addEventListener("transitionend", onEnd)
}
const onAfterEnter = (el) => {
  el.style.transition = ""
  el.style.height = ""
  el.style.opacity = ""
}
const onLeave = (el, done) => {
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = "1"
  void el.offsetHeight
  el.style.transition = "height 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 140ms ease"
  el.style.height = "0"
  el.style.opacity = "0"
  const onEnd = (e) => {
    if (e.propertyName !== "height") return
    el.removeEventListener("transitionend", onEnd)
    done()
  }
  el.addEventListener("transitionend", onEnd)
}
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
    <div
      v-if="visible"
      :class="[
        'pc-banner',
        `pc-banner--${variant}`,
        `pc-banner--${align}`,
        { 'pc-banner--sticky': sticky },
      ]"
      role="status"
    >
      <div class="pc-banner__inner">
        <span v-if="resolvedIcon" class="pc-banner__icon" aria-hidden="true">
          <Icon :icon="resolvedIcon" />
        </span>
        <div class="pc-banner__body">
          <span v-if="title" class="pc-banner__title">{{ title }}</span>
          <span v-if="message || $slots.default" class="pc-banner__message">
            <slot>{{ message }}</slot>
          </span>
        </div>
        <div v-if="$slots.actions" class="pc-banner__actions">
          <slot name="actions" />
        </div>
        <button
          v-if="dismissible"
          type="button"
          class="pc-banner__close"
          aria-label="Dismiss"
          @click="onDismiss"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pc-banner {
  position: relative;
  width: 100%;
  border-bottom: 1px solid var(--ink-08);
  overflow: hidden;
  font-size: 13px;
  letter-spacing: -0.12px;
  line-height: 1.5;
  color: var(--ink);
}
.pc-banner--sticky {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: saturate(140%) blur(6px);
}

.pc-banner__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  min-height: 40px;
}
.pc-banner--center .pc-banner__inner {
  justify-content: center;
  text-align: center;
}

.pc-banner__icon {
  flex-shrink: 0;
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px;
}

.pc-banner__body {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.pc-banner--center .pc-banner__body { flex: 0 1 auto; justify-content: center; }

.pc-banner__title {
  font-weight: 500;
  letter-spacing: -0.16px;
  color: var(--ink);
}
.pc-banner__message {
  color: var(--ink-60);
}
.pc-banner--danger .pc-banner__message,
.pc-banner--warning .pc-banner__message { color: var(--ink); }

.pc-banner__actions {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pc-banner__close {
  flex-shrink: 0;
  width: 24px; height: 24px;
  border: 0;
  background: transparent;
  border-radius: 999px;
  color: var(--ink-60);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  outline: none;
  transition: background 140ms ease, color 140ms ease;
}
.pc-banner__close:hover { background: var(--ink-04); color: var(--ink); }
.pc-banner__close:focus-visible { box-shadow: var(--focus-ring); }

/* variants - same pastel wash language as Callout */
.pc-banner--info {
  background:
    radial-gradient(70% 200% at 0% 50%, rgba(189, 187, 255, 0.28), transparent 70%),
    radial-gradient(70% 200% at 100% 50%, rgba(214, 225, 255, 0.22), transparent 70%),
    var(--paper);
}
.pc-banner--info .pc-banner__icon { color: var(--status-paused); }

.pc-banner--success {
  background:
    radial-gradient(70% 200% at 0% 50%, rgba(189, 187, 255, 0.18), transparent 70%),
    radial-gradient(70% 200% at 100% 50%, rgba(214, 225, 255, 0.20), transparent 70%),
    var(--paper);
}
.pc-banner--success .pc-banner__icon { color: var(--status-active); }

.pc-banner--warning {
  background:
    radial-gradient(80% 200% at 0% 50%, rgba(255, 224, 200, 0.55), transparent 70%),
    radial-gradient(70% 200% at 100% 50%, rgba(255, 214, 245, 0.28), transparent 70%),
    var(--paper);
  border-bottom-color: rgba(184, 107, 0, 0.30);
}
.pc-banner--warning .pc-banner__icon { color: var(--status-warning); }

.pc-banner--danger {
  background:
    radial-gradient(80% 200% at 0% 50%, rgba(252, 228, 226, 0.75), transparent 70%),
    radial-gradient(70% 200% at 100% 50%, rgba(255, 214, 245, 0.22), transparent 70%),
    var(--paper);
  border-bottom-color: rgba(179, 38, 30, 0.28);
}
.pc-banner--danger .pc-banner__icon { color: var(--status-failed); }

.pc-banner--neutral {
  background: var(--ink-04);
}
.pc-banner--neutral .pc-banner__icon { color: var(--ink-60); }

.pc-banner--announce {
  background:
    radial-gradient(60% 200% at 0% 50%, rgba(189, 187, 255, 0.35), transparent 70%),
    radial-gradient(60% 200% at 50% 50%, rgba(255, 214, 245, 0.25), transparent 70%),
    radial-gradient(60% 200% at 100% 50%, rgba(214, 225, 255, 0.30), transparent 70%),
    var(--paper);
}
.pc-banner--announce .pc-banner__icon { color: var(--status-paused); }
</style>
