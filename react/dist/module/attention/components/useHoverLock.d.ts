export interface UseHoverLockState {
    focused: number;
    onClick: (element: number) => void;
    onMouseEnter: (element: number) => void;
    onMouseLeave: () => void;
}
/**
 * Track which element from a set is focussed
 *
 * Prioritizes an element being locked (clicked) rather than hovered.
 */
export declare function useHoverLock(default_locked?: number | null): UseHoverLockState;
//# sourceMappingURL=useHoverLock.d.ts.map