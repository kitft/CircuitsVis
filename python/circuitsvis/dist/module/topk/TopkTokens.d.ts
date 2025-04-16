/// <reference types="react" />
import { AnyColor } from "colord";
/**
 * Create a grid cell containing the token coloured by its activation value.
 *
 * @returns A td element.
 */
export declare function TokenCell({ tdKey, token, value, minValue, maxValue, negativeColor, positiveColor }: {
    /** The td key */
    tdKey: number;
    /** The token to display */
    token: string;
    /** The value to use for the token's background color and tooltip display */
    value: number;
    /** The minimum value for setting the colour scheme */
    minValue: number;
    /** The maximum value for setting the colour scheme */
    maxValue: number;
    /** The color to use for negative values */
    negativeColor?: AnyColor;
    /** The color to use for positive values */
    positiveColor?: AnyColor;
}): JSX.Element;
/**
 * Create a table with the topk and bottomk tokens for each neuron in the selected range.
 *
 * @returns A html table element containing the topk table.
 */
export declare function TopBottomKTable({ topkActivations, bottomkActivations, topkTokens, bottomkTokens, neuronNumbers, filter, colLabel }: {
    /** Topk activations for the selected sample and neuron numbers [ tokens x neurons ] */
    topkActivations: number[][];
    /** Bottomk activations for the selected sample and neuron numbers [ tokens x neurons ] */
    bottomkActivations: number[][];
    /** Topk tokens for the selected sample and neuron numbers [ tokens x neurons ] */
    topkTokens: string[][];
    /** Bottomk tokens for the selected sample and neuron numbers [ tokens x neurons ] */
    bottomkTokens: string[][];
    /** The neuron numbers we wish to display (each will have its own column) */
    neuronNumbers: number[];
    /** Indicates whether to show topk, bottomk or both. */
    filter: string;
    /** The column label to use for the table */
    colLabel: string;
}): JSX.Element;
/**
 * Show the topk and bottomk tokens for each neuron/directions.
 *
 * Includes drop-downs for k, layer and neuron numbers, and the number of
 * columns to show (representing the neurons or directions).
 */
export declare function TopkTokens({ tokens, topkVals, topkIdxs, bottomkVals, bottomkIdxs, firstDimensionName, thirdDimensionName, // Note that we simply use neuron for variable names throughout this file
sampleLabels, firstDimensionLabels }: TopkTokensProps): JSX.Element;
export interface TopkTokensProps {
    /**
     * List of lists of tokens [ samples x tokens ]
     *
     * Each list must be the same length as the number of activations in the
     * corresponding activations list.
     */
    tokens: string[][];
    /**
     * Topk values
     *
     * Nested list of activation values of the form [ samples x layers x k x neurons].
     */
    topkVals: number[][][][];
    /**
     * Topk indices
     *
     * Nested list of token indices of the form [ samples x layers x k x neurons].
     */
    topkIdxs: number[][][][];
    /**
     * Bottomk values
     *
     * Nested list of activation values of the form [ samples x layers x k x neurons].
     */
    bottomkVals: number[][][][];
    /**
     * Bottomk indices
     *
     * Nested list of token indices of the form [ samples x layers x k x neurons].
     */
    bottomkIdxs: number[][][][];
    /**
     * Name of the first dimension (e.g. "Layer")
     *
     */
    firstDimensionName?: string;
    /**
     * Name of the third dimension (e.g. "Neuron"). Cannot have labels for this dimension as we use a range selector for pagination.
     */
    thirdDimensionName?: string;
    /**
     * Labels for the samples (i.e. the zeroth dimension)
     */
    sampleLabels?: string[];
    /**
     * Labels for the first dimension
     */
    firstDimensionLabels?: string[];
}
//# sourceMappingURL=TopkTokens.d.ts.map