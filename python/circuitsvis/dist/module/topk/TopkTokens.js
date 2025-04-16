import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-grid-system";
import { usePopperTooltip } from "react-popper-tooltip";
import { colord } from "colord";
import { getTokenBackgroundColor } from "../utils/getTokenBackgroundColor";
import { arraySlice2D } from "../utils/arrayOps";
import { RangeSelector } from "../shared/RangeSelector";
import { NumberSelector } from "../shared/NumberSelector";
/**
 * Create a grid cell containing the token coloured by its activation value.
 *
 * @returns A td element.
 */
export function TokenCell({ tdKey, token, value, minValue, maxValue, negativeColor, positiveColor }) {
    // Hover state
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({
        followCursor: true
    });
    const backgroundColor = getTokenBackgroundColor(value, minValue, maxValue, negativeColor, positiveColor).toRgbString();
    const textColor = colord(backgroundColor).brightness() < 0.6 ? "white" : "black";
    const tokenReplaceSpaces = token.replace(/\s/g, "&nbsp;");
    const tokenReplaceLineBreaks = tokenReplaceSpaces.replace(/\n/g, "¶");
    return (React.createElement("td", { key: tdKey, style: {
            backgroundColor,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "black"
        } },
        React.createElement("span", { ref: setTriggerRef, style: { display: "block", color: textColor }, dangerouslySetInnerHTML: { __html: tokenReplaceLineBreaks } }),
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
/**
 * Create a table with the topk and bottomk tokens for each neuron in the selected range.
 *
 * @returns A html table element containing the topk table.
 */
export function TopBottomKTable({ topkActivations, bottomkActivations, topkTokens, bottomkTokens, neuronNumbers, filter, colLabel }) {
    return (React.createElement("table", { style: { marginTop: 15, marginLeft: 15 } },
        React.createElement("thead", null,
            React.createElement("tr", null,
                React.createElement("th", { colSpan: neuronNumbers.length + 1, style: { textAlign: "center", paddingLeft: "9ch" } }, colLabel)),
            React.createElement("tr", null,
                React.createElement("th", { key: "default", style: { textAlign: "center" } }),
                neuronNumbers.map((neuronNumber) => (React.createElement("th", { key: neuronNumber, style: { textAlign: "center" } }, neuronNumber))))),
        React.createElement("tbody", null,
            filter.includes("topk") &&
                topkActivations.map((activations, tokenIdx) => (React.createElement("tr", { key: tokenIdx },
                    tokenIdx === 0 && (React.createElement("td", { key: "default", style: { textAlign: "center", fontWeight: "bold" }, rowSpan: topkActivations.length }, "Topk \u2193")),
                    activations.map((activation, neuronIdx) => (React.createElement(TokenCell, { key: neuronIdx, tdKey: neuronIdx, token: topkTokens[tokenIdx][neuronIdx], value: activation, minValue: 0, maxValue: 1 })))))),
            filter === "topk+bottomk" && (React.createElement("tr", null,
                React.createElement("td", { key: "default", style: { textAlign: "center" } }),
                Array(topkActivations[0].length)
                    .fill(0)
                    .map((_, idx) => (React.createElement("td", { key: idx },
                    React.createElement("div", { style: { textAlign: "center" } }, "...")))))),
            filter.includes("bottomk") &&
                bottomkActivations.map((activations, tokenIdx) => (React.createElement("tr", { key: tokenIdx },
                    tokenIdx === 0 && (React.createElement("td", { key: "default", style: { textAlign: "center", fontWeight: "bold" }, rowSpan: bottomkActivations.length }, "Bottomk \u2193")),
                    activations.map((activation, neuronIdx) => (React.createElement(TokenCell, { key: neuronIdx, tdKey: neuronIdx, token: bottomkTokens[tokenIdx][neuronIdx], value: activation, minValue: 0, maxValue: 1 })))))))));
}
/**
 * Show the topk and bottomk tokens for each neuron/directions.
 *
 * Includes drop-downs for k, layer and neuron numbers, and the number of
 * columns to show (representing the neurons or directions).
 */
export function TopkTokens({ tokens, topkVals, topkIdxs, bottomkVals, bottomkIdxs, firstDimensionName = "Layer", thirdDimensionName = "Neuron", // Note that we simply use neuron for variable names throughout this file
sampleLabels, firstDimensionLabels }) {
    const numberOfSamples = topkVals.length;
    const numberOfLayers = topkVals[0].length;
    const maxk = topkVals[0][0].length;
    const numberOfNeurons = topkVals[0][0][0].length;
    /** TODO: reqct-hook-form <- investigate */
    const [sampleNumber, setSampleNumber] = useState(0);
    const [layerNumber, setLayerNumber] = useState(0);
    const [colsToShow, setColsToShow] = useState(5);
    const [k, setK] = useState(maxk);
    const [neuronNumbers, setNeuronNumbers] = useState([
        ...Array(colsToShow).keys()
    ]);
    // Filter for whether to show the topk, bottomk or both (written as "bottomk+topk")
    const [filter, setFilter] = useState("topk+bottomk");
    useEffect(() => {
        // When the user changes the colsToShow, update the neuronNumbers
        setNeuronNumbers(numberOfSamples > 1 ? [...Array(colsToShow).keys()] : [0]);
    }, [colsToShow, numberOfSamples]);
    const currentTokens = tokens[sampleNumber];
    // Start-end ranges for the slice of the topk/bottomk arrays
    const dimRanges = [
        [0, k],
        [neuronNumbers[0], neuronNumbers[neuronNumbers.length - 1] + 1]
    ];
    const currentTopkVals = arraySlice2D(topkVals[sampleNumber][layerNumber], dimRanges);
    const currentTopkIdxs = arraySlice2D(topkIdxs[sampleNumber][layerNumber], dimRanges);
    const currentBottomkVals = arraySlice2D(bottomkVals[sampleNumber][layerNumber], dimRanges);
    const currentBottomkIdxs = arraySlice2D(bottomkIdxs[sampleNumber][layerNumber], dimRanges);
    const topkTokens = currentTopkIdxs.map((outerArr) => outerArr.map((token_idx) => currentTokens[token_idx]));
    const bottomkTokens = currentBottomkIdxs.map((outerArr) => outerArr.map((token_idx) => currentTokens[token_idx]));
    const selectRowStyle = {
        paddingTop: 5,
        paddingBottom: 5
    };
    return (React.createElement("div", null,
        React.createElement(Container, { fluid: true },
            React.createElement(Row, null,
                React.createElement(Col, null,
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Sample:"),
                            React.createElement(NumberSelector, { id: "sample-selector", smallestNumber: 0, largestNumber: numberOfSamples - 1, currentValue: sampleNumber, setCurrentValue: setSampleNumber, labels: sampleLabels }))),
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "layer-selector", style: { marginRight: 15 } },
                                firstDimensionName,
                                ":"),
                            React.createElement(NumberSelector, { id: "layer-selector", largestNumber: numberOfLayers - 1, currentValue: layerNumber, setCurrentValue: setLayerNumber, labels: firstDimensionLabels }))),
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } },
                                thirdDimensionName,
                                ":"),
                            React.createElement(RangeSelector, { id: "neuron-selector", largestNumber: numberOfNeurons - 1, currentRangeArr: neuronNumbers, setCurrentValue: setNeuronNumbers, numValsInRange: colsToShow })))),
                React.createElement(Col, null,
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "filter-select", style: { marginRight: 15 } }, "Filter:"),
                            React.createElement("select", { value: filter, onChange: (event) => setFilter(event.target.value), id: "filter-select" },
                                React.createElement("option", { value: undefined }, "topk+bottomk"),
                                React.createElement("option", { value: "topk" }, "topk"),
                                React.createElement("option", { value: "bottomk" }, "bottomk")))),
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "visibleCols-selector", style: { marginRight: 15 } },
                                thirdDimensionName,
                                "s to show:"),
                            React.createElement(NumberSelector, { id: "visible-cols-selector", smallestNumber: 1, largestNumber: numberOfNeurons, currentValue: colsToShow, setCurrentValue: setColsToShow }))),
                    React.createElement(Row, { style: selectRowStyle },
                        React.createElement(Col, null,
                            React.createElement("label", { htmlFor: "k-selector", style: { marginRight: 15 } }, "k:"),
                            React.createElement(NumberSelector, { id: "k-selector", smallestNumber: 1, largestNumber: maxk, currentValue: k, setCurrentValue: setK })))))),
        React.createElement(TopBottomKTable, { topkActivations: currentTopkVals, bottomkActivations: currentBottomkVals, topkTokens: topkTokens, bottomkTokens: bottomkTokens, neuronNumbers: neuronNumbers, filter: filter, colLabel: thirdDimensionName })));
}
//# sourceMappingURL=TopkTokens.js.map