import { tensor } from "@tensorflow/tfjs";
import React, { useState, useEffect } from "react";
import { ColoredTokensCustomTooltips } from "./ColoredTokensCustomTooltips";
import { useHoverLock } from "../attention/components/useHoverLock";
const PRECISION = 6;
export function ValueSelector({ values, labels, selectedValue, setSelectedValue }) {
    const numValues = values.shape[1];
    const { focused: focusedValue, onClick: onClickValue, onMouseEnter: onMouseEnterValue, onMouseLeave: onMouseLeaveValue } = useHoverLock();
    // Janky setup because focusedValue and selectedValue are not the same thing.
    // Keeps them in sync, but only when focusedValue is not null.
    // This means that when the user moves their cursor off the selector, it
    // remains with that value selected, rather than being null.
    useEffect(() => {
        if (focusedValue !== null) {
            setSelectedValue(focusedValue);
        }
    }, [focusedValue, setSelectedValue]);
    const valueSelectors = [];
    for (let i = 0; i < numValues; i++) {
        const isSelected = i === selectedValue;
        const label = labels[i];
        valueSelectors.push(React.createElement("div", { key: i, style: {
                display: "inline-block",
                padding: "0 5px",
                backgroundColor: isSelected ? "black" : "white",
                color: isSelected ? "white" : "black",
                cursor: "pointer"
            }, onClick: () => onClickValue(i), onMouseEnter: () => onMouseEnterValue(i), onMouseLeave: onMouseLeaveValue }, label));
    }
    return React.createElement("div", null, valueSelectors);
}
export function NumberInput({ value, setValue, defaultValue, label }) {
    const handleInputChange = (event) => {
        setValue(parseFloat(event.target.value));
    };
    const handleButtonClick = () => {
        setValue(defaultValue);
    };
    return (React.createElement("div", null,
        React.createElement("label", { htmlFor: label },
            label,
            ":"),
        " ",
        React.createElement("input", { type: "text", id: "number", value: value, onChange: handleInputChange }),
        defaultValue && (React.createElement("button", { type: "button", onClick: handleButtonClick }, "Reset"))));
}
export function Tooltip({ title, labels, values, tokenIndex, currentValueIndex }) {
    const numValues = values.shape[1];
    const valueRows = [];
    for (let i = 0; i < numValues; i++) {
        valueRows.push(React.createElement("tr", { key: i },
            React.createElement("td", { style: { fontWeight: "bold" } }, labels[i]),
            React.createElement("td", { style: {
                    textAlign: "right",
                    fontWeight: currentValueIndex === i ? "bold" : "normal"
                } }, values.bufferSync().get(tokenIndex, i).toFixed(PRECISION))));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { fontWeight: "bold", fontSize: 16, backgroundColor: "white" } }, title),
        React.createElement("table", null,
            React.createElement("tbody", null, valueRows))));
}
/**
 * Extension of ColoredTokens to allow K vectors of values across tokens. Each
 * vector has a positive and negative color associated. For the selected vector,
 * display tokens with a background representing how negative (close to
 * `negativeColor`) or positive (close to `positiveColor`) the token is. Zero is
 * always displayed as white.
 *
 * Hover over a token, to view all K of its values.
 */
export function ColoredTokensMulti({ tokens, values, labels, positiveBounds, negativeBounds }) {
    const valuesTensor = tensor(values);
    const numValues = valuesTensor.shape[1];
    // Define default positive and negative bounds if not provided
    // These are the max/min elements of the value tensor, capped at +-1e-7 (not
    // zero, to avoid a bug in our color calculation code)
    const positiveBoundsTensor = positiveBounds
        ? tensor(positiveBounds)
        : valuesTensor.max(0).maximum(1e-7);
    const negativeBoundsTensor = negativeBounds
        ? tensor(negativeBounds)
        : valuesTensor.min(0).minimum(-1e-7);
    // Define default labels if not provided
    const valueLabels = labels || Array.from(Array(numValues).keys()).map((_, i) => `${i}`);
    const [displayedValueIndex, setDisplayedValueIndex] = useState(0);
    // Positive and negative bounds state
    const defaultPositiveBound = Number(positiveBoundsTensor.arraySync()[displayedValueIndex].toFixed(PRECISION));
    const defaultNegativeBound = Number(negativeBoundsTensor.arraySync()[displayedValueIndex].toFixed(PRECISION));
    const [positiveBound, setOverridePositiveBound] = useState(Number(defaultPositiveBound));
    const [negativeBound, setOverrideNegativeBound] = useState(Number(defaultNegativeBound));
    const displayedValues = valuesTensor
        .slice([0, displayedValueIndex], [-1, 1])
        .squeeze([1]);
    // Padding to ensure that the tooltip is visible - pretty janky, sorry!
    return (React.createElement("div", { style: { paddingBottom: 20 * numValues } },
        React.createElement(ValueSelector, { values: valuesTensor, labels: valueLabels, selectedValue: displayedValueIndex, setSelectedValue: setDisplayedValueIndex }),
        React.createElement(NumberInput, { value: positiveBound, setValue: setOverridePositiveBound, defaultValue: defaultPositiveBound, label: "Positive Bound" }),
        React.createElement(NumberInput, { value: negativeBound, setValue: setOverrideNegativeBound, defaultValue: defaultNegativeBound, label: "Negative Bound" }),
        React.createElement("br", null),
        React.createElement(ColoredTokensCustomTooltips, { tokens: tokens, values: displayedValues.arraySync(), maxValue: positiveBound, minValue: negativeBound, tooltips: displayedValues.arraySync().map((_val, i) => (React.createElement(Tooltip, { key: i, title: tokens[i], labels: valueLabels, values: valuesTensor, tokenIndex: i, currentValueIndex: displayedValueIndex }))) })));
}
//# sourceMappingURL=ColoredTokensMulti.js.map