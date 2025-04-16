import React from "react";
import { TokenCustomTooltip } from "./utils/TokenCustomTooltip";
/**
 * Display tokens with a background representing how negative (close to
 * `negativeColor`) or positive (close to `positiveColor`) the token is. Zero is
 * always displayed as white.
 *
 * Hover over a token, to view its value.
 */
export function ColoredTokensCustomTooltips({ maxValue, minValue, negativeColor, positiveColor, tokens, values, tooltips }) {
    const tokenMin = minValue !== null && minValue !== void 0 ? minValue : Math.min(...values);
    const tokenMax = maxValue !== null && maxValue !== void 0 ? maxValue : Math.max(...values);
    return (React.createElement("div", { className: "colored-tokens", style: { paddingBottom: 30 } }, tokens.map((token, key) => (React.createElement(TokenCustomTooltip, { key: key, token: token, value: values[key], min: tokenMin, max: tokenMax, negativeColor: negativeColor, positiveColor: positiveColor, tooltip: tooltips[key] })))));
}
//# sourceMappingURL=ColoredTokensCustomTooltips.js.map