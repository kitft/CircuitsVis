import React, { useMemo, useState } from "react";
import { einsum, tensor } from "@tensorflow/tfjs";
import tinycolor from "tinycolor2";
import { AttentionImage } from "./components/AttentionImage";
import { Tokens, TokensView } from "./components/AttentionTokens";
import { useHoverLock } from "./components/useHoverLock";
/**
 * Color the attention values by heads
 *
 * We want attention values to be colored by each head (i.e. becoming [heads x
 * dest_tokens x src_tokens x rgb_color_channel]). This way, when outputting an
 * image of just one attention head it will be colored (by the specific hue
 * assigned to that attention head) rather than grayscale.
 *
 * Importantly, when outputting an image that averages
 * several attention heads we can then also average over the colors (so that we
 * can see for each destination-source token pair which head is most important).
 * For example, if the specific pair is very red, it suggests that the red
 * attention head is most important for this destination-source token combination.
 *
 * @param attentionInput Attention input as [dest_tokens x source_tokens x
 * heads] array (this is the format provided by the Python interface).
 *
 * @returns Tensor of the shape [heads x dest_tokens x src_tokens x
 * rgb_color_channel]
 */
export function colorAttentionTensors(attentionInput) {
    // Create a TensorFlow tensor from the attention data
    const attentionTensor = tensor(attentionInput); // [heads x dest_tokens x source_tokens]
    const attention = attentionTensor.arraySync();
    // Set the colors
    const colored = attention.map((head, headNumber) => head.map((destination) => destination.map((sourceAttention) => {
        // Color
        const attentionColor = tinycolor({
            h: (headNumber / attention.length) * 360,
            s: 0.8,
            l: 1 - 0.75 * sourceAttention // Luminance (shows amount of attention)
        });
        // Return as a nested list in the format [red, green, blue]
        const { r, g, b } = attentionColor.toRgb();
        return [r, g, b];
    })));
    return tensor(colored);
}
/**
 * Attention Patterns
 *
 * @deprecated Use `AttentionHeads` instead.
 */
export function AttentionPatterns({ tokens, attention, headLabels }) {
    // State for the token view type
    const [tokensView, setTokensView] = useState(TokensView.DESTINATION_TO_SOURCE);
    // Attention head focussed state
    const { focused: focusedHead, onClick: onClickHead, onMouseEnter: onMouseEnterHead, onMouseLeave: onMouseLeaveHead } = useHoverLock();
    // State for which token is focussed
    const { focused: focussedToken, onClick: onClickToken, onMouseEnter: onMouseEnterToken, onMouseLeave: onMouseLeaveToken } = useHoverLock();
    // Color the attention values (by head)
    const coloredAttention = useMemo(() => colorAttentionTensors(attention), [attention]);
    const heads = coloredAttention.unstack(0);
    // Max attention color across all heads
    // This is helpful as we can see if, for example, only one or two colored
    // heads are focussing on a specific source token from a destination token.
    // To do this we re-arrange to put heads at the last dimension and then max
    // this (by color darkness, so min in terms of rgb values)
    const maxAttentionAcrossHeads = einsum("hdsc -> dsch", coloredAttention).min(3);
    // Get the focused head based on the state (selected/hovered)
    const focusedAttention = focusedHead === null ? maxAttentionAcrossHeads : heads[focusedHead];
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: "flex" } },
            React.createElement("div", null,
                React.createElement("h4", null, "Attention Patterns"),
                React.createElement(AttentionImage, { coloredAttention: focusedAttention })),
            React.createElement("div", { style: { marginLeft: 15 } },
                React.createElement("h4", null,
                    "Head selector",
                    React.createElement("span", { style: { fontWeight: "normal" } },
                        " ",
                        "(hover to focus, click to lock)")),
                React.createElement("div", { style: { display: "flex", flexWrap: "wrap" } }, heads.map((head, headNumber) => {
                    var _a;
                    return (React.createElement("figure", { key: headNumber, style: {
                            margin: 0,
                            marginRight: 15
                        }, onClick: () => onClickHead(headNumber), onMouseEnter: () => onMouseEnterHead(headNumber), onMouseLeave: onMouseLeaveHead },
                        React.createElement(AttentionImage, { coloredAttention: head, style: { width: 80 }, isSelected: headNumber === focusedHead }),
                        React.createElement("figcaption", null, (_a = headLabels === null || headLabels === void 0 ? void 0 : headLabels[headNumber]) !== null && _a !== void 0 ? _a : `Head ${headNumber}`)));
                })))),
        React.createElement("div", { className: "tokens" },
            React.createElement("h4", { style: { display: "inline-block", marginRight: 15 } },
                "Tokens",
                React.createElement("span", { style: { fontWeight: "normal" } }, " (click to focus)")),
            React.createElement("select", { value: tokensView, onChange: (e) => setTokensView(e.target.value) },
                React.createElement("option", { value: TokensView.DESTINATION_TO_SOURCE }, "Source \u2190 Destination"),
                React.createElement("option", { value: TokensView.SOURCE_TO_DESTINATION }, "Destination \u2190 Source")),
            React.createElement("div", null,
                React.createElement(Tokens, { coloredAttention: coloredAttention, focusedHead: focusedHead, focusedToken: focussedToken, onClickToken: onClickToken, onMouseEnterToken: onMouseEnterToken, onMouseLeaveToken: onMouseLeaveToken, tokens: tokens, tokensView: tokensView })))));
}
//# sourceMappingURL=AttentionPatterns.js.map