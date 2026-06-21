import { ref, onMounted, onScopeDispose } from "vue"

/**
 * keeps a scroll container pinned to the bottom while content grows, while
 * yielding to the user the instant they scroll up. re-pins when they return to
 * the bottom and settle there.
 *
 * the behavior leans on two facts: growing content never fires a scroll event,
 * and this code never scrolls *up* programmatically. so a decrease in scrollTop
 * is always the user, and landing within `threshold` of the bottom on a
 * downward/settling scroll is a deliberate return.
 *
 * @param {import("vue").Ref<HTMLElement|null>} scrollRef the scrolling element
 * @param {import("vue").Ref<HTMLElement|null>} contentRef the growing inner element
 * @param {{ threshold?: number }} [options]
 */
export function useStickToBottom(scrollRef, contentRef, options = {}) {
  const threshold = options.threshold ?? 80
  // dead-band so the button's at-bottom state flips once instead of chattering
  // at the boundary while scrolling
  const band = options.band ?? 40
  // distance at which the follow-pin re-engages - small, so returning to the
  // very bottom re-pins but drifting near it does not
  const engage = 8

  // pinned drives auto-follow on growth; isAtBottom drives the jump button.
  // keeping them separate stops the button from flickering as the follow state
  // toggles during a scroll
  const pinned = ref(true)
  const isAtBottom = ref(true)

  let lastTop = 0
  let touchY = 0
  let ro = null

  const el = () => scrollRef.value
  const distanceFromBottom = () => {
    const e = el()
    return e ? e.scrollHeight - e.scrollTop - e.clientHeight : 0
  }

  const toBottom = () => {
    const e = el()
    if (!e) return
    e.scrollTop = e.scrollHeight
    lastTop = e.scrollTop
  }

  const reduced = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const scrollToBottom = (behavior) => {
    const e = el()
    if (!e) return
    const mode = behavior ?? (reduced() ? "auto" : "smooth")
    e.scrollTo({ top: e.scrollHeight, behavior: mode })
    pinned.value = true
  }

  const onScroll = () => {
    const e = el()
    if (!e) return
    const top = e.scrollTop
    const dist = e.scrollHeight - top - e.clientHeight
    const movingUp = top < lastTop - 1
    lastTop = top

    // follow intent: any upward move or drifting past the threshold releases;
    // re-engages only on returning to the very bottom
    if (movingUp || dist > threshold) {
      pinned.value = false
    } else if (dist <= engage) {
      pinned.value = true
    }

    // button state with a dead-band: hide within `threshold`, show only once
    // past `threshold + band`, so it never chatters at the edge
    if (dist <= threshold) isAtBottom.value = true
    else if (dist > threshold + band) isAtBottom.value = false
  }
  const onWheel = (ev) => { if (ev.deltaY < 0) pinned.value = false }
  const onTouchStart = (ev) => { touchY = ev.touches[0]?.clientY ?? 0 }
  const onTouchMove = (ev) => {
    const y = ev.touches[0]?.clientY ?? 0
    // finger dragging down scrolls the content up
    if (y > touchY + 2) pinned.value = false
    touchY = y
  }

  // content (or the viewport) changed size - follow only if still pinned
  const onResize = () => { if (pinned.value) { toBottom(); isAtBottom.value = true } }

  onMounted(() => {
    const e = el()
    if (!e) return
    e.addEventListener("scroll", onScroll, { passive: true })
    e.addEventListener("wheel", onWheel, { passive: true })
    e.addEventListener("touchstart", onTouchStart, { passive: true })
    e.addEventListener("touchmove", onTouchMove, { passive: true })

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize)
      if (contentRef.value) ro.observe(contentRef.value)
      ro.observe(e)
    }

    toBottom()
    pinned.value = true
    isAtBottom.value = true
  })

  onScopeDispose(() => {
    const e = el()
    if (e) {
      e.removeEventListener("scroll", onScroll)
      e.removeEventListener("wheel", onWheel)
      e.removeEventListener("touchstart", onTouchStart)
      e.removeEventListener("touchmove", onTouchMove)
    }
    if (ro) ro.disconnect()
  })

  // bring a child element into view, aligning its top to the viewport top when it
  // sits above the fold or is taller than the viewport. unpins first (synchronously,
  // so a concurrent expand animation's resize cannot re-pin to the bottom), then
  // aligns after layout settles
  // align a child element's top to the viewport top. unpins synchronously so a
  // concurrent expand animation's resize cannot pin back to the bottom, then
  // converges over the animation (the element's body grows downward, so scroll
  // room appears progressively and a single frame would clamp short)
  const reveal = (target) => {
    if (!target) return
    pinned.value = false
    isAtBottom.value = false
    const e = el()
    if (!e) return
    let start = -1
    const step = (now) => {
      if (start < 0) start = now
      const delta = Math.round(target.getBoundingClientRect().top - e.getBoundingClientRect().top)
      if (delta !== 0) { e.scrollTop += delta; lastTop = e.scrollTop }
      if (now - start < 350) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return { pinned, isAtBottom, scrollToBottom, reveal }
}
