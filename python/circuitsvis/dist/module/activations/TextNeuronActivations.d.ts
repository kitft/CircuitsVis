/// <reference types="react" />
import { Tensor3D } from "@tensorflow/tfjs";
/**
 * Get the selected activations
 *
 * @param activations All activations [ tokens x layers x neurons ]
 * @param layerNumber
 * @param neuronNumber
 */
export declare function getSelectedActivations(activations: Tensor3D, layerNumber: number, neuronNumber: number): number[];
/**
 * Show activations (colored by intensity) for each token.
 *
 * Includes drop-downs for e.g. showing the activations for the selected layer
 * and neuron for the given samples.
 */
export declare function TextNeuronActivations({ tokens, activations, firstDimensionName, secondDimensionName, firstDimensionLabels, secondDimensionLabels }: TextNeuronActivationsProps): JSX.Element;
export interface TextNeuronActivationsProps {
    /**
     * List of lists of tokens (if multiple samples) or a list of tokens (if
     * single sample)
     *
     * If multiple samples, each list must be the same length as the number of activations in the
     * corresponding activations list.
     */
    tokens: string[][] | string[];
    /**
     * Activations
     *
     * If multiple samples, will be a nested list of numbers, of the form [ sample x tokens x layers x neurons
     * ]. If a single sample, will be a list of numbers of the form [ tokens x layers x neurons ].
     */
    activations: number[][][][] | number[][][];
    /**
     * Name of the first dimension
     */
    firstDimensionName?: string;
    /**
     * Name of the second dimension
     */
    secondDimensionName?: string;
    /**
     * Labels for the first dimension
     */
    firstDimensionLabels?: string[];
    /**
     * Labels for the second dimension
     */
    secondDimensionLabels?: string[];
}
//# sourceMappingURL=TextNeuronActivations.d.ts.map