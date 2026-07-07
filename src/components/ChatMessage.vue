<script setup>
import { ref, computed, toRef, useSlots, watch, onUnmounted } from "vue"
import Avatar from "./Avatar.vue"
import Markdown from "./Markdown.vue"
import { useSmoothStream, smoothstep, clamp } from "../composables/useSmoothStream.js"

const props = defineProps({
  role: { type: String, default: "assistant" }, // user | assistant | system
  name: { type: String, default: "" },
  // avatar image src; initials fall back to name when omitted
  avatar: { type: String, default: "" },
  timestamp: { type: String, default: "" },
  // text content; the default slot wins when provided (custom markup, CodeBlock, etc)
  text: { type: String, default: "" },
  // render `text` as markdown. raw HTML in the text stays escaped, so model
  // output is safe to pass straight through. when combined with `streaming`,
  // the growing text re-renders as markdown each tick instead of using the
  // character-level fade reveal
  markdown: { type: Boolean, default: false },
  showAvatar: { type: Boolean, default: true },
  // show the name label above the bubble (the avatar still uses name for initials)
  showName: { type: Boolean, default: true },
  // when true the `text` prop is treated as a live, growing stream and revealed
  // with a paced, character-level animation. only applies to the `text` path
  streaming: { type: Boolean, default: false },
  // how streamed characters animate in
  reveal: { type: String, default: "fade" }, // fade | blur | typewriter
  // stagger the avatar, name, and bubble in when the message first appears
  animateIn: { type: Boolean, default: true },
  // optional overrides for the stream pacer (settleMs, fadeWindow, fadeBlur, etc)
  streamOptions: { type: Object, default: () => ({}) },
})

const slots = useSlots()

const isSystem = computed(() => props.role === "system")
const withAvatar = computed(
  () => props.showAvatar && !isSystem.value && (props.avatar || props.name),
)
const avatarTone = computed(() => (props.role === "user" ? "dark" : "neutral"))

const hasMeta = computed(
  () => !isSystem.value && ((props.showName && props.name) || props.timestamp || !!slots.meta),
)

// stagger only the parts that actually render - with no avatar or name before it
// the bubble should animate in immediately, not wait out an empty delay
const entranceDelay = computed(() => {
  const a = withAvatar.value
  const m = hasMeta.value
  return {
    meta: a ? "90ms" : "0ms",
    bubble: m ? (a ? "170ms" : "90ms") : a ? "90ms" : "0ms",
  }
})

// streaming only drives the plain-text path; a default slot opts out entirely
const streamed = computed(() => props.streaming && !slots.default)

// per-reveal pacer defaults - timing stays the same, only the character
// treatment (opacity ramp, blur, rise, or a hard typewriter cut) changes
const REVEAL_OPTS = {
  fade: { fade: true, fadeWindow: 36, fadeBlurWindow: 10, fadeBlur: 4 },
  blur: { fade: true, fadeWindow: 30, fadeBlurWindow: 24, fadeBlur: 10 },
  typewriter: { fade: false },
}
const isTypewriter = computed(() => props.reveal === "typewriter")

const streamOpts = computed(() => ({
  enabled: streamed.value,
  ...(REVEAL_OPTS[props.reveal] || REVEAL_OPTS.fade),
  ...props.streamOptions,
}))
const { displayed, fadeOffset, fadeActive } = useSmoothStream(toRef(props, "text"), streamOpts)

// split the displayed text into a settled head plus a trailing window of
// characters carrying the opacity/blur ramp that hugs the reveal frontier
const fade = computed(() => {
  const text = displayed.value
  const o = streamOpts.value
  const size = o.fadeWindow ?? 36
  if (!fadeActive.value || !o.fade || size <= 0 || !text) {
    return { head: text, tail: [] }
  }
  const blurWindow = o.fadeBlurWindow ?? 0
  const maxBlur = o.fadeBlur ?? 0
  const frontier = text.length + (fadeOffset.value ?? 0)
  const start = Math.max(0, Math.floor(frontier - size))
  const tail = []
  for (let i = start; i < text.length; i++) {
    const distance = frontier - i
    const opacity = smoothstep(clamp(distance / size, 0, 1))
    const style = { opacity: opacity.toFixed(3) }
    if (blurWindow > 0 && maxBlur > 0) {
      const sharp = smoothstep(clamp(distance / blurWindow, 0, 1))
      const blur = (1 - sharp) * maxBlur
      if (blur > 0.05) style.filter = `blur(${blur.toFixed(2)}px)`
    }
    tail.push({ ch: text[i], style })
  }
  return { head: text.slice(0, start), tail }
})

