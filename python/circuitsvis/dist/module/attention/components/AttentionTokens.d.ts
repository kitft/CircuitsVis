/// <reference types="react" />
import { Tensor3D, Tensor4D } from "@tensorflow/tfjs";
export declare enum TokensView {
    DESTINATION_TO_SOURCE = "DESTINATION_TO_SOURCE",
    SOURCE_TO_DESTINATION = "SOURCE_TO_DESTINATION"
}
/**
 * Get the relevant attention values to average (for an individual token)
 *
 * Used to calculate the color of a specific token block (div).
 *
 * @param maxAttentionAcrossHeads [dest_tokens x src_tokens x rgb]
 * @param tokenIndex Current token index
 * @param tokensView
 * @param focusedToken Selected/focused token
 *
 * @returns Relevant tokens from which to average the color [dest_tokens x src_tokens x rgb]
 */
export declare function getTokensToAverage(maxAttentionAcrossHeads: Tensor3D, tokenIndex: number, tokensView: TokensView, focusedToken?: number): Tensor3D;
/**
 * Individual Token
 */
export declare function Token({ focusedToken, onClickToken, onMouseEnterToken, onMouseLeaveToken, maxAttentionAcrossHeads, text, tokenIndex, tokensView }: {
    focusedToken?: number;
    onClickToken: (e: number) => void;
    onMouseEnterToken: (e: number) => void;
    onMouseLeaveToken: () => void;
    maxAttentionAcrossHeads: Tensor3D;
    text: string;
    tokenIndex: number;
    tokensView: TokensView;
}): JSX.Element;
/**
 * Tokens
 *
 * Each token is shown as block (div) with the token text inside of it. When you
 * click on a token, it updates all the other tokens in this list to show how
 * much those tokens are attended to by this one (or attended from if TokenView
 * is set as Source -> Destination instead). The values are averaged over
 * attention heads unless a specific head is selected.
 */
export declare function Tokens({ coloredAttention, focusedHead, focusedToken, onClickToken, onMouseEnterToken, onMouseLeaveToken, tokens, tokensView }: {
    coloredAttention: Tensor4D;
    focusedHead?: number;
    focusedToken?: number;
    onClickToken: (e: number) => void;
    onMouseEnterToken: (e: number) => void;
    onMouseLeaveToken: () => void;
    tokens: string[];
    tokensView: TokensView;
}): JSX.Element;
//# sourceMappingURL=AttentionTokens.d.ts.map