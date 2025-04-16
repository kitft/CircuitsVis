import React from "react";
/**
 * Function for converting an array of numbers to a string representing the
 * range.
 * @param {number[]} rangeArr - Array of numbers representing a range.
 * @returns {string} - String representing the range.
 */
export function rangeArrToString(rangeArr) {
    return rangeArr.length < 3
        ? rangeArr.join("-")
        : `${rangeArr[0]}-${rangeArr[rangeArr.length - 1]}`;
}
/**
 * Function for converting a string representing of a range to an array of
 * numbers.
 * @param {string} rangeStr - String representing a range.
 * @returns {number[]} - Array of numbers representing the range.
 */
export function rangeStringToArr(rangeStr) {
    const rangeArr = rangeStr.split("-");
    if (rangeArr.length === 1) {
        return [parseInt(rangeArr[0], 10)];
    }
    const start = parseInt(rangeArr[0], 10);
    const end = parseInt(rangeArr[rangeArr.length - 1], 10);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
/**
 * Create an html select with each option being a string representation of a
 * range of numbers that takes the form "start-end", where start is the first
 * number in the range and end is the last number in the range. E.g. if
 * largestNumber=4, smallestNumber=0, and numValsInRange=2, then the ranges array
 * will be ["0-1", "2-3", "4"].
 *
 * @returns Select element.
 */
export function RangeSelector({ smallestNumber = 0, largestNumber, currentRangeArr, setCurrentValue, numValsInRange, id }) {
    // Convert the current range to a string.
    const currentRange = rangeArrToString(currentRangeArr);
    // Create an array of ranges to display in the select.
    const ranges = [];
    for (let i = smallestNumber; i <= largestNumber; i += numValsInRange) {
        const start = i;
        const end = Math.min(i + numValsInRange - 1, largestNumber);
        if (start === end) {
            ranges.push(`${start}`);
        }
        else {
            ranges.push(`${start}-${end}`);
        }
    }
    return (React.createElement("select", { value: currentRange, onChange: (event) => setCurrentValue(rangeStringToArr(event.target.value)), id: id }, ranges.map((range) => (React.createElement("option", { key: range }, range)))));
}
//# sourceMappingURL=RangeSelector.js.map