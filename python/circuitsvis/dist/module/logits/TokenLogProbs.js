import React from "react";
import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import namesPlugin from "colord/plugins/names";
import { TokenCustomTooltip } from "../tokens/utils/TokenCustomTooltip";
import { formatTokenText } from "../tokens/utils/Token";
extend([mixPlugin, namesPlugin]);
const maxLogProb = 5;
export function logProbToColor(logProb, color = "blue", min = -maxLogProb) {
    return colord(color).mix(colord("grey"), Math.min(-logProb / -min, 1.0));
}
export function SimpleToken({ token }) {
    return (React.createElement("span", { style: { borderColor: "green", borderWidth: 1, borderStyle: "solid" }, dangerouslySetInnerHTML: { __html: formatTokenText(token) } }));
}
export function TooltipTableRow({ token, logProb, rank, isCorrectToken }) {
    const correctTokenStyle = {
        color: "orange",
        backgroundColor: logProbToColor(logProb).toRgbString(),
        fontWeight: "bold"
    };
    const incorrectTokenStyle = {
        color: "white",
        backgroundColor: logProbToColor(logProb).toRgbString()
    };
    return (React.createElement("tr", { style: isCorrectToken ? correctTokenStyle : incorrectTokenStyle },
        React.createElement("td", null,
            "#",
            rank),
        React.createElement("td", null,
            (Math.exp(logProb) * 100).toFixed(2),
            "%"),
        React.createElement("td", null, logProb.toFixed(3)),
        React.createElement("td", null,
            React.createElement(SimpleToken, { token: token }))));
}
export function Tooltip({ currentCorrectToken, currentCorrectTokenRank, currentCorrectTokenLogProb, currentTopKLogProbs, currentTopKTokens, prevToken }) {
    return (React.createElement("div", null,
        React.createElement("div", { style: {
                fontSize: 20,
                fontWeight: "bold",
                backgroundColor: "white",
                color: "black"
            } },
            React.createElement(SimpleToken, { token: prevToken }),
            " -",
            ">",
            " ",
            React.createElement(SimpleToken, { token: currentCorrectToken })),
        React.createElement("table", null,
            React.createElement("tr", null,
                React.createElement("th", null, "Rank"),
                React.createElement("th", null, "Prob"),
                React.createElement("th", null, "Log Prob"),
                React.createElement("th", null, "String")),
            React.createElement(TooltipTableRow, { token: currentCorrectToken, logProb: currentCorrectTokenLogProb, rank: currentCorrectTokenRank, isCorrectToken: true }),
            React.createElement("hr", null),
            currentTopKTokens.map((_token, i) => (React.createElement(TooltipTableRow, { key: i, token: currentTopKTokens[i], logProb: currentTopKLogProbs[i], rank: i, isCorrectToken: currentCorrectTokenRank === i }))))));
}
/**
 * Token log probs visualizer
 *
 * Shows the log probabilities of the top k next tokens for each token in the
 * prompt. Hover over each token to see these.
 */
export function TokenLogProbs({ prompt, topKLogProbs, topKTokens, correctTokenRank, correctTokenLogProb }) {
    return (
    // Padding to ensure that the tooltip is visible - pretty janky, sorry!
    React.createElement("div", { style: { paddingBottom: 350 } }, prompt.slice(1).map((token, i) => (React.createElement(TokenCustomTooltip, { key: i, token: token, value: Math.max(maxLogProb + correctTokenLogProb[i], 0), min: -0.1, max: maxLogProb, positiveColor: "red", tooltip: React.createElement(Tooltip, { currentCorrectToken: token, currentCorrectTokenRank: correctTokenRank[i], currentCorrectTokenLogProb: correctTokenLogProb[i], currentTopKLogProbs: topKLogProbs[i], currentTopKTokens: topKTokens[i], prevToken: prompt[i] }) })))));
}
//# sourceMappingURL=TokenLogProbs.js.map