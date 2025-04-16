/// <reference types="react" />
/**
 * Create an html select with each option corresponding to a single number in a
 * range of numbers.
 *
 * @returns Select element.
 */
export declare function NumberSelector({ smallestNumber, largestNumber, currentValue, setCurrentValue, id, labels }: {
    /** Smallest number included in the range */
    smallestNumber?: number;
    /** Largest number included in the range */
    largestNumber: number;
    /** Current value selected */
    currentValue: number;
    /** Function for setting the selected value */
    setCurrentValue: (num: number) => void;
    /** The id of the select */
    id: string;
    /** Labels for each option */
    labels?: string[];
}): JSX.Element;
//# sourceMappingURL=NumberSelector.d.ts.map