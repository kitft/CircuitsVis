/// <reference types="react" />
/**
 * Function for converting an array of numbers to a string representing the
 * range.
 * @param {number[]} rangeArr - Array of numbers representing a range.
 * @returns {string} - String representing the range.
 */
export declare function rangeArrToString(rangeArr: number[]): string;
/**
 * Function for converting a string representing of a range to an array of
 * numbers.
 * @param {string} rangeStr - String representing a range.
 * @returns {number[]} - Array of numbers representing the range.
 */
export declare function rangeStringToArr(rangeStr: string): number[];
/**
 * Create an html select with each option being a string representation of a
 * range of numbers that takes the form "start-end", where start is the first
 * number in the range and end is the last number in the range. E.g. if
 * largestNumber=4, smallestNumber=0, and numValsInRange=2, then the ranges array
 * will be ["0-1", "2-3", "4"].
 *
 * @returns Select element.
 */
export declare function RangeSelector({ smallestNumber, largestNumber, currentRangeArr, setCurrentValue, numValsInRange, id }: {
    /** Smallest number included in the range */
    smallestNumber?: number;
    /** Largest number included in the range */
    largestNumber: number;
    /** Current range selected represented as an array of numbers */
    currentRangeArr: number[];
    /** Function for setting the selected range */
    setCurrentValue: (rangeArr: number[]) => void;
    /** The max number of values in each range */
    numValsInRange: number;
    /** The id of the select */
    id: string;
}): JSX.Element;
//# sourceMappingURL=RangeSelector.d.ts.map