/// <reference types="react" />
import { AnyColor } from "colord";
export declare function logProbToColor(logProb: number, color?: AnyColor, min?: number): import("colord").Colord;
export declare function SimpleToken({ token }: {
    token: string;
}): JSX.Element;
export declare function TooltipTableRow({ token, logProb, rank, isCorrectToken }: {
    token: string;
    logProb: number;
    rank: number;
    isCorrectToken: boolean;
}): JSX.Element;
export declare function Tooltip({ currentCorrectToken, currentCorrectTokenRank, currentCorrectTokenLogProb, currentTopKLogProbs, currentTopKTokens, prevToken }: {
    currentCorrectToken: string;
    currentCorrectTokenRank: number;
    currentCorrectTokenLogProb: number;
    currentTopKLogProbs: number[];
    currentTopKTokens: string[];
    prevToken: string;
}): JSX.Element;
/**
 * Token log probs visualizer
 *
 * Shows the log probabilities of the top k next tokens for each token in the
 * prompt. Hover over each token to see these.
 */
export declare function TokenLogProbs({ prompt, topKLogProbs, topKTokens, correctTokenRank, correctTokenLogProb }: TokenLogProbsProps): JSX.Element;
export interface TokenLogProbsProps {
    /**
     * Prompt as a list of tokens.
     */
    prompt: string[];
    /**
     * Log probs of the top K next tokens, for each token in the prompt.
     */
    topKLogProbs: number[][];
    /**
     * Top K next tokens, for each token in the prompt.
     */
    topKTokens: string[][];
    /**
     * Rank of the correct next token, for each token in the prompt.
     */
    correctTokenRank: number[];
    /**
     * Log prob of the correct next token, for each token in the prompt.
     */
    correctTokenLogProb: number[];
}
//# sourceMappingURL=TokenLogProbs.d.ts.map