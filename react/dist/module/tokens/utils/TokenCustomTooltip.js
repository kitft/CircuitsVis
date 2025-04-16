import React from "react";
import { colord } from "colord";
import { usePopperTooltip } from "react-popper-tooltip";
import { getTokenBackgroundColor } from "../../utils/getTokenBackgroundColor";
import { formatTokenText } from "./Token";
/**
 * Token (shown as an inline block)
 */
export function TokenCustomTooltip({ token, value, min, max, negativeColor, positiveColor, tooltip = React.createElement(React.Fragment, null, "Intentionally Left Blank") }) {
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
                    background: "#eee",
                    color: "black",
                    textAlign: "center",
                    padding: 10,
                    borderRadius: 5,
                    boxShadow: "5px 5px rgba(0, 0, 0, 0.03)",
                    marginTop: 15
                }
            }) }, tooltip))));
}
//# sourceMappingURL=TokenCustomTooltip.js.map