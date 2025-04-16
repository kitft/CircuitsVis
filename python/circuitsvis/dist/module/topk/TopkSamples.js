import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-grid-system";
import { SampleItems } from "../shared/SampleItems";
import { RangeSelector } from "../shared/RangeSelector";
import { NumberSelector } from "../shared/NumberSelector";
import { minMaxInNestedArray } from "../utils/arrayOps";
/**
 * List of samples in descending order of max token activation value for the
 * selected layer and neuron (or whatever other dimension names are specified).
 */
export function TopkSamples({ tokens, activations, zerothDimensionName = "Layer", firstDimensionName = "Neuron", zerothDimensionLabels, firstDimensionLabels }) {
    const numberOfLayers = activations.length;
    const numberOfNeurons = activations[0].length;
    const numberOfSamples = activations[0][0].length;
    const [samplesPerPage, setSamplesPerPage] = useState(Math.min(5, numberOfSamples));
    const [sampleNumbers, setSampleNumbers] = useState([
        ...Array(samplesPerPage).keys()
    ]);
    const [layerNumber, setLayerNumber] = useState(0);
    const [neuronNumber, setNeuronNumber] = useState(0);
    useEffect(() => {
        // When the user changes the samplesPerPage, update the sampleNumbers
        setSampleNumbers([...Array(samplesPerPage).keys()]);
    }, [samplesPerPage]);
    // Get the relevant activations for the selected layer and neuron.
    const selectedActivations = sampleNumbers.map((sampleNumber) => {
        return activations[layerNumber][neuronNumber][sampleNumber];
    });
    const selectedTokens = sampleNumbers.map((sampleNumber) => {
        return tokens[layerNumber][neuronNumber][sampleNumber];
    });
    // For a consistent color scale across all samples in this layer and neuron
    const [minValue, maxValue] = minMaxInNestedArray(activations[layerNumber][neuronNumber]);
    const selectRowStyle = {
        paddingTop: 5,
        paddingBottom: 5
    };
    return (React.createElement(Container, { fluid: true },
        React.createElement(Row, null,
            React.createElement(Col, null,
                React.createElement(Row, { style: selectRowStyle },
                    React.createElement(Col, null,
                        React.createElement("label", { htmlFor: "layer-selector", style: { marginRight: 15 } },
                            zerothDimensionName,
                            ":"),
                        React.createElement(NumberSelector, { id: "layer-selector", largestNumber: numberOfLayers - 1, currentValue: layerNumber, setCurrentValue: setLayerNumber, labels: zerothDimensionLabels }))),
                React.createElement(Row, { style: selectRowStyle },
                    React.createElement(Col, null,
                        React.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } },
                            firstDimensionName,
                            ":"),
                        React.createElement(NumberSelector, { id: "neuron-selector", largestNumber: numberOfNeurons - 1, currentValue: neuronNumber, setCurrentValue: setNeuronNumber, labels: firstDimensionLabels }))),
                numberOfSamples > 1 && (React.createElement(Row, { style: selectRowStyle },
                    React.createElement(Col, null,
                        React.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Samples (descending):"),
                        React.createElement(RangeSelector, { id: "sample-selector", largestNumber: numberOfSamples - 1, currentRangeArr: sampleNumbers, setCurrentValue: setSampleNumbers, numValsInRange: samplesPerPage }))))),
            React.createElement(Col, null, numberOfSamples > 1 && (React.createElement(Row, { style: selectRowStyle },
                React.createElement(Col, null,
                    React.createElement("label", { htmlFor: "samples-per-page-selector", style: { marginRight: 15 } }, "Samples per page:"),
                    React.createElement(NumberSelector, { id: "samples-per-page-selector", smallestNumber: 1, largestNumber: numberOfSamples, currentValue: samplesPerPage, setCurrentValue: setSamplesPerPage })))))),
        React.createElement(Row, null,
            React.createElement(Col, null,
                React.createElement(SampleItems, { activationsList: selectedActivations, tokensList: selectedTokens, minValue: minValue, maxValue: maxValue })))));
}
//# sourceMappingURL=TopkSamples.js.map