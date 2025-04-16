import React from "react";
import { colord } from "colord";
import { usePopperTooltip } from "react-popper-tooltip";
import { getTokenBackgroundColor } from "../../utils/getTokenBackgroundColor";
export function formatTokenText(token) {
    // Handle special tokens (e.g. spaces/line breaks)
    const tokenReplaceSpaces = token.replace(/\s/g, "&nbsp;");
    const tokenReplaceLineBreaks = tokenReplaceSpaces.replace(/\n/g, "¶");
    return tokenReplaceLineBreaks;
}
/**
 * Token (shown as an inline block)
 */
export function Token({ token, value, min, max, negativeColor, positiveColor }) {
    // Hover state
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({
        followCursor: true
    });
    // Get the background color
    const backgroundColor = getTokenBackgroundColor(value, min, max, negativeColor, positiveColor).toRgbString();
    // Get the text color
    const textColor = colord(backgroundColor).brightness() < 0.6 ? "white" : "black";
    // Format the span (CSS style)
    const spanStyle = {
        display: "inline-block",
        backgroundColor,
        color: textColor,
        lineHeight: "1em",
        padding: "3px 0",
        marginLeft: -1,
        marginBottom: 1,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#eee"
    };
    // Handle special tokens (e.g. spaces/line breaks)
    const tokenReplaceLineBreaks = formatTokenText(token);
    const lineBreakElements = token.match(/\n/g);
    return (React.createElement(React.Fragment, null,
        React.createElement("span", { ref: setTriggerRef },
            React.createElement("span", { style: spanStyle, dangerouslySetInnerHTML: { __html: tokenReplaceLineBreaks } }), lineBreakElements === null || lineBreakElements === void 0 ? void 0 :
            lineBreakElements.map((_break, idx) => (React.createElement("br", { key: idx })))),
        visible && (React.createElement("div", { ref: setTooltipRef, ...getTooltipProps({
                style: {
                    background: "#333",
                    color: "white",
                    textAlign: "center",
                    padding: 10,
                    borderRadius: 5,
                    boxShadow: "5px 5px rgba(0, 0, 0, 0.03)",
                    marginTop: 15,
                    zIndex: 1
                }
            }) },
            React.createElement("strong", null, token),
            React.createElement("br", null),
            value))));
}
//# sourceMappingURL=Token.js.map