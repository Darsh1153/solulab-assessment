import * as React from "react";

export function useFocusRestore<T extends HTMLElement>(
  deps: React.DependencyList,
): React.RefObject<T | null> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ensure focusability for headings/divs.
    const prevTabIndex = el.getAttribute("tabindex");
    if (prevTabIndex === null) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: false });
    return () => {
      if (prevTabIndex === null) el.removeAttribute("tabindex");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

