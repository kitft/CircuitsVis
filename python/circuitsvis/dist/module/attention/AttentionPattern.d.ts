/// <reference types="react" />
/**
 * Block data point
 *
 * Contains information about a single block on the chart.
 */
export interface Block {
    /** Source token with index suffix */
    x: string;
    /** Destination token with index suffix */
    y: string;
    /** Attention value */
    v: number;
    /** Source token */
    srcToken: string;
    /** Destination token */
    destToken: string;
    /** Source index */
    srcIdx: number;
    /** Destination index */
    destIdx: number;
}
/**
 * Attention pattern from destination to source tokens. Displays a heatmap of
 * attention values (hover to see the specific values).
 */
export declare function AttentionPattern({ attention, maxValue, minValue, negativeColor, positiveColor, upperTriColor, showAxisLabels, zoomed, maskUpperTri, tokens }: AttentionPatternProps): JSX.Element;
export interface AttentionPatternProps {
    /**
     * Attention head activations
     *
     * Of the shape [ dest_pos x src_pos ]
     */
    attention: number[][];
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
     * Upper triangular color
     *
     * Color to use for the upper triangular part of the attention pattern to make visualization slightly nicer.
     * Only applied if maskUpperTri is set to true.
     *
     * @default rgb(200, 200, 200)
     *
     * @example rgb(200, 200, 200)
     *
     * @example #C8C8C8
     */
    upperTriColor?: string;
    /**
     * Show axis labels
     */
    showAxisLabels?: boolean;
    /**
     * Is this a zoomed in view?
     */
    zoomed?: boolean;
    /**
     * List of tokens
     *
     * Must be the same length as the list of values.
     */
    tokens: string[];
}
//# sourceMappingURL=AttentionPattern.d.ts.map