import { useState } from "react";
/**
 * Track which element from a set is focussed
 *
 * Prioritizes an element being locked (clicked) rather than hovered.
 */
export function useHoverLock(default_locked = null) {
    const [hoveredElement, setHoveredElement] = useState(null);
    const [lockedElement, setLockedElement] = useState(default_locked);
    function onClick(element) {
        setLockedElement(element);
    }
    function onMouseEnter(element) {
        setHoveredElement(element);
    }
    function onMouseLeave() {
        setHoveredElement(null);
    }
    const focused = hoveredElement !== null && hoveredElement !== void 0 ? hoveredElement : lockedElement;
    return {
        focused: focused,
        onClick,
        onMouseEnter,
        onMouseLeave
    };
}
//# sourceMappingURL=useHoverLock.js.map