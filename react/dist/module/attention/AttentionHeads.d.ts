/// <reference types="react" />
import { UseHoverLockState } from "./components/useHoverLock";
/**
 * Attention head color
 *
 * @param idx Head index
 * @param numberOfHeads Number of heads
 * @param alpha Opaqueness (0% = fully transparent, 100% = fully opaque)
 */
export declare function attentionHeadColor(idx: number, numberOfHeads: number, alpha?: string): string;
/**
 * Attention Heads Selector
 */
export declare function AttentionHeadsSelector({ attention, attentionHeadNames, focused, maxValue, minValue, negativeColor, onClick, onMouseEnter, onMouseLeave, positiveColor, maskUpperTri, tokens }: AttentionHeadsProps & {
    attentionHeadNames: string[];
} & UseHoverLockState): JSX.Element;
/**
 * Attention patterns from destination to source tokens, for a group of heads.
 *
 * Displays a small heatmap for each attention head. When one is selected, it is
 * then shown in full size.
 */
export declare function AttentionHeads({ attention, attentionHeadNames, maxValue, minValue, negativeColor, positiveColor, maskUpperTri, tokens }: AttentionHeadsProps): JSX.Element;
export interface AttentionHeadsProps {
    /**
     * Attention heads activations
     *
     * Of the shape [ heads x dest_pos x src_pos ]
     */
    attention: number[][][];
    /**
     * Names for each attention head
     *
     * Useful if e.g. you want to label the heads with the layer they are from.
     */
    attentionHeadNames?: string[];
    /**
     * Maximum value
     *
     * Used to determine how dark the token color is when positive (i.e. based on
     * how close it is to the maximum value).
     *
     * @default Math.max(...values)
     */
    maxValue?: number;
    /**
     * Minimum value
     *
     * Used to determine how dark the token color is when negative (i.e. based on
     * how close it is to the minimum value).
     *
     * @default Math.min(...values)
     */
    minValue?: number;
    /**
     * Negative color
     *
     * Color to use for negative values. This can be any valid CSS color string.
     *
     * Be mindful of color blindness if not using the default here.
     *
     * @default red
     *
     * @example rgb(255, 0, 0)
     *
     * @example #ff0000
     */
    negativeColor?: string;
    /**
     * Positive color
     *
     * Color to use for positive values. This can be any valid CSS color string.
     *
     * Be mindful of color blindness if not using the default here.
     *
     * @default blue
     *
     * @example rgb(0, 0, 255)
     *
     * @example #0000ff
     */
    positiveColor?: string;
    /**
     * Mask upper triangular
     *
     * Whether or not to mask the upper triangular portion of the attention patterns.
     *
     * Should be true for causal attention, false for bidirectional attention.
     *
     * @default true
     */
    maskUpperTri?: boolean;
    /**
     * Show axis labels
     */
    showAxisLabels?: boolean;
    /**
     * List of tokens
     *
     * Must be the same length as the list of values.
     */
    tokens: string[];
}
//# sourceMappingURL=AttentionHeads.d.ts.map