import React, { useMemo } from "react";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart as ChartJS, CategoryScale, Tooltip, LinearScale } from "chart.js";
import { Chart } from "react-chartjs-2";
import { Col, Row } from "react-grid-system";
import { colord } from "colord";
import { getTokenBackgroundColor } from "../utils/getTokenBackgroundColor";
/**
 * Register ChartJS plugins
 */
ChartJS.register(CategoryScale, Tooltip, MatrixElement, MatrixController, LinearScale);
const DefaultUpperTriColor = "rgb(200,200,200)";
/**
 * Attention pattern from destination to source tokens. Displays a heatmap of
 * attention values (hover to see the specific values).
 */
export function AttentionPattern({ attention, maxValue = 1, minValue = -1, negativeColor, positiveColor, upperTriColor = DefaultUpperTriColor, showAxisLabels = true, zoomed = false, maskUpperTri = true, tokens }) {
    // Tokens must be unique (for the categories), so we add an index prefix
    const uniqueTokens = useMemo(() => tokens.map((token, idx) => `${token.replace(/\s/g, "")} (${idx})`), [tokens]);
    // Memoize the chart data
    const chartData = useMemo(() => {
        return attention
            .map((src, destIdx) => src.map((value, srcIdx) => ({
            srcIdx,
            destIdx,
            srcToken: tokens[srcIdx],
            destToken: tokens[destIdx],
            x: uniqueTokens[srcIdx],
            y: uniqueTokens[destIdx],
            v: value
        })))
            .flat();
    }, [attention, tokens, uniqueTokens]);
    // Format the chart data
    const data = {
        datasets: [
            {
                // Data must be given in the form {x: xCategory, y: yCategory, v: value}
                data: chartData,
                // Set the background color for each block, based on the attention value
                backgroundColor(context) {
                    const block = context.dataset.data[context.dataIndex];
                    if (maskUpperTri && block.srcIdx > block.destIdx) {
                        // Color the upper triangular part separately
                        return colord(upperTriColor).toRgbString();
                    }
                    const color = getTokenBackgroundColor(block.v, minValue, maxValue, negativeColor, positiveColor);
                    return color.toRgbString();
                },
                // Block size
                width: (ctx) => ctx.chart.chartArea.width / tokens.length,
                height: (ctx) => ctx.chart.chartArea.height / tokens.length
            }
        ]
    };
    // Chart options
    const options = {
        animation: {
            duration: 0 // general animation time
        },
        plugins: {
            // Tooltip (hover) options
            tooltip: {
                enabled: showAxisLabels,
                yAlign: "bottom",
                callbacks: {
                    title: () => "",
                    label({ raw }) {
                        const block = raw;
                        if (maskUpperTri && block.destIdx < block.srcIdx) {
                            // Just show N/A for the upper triangular part
                            return "N/A";
                        }
                        return [
                            `(${block.destIdx}, ${block.srcIdx})`,
                            `Src: ${block.srcToken}`,
                            `Dest: ${block.destToken} `,
                            `Val: ${block.v}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: "Source Token", padding: 1 },
                type: "category",
                labels: uniqueTokens,
                offset: true,
                ticks: { display: true, minRotation: 45, maxRotation: 90 },
                grid: { display: false },
                display: showAxisLabels
            },
            y: {
                title: { display: true, text: "Destination Token", padding: 1 },
                type: "category",
                offset: true,
                labels: [...uniqueTokens].reverse(),
                ticks: { display: true },
                grid: { display: false },
                display: showAxisLabels
            }
        }
    };
    return (React.createElement(Col, null,
        React.createElement(Row, null,
            React.createElement("div", { style: {
                    // Chart.js charts resizing is weird.
                    // Responsive chart elements (which all are by default) require the
                    // parent element to have position: 'relative' and no sibling elements.
                    // There were previously issues that only occured at particular display
                    // sizes and zoom levels. See:
                    // https://github.com/TransformerLensOrg/CircuitsVis/pull/63
                    // https://www.chartjs.org/docs/latest/configuration/responsive.html#important-note
                    // https://stackoverflow.com/a/48770978/7086623
                    position: "relative",
                    // Set the maximum width of zoomed heads such that a head with just a
                    // few tokens doesn't have crazy large boxes per token and the chart
                    // doesn't overflow the screen. Other heads fill their width.
                    maxWidth: zoomed
                        ? `min(100%, ${Math.round(tokens.length * 8)}em)`
                        : "initial",
                    width: zoomed ? "initial" : "100%",
                    aspectRatio: "1/1"
                } },
                React.createElement(Chart, { type: "matrix", options: options, data: data, width: 1000, height: 1000, updateMode: "none" })))));
}
//# sourceMappingURL=AttentionPattern.js.map