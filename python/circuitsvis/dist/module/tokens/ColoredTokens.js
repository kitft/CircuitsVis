import React from "react";
import { Token } from "./utils/Token";
/**
 * Display tokens with a background representing how negative (close to
 * `negativeColor`) or positive (close to `positiveColor`) the token is. Zero is
 * always displayed as white.
 *
 * Hover over a token, to view its value.
 */
export function ColoredTokens({ maxValue, minValue, negativeColor, positiveColor, tokens, values, paddingBottom }) {
    const tokenMin = minValue !== null && minValue !== void 0 ? minValue : Math.min(...values);
    const tokenMax = maxValue !== null && maxValue !== void 0 ? maxValue : Math.max(...values);
    return (React.createElement("div", { className: "colored-tokens", style: { paddingBottom } }, tokens.map((token, key) => (React.createElement(Token, { key: key, token: token, value: values[key], min: tokenMin, max: tokenMax, negativeColor: negativeColor, positiveColor: positiveColor })))));
}
//# sourceMappingURL=ColoredTokens.js.map