import React from "react";
/**
 * Create an html select with each option corresponding to a single number in a
 * range of numbers.
 *
 * @returns Select element.
 */
export function NumberSelector({ smallestNumber = 0, largestNumber, currentValue, setCurrentValue, id, labels }) {
    // Initialize an array of numbers smallestNumber-largestNumber
    const options = [...Array(largestNumber - smallestNumber + 1).keys()].map((i) => i + smallestNumber);
    // If no labels are provided or the length of labels is not equal to the length of options, use the numbers as the labels.
    const resolvedLabels = labels && labels.length === options.length
        ? labels
        : options.map((i) => i.toString());
    return (React.createElement("select", { value: currentValue, onChange: (event) => setCurrentValue(Number(event.target.value)), id: id }, options.map((value, index) => (React.createElement("option", { key: value, value: value }, resolvedLabels[index])))));
}
//# sourceMappingURL=NumberSelector.js.map