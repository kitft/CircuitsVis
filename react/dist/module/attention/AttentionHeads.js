import React from "react";
import { Col, Container, Row } from "react-grid-system";
import { AttentionPattern } from "./AttentionPattern";
import { useHoverLock } from "./components/useHoverLock";
/**
 * Attention head color
 *
 * @param idx Head index
 * @param numberOfHeads Number of heads
 * @param alpha Opaqueness (0% = fully transparent, 100% = fully opaque)
 */
export function attentionHeadColor(idx, numberOfHeads, alpha = "100%") {
    const hue = Math.round((idx / numberOfHeads) * 360);
    return `hsla(${hue}, 70%, 50%,  ${alpha})`;
}
/**
 * Attention Heads Selector
 */
export function AttentionHeadsSelector({ attention, attentionHeadNames, focused, maxValue, minValue, negativeColor, onClick, onMouseEnter, onMouseLeave, positiveColor, maskUpperTri, tokens }) {
    return (React.createElement(Row, { style: { marginBottom: 15 } }, attention.map((headAttention, idx) => {
        const isFocused = focused === idx;
        return (React.createElement(Col, { lg: 1, md: 2, xs: 3, style: { margin: 0, padding: 0 }, key: idx },
            React.createElement("div", { style: { padding: 3 }, onClick: () => onClick(idx), onMouseEnter: () => onMouseEnter(idx), onMouseLeave: onMouseLeave },
                React.createElement("div", { style: {
                        position: "relative",
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: attentionHeadColor(idx, attention.length),
                        boxShadow: isFocused
                            ? `0px 0px 4px 3px ${attentionHeadColor(idx, attention.length, "60%")}`
                            : undefined
                    } },
                    React.createElement("h4", { style: {
                            position: "absolute",
                            top: 0,
                            right: 0,
                            zIndex: 100,
                            margin: 0,
                            padding: 1,
                            background: attentionHeadColor(idx, attention.length),
                            color: "white"
                        } }, attentionHeadNames[idx]),
                    React.createElement(AttentionPattern, { attention: headAttention, tokens: tokens, showAxisLabels: false, maxValue: maxValue, minValue: minValue, negativeColor: negativeColor, positiveColor: positiveColor, maskUpperTri: maskUpperTri })))));
    })));
}
/**
 * Attention patterns from destination to source tokens, for a group of heads.
 *
 * Displays a small heatmap for each attention head. When one is selected, it is
 * then shown in full size.
 */
export function AttentionHeads({ attention, attentionHeadNames, maxValue, minValue, negativeColor, positiveColor, maskUpperTri = true, tokens }) {
    // Attention head focussed state
    const { focused, onClick, onMouseEnter, onMouseLeave } = useHoverLock(0);
    const headNames = attentionHeadNames || attention.map((_, idx) => `Head ${idx}`);
    return (React.createElement(Container, null,
        React.createElement("h3", { style: { marginBottom: 15 } }, "Head Selector (hover to view, click to lock)"),
        React.createElement(AttentionHeadsSelector, { attention: attention, attentionHeadNames: headNames, focused: focused, maxValue: maxValue, minValue: minValue, negativeColor: negativeColor, onClick: onClick, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, positiveColor: positiveColor, maskUpperTri: maskUpperTri, tokens: tokens }),
        React.createElement(Row, null,
            React.createElement(Col, { xs: 12 },
                React.createElement("h3", { style: { marginBottom: 10 } },
                    headNames[focused],
                    " Zoomed"),
                React.createElement("div", null,
                    React.createElement("h2", { style: {
                            position: "absolute",
                            top: 0,
                            right: 0,
                            zIndex: 1000,
                            margin: 6,
                            padding: "5px 10px",
                            background: attentionHeadColor(focused, attention.length),
                            color: "white"
                        } }, headNames[focused]),
                    React.createElement(AttentionPattern, { attention: attention[focused], maxValue: maxValue, minValue: minValue, negativeColor: negativeColor, positiveColor: positiveColor, zoomed: true, maskUpperTri: maskUpperTri, tokens: tokens })))),
        React.createElement(Row, null)));
}
//# sourceMappingURL=AttentionHeads.js.map