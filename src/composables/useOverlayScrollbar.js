import { ref, onMounted, onScopeDispose } from "vue"

/**
 * drives a custom overlay scrollbar for a natively-scrolling element: a thin
 * pastel thumb that wakes on hover / move / scroll and fades after idle or
 * leave, matching ScrollArea. it only measures the element and sets its
 * scrollTop, so it composes with stick-to-bottom logic that owns the same
 * element.
 *
 * @param {import("vue").Ref<HTMLElement|null>} scrollRef the scrolling element
 * @param {import("vue").Ref<HTMLElement|null>} contentRef the growing inner element
 * @param {{ idleMs?: number, pad?: number, minThumb?: number }} [options]
 */
export function useOverlayScrollbar(scrollRef, contentRef, options = {}) {
  const idleMs = options.idleMs ?? 1500
  // matches the scrollbar track padding in css, so thumb travel lines up exactly
  const pad = options.pad ?? 3
  const minThumb = options.minThumb ?? 28

  const active = ref(false)
  const overflow = ref(false)
  const dragging = ref(false)
  const thumbSize = ref(0)
  const thumbOffset = ref(0)

  let idleTimer = null
  let ro = null

  const trackHeight = (e) => Math.max(e.clientHeight - pad * 2, 0)

  const measure = () => {
    const e = scrollRef.value
    if (!e) return
    const { scrollHeight, clientHeight, scrollTop } = e
    const has = scrollHeight - clientHeight > 1
    overflow.value = has
    if (!has) {
      thumbSize.value = 0
      thumbOffset.value = 0
      return
    }
    const track = trackHeight(e)
    const size = Math.min(Math.max((clientHeight / scrollHeight) * track, minThumb), track)
    const maxOffset = track - size
    const maxScroll = scrollHeight - clientHeight
    thumbSize.value = size
    thumbOffset.value = maxScroll > 0 ? (scrollTop / maxScroll) * maxOffset : 0
  }

  const wake = () => {
    active.value = true
    clearTimeout(idleTimer)
    if (!dragging.value) idleTimer = setTimeout(() => { active.value = false }, idleMs)
  }
  const sleep = () => {
    if (dragging.value) return
    clearTimeout(idleTimer)
    active.value = false
  }

  const onScroll = () => { measure(); wake() }

  let startY = 0
  let startScroll = 0
  const onThumbMove = (ev) => {
    const e = scrollRef.value
    if (!e) return
    const maxOffset = trackHeight(e) - thumbSize.value
    if (maxOffset <= 0) return
    const maxScroll = e.scrollHeight - e.clientHeight
    const dy = ev.clientY - startY
    e.scrollTop = startScroll + (dy / maxOffset) * maxScroll
  }
  const endThumbDrag = () => {
    dragging.value = false
    window.removeEventListener("pointermove", onThumbMove)
    window.removeEventListener("pointerup", endThumbDrag)
    wake()
  }
  const onThumbDown = (ev) => {
    const e = scrollRef.value
    if (!e) return
    ev.preventDefault()
    dragging.value = true
    active.value = true
    clearTimeout(idleTimer)
    startY = ev.clientY
    startScroll = e.scrollTop
    window.addEventListener("pointermove", onThumbMove)
    window.addEventListener("pointerup", endThumbDrag)
  }

  // clicking the track jumps the thumb so its center lands under the pointer
  const onTrackDown = (ev) => {
    const e = scrollRef.value
    if (!e) return
    const rect = ev.currentTarget.getBoundingClientRect()
    const track = trackHeight(e)
    const maxOffset = track - thumbSize.value
    if (maxOffset <= 0) return
    const target = Math.min(Math.max(ev.clientY - rect.top - pad - thumbSize.value / 2, 0), maxOffset)
    const maxScroll = e.scrollHeight - e.clientHeight
    e.scrollTop = (target / maxOffset) * maxScroll
  }

  onMounted(() => {
    const e = scrollRef.value
    if (!e) return
    e.addEventListener("scroll", onScroll, { passive: true })
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure)
      ro.observe(e)
      if (contentRef.value) ro.observe(contentRef.value)
    }
    measure()
  })

  onScopeDispose(() => {
    const e = scrollRef.value
    if (e) e.removeEventListener("scroll", onScroll)
    if (ro) ro.disconnect()
    clearTimeout(idleTimer)
    window.removeEventListener("pointermove", onThumbMove)
    window.removeEventListener("pointerup", endThumbDrag)
  })

  return { active, overflow, dragging, thumbSize, thumbOffset, wake, sleep, onThumbDown, onTrackDown }
}
