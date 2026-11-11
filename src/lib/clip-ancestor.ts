const cache = new WeakMap<Element, boolean>();

/** A box that clips sideways AND has more content than fits: a scroller, not a tidy section. */
function clips(el: Element) {
  let v = cache.get(el);
  if (v === undefined) {
    v = getComputedStyle(el).overflowX !== "visible";
    cache.set(el, v);
  }
  return v && el.scrollWidth > el.clientWidth + 1;
}

/**
 * What to watch so `el` is revealed when its part of the page comes into view. An element inside a
 * horizontal scroller (a carousel) is clipped by it and an IntersectionObserver never calls it
 * visible while it is off to the side, so the scroller itself is watched instead.
 */
export function watchTarget(el: Element): Element {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (clips(p)) return p;
  }
  return el;
}
