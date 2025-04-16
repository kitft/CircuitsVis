/**
 * Render Helper
 *
 * Renders a CircuitVis visualization to a div element in the DOM. This enables
 * quick importing and use of this library.
 *
 * @example
 * ```html
 * <script
 *   crossorigin
 *   type="module"
 *   src="https://unpkg.com/circuits-vis/dist/cdn/with-react.iife.js">
 *   CircuitsVis.render(
 *     "my-div-id",
 *     CircuitsVis.Hello,
 *     {
 *        name: "Bob"
 *     }
 *   )
 * </script>
 * <div id="my-div-id"/>
 * ```
 *
 * @param divID ID of the div that we're rendering to
 * @param circuitsVisElement Visualization from CircuitsVis (e.g. `CircuitsVis.Hello`)
 * @param props Props for the visualization passed as an object.
 */
export declare function render(divID: string, circuitsVisElement: any, props?: {
    [key: string]: any;
}): void;
//# sourceMappingURL=render-helper.d.ts.map