/// <reference types="react" />
import { Tensor2D } from "@tensorflow/tfjs";
export declare function ValueSelector({ values, labels, selectedValue, setSelectedValue }: {
    values: Tensor2D;
    labels: string[];
    selectedValue: number;
    setSelectedValue: (value: number) => void;
}): JSX.Element;
export declare function NumberInput({ value, setValue, defaultValue, label }: {
    value: number;
    setValue: (value: number) => void;
    defaultValue?: number;
    label: string;
}): JSX.Element;
export declare function Tooltip({ title, labels, values, tokenIndex, currentValueIndex }: {
    title: string;
    labels: string[];
    values: Tensor2D;
    tokenIndex: number;
    currentValueIndex: number;
}): JSX.Element;
/**
 * Extension of ColoredTokens to allow K vectors of values across tokens. Each
 * vector has a positive and negative color associated. For the selected vector,
 * display tokens with a background representing how negative (close to
 * `negativeColor`) or positive (close to `positiveColor`) the token is. Zero is
 * always displayed as white.
 *
 * Hover over a token, to view all K of its values.
 */
export declare function ColoredTokensMulti({ tokens, values, labels, positiveBounds, negativeBounds }: ColoredTokensMultiProps): JSX.Element;
export interface ColoredTokensMultiProps {
    /**
     * The prompt for the model, split into S tokens (as strings)
     */
    tokens: string[];
    /**
     * The tensor of values across the tokens. Shape [S, K]
     */
    values: number[][];
    /**
     * The labels for the K vectors
     */
    labels?: string[];
    /**
     *
     */
    positiveBounds?: number[];
    /**
     */
    negativeBounds?: number[];
}
//# sourceMappingURL=ColoredTokensMulti.d.ts.map