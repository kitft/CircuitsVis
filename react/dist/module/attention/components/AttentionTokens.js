import { einsum } from "@tensorflow/tfjs";
import tinycolor from "tinycolor2";
import React from "react";
export var TokensView;
(function (TokensView) {
    TokensView["DESTINATION_TO_SOURCE"] = "DESTINATION_TO_SOURCE";
    TokensView["SOURCE_TO_DESTINATION"] = "SOURCE_TO_DESTINATION";
})(TokensView || (TokensView = {}));
/**
 * Get the relevant attention values to average (for an individual token)
 *
 * Used to calculate the color of a specific token block (div).
 *
 * @param maxAttentionAcrossHeads [dest_tokens x src_tokens x rgb]
 * @param tokenIndex Current token index
 * @param tokensView
 * @param focusedToken Selected/focused token
 *
 * @returns Relevant tokens from which to average the color [dest_tokens x src_tokens x rgb]
 */
export function getTokensToAverage(maxAttentionAcrossHeads, tokenIndex, tokensView, focusedToken) {
    // Default: If no tokens are selected, we're going to average over all source
    // tokens available to look at (i.e. up to this current token)
    // Note: End values are inclusive
    let destinationStart = tokenIndex;
    let destinationEnd = tokenIndex;
    let sourceStart = 0;
    let sourceEnd = tokenIndex;
    // If a token is selected (and we're showing destination -> source attention),
    // show the attention from the selected destination token to this token.
    if (typeof focusedToken === "number" &&
        tokensView === TokensView.DESTINATION_TO_SOURCE) {
        destinationStart = focusedToken;
        destinationEnd = focusedToken;
        sourceStart = tokenIndex;
        sourceEnd = tokenIndex;
    }
    // If a token is selected (but instead we're showing source -> destination),
    // show the attention from the selected source token to this token.
    else if (typeof focusedToken === "number" &&
        tokensView === TokensView.SOURCE_TO_DESTINATION) {
        destinationStart = tokenIndex;
        destinationEnd = tokenIndex;
        sourceStart = focusedToken;
        sourceEnd = focusedToken;
    }
    return maxAttentionAcrossHeads.slice([destinationStart, sourceStart], [destinationEnd + 1 - destinationStart, sourceEnd + 1 - sourceStart]);
}
/**
 * Individual Token
 */
export function Token({ focusedToken, onClickToken, onMouseEnterToken, onMouseLeaveToken, maxAttentionAcrossHeads, text, tokenIndex, tokensView }) {
    const isFocused = focusedToken !== null && focusedToken === tokenIndex;
    // Get the average of the colors of the source tokens that we can attend to.
    const relevantTokens = getTokensToAverage(maxAttentionAcrossHeads, tokenIndex, tokensView, focusedToken);
    const averageColor = relevantTokens
        .mean(0)
        .mean(0);
    const [r, g, b] = averageColor.arraySync();
    const backgroundColor = tinycolor({ r, g, b });
    // Set the text color to always be visible (allowing for the background color)
    const textColor = backgroundColor.getBrightness() < 180 ? "white" : "black";
    return (React.createElement("button", { style: {
            backgroundColor: backgroundColor.toRgbString(),
            borderColor: "#DDD",
            borderStyle: "solid",
            borderWidth: 0,
            borderRightWidth: 1,
            color: textColor,
            display: "inline-block",
            marginBottom: 3,
            padding: "3px 0px",
            // Focussed box shadow
            boxShadow: isFocused ? "0px 0px 3px 3px rgba(0,0,200,0.4)" : undefined
        }, onClick: () => onClickToken(tokenIndex), onMouseEnter: () => onMouseEnterToken(tokenIndex), onMouseLeave: onMouseLeaveToken, 
        // Dangerously set so that we can print un-escaped html characters
        dangerouslySetInnerHTML: { __html: text.replace(" ", "&nbsp;") } }));
}
/**
 * Tokens
 *
 * Each token is shown as block (div) with the token text inside of it. When you
 * click on a token, it updates all the other tokens in this list to show how
 * much those tokens are attended to by this one (or attended from if TokenView
 * is set as Source -> Destination instead). The values are averaged over
 * attention heads unless a specific head is selected.
 */
export function Tokens({ coloredAttention, focusedHead, focusedToken, onClickToken, onMouseEnterToken, onMouseLeaveToken, tokens, tokensView }) {
    // Just use the focused head colors if selected
    const focusedAttention = typeof focusedHead === "number"
        ? coloredAttention.slice([focusedHead], [1])
        : coloredAttention;
    // Get the max attention across attention heads (by color darkness, so min in
    // terms of rgb values)
    const maxAttentionAcrossHeads = einsum("hdsc -> dsch", focusedAttention).min(3);
    return (React.createElement("div", null, tokens.map((text, tokenIndex) => (React.createElement(Token, { focusedToken: focusedToken, onClickToken: onClickToken, onMouseEnterToken: onMouseEnterToken, onMouseLeaveToken: onMouseLeaveToken, key: tokenIndex, maxAttentionAcrossHeads: maxAttentionAcrossHeads, text: text, tokenIndex: tokenIndex, tokensView: tokensView })))));
}
//# sourceMappingURL=AttentionTokens.js.map