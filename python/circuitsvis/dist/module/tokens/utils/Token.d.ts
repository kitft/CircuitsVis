/// <reference types="react" />
import { AnyColor } from "colord";
export declare function formatTokenText(token: string): string;
/**
 * Token (shown as an inline block)
 */
export declare function Token({ token, value, min, max, negativeColor, positiveColor }: {
    token: string;
    value: number;
    min: number;
    max: number;
    negativeColor?: AnyColor;
    positiveColor?: AnyColor;
}): JSX.Element;
//# sourceMappingURL=Token.d.ts.map