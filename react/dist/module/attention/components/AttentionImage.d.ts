import { CSSProperties } from "react";
import { Tensor3D } from "@tensorflow/tfjs";
export interface AttentionImageProps {
    /**
     * Attention patterns (destination to source tokens), colored by attention head
     *
     * Should be [n_tokens x n_tokens x color_channels]
     */
    coloredAttention: Tensor3D;
    style?: CSSProperties;
    /** Adds a box-shadow to the canvas when true */
    isSelected?: boolean;
}
/**
 * Attention Image
 *
 * Shows the attention from destination tokens to source tokens, as a [n_tokens
 * x n_tokens] image.
 */
export declare function AttentionImage({ coloredAttention, style, isSelected }: AttentionImageProps): JSX.Element;
//# sourceMappingURL=AttentionImage.d.ts.map