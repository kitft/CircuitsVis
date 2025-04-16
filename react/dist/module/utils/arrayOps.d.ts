/**
 * Slices a 2D array.
 *
 * @param arr - The 2D array to slice
 * @param dims - The dimensions to slice, as 2D array of pairs of start and end indices
 * @returns The sliced array
 */
export declare function arraySlice2D(arr: number[][], dims: [number, number][]): number[][];
type NestedArrayOfNumbers = number[] | NestedArrayOfNumbers[];
/**
 * Finds the minimum and maximum values in a nested array of arbitrary depth.
 *
 * @param {any[]} arr - The input array.
 * @returns {[number, number]} A tuple containing the minimum and maximum values in the array.
 *
 * @example
 * minMaxInNestedArray([1, 2, 3, [4, 5, [6, 7]], 8]);
 * // returns [1, 8]
 *
 * @example
 * minMaxInNestedArray([[[[1]]]], 2, 3, [[4]]);
 * // returns [1, 4]
 */
export declare function minMaxInNestedArray(arr: NestedArrayOfNumbers): [number, number];
export {};
//# sourceMappingURL=arrayOps.d.ts.map