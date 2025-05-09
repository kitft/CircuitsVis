/// <reference types="react" />
import { AnyColor } from "colord";
/**
 * Display tokens with a background representing how negative (close to
 * `negativeColor`) or positive (close to `positiveColor`) the token is. Zero is
 * always displayed as white.
 *
 * Hover over a token, to view its value.
 */
export declare function ColoredTokens({ maxValue, minValue, negativeColor, positiveColor, tokens, values, paddingBottom }: ColoredTokensProps): JSX.Element;
export interface ColoredTokensProps {
    /**
     * Maximum value
     *
     * Used to determine how dark the token color is when positive (i.e. based on
     * how close it is to the minimum value).
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
     * @default "red"
     *
     * @example rgb(255, 0, 0)
     *
     * @example #ff0000
     */
    negativeColor?: AnyColor;
    /**
     * Positive color
     *
     * Color to use for positive values. This can be any valid CSS color string.
     *
     * Be mindful of color blindness if not using the default here.
     *
     * @default "blue"
     *
     * @example rgb(0, 0, 255)
     *
     * @example #0000ff
     */
    positiveColor?: AnyColor;
    /**
     * The padding below the sample
     *
     * @default 30
     */
    paddingBottom?: number;
    /**
     * List of tokens
     *
     * Must be the same length as the list of values.
     */
    tokens: string[];
    /**
     * Values for each token
     *
     * Must be the same length as the list of tokens.
     */
    values: number[];
}
//# sourceMappingURL=ColoredTokens.d.ts.map