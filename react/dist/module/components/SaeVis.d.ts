import React from "react";
/**
 * Props for the SaeVis component.
 */
interface SaeVisProps {
    /** Array of token strings */
    tokens: string[];
    /**
     * 2D array of feature activations [token][feature].
     * Assumed to be dense and correspond positionally to `featureLabels` and `featureIDs`.
     */
    featureActivations: number[][];
    /** Array of labels for each feature. */
    featureLabels: string[];
    /**
     * Optional array of actual feature IDs corresponding to the columns in `featureActivations`.
     * If provided, these IDs will be used for display purposes.
     * If omitted, indices 0 to N-1 will be assumed as IDs.
     */
    featureIDs?: number[];
    /** Number of top features to show in the token hover tooltip. @default 5 */
    numTopFeaturesPerToken?: number;
    /** Number of top features to show in the overall ranked list. @default 20 */
    numTopFeaturesOverall?: number;
    /** Initial metric for ranking features ('max', 'l1', 'l0'). @default 'max' */
    initialRankingMetric?: "max" | "l1" | "l0";
    /** Activation threshold for L0 calculation and dimming. @default null */
    activationThreshold?: number | null;
    /** Initial D3 color map scheme string (e.g., 'reds', 'coolwarm'). @default 'reds' */
    colorMap?: string;
    /** Optional midpoint for diverging color maps. @default null */
    colorMidpoint?: number | null;
}
/**
 * SaeVis Component: Visualizes Sparse Autoencoder feature activations across tokens.
 *
 * Features:
 * - Ranks features by Max Activation, L1 Norm, or L0 Norm.
 * - Colors tokens based on selected/hovered feature activations.
 * - Supports single feature coloring, multi-feature segment coloring, or max-activation coloring.
 * - Allows selection of multiple features and tokens for detailed inspection.
 * - Provides tooltips on token hover showing top activating features for that token.
 * - Includes controls for filtering, thresholds, color maps (incl. diverging with midpoint), and compact view.
 * - Supports display of custom feature IDs.
 */
export declare const SaeVis: React.FC<SaeVisProps>;
export default SaeVis;
//# sourceMappingURL=SaeVis.d.ts.map