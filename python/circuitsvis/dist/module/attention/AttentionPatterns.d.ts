/// <reference types="react" />
import { Tensor4D } from "@tensorflow/tfjs";
/**
 * Color the attention values by heads
 *
 * We want attention values to be colored by each head (i.e. becoming [heads x
 * dest_tokens x src_tokens x rgb_color_channel]). This way, when outputting an
 * image of just one attention head it will be colored (by the specific hue
 * assigned to that attention head) rather than grayscale.
 *
 * Importantly, when outputting an image that averages
 * several attention heads we can then also average over the colors (so that we
 * can see for each destination-source token pair which head is most important).
 * For example, if the specific pair is very red, it suggests that the red
 * attention head is most important for this destination-source token combination.
 *
 * @param attentionInput Attention input as [dest_tokens x source_tokens x
 * heads] array (this is the format provided by the Python interface).
 *
 * @returns Tensor of the shape [heads x dest_tokens x src_tokens x
 * rgb_color_channel]
 */
export declare function colorAttentionTensors(attentionInput: number[][][]): Tensor4D;
/**
 * Attention Patterns
 *
 * @deprecated Use `AttentionHeads` instead.
 */
export declare function AttentionPatterns({ tokens, attention, headLabels }: {
    /** Array of tokens e.g. `["Hello", "my", "name", "is"...]` */
    tokens: string[];
    /** Attention input as [dest_tokens x source_tokens x heads] (JSON stringified) */
    attention: number[][][];
    /** Head labels */
    headLabels?: string[];
}): JSX.Element;
//# sourceMappingURL=AttentionPatterns.d.ts.map