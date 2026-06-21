import { ref, watch, onScopeDispose, unref } from "vue"

export const SMOOTH_STREAM_DEFAULTS = {
  // when false the source is mirrored through untouched
  enabled: true,
  // time, in ms, to drain the current backlog of unrevealed text. also bounds
  // how far behind the real stream the pacer can fall - a fast stream is never
  // stretched into a long animation, it just gets a brief tail
  settleMs: 320,
  // how long, in ms, the source must be idle after the pacer catches up before
  // the trail starts settling toward opaque. brief burst gaps under this
  // threshold leave the active fade in place so the trail does not visibly cycle
  settleHoldMs: 360,
  // floor on reveal speed, in characters per second, so the last few characters
  // always finish promptly
  minCps: 40,
  // whether revealed text fades in character by character
  fade: true,
  // number of trailing characters covered by the opacity ramp
  fadeWindow: 36,
  // number of trailing characters covered by the blur ramp (kept tight so the
  // blur hugs the frontier rather than smearing the whole opacity ramp)
  fadeBlurWindow: 10,
  // blur applied to the newest character, in pixels
  fadeBlur: 4,
}

export const clamp = (value, lo, hi) => (value < lo ? lo : value > hi ? hi : value)
export const smoothstep = (t) => t * t * (3 - 2 * t)

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * converts an irregularly-growing source string into a smoothly-growing
 * `displayed` string. the source can arrive in bursts of any size at any
 * interval - the pacer drains its backlog at an adaptive, eased rate so the
 * reveal looks consistent regardless of how the underlying stream behaves.
 *
 * @param {import("vue").Ref<string> | (() => string)} source
 * @param {import("vue").Ref<object>} options
 */
export function useSmoothStream(source, options) {
  const read = () => (typeof source === "function" ? source() : unref(source)) || ""
  const opts = () => ({ ...SMOOTH_STREAM_DEFAULTS, ...unref(options) })

  const displayed = ref(read())
  const fadeOffset = ref(0)
  const fadeActive = ref(false)

  let shown = read().length
  let cps = 0
  let postroll = 0
  let raf = 0
  let lastT = 0
  let lastGrowAt = 0
  let idleTimer = 0

  const reduced = prefersReducedMotion()

  const clearIdle = () => {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0 }
  }
  const stop = () => {
    clearIdle()
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
  }
  const settle = () => {
    stop()
    const src = read()
    shown = src.length
    postroll = 0
    cps = 0
    displayed.value = src
    fadeOffset.value = 0
    fadeActive.value = false
  }

  const frame = (now) => {
    const o = opts()
    const src = read()
    const dt = Math.min((now - lastT) / 1000, 0.05)
    lastT = now
    const target = src.length

    if (shown < target) {
      const remaining = target - shown
      const desired = Math.max(remaining / (o.settleMs / 1000), o.minCps)
      cps += (desired - cps) * 0.12
      shown = Math.min(target, shown + cps * dt)
      displayed.value = src.slice(0, Math.floor(shown))
      fadeOffset.value = 0
      fadeActive.value = o.fade
      raf = requestAnimationFrame(frame)
      return
    }

    displayed.value = src

    const idleMs = now - lastGrowAt
    if (idleMs < o.settleHoldMs) {
      fadeOffset.value = 0
      fadeActive.value = o.fade
      raf = 0
      const delay = Math.max(16, o.settleHoldMs - idleMs)
      idleTimer = window.setTimeout(() => {
        idleTimer = 0
        lastT = performance.now()
        raf = requestAnimationFrame(frame)
      }, delay)
      return
    }

    if (o.fade && postroll < o.fadeWindow) {
      const drainCps = o.fadeWindow / (o.settleMs / 1000)
      postroll = Math.min(o.fadeWindow, postroll + drainCps * dt)
      fadeOffset.value = postroll
      fadeActive.value = true
      raf = requestAnimationFrame(frame)
      return
    }

    if (o.fade) fadeOffset.value = o.fadeWindow
    raf = 0
  }

  const start = () => {
    if (raf) return
    lastT = performance.now()
    raf = requestAnimationFrame(frame)
  }

  watch(read, (next) => {
    if (!opts().enabled || reduced) { settle(); return }
    lastGrowAt = performance.now()
    if (!next.startsWith(displayed.value)) {
      shown = 0
      cps = 0
      displayed.value = ""
    }
    if (shown < next.length) {
      postroll = 0
      clearIdle()
      start()
    }
  })

  watch(() => opts().enabled, (enabled) => {
    if (!enabled || reduced) settle()
  })

  if (!opts().enabled || reduced) {
    settle()
  } else if (read()) {
    shown = 0
    displayed.value = ""
    lastGrowAt = performance.now()
    start()
  }

  onScopeDispose(stop)

  return { displayed, fadeOffset, fadeActive }
}
