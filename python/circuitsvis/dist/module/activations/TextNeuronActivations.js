import { tensor } from "@tensorflow/tfjs";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-grid-system";
import { SampleItems } from "../shared/SampleItems";
import { RangeSelector } from "../shared/RangeSelector";
import { NumberSelector } from "../shared/NumberSelector";
import { minMaxInNestedArray } from "../utils/arrayOps";
/**
 * Get the selected activations
 *
 * @param activations All activations [ tokens x layers x neurons ]
 * @param layerNumber
 * @param neuronNumber
 */
export function getSelectedActivations(activations, layerNumber, neuronNumber) {
    const relevantActivations = activations
        .slice([0, layerNumber, neuronNumber], [-1, 1, 1])
        .squeeze([1, 2]);
    return relevantActivations.arraySync();
}
/**
 * Show activations (colored by intensity) for each token.
 *
 * Includes drop-downs for e.g. showing the activations for the selected layer
 * and neuron for the given samples.
 */
export function TextNeuronActivations({ tokens, activations, firstDimensionName = "Layer", secondDimensionName = "Neuron", firstDimensionLabels, secondDimensionLabels }) {
    // If there is only one sample (i.e. if tokens is an array of strings), cast tokens and activations to an array with
    // a single element
    const tokensList = typeof tokens[0] === "string"
        ? [tokens]
        : tokens;
    const activationsList = typeof activations[0][0][0] === "number"
        ? [activations]
        : activations;
    // Obtain min and max activations for a consistent color scale across all samples
    const [minValue, maxValue] = minMaxInNestedArray(activationsList);
    // Convert the activations to a tensor
    const activationsTensors = activationsList.map((sampleActivations) => {
        return tensor(sampleActivations);
    });
    // Get number of layers/neurons
    const numberOfLayers = activationsTensors[0].shape[1];
    const numberOfNeurons = activationsTensors[0].shape[2];
    const numberOfSamples = activationsTensors.length;
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
    // Get the relevant activations for the selected samples, layer, and neuron.
    const selectedActivations = sampleNumbers.map((sampleNumber) => {
        return getSelectedActivations(activationsTensors[sampleNumber], layerNumber, neuronNumber);
    });
    const selectedTokens = sampleNumbers.map((sampleNumber) => {
        return tokensList[sampleNumber];
    });
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
                            firstDimensionName,
                            ":"),
                        React.createElement(NumberSelector, { id: "layer-selector", largestNumber: numberOfLayers - 1, currentValue: layerNumber, setCurrentValue: setLayerNumber, labels: firstDimensionLabels }))),
                React.createElement(Row, { style: selectRowStyle },
                    React.createElement(Col, null,
                        React.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } },
                            secondDimensionName,
                            ":"),
                        React.createElement(NumberSelector, { id: "neuron-selector", largestNumber: numberOfNeurons - 1, currentValue: neuronNumber, setCurrentValue: setNeuronNumber, labels: secondDimensionLabels }))),
                numberOfSamples > 1 && (React.createElement(Row, { style: selectRowStyle },
                    React.createElement(Col, null,
                        React.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Samples:"),
                        React.createElement(RangeSelector, { id: "sample-selector", largestNumber: numberOfSamples - 1, currentRangeArr: sampleNumbers, setCurrentValue: setSampleNumbers, numValsInRange: samplesPerPage }))))),
            React.createElement(Col, null, numberOfSamples > 1 && (React.createElement(Row, { style: selectRowStyle },
                React.createElement(Col, null,
                    React.createElement("label", { htmlFor: "samples-per-page-selector", style: { marginRight: 15 } }, "Samples per page:"),
                    React.createElement(NumberSelector, { id: "samples-per-page-selector", smallestNumber: 1, largestNumber: numberOfSamples, currentValue: samplesPerPage, setCurrentValue: setSamplesPerPage })))))),
        React.createElement(Row, null,
            React.createElement(Col, null,
                React.createElement(SampleItems, { activationsList: selectedActivations, tokensList: selectedTokens, minValue: minValue, maxValue: maxValue })))));
}
//# sourceMappingURL=TextNeuronActivations.js.map