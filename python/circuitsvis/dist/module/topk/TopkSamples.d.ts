/// <reference types="react" />
/**
 * List of samples in descending order of max token activation value for the
 * selected layer and neuron (or whatever other dimension names are specified).
 */
export declare function TopkSamples({ tokens, activations, zerothDimensionName, firstDimensionName, zerothDimensionLabels, firstDimensionLabels }: TopkSamplesProps): JSX.Element;
export interface TopkSamplesProps {
    /**
     * Nested list of tokens of shape [layers x neurons x samples x tokens]
     *
     * The inner most dimension must be the same size as the inner most dimension of activations.
     *
     * For example, the first and second dimensisons (1-indexed) may correspond to
     * layers and neurons.
     */
    tokens: string[][][][];
    /**
     * Activations for the tokens with shape [layers x neurons x samples x tokens]
     *
     */
    activations: number[][][][];
    /**
     * Name of the zeroth dimension
     */
    zerothDimensionName?: string;
    /**
     * Name of the first dimension
     */
    firstDimensionName?: string;
    /**
     * Labels for the zeroth dimension
     */
    zerothDimensionLabels?: string[];
    /**
     * Labels for the first dimension
     */
    firstDimensionLabels?: string[];
}
//# sourceMappingURL=TopkSamples.d.ts.map