// drive the bubble's height from the streamed content's natural height so each
// line-wrap growth can transition (height:auto is not animatable; a measured px
// value is). a ResizeObserver fires only when the content actually changes height
// - i.e. at a wrap - so this is not per-frame work
const streamInnerRef = ref(null)
const streamHeight = ref("")
let ro = null
const measure = () => {
  if (streamInnerRef.value) streamHeight.value = `${streamInnerRef.value.offsetHeight}px`
}
watch(
  [streamInnerRef, streamed],
  ([inner, on]) => {
    if (ro) { ro.disconnect(); ro = null }
    if (on && inner && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure)
      ro.observe(inner)
      measure()
    } else {
      streamHeight.value = ""
    }
  },
  { immediate: true },
)
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div
    class="pc-msg"
    :class="[`pc-msg--${role}`, { 'pc-msg--animate': animateIn }]"
    :style="{ '--pc-meta-delay': entranceDelay.meta, '--pc-bubble-delay': entranceDelay.bubble }"
  >
    <Avatar
      v-if="withAvatar"
      class="pc-msg__avatar"
      :src="avatar"
      :name="name"
      size="sm"
      :tone="avatarTone"
    />
    <div class="pc-msg__col">
      <div v-if="hasMeta" class="pc-msg__meta">
        <span v-if="showName && name" class="pc-msg__name">{{ name }}</span>
        <span v-if="timestamp" class="pc-msg__time">{{ timestamp }}</span>
        <slot name="meta" />
      </div>
      <div
        class="pc-msg__bubble"
        :class="{ 'pc-msg__bubble--stream': streamed }"
        :style="streamed ? { height: streamHeight || undefined } : undefined"
      >
        <div
          v-if="streamed && markdown"
          ref="streamInnerRef"
          class="pc-msg__stream pc-msg__stream--md"
        ><Markdown :source="displayed" /></div>
        <div v-else-if="streamed" ref="streamInnerRef" class="pc-msg__stream"
          ><span>{{ fade.head }}</span
          ><span
            v-for="(c, i) in fade.tail"
            :key="i"
            class="pc-msg__char"
            :style="c.style"
            >{{ c.ch }}</span
          ><span v-if="isTypewriter" class="pc-msg__cursor" aria-hidden="true"
        /></div>
        <slot v-else>
          <Markdown v-if="markdown" :source="text" />
          <template v-else>{{ text }}</template>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.pc-msg--user { flex-direction: row-reverse; }
.pc-msg--system { justify-content: center; }

.pc-msg__avatar { flex-shrink: 0; }

.pc-msg__col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 78%;
}
.pc-msg--user .pc-msg__col { align-items: flex-end; }
.pc-msg--system .pc-msg__col { max-width: 90%; align-items: center; }

.pc-msg__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  /* match the sm avatar height so the name sits centered against it instead of
     floating at its top edge */
  min-height: 24px;
}
.pc-msg__name {
  font-family: var(--display);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink);
}
.pc-msg__time {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-40);
}

.pc-msg__bubble {
  padding: 10px 12px;
  /* reserve one line of height so an empty or just-starting bubble (e.g. a
     stream before its first character) does not pop from tiny to one line */
  min-height: calc(1.5em + 20px);
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink);
  background: var(--ink-04);
  word-break: break-word;
  overflow-wrap: anywhere;
}
/* a small squared-off corner toward the speaker reads as a chat tail */
.pc-msg--assistant .pc-msg__bubble { border-bottom-left-radius: 4px; }
.pc-msg--user .pc-msg__bubble {
  background: var(--midnight);
  color: var(--paper-on-dark);
  border-bottom-right-radius: 4px;
}
.pc-msg--system .pc-msg__bubble {
  background: transparent;
  padding: 2px 0;
  min-height: 0;
  font-size: 12.5px;
  color: var(--ink-40);
  text-align: center;
}

/* streamed bubbles animate their height as text wraps in. the bubble height is
   driven by JS from the inner element's measured height; overflow hidden reveals
   each new line as the height grows instead of letting it spill below */
.pc-msg__bubble--stream {
  padding: 0;
  overflow: hidden;
  transition: height 130ms ease-out;
}
/* the inner carries the bubble's padding and is what gets measured. preserve
   whitespace so streamed spaces and newlines render */
.pc-msg__stream {
  padding: 10px 12px;
  white-space: pre-wrap;
}
/* markdown streams render block markup, so normal whitespace handling applies */
.pc-msg__stream--md { white-space: normal; }
.pc-msg__char { will-change: opacity, filter, transform; }

@media (prefers-reduced-motion: reduce) {
  .pc-msg__bubble--stream { transition: none; }
}

/* typewriter caret */
.pc-msg__cursor {
  display: inline-block;
  width: 0.5em;
  height: 1.05em;
  margin-left: 1px;
  vertical-align: text-bottom;
  border-radius: 1px;
  background: currentColor;
  opacity: 0.55;
  animation: pc-msg-blink 1s steps(1) infinite;
}
@keyframes pc-msg-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .pc-msg__cursor { animation: none; }
}

/* staggered entrance: avatar, then name, then bubble settle in on appear.
   the avatar pops from scale, the bubble rises and grows from its tail corner */
.pc-msg--animate .pc-msg__avatar {
  animation: pc-msg-pop 360ms cubic-bezier(0.34, 1.3, 0.64, 1) both;
}
.pc-msg--animate .pc-msg__meta {
  animation: pc-msg-in 340ms cubic-bezier(0.16, 1, 0.3, 1) var(--pc-meta-delay, 90ms) both;
}
.pc-msg--animate .pc-msg__bubble {
  animation: pc-msg-rise 380ms cubic-bezier(0.16, 1, 0.3, 1) var(--pc-bubble-delay, 170ms) both;
}
/* system messages are centered text - skip the directional scale */
.pc-msg--animate.pc-msg--system .pc-msg__bubble {
  animation: pc-msg-in 340ms cubic-bezier(0.16, 1, 0.3, 1) var(--pc-bubble-delay, 0ms) both;
}
@keyframes pc-msg-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pc-msg-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pc-msg-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .pc-msg--animate .pc-msg__avatar,
  .pc-msg--animate .pc-msg__meta,
  .pc-msg--animate .pc-msg__bubble { animation: none; }
}
</style>
