"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AttentionHeads: () => AttentionHeads,
  AttentionPattern: () => AttentionPattern,
  AttentionPatterns: () => AttentionPatterns,
  ColoredTokens: () => ColoredTokens,
  ColoredTokensMulti: () => ColoredTokensMulti,
  Hello: () => Hello,
  SaeVis: () => SaeVis,
  TextNeuronActivations: () => TextNeuronActivations,
  TokenLogProbs: () => TokenLogProbs,
  TopkSamples: () => TopkSamples,
  TopkTokens: () => TopkTokens,
  render: () => render
});
module.exports = __toCommonJS(src_exports);

// src/activations/TextNeuronActivations.tsx
var import_tfjs = require("../../node_modules/@tensorflow/tfjs/dist/tf.node.js");
var import_react6 = __toESM(require("../../node_modules/react/index.js"));
var import_react_grid_system2 = require("../../node_modules/react-grid-system/build/index.js");

// src/shared/SampleItems.tsx
var import_react3 = __toESM(require("../../node_modules/react/index.js"));
var import_react_grid_system = require("../../node_modules/react-grid-system/build/index.js");

// src/tokens/ColoredTokens.tsx
var import_react2 = __toESM(require("../../node_modules/react/index.js"));

// src/tokens/utils/Token.tsx
var import_react = __toESM(require("../../node_modules/react/index.js"));
var import_colord2 = require("../../node_modules/colord/index.mjs");
var import_react_popper_tooltip = require("../../node_modules/react-popper-tooltip/dist/cjs/react-popper-tooltip.js");

// src/utils/getTokenBackgroundColor.ts
var import_colord = require("../../node_modules/colord/index.mjs");
var import_mix = __toESM(require("../../node_modules/colord/plugins/mix.mjs"));
var import_names = __toESM(require("../../node_modules/colord/plugins/names.mjs"));
(0, import_colord.extend)([import_mix.default, import_names.default]);
function getTokenBackgroundColor(value, min, max, negativeColor = "red", positiveColor = "blue") {
  if (value >= 0) {
    return (0, import_colord.colord)(positiveColor).mix(
      (0, import_colord.colord)("white"),
      Math.min(Math.max(1 - value / max, 0), 1)
    );
  }
  return (0, import_colord.colord)(negativeColor).mix(
    (0, import_colord.colord)("white"),
    Math.min(Math.max(1 - -value / -min, 0), 1)
  );
}

// src/tokens/utils/Token.tsx
function formatTokenText(token) {
  const tokenReplaceSpaces = token.replace(/\s/g, "&nbsp;");
  const tokenReplaceLineBreaks = tokenReplaceSpaces.replace(/\n/g, "\xB6");
  return tokenReplaceLineBreaks;
}
function Token({
  token,
  value,
  min,
  max,
  negativeColor,
  positiveColor
}) {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = (0, import_react_popper_tooltip.usePopperTooltip)({
    followCursor: true
  });
  const backgroundColor = getTokenBackgroundColor(
    value,
    min,
    max,
    negativeColor,
    positiveColor
  ).toRgbString();
  const textColor = (0, import_colord2.colord)(backgroundColor).brightness() < 0.6 ? "white" : "black";
  const spanStyle = {
    display: "inline-block",
    backgroundColor,
    color: textColor,
    lineHeight: "1em",
    padding: "3px 0",
    marginLeft: -1,
    marginBottom: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee"
  };
  const tokenReplaceLineBreaks = formatTokenText(token);
  const lineBreakElements = token.match(/\n/g);
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("span", { ref: setTriggerRef }, /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      style: spanStyle,
      dangerouslySetInnerHTML: { __html: tokenReplaceLineBreaks }
    }
  ), lineBreakElements == null ? void 0 : lineBreakElements.map((_break, idx) => /* @__PURE__ */ import_react.default.createElement("br", { key: idx }))), visible && /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      ref: setTooltipRef,
      ...getTooltipProps({
        style: {
          background: "#333",
          color: "white",
          textAlign: "center",
          padding: 10,
          borderRadius: 5,
          boxShadow: "5px 5px rgba(0, 0, 0, 0.03)",
          marginTop: 15,
          zIndex: 1
        }
      })
    },
    /* @__PURE__ */ import_react.default.createElement("strong", null, token),
    /* @__PURE__ */ import_react.default.createElement("br", null),
    value
  ));
}

// src/tokens/ColoredTokens.tsx
function ColoredTokens({
  maxValue,
  minValue,
  negativeColor,
  positiveColor,
  tokens,
  values,
  paddingBottom
}) {
  const tokenMin = minValue != null ? minValue : Math.min(...values);
  const tokenMax = maxValue != null ? maxValue : Math.max(...values);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "colored-tokens", style: { paddingBottom } }, tokens.map((token, key) => /* @__PURE__ */ import_react2.default.createElement(
    Token,
    {
      key,
      token,
      value: values[key],
      min: tokenMin,
      max: tokenMax,
      negativeColor,
      positiveColor
    }
  )));
}

// src/shared/SampleItems.tsx
function SampleItems({
  activationsList,
  tokensList,
  minValue,
  maxValue
}) {
  const boxedSampleStyle = {
    border: "1px solid black",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#f5f5f5"
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", null, activationsList && tokensList && activationsList.length > 1 && activationsList.map((activations, index) => /* @__PURE__ */ import_react3.default.createElement(import_react_grid_system.Row, { key: index }, /* @__PURE__ */ import_react3.default.createElement(import_react_grid_system.Col, { style: boxedSampleStyle }, /* @__PURE__ */ import_react3.default.createElement(
    ColoredTokens,
    {
      minValue,
      maxValue,
      tokens: tokensList[index],
      values: activations,
      paddingBottom: 0
    }
  )))), activationsList && tokensList && activationsList.length === 1 && /* @__PURE__ */ import_react3.default.createElement(import_react_grid_system.Row, { key: 0 }, /* @__PURE__ */ import_react3.default.createElement(import_react_grid_system.Col, null, /* @__PURE__ */ import_react3.default.createElement(ColoredTokens, { tokens: tokensList[0], values: activationsList[0] }))));
}

// src/shared/RangeSelector.tsx
var import_react4 = __toESM(require("../../node_modules/react/index.js"));
function rangeArrToString(rangeArr) {
  return rangeArr.length < 3 ? rangeArr.join("-") : `${rangeArr[0]}-${rangeArr[rangeArr.length - 1]}`;
}
function rangeStringToArr(rangeStr) {
  const rangeArr = rangeStr.split("-");
  if (rangeArr.length === 1) {
    return [parseInt(rangeArr[0], 10)];
  }
  const start = parseInt(rangeArr[0], 10);
  const end = parseInt(rangeArr[rangeArr.length - 1], 10);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
function RangeSelector({
  smallestNumber = 0,
  largestNumber,
  currentRangeArr,
  setCurrentValue,
  numValsInRange,
  id
}) {
  const currentRange = rangeArrToString(currentRangeArr);
  const ranges = [];
  for (let i = smallestNumber; i <= largestNumber; i += numValsInRange) {
    const start = i;
    const end = Math.min(i + numValsInRange - 1, largestNumber);
    if (start === end) {
      ranges.push(`${start}`);
    } else {
      ranges.push(`${start}-${end}`);
    }
  }
  return /* @__PURE__ */ import_react4.default.createElement(
    "select",
    {
      value: currentRange,
      onChange: (event) => setCurrentValue(rangeStringToArr(event.target.value)),
      id
    },
    ranges.map((range) => /* @__PURE__ */ import_react4.default.createElement("option", { key: range }, range))
  );
}

// src/shared/NumberSelector.tsx
var import_react5 = __toESM(require("../../node_modules/react/index.js"));
function NumberSelector({
  smallestNumber = 0,
  largestNumber,
  currentValue,
  setCurrentValue,
  id,
  labels
}) {
  const options = [...Array(largestNumber - smallestNumber + 1).keys()].map(
    (i) => i + smallestNumber
  );
  const resolvedLabels = labels && labels.length === options.length ? labels : options.map((i) => i.toString());
  return /* @__PURE__ */ import_react5.default.createElement(
    "select",
    {
      value: currentValue,
      onChange: (event) => setCurrentValue(Number(event.target.value)),
      id
    },
    options.map((value, index) => /* @__PURE__ */ import_react5.default.createElement("option", { key: value, value }, resolvedLabels[index]))
  );
}

// src/utils/arrayOps.ts
function arraySlice2D(arr, dims) {
  return arr.slice(dims[0][0], dims[0][1]).map((row) => row.slice(dims[1][0], dims[1][1]));
}
function minMaxInNestedArray(arr) {
  if (arr.length === 0) {
    return [0, 1];
  }
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  for (let i = 0; i < arr.length; i += 1) {
    if (Array.isArray(arr[i])) {
      const [subMin, subMax] = minMaxInNestedArray(
        arr[i]
      );
      min = Math.min(min, subMin);
      max = Math.max(max, subMax);
    } else {
      min = Math.min(min, arr[i]);
      max = Math.max(max, arr[i]);
    }
  }
  return [min, max];
}

// src/activations/TextNeuronActivations.tsx
function getSelectedActivations(activations, layerNumber, neuronNumber) {
  const relevantActivations = activations.slice([0, layerNumber, neuronNumber], [-1, 1, 1]).squeeze([1, 2]);
  return relevantActivations.arraySync();
}
function TextNeuronActivations({
  tokens,
  activations,
  firstDimensionName = "Layer",
  secondDimensionName = "Neuron",
  firstDimensionLabels,
  secondDimensionLabels
}) {
  const tokensList = typeof tokens[0] === "string" ? [tokens] : tokens;
  const activationsList = typeof activations[0][0][0] === "number" ? [activations] : activations;
  const [minValue, maxValue] = minMaxInNestedArray(activationsList);
  const activationsTensors = activationsList.map((sampleActivations) => {
    return (0, import_tfjs.tensor)(sampleActivations);
  });
  const numberOfLayers = activationsTensors[0].shape[1];
  const numberOfNeurons = activationsTensors[0].shape[2];
  const numberOfSamples = activationsTensors.length;
  const [samplesPerPage, setSamplesPerPage] = (0, import_react6.useState)(
    Math.min(5, numberOfSamples)
  );
  const [sampleNumbers, setSampleNumbers] = (0, import_react6.useState)([
    ...Array(samplesPerPage).keys()
  ]);
  const [layerNumber, setLayerNumber] = (0, import_react6.useState)(0);
  const [neuronNumber, setNeuronNumber] = (0, import_react6.useState)(0);
  (0, import_react6.useEffect)(() => {
    setSampleNumbers([...Array(samplesPerPage).keys()]);
  }, [samplesPerPage]);
  const selectedActivations = sampleNumbers.map((sampleNumber) => {
    return getSelectedActivations(
      activationsTensors[sampleNumber],
      layerNumber,
      neuronNumber
    );
  });
  const selectedTokens = sampleNumbers.map((sampleNumber) => {
    return tokensList[sampleNumber];
  });
  const selectRowStyle = {
    paddingTop: 5,
    paddingBottom: 5
  };
  return /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Container, { fluid: true }, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, null, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement("label", { htmlFor: "layer-selector", style: { marginRight: 15 } }, firstDimensionName, ":"), /* @__PURE__ */ import_react6.default.createElement(
    NumberSelector,
    {
      id: "layer-selector",
      largestNumber: numberOfLayers - 1,
      currentValue: layerNumber,
      setCurrentValue: setLayerNumber,
      labels: firstDimensionLabels
    }
  ))), /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } }, secondDimensionName, ":"), /* @__PURE__ */ import_react6.default.createElement(
    NumberSelector,
    {
      id: "neuron-selector",
      largestNumber: numberOfNeurons - 1,
      currentValue: neuronNumber,
      setCurrentValue: setNeuronNumber,
      labels: secondDimensionLabels
    }
  ))), numberOfSamples > 1 && /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Samples:"), /* @__PURE__ */ import_react6.default.createElement(
    RangeSelector,
    {
      id: "sample-selector",
      largestNumber: numberOfSamples - 1,
      currentRangeArr: sampleNumbers,
      setCurrentValue: setSampleNumbers,
      numValsInRange: samplesPerPage
    }
  )))), /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, numberOfSamples > 1 && /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement(
    "label",
    {
      htmlFor: "samples-per-page-selector",
      style: { marginRight: 15 }
    },
    "Samples per page:"
  ), /* @__PURE__ */ import_react6.default.createElement(
    NumberSelector,
    {
      id: "samples-per-page-selector",
      smallestNumber: 1,
      largestNumber: numberOfSamples,
      currentValue: samplesPerPage,
      setCurrentValue: setSamplesPerPage
    }
  ))))), /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Row, null, /* @__PURE__ */ import_react6.default.createElement(import_react_grid_system2.Col, null, /* @__PURE__ */ import_react6.default.createElement(
    SampleItems,
    {
      activationsList: selectedActivations,
      tokensList: selectedTokens,
      minValue,
      maxValue
    }
  ))));
}

// src/attention/AttentionHeads.tsx
var import_react9 = __toESM(require("../../node_modules/react/index.js"));
var import_react_grid_system4 = require("../../node_modules/react-grid-system/build/index.js");

// src/attention/AttentionPattern.tsx
var import_react7 = __toESM(require("../../node_modules/react/index.js"));
var import_chartjs_chart_matrix = require("../../node_modules/chartjs-chart-matrix/dist/chartjs-chart-matrix.js");
var import_chart = require("../../node_modules/chart.js/dist/chart.js");
var import_react_chartjs_2 = require("../../node_modules/react-chartjs-2/dist/index.js");
var import_react_grid_system3 = require("../../node_modules/react-grid-system/build/index.js");
var import_colord3 = require("../../node_modules/colord/index.mjs");
import_chart.Chart.register(
  import_chart.CategoryScale,
  import_chart.Tooltip,
  import_chartjs_chart_matrix.MatrixElement,
  import_chartjs_chart_matrix.MatrixController,
  import_chart.LinearScale
);
var DefaultUpperTriColor = "rgb(200,200,200)";
function AttentionPattern({
  attention,
  maxValue = 1,
  minValue = -1,
  negativeColor,
  positiveColor,
  upperTriColor = DefaultUpperTriColor,
  showAxisLabels = true,
  zoomed = false,
  maskUpperTri = true,
  tokens
}) {
  const uniqueTokens = (0, import_react7.useMemo)(
    () => tokens.map((token, idx) => `${token.replace(/\s/g, "")} (${idx})`),
    [tokens]
  );
  const chartData = (0, import_react7.useMemo)(() => {
    return attention.map(
      (src, destIdx) => src.map((value, srcIdx) => ({
        srcIdx,
        destIdx,
        srcToken: tokens[srcIdx],
        destToken: tokens[destIdx],
        x: uniqueTokens[srcIdx],
        y: uniqueTokens[destIdx],
        v: value
      }))
    ).flat();
  }, [attention, tokens, uniqueTokens]);
  const data = {
    datasets: [
      {
        data: chartData,
        backgroundColor(context) {
          const block = context.dataset.data[context.dataIndex];
          if (maskUpperTri && block.srcIdx > block.destIdx) {
            return (0, import_colord3.colord)(upperTriColor).toRgbString();
          }
          const color = getTokenBackgroundColor(
            block.v,
            minValue,
            maxValue,
            negativeColor,
            positiveColor
          );
          return color.toRgbString();
        },
        width: (ctx) => ctx.chart.chartArea.width / tokens.length,
        height: (ctx) => ctx.chart.chartArea.height / tokens.length
      }
    ]
  };
  const options = {
    animation: {
      duration: 0
    },
    plugins: {
      tooltip: {
        enabled: showAxisLabels,
        yAlign: "bottom",
        callbacks: {
          title: () => "",
          label({ raw }) {
            const block = raw;
            if (maskUpperTri && block.destIdx < block.srcIdx) {
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
  return /* @__PURE__ */ import_react7.default.createElement(import_react_grid_system3.Col, null, /* @__PURE__ */ import_react7.default.createElement(import_react_grid_system3.Row, null, /* @__PURE__ */ import_react7.default.createElement(
    "div",
    {
      style: {
        position: "relative",
        maxWidth: zoomed ? `min(100%, ${Math.round(tokens.length * 8)}em)` : "initial",
        width: zoomed ? "initial" : "100%",
        aspectRatio: "1/1"
      }
    },
    /* @__PURE__ */ import_react7.default.createElement(
      import_react_chartjs_2.Chart,
      {
        type: "matrix",
        options,
        data,
        width: 1e3,
        height: 1e3,
        updateMode: "none"
      }
    )
  )));
}

// src/attention/components/useHoverLock.tsx
var import_react8 = require("../../node_modules/react/index.js");
function useHoverLock(default_locked = null) {
  const [hoveredElement, setHoveredElement] = (0, import_react8.useState)(null);
  const [lockedElement, setLockedElement] = (0, import_react8.useState)(
    default_locked
  );
  function onClick(element) {
    setLockedElement(element);
  }
  function onMouseEnter(element) {
    setHoveredElement(element);
  }
  function onMouseLeave() {
    setHoveredElement(null);
  }
  const focused = hoveredElement != null ? hoveredElement : lockedElement;
  return {
    focused,
    onClick,
    onMouseEnter,
    onMouseLeave
  };
}

// src/attention/AttentionHeads.tsx
function attentionHeadColor(idx, numberOfHeads, alpha = "100%") {
  const hue = Math.round(idx / numberOfHeads * 360);
  return `hsla(${hue}, 70%, 50%,  ${alpha})`;
}
function AttentionHeadsSelector({
  attention,
  attentionHeadNames,
  focused,
  maxValue,
  minValue,
  negativeColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
  positiveColor,
  maskUpperTri,
  tokens
}) {
  return /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Row, { style: { marginBottom: 15 } }, attention.map((headAttention, idx) => {
    const isFocused = focused === idx;
    return /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Col, { lg: 1, md: 2, xs: 3, style: { margin: 0, padding: 0 }, key: idx }, /* @__PURE__ */ import_react9.default.createElement(
      "div",
      {
        style: { padding: 3 },
        onClick: () => onClick(idx),
        onMouseEnter: () => onMouseEnter(idx),
        onMouseLeave
      },
      /* @__PURE__ */ import_react9.default.createElement(
        "div",
        {
          style: {
            position: "relative",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: attentionHeadColor(idx, attention.length),
            boxShadow: isFocused ? `0px 0px 4px 3px ${attentionHeadColor(
              idx,
              attention.length,
              "60%"
            )}` : void 0
          }
        },
        /* @__PURE__ */ import_react9.default.createElement(
          "h4",
          {
            style: {
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 100,
              margin: 0,
              padding: 1,
              background: attentionHeadColor(idx, attention.length),
              color: "white"
            }
          },
          attentionHeadNames[idx]
        ),
        /* @__PURE__ */ import_react9.default.createElement(
          AttentionPattern,
          {
            attention: headAttention,
            tokens,
            showAxisLabels: false,
            maxValue,
            minValue,
            negativeColor,
            positiveColor,
            maskUpperTri
          }
        )
      )
    ));
  }));
}
function AttentionHeads({
  attention,
  attentionHeadNames,
  maxValue,
  minValue,
  negativeColor,
  positiveColor,
  maskUpperTri = true,
  tokens
}) {
  const { focused, onClick, onMouseEnter, onMouseLeave } = useHoverLock(0);
  const headNames = attentionHeadNames || attention.map((_, idx) => `Head ${idx}`);
  return /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Container, null, /* @__PURE__ */ import_react9.default.createElement("h3", { style: { marginBottom: 15 } }, "Head Selector (hover to view, click to lock)"), /* @__PURE__ */ import_react9.default.createElement(
    AttentionHeadsSelector,
    {
      attention,
      attentionHeadNames: headNames,
      focused,
      maxValue,
      minValue,
      negativeColor,
      onClick,
      onMouseEnter,
      onMouseLeave,
      positiveColor,
      maskUpperTri,
      tokens
    }
  ), /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Row, null, /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Col, { xs: 12 }, /* @__PURE__ */ import_react9.default.createElement("h3", { style: { marginBottom: 10 } }, headNames[focused], " Zoomed"), /* @__PURE__ */ import_react9.default.createElement("div", null, /* @__PURE__ */ import_react9.default.createElement(
    "h2",
    {
      style: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 1e3,
        margin: 6,
        padding: "5px 10px",
        background: attentionHeadColor(focused, attention.length),
        color: "white"
      }
    },
    headNames[focused]
  ), /* @__PURE__ */ import_react9.default.createElement(
    AttentionPattern,
    {
      attention: attention[focused],
      maxValue,
      minValue,
      negativeColor,
      positiveColor,
      zoomed: true,
      maskUpperTri,
      tokens
    }
  )))), /* @__PURE__ */ import_react9.default.createElement(import_react_grid_system4.Row, null));
}

// src/attention/AttentionPatterns.tsx
var import_react12 = __toESM(require("../../node_modules/react/index.js"));
var import_tfjs4 = require("../../node_modules/@tensorflow/tfjs/dist/tf.node.js");
var import_tinycolor22 = __toESM(require("../../node_modules/tinycolor2/tinycolor.js"));

// src/attention/components/AttentionImage.tsx
var import_react10 = __toESM(require("../../node_modules/react/index.js"));
var import_tfjs2 = require("../../node_modules/@tensorflow/tfjs/dist/tf.node.js");
function AttentionImage({
  coloredAttention,
  style = {},
  isSelected = false
}) {
  const canvasRef = (0, import_react10.useRef)(null);
  (0, import_react10.useEffect)(() => {
    const canvas = canvasRef.current;
    import_tfjs2.browser.toPixels(coloredAttention.toInt(), canvas);
  }, [coloredAttention]);
  return /* @__PURE__ */ import_react10.default.createElement(
    "canvas",
    {
      ref: canvasRef,
      style: {
        imageRendering: "pixelated",
        borderColor: isSelected ? "rgba(0,0,200,0.5)" : "#DDD",
        borderStyle: "solid",
        borderWidth: 1,
        boxShadow: isSelected ? "0px 0px 3px 3px rgba(0,0,200,0.4)" : void 0,
        width: 200,
        ...style
      }
    }
  );
}

// src/attention/components/AttentionTokens.tsx
var import_tfjs3 = require("../../node_modules/@tensorflow/tfjs/dist/tf.node.js");
var import_tinycolor2 = __toESM(require("../../node_modules/tinycolor2/tinycolor.js"));
var import_react11 = __toESM(require("../../node_modules/react/index.js"));
function getTokensToAverage(maxAttentionAcrossHeads, tokenIndex, tokensView, focusedToken) {
  let destinationStart = tokenIndex;
  let destinationEnd = tokenIndex;
  let sourceStart = 0;
  let sourceEnd = tokenIndex;
  if (typeof focusedToken === "number" && tokensView === "DESTINATION_TO_SOURCE" /* DESTINATION_TO_SOURCE */) {
    destinationStart = focusedToken;
    destinationEnd = focusedToken;
    sourceStart = tokenIndex;
    sourceEnd = tokenIndex;
  } else if (typeof focusedToken === "number" && tokensView === "SOURCE_TO_DESTINATION" /* SOURCE_TO_DESTINATION */) {
    destinationStart = tokenIndex;
    destinationEnd = tokenIndex;
    sourceStart = focusedToken;
    sourceEnd = focusedToken;
  }
  return maxAttentionAcrossHeads.slice(
    [destinationStart, sourceStart],
    [destinationEnd + 1 - destinationStart, sourceEnd + 1 - sourceStart]
  );
}
function Token2({
  focusedToken,
  onClickToken,
  onMouseEnterToken,
  onMouseLeaveToken,
  maxAttentionAcrossHeads,
  text,
  tokenIndex,
  tokensView
}) {
  const isFocused = focusedToken !== null && focusedToken === tokenIndex;
  const relevantTokens = getTokensToAverage(
    maxAttentionAcrossHeads,
    tokenIndex,
    tokensView,
    focusedToken
  );
  const averageColor = relevantTokens.mean(0).mean(0);
  const [r, g, b] = averageColor.arraySync();
  const backgroundColor = (0, import_tinycolor2.default)({ r, g, b });
  const textColor = backgroundColor.getBrightness() < 180 ? "white" : "black";
  return /* @__PURE__ */ import_react11.default.createElement(
    "button",
    {
      style: {
        backgroundColor: backgroundColor.toRgbString(),
        borderColor: "#DDD",
        borderStyle: "solid",
        borderWidth: 0,
        borderRightWidth: 1,
        color: textColor,
        display: "inline-block",
        marginBottom: 3,
        padding: "3px 0px",
        boxShadow: isFocused ? "0px 0px 3px 3px rgba(0,0,200,0.4)" : void 0
      },
      onClick: () => onClickToken(tokenIndex),
      onMouseEnter: () => onMouseEnterToken(tokenIndex),
      onMouseLeave: onMouseLeaveToken,
      dangerouslySetInnerHTML: { __html: text.replace(" ", "&nbsp;") }
    }
  );
}
function Tokens({
  coloredAttention,
  focusedHead,
  focusedToken,
  onClickToken,
  onMouseEnterToken,
  onMouseLeaveToken,
  tokens,
  tokensView
}) {
  const focusedAttention = typeof focusedHead === "number" ? coloredAttention.slice([focusedHead], [1]) : coloredAttention;
  const maxAttentionAcrossHeads = (0, import_tfjs3.einsum)(
    "hdsc -> dsch",
    focusedAttention
  ).min(3);
  return /* @__PURE__ */ import_react11.default.createElement("div", null, tokens.map((text, tokenIndex) => /* @__PURE__ */ import_react11.default.createElement(
    Token2,
    {
      focusedToken,
      onClickToken,
      onMouseEnterToken,
      onMouseLeaveToken,
      key: tokenIndex,
      maxAttentionAcrossHeads,
      text,
      tokenIndex,
      tokensView
    }
  )));
}

// src/attention/AttentionPatterns.tsx
function colorAttentionTensors(attentionInput) {
  const attentionTensor = (0, import_tfjs4.tensor)(attentionInput);
  const attention = attentionTensor.arraySync();
  const colored = attention.map(
    (head, headNumber) => head.map(
      (destination) => destination.map((sourceAttention) => {
        const attentionColor = (0, import_tinycolor22.default)({
          h: headNumber / attention.length * 360,
          s: 0.8,
          l: 1 - 0.75 * sourceAttention
        });
        const { r, g, b } = attentionColor.toRgb();
        return [r, g, b];
      })
    )
  );
  return (0, import_tfjs4.tensor)(colored);
}
function AttentionPatterns({
  tokens,
  attention,
  headLabels
}) {
  const [tokensView, setTokensView] = (0, import_react12.useState)(
    "DESTINATION_TO_SOURCE" /* DESTINATION_TO_SOURCE */
  );
  const {
    focused: focusedHead,
    onClick: onClickHead,
    onMouseEnter: onMouseEnterHead,
    onMouseLeave: onMouseLeaveHead
  } = useHoverLock();
  const {
    focused: focussedToken,
    onClick: onClickToken,
    onMouseEnter: onMouseEnterToken,
    onMouseLeave: onMouseLeaveToken
  } = useHoverLock();
  const coloredAttention = (0, import_react12.useMemo)(
    () => colorAttentionTensors(attention),
    [attention]
  );
  const heads = coloredAttention.unstack(0);
  const maxAttentionAcrossHeads = (0, import_tfjs4.einsum)("hdsc -> dsch", coloredAttention).min(
    3
  );
  const focusedAttention = focusedHead === null ? maxAttentionAcrossHeads : heads[focusedHead];
  return /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("div", { style: { display: "flex" } }, /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("h4", null, "Attention Patterns"), /* @__PURE__ */ import_react12.default.createElement(AttentionImage, { coloredAttention: focusedAttention })), /* @__PURE__ */ import_react12.default.createElement("div", { style: { marginLeft: 15 } }, /* @__PURE__ */ import_react12.default.createElement("h4", null, "Head selector", /* @__PURE__ */ import_react12.default.createElement("span", { style: { fontWeight: "normal" } }, " ", "(hover to focus, click to lock)")), /* @__PURE__ */ import_react12.default.createElement("div", { style: { display: "flex", flexWrap: "wrap" } }, heads.map((head, headNumber) => {
    var _a;
    return /* @__PURE__ */ import_react12.default.createElement(
      "figure",
      {
        key: headNumber,
        style: {
          margin: 0,
          marginRight: 15
        },
        onClick: () => onClickHead(headNumber),
        onMouseEnter: () => onMouseEnterHead(headNumber),
        onMouseLeave: onMouseLeaveHead
      },
      /* @__PURE__ */ import_react12.default.createElement(
        AttentionImage,
        {
          coloredAttention: head,
          style: { width: 80 },
          isSelected: headNumber === focusedHead
        }
      ),
      /* @__PURE__ */ import_react12.default.createElement("figcaption", null, (_a = headLabels == null ? void 0 : headLabels[headNumber]) != null ? _a : `Head ${headNumber}`)
    );
  })))), /* @__PURE__ */ import_react12.default.createElement("div", { className: "tokens" }, /* @__PURE__ */ import_react12.default.createElement("h4", { style: { display: "inline-block", marginRight: 15 } }, "Tokens", /* @__PURE__ */ import_react12.default.createElement("span", { style: { fontWeight: "normal" } }, " (click to focus)")), /* @__PURE__ */ import_react12.default.createElement(
    "select",
    {
      value: tokensView,
      onChange: (e) => setTokensView(e.target.value)
    },
    /* @__PURE__ */ import_react12.default.createElement("option", { value: "DESTINATION_TO_SOURCE" /* DESTINATION_TO_SOURCE */ }, "Source \u2190 Destination"),
    /* @__PURE__ */ import_react12.default.createElement("option", { value: "SOURCE_TO_DESTINATION" /* SOURCE_TO_DESTINATION */ }, "Destination \u2190 Source")
  ), /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement(
    Tokens,
    {
      coloredAttention,
      focusedHead,
      focusedToken: focussedToken,
      onClickToken,
      onMouseEnterToken,
      onMouseLeaveToken,
      tokens,
      tokensView
    }
  ))));
}

// src/components/SaeVis.tsx
var import_d3_scale = require("../../node_modules/d3-scale/src/index.js");
var chromatic = __toESM(require("../../node_modules/d3-scale-chromatic/src/index.js"));
var import_react13 = __toESM(require("../../node_modules/react/index.js"));
function getLuminance(hexColorInput) {
  if (!hexColorInput || hexColorInput.length < 4)
    return 1;
  let hexColor = hexColorInput;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexColor = hexColor.replace(shorthandRegex, (m, r2, g2, b2) => {
    return r2 + r2 + g2 + g2 + b2 + b2;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!result)
    return 1;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
var claudeOrangeInterpolator = (0, import_d3_scale.scaleLinear)().domain([0, 0.5, 1]).range(["#ffffff", "#ff9966", "#ff6633"]).clamp(true);
function createColorScale(interpolator, domain, options = {}) {
  const {
    minClamp = 0,
    maxClamp = 0.7,
    isDiverging = false,
    shouldApplyRangeClamp = true
  } = options;
  if (!isDiverging && shouldApplyRangeClamp) {
    const adjustedInterpolator = (t) => interpolator(t * (maxClamp - minClamp) + minClamp);
    return (0, import_d3_scale.scaleSequential)(adjustedInterpolator).domain(domain).clamp(true);
  }
  if (isDiverging) {
    return (0, import_d3_scale.scaleSequential)(interpolator).domain(domain).clamp(true);
  }
  return (0, import_d3_scale.scaleSequential)(interpolator).domain(domain).clamp(true);
}
function clampInterpolator(interpolator, minClamp = 0, maxClamp = 0.7) {
  return (t) => interpolator(t * (maxClamp - minClamp) + minClamp);
}
var d3ColorMapLookup = {
  claudeOranges: claudeOrangeInterpolator,
  viridis: chromatic.interpolateViridis,
  plasma: chromatic.interpolatePlasma,
  inferno: clampInterpolator(chromatic.interpolateInferno),
  magma: clampInterpolator(chromatic.interpolateMagma),
  cividis: chromatic.interpolateCividis,
  gray: clampInterpolator(chromatic.interpolateGreys, 0.1, 0.9),
  coolwarm: chromatic.interpolateWarm,
  rdylbu: chromatic.interpolateRdYlBu,
  piyg: chromatic.interpolatePiYG,
  prgn: chromatic.interpolatePRGn,
  spectral: chromatic.interpolateSpectral,
  blues: chromatic.interpolateBlues,
  greens: chromatic.interpolateGreens,
  reds: chromatic.interpolateReds,
  oranges: chromatic.interpolateOranges,
  purples: chromatic.interpolatePurples
};
var divergingColorMapKeys = [
  "coolwarm",
  "rdylbu",
  "piyg",
  "prgn",
  "spectral"
];
function calculateFeatureScores(activations, labels, featureIDs, threshold = null) {
  var _a, _b, _c, _d;
  if (!activations.length || !((_a = activations[0]) == null ? void 0 : _a.length))
    return [];
  const numTokens = activations.length;
  const numFeatures = activations[0].length;
  const features = [];
  const effectiveThreshold = threshold != null ? threshold : 0;
  for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
    let maxAct = -Infinity;
    let sumAbsAct = 0;
    let nonZero = 0;
    for (let tokIdx = 0; tokIdx < numTokens; tokIdx++) {
      const act = (_c = (_b = activations[tokIdx]) == null ? void 0 : _b[featIdx]) != null ? _c : 0;
      if (act > maxAct)
        maxAct = act;
      sumAbsAct += Math.abs(act);
      if (Math.abs(act) > effectiveThreshold) {
        nonZero += 1;
      }
    }
    features.push({
      index: featureIDs ? featureIDs[featIdx] : featIdx,
      label: (_d = labels[featIdx]) != null ? _d : `Feature ${featIdx}`,
      score: 0,
      maxActivation: maxAct,
      meanAbsActivation: sumAbsAct / numTokens,
      nonZeroCount: nonZero
    });
  }
  return features;
}
function rankFeatures(features, metric) {
  return [...features].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    switch (metric) {
      case "l1":
        scoreA = a.meanAbsActivation;
        scoreB = b.meanAbsActivation;
        break;
      case "l0":
        scoreA = a.nonZeroCount;
        scoreB = b.nonZeroCount;
        break;
      case "max":
      default:
        scoreA = a.maxActivation;
        scoreB = b.maxActivation;
        break;
    }
    return scoreB - scoreA;
  });
}
function getTopFeaturesForToken(tokenIndex, activations, labels, featureIDs, count, threshold) {
  var _a, _b, _c, _d;
  if (!activations[tokenIndex])
    return [];
  const numFeatures = (_b = (_a = activations[0]) == null ? void 0 : _a.length) != null ? _b : 0;
  const featuresForToken = [];
  for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
    const act = (_c = activations[tokenIndex][featIdx]) != null ? _c : 0;
    if (threshold === null || Math.abs(act) >= threshold) {
      featuresForToken.push({
        index: featureIDs ? featureIDs[featIdx] : featIdx,
        label: (_d = labels[featIdx]) != null ? _d : `Feature ${featIdx}`,
        activation: act
      });
    }
  }
  return featuresForToken.sort((a, b) => Math.abs(b.activation) - Math.abs(a.activation)).slice(0, count);
}
var themes = {
  light: {
    bg: "#ffffff",
    text: "#000000",
    border: "#ccc",
    containerBg: "#f9f9f9",
    selectedItemBg: "#e0e8ff",
    selectedItemBorder: "#4a90e2",
    hoverOutline: "#cccccc",
    subtleBorder: "#eee",
    dimText: "#555",
    closeButton: "#aaa",
    boxHoverBg: "#f0f0f0"
  },
  dark: {
    bg: "#1e1e1e",
    text: "#e0e0e0",
    border: "#555",
    containerBg: "#2a2a2a",
    selectedItemBg: "#3a4a7e",
    selectedItemBorder: "#6a90e2",
    hoverOutline: "#777777",
    subtleBorder: "#444",
    dimText: "#aaa",
    closeButton: "#ccc",
    boxHoverBg: "#333333"
  },
  "claude-brown": {
    bg: "hsl(30, 40%, 96%)",
    text: "hsl(30, 30%, 20%)",
    border: "hsl(30, 20%, 70%)",
    containerBg: "hsl(30, 30%, 90%)",
    selectedItemBg: "hsl(30, 50%, 80%)",
    selectedItemBorder: "hsl(30, 70%, 50%)",
    hoverOutline: "hsl(30, 30%, 60%)",
    subtleBorder: "hsl(30, 25%, 85%)",
    dimText: "hsl(30, 20%, 40%)",
    closeButton: "hsl(30, 25%, 50%)",
    boxHoverBg: "hsl(30, 35%, 92%)"
  }
};
var getStyles = (mode, claudeModeActive) => {
  var _a;
  const theme = (_a = themes[mode]) != null ? _a : themes.light;
  return {
    container: {
      fontFamily: claudeModeActive ? "sans-serif" : "sans-serif",
      padding: "10px",
      border: `1px solid ${theme.border}`,
      borderRadius: "5px",
      position: "relative",
      backgroundColor: theme.bg,
      color: theme.text
    },
    controls: {
      marginBottom: "10px",
      display: "flex",
      gap: "15px",
      alignItems: "center",
      flexWrap: "wrap",
      flexShrink: 0
    },
    featureSearch: { marginBottom: "10px" },
    featureListContainer: {
      marginBottom: "15px",
      maxHeight: "200px",
      overflowY: "auto",
      border: `1px solid ${theme.subtleBorder}`,
      backgroundColor: theme.containerBg
    },
    featureListItem: {
      padding: "5px 8px",
      cursor: "pointer",
      borderBottom: `1px solid ${theme.subtleBorder}`,
      fontSize: "0.9em",
      display: "flex",
      justifyContent: "space-between"
    },
    featureListItemHover: { outline: `1px solid ${theme.hoverOutline}` },
    featureListItemSelected: {
      backgroundColor: theme.selectedItemBg,
      fontWeight: "bold",
      borderLeft: `3px solid ${theme.selectedItemBorder}`,
      color: theme.text
    },
    featureScore: { color: theme.dimText, fontSize: "0.9em" },
    selectedFeaturesContainer: {
      marginTop: "15px",
      marginBottom: "15px",
      padding: "10px",
      border: `1px solid ${theme.border}`,
      borderRadius: "4px",
      maxHeight: "200px",
      overflowY: "auto",
      flexShrink: 0
    },
    selectedFeatureInfoBox: {
      border: `1px solid ${theme.border}`,
      borderRadius: "3px",
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: theme.bg,
      position: "relative",
      fontSize: "0.9em",
      transition: "background-color 0.1s ease-in-out"
    },
    featureValueIndicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "auto",
      minWidth: "2.5em",
      height: "1.5em",
      marginLeft: "5px",
      border: `1px solid ${theme.border}`,
      borderRadius: "3px",
      verticalAlign: "middle",
      padding: "0 4px",
      fontSize: "0.85em",
      overflow: "hidden",
      whiteSpace: "nowrap"
    },
    selectedTokensContainer: {
      marginTop: "15px",
      marginBottom: "5px",
      padding: "10px",
      border: `1px solid ${theme.border}`,
      borderRadius: "4px",
      maxHeight: "200px",
      overflowY: "auto",
      flexShrink: 0
    },
    selectedTokensContainerCompactWrap: {
      display: "flex",
      flexWrap: "wrap",
      gap: "5px"
    },
    selectedTokenInfoBox: {
      border: `1px solid ${theme.border}`,
      borderRadius: "3px",
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: theme.bg,
      position: "relative",
      fontSize: "0.9em",
      transition: "background-color 0.1s ease-in-out"
    },
    selectedTokenInfoBoxCompactTile: {
      border: `1px solid ${theme.border}`,
      borderRadius: "3px",
      padding: "2px 5px",
      backgroundColor: theme.bg,
      fontSize: "0.85em",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      whiteSpace: "nowrap"
    },
    selectedItemCloseButton: {
      position: "absolute",
      top: "2px",
      right: "5px",
      background: "none",
      border: "none",
      color: theme.closeButton,
      cursor: "pointer",
      fontSize: "1.2em",
      padding: "0",
      lineHeight: "1"
    },
    tokenSequence: {
      display: "block",
      lineHeight: 1.5,
      border: `1px solid ${theme.subtleBorder}`,
      padding: "5px",
      marginTop: "10px",
      flexShrink: 0,
      letterSpacing: "normal"
    },
    token: {
      padding: "0",
      margin: "-1px -1px 0 -1px",
      borderRadius: "2px",
      cursor: "pointer",
      whiteSpace: "pre",
      border: "1px solid transparent",
      transition: "outline 0.1s ease-in-out, background-color 0.1s ease-in-out",
      letterSpacing: "0.08em",
      display: "inline-block",
      position: "relative",
      verticalAlign: "middle",
      lineHeight: 1.2,
      overflow: "visible"
    },
    tokenTextOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2px 0px",
      zIndex: 1,
      pointerEvents: "none",
      width: "100%",
      height: "100%",
      letterSpacing: "0.08em"
    },
    tokenHover: {
      outline: `1px solid ${theme.hoverOutline}`,
      outlineOffset: "0px"
    },
    tokenClicked: {
      outline: `2px solid ${theme.selectedItemBorder}`,
      outlineOffset: "-1px",
      textDecoration: "underline",
      textUnderlineOffset: "2px"
    },
    tooltip: {
      position: "absolute",
      backgroundColor: mode === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(40, 40, 40, 0.9)",
      color: mode === "light" ? "white" : "#e0e0e0",
      padding: "8px 10px",
      borderRadius: "4px",
      fontSize: "0.85em",
      zIndex: 10,
      maxWidth: "350px",
      pointerEvents: "none",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    },
    tooltipSticky: { pointerEvents: "auto" },
    tooltipCloseButton: {
      position: "absolute",
      top: "2px",
      right: "5px",
      background: "none",
      border: "none",
      color: mode === "light" ? "#ccc" : "#aaa",
      cursor: "pointer",
      fontSize: "1.2em",
      padding: "0",
      lineHeight: "1"
    },
    tooltipFeature: { padding: "2px 0", cursor: "pointer" },
    tooltipFeatureHover: { textDecoration: "underline" },
    inputGroup: { display: "flex", alignItems: "center", gap: "5px" },
    compactButton: { padding: "2px 6px", fontSize: "0.8em" },
    featureGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "3px",
      padding: "5px"
    },
    featureTile: {
      padding: "1px 2px",
      fontSize: "0.85em",
      border: `1px solid ${theme.border}`,
      borderRadius: "3px",
      cursor: "pointer",
      textAlign: "center",
      whiteSpace: "nowrap",
      minWidth: "2.5em"
    },
    featureTileHover: { outline: `1px solid ${theme.hoverOutline}` },
    featureTileSelected: {
      backgroundColor: theme.selectedItemBg,
      fontWeight: "bold",
      borderColor: theme.selectedItemBorder,
      color: theme.text
    },
    mainContentArea: {
      display: "flex",
      flexDirection: "column"
    },
    featureListIndexValue: {
      fontWeight: "bold",
      marginRight: "5px"
    },
    featureListDescription: {
      color: theme.dimText
    },
    dynamicInfoLabel: {
      fontStyle: "italic",
      marginRight: "5px"
    }
  };
};
var getRankingMetricDisplayName = (metric) => {
  switch (metric) {
    case "l1":
      return "L1";
    case "l0":
      return "L0";
    case "max":
    default:
      return "Max";
  }
};
var SaeVis = ({
  tokens,
  featureActivations,
  featureLabels,
  featureIDs,
  numTopFeaturesPerToken = 5,
  numTopFeaturesOverall = 20,
  initialRankingMetric = "max",
  activationThreshold = null,
  colorMap = "reds",
  colorMidpoint: propsColorMidpoint
}) => {
  var _a;
  const processedTokens = (0, import_react13.useMemo)(() => {
    return tokens.map((token) => token.replace(/\n/g, "\u21B5"));
  }, [tokens]);
  const [rankingMetric, setRankingMetric] = (0, import_react13.useState)(
    initialRankingMetric
  );
  const [currentThreshold, setCurrentThreshold] = (0, import_react13.useState)(
    activationThreshold
  );
  const [selectedFeatureIndex, setSelectedFeatureIndex] = (0, import_react13.useState)(null);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = (0, import_react13.useState)(
    null
  );
  const [hoverTokenTooltipData, setHoverTokenTooltipData] = (0, import_react13.useState)(null);
  const [selectedTokenIndices, setSelectedTokenIndices] = (0, import_react13.useState)(
    []
  );
  const [featureSearchTerm, setFeatureSearchTerm] = (0, import_react13.useState)("");
  const [numOverallToShow, setNumOverallToShow] = (0, import_react13.useState)(
    numTopFeaturesOverall
  );
  const [numTokenToShow, setNumTokenToShow] = (0, import_react13.useState)(numTopFeaturesPerToken);
  const [minColorBound, setMinColorBound] = (0, import_react13.useState)(
    null
  );
  const [maxColorBound, setMaxColorBound] = (0, import_react13.useState)(
    null
  );
  const [colorMidpoint, setColorMidpoint] = (0, import_react13.useState)(
    propsColorMidpoint != null ? propsColorMidpoint : null
  );
  const [featureListHeight, setFeatureListHeight] = (0, import_react13.useState)("200px");
  const [selectedFeaturesHeight, setSelectedFeaturesHeight] = (0, import_react13.useState)("200px");
  const [focusedFeatureInfo, setFocusedFeatureInfo] = (0, import_react13.useState)(null);
  const [selectedFeatureIndices, setSelectedFeatureIndices] = (0, import_react13.useState)([]);
  const [hoveredTokenIndex, setHoveredTokenIndex] = (0, import_react13.useState)(
    null
  );
  const [multiColorTokens, setMultiColorTokens] = (0, import_react13.useState)(false);
  const [colorMode, setColorMode] = (0, import_react13.useState)(
    "claude-brown"
  );
  const [selectedColorMap, setSelectedColorMap] = (0, import_react13.useState)(
    "claudeOranges"
  );
  const [showTokenFeatures, setShowTokenFeatures] = (0, import_react13.useState)(false);
  const [claudeModeActive, setClaudeModeActive] = (0, import_react13.useState)(true);
  const [isCompactView, setIsCompactView] = (0, import_react13.useState)(false);
  const [selectedTokensHeight, setSelectedTokensHeight] = (0, import_react13.useState)("200px");
  const containerRef = (0, import_react13.useRef)(null);
  const styles = (0, import_react13.useMemo)(
    () => getStyles(colorMode, claudeModeActive),
    [colorMode, claudeModeActive]
  );
  const theme = (_a = themes[colorMode]) != null ? _a : themes.light;
  const featureIdToArrayIndexMap = (0, import_react13.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    if (featureIDs) {
      featureIDs.forEach((featureId, arrayIndex) => {
        map.set(featureId, arrayIndex);
      });
    } else if (featureActivations.length > 0 && featureActivations[0]) {
      const numFeatures = featureActivations[0].length;
      for (let i = 0; i < numFeatures; i++) {
        map.set(i, i);
      }
    }
    return map;
  }, [featureIDs, featureActivations]);
  const allFeatures = (0, import_react13.useMemo)(() => {
    return calculateFeatureScores(
      featureActivations,
      featureLabels,
      featureIDs,
      currentThreshold
    );
  }, [featureActivations, featureLabels, featureIDs, currentThreshold]);
  const rankedFeatures = (0, import_react13.useMemo)(() => {
    const featuresWithScores = allFeatures.map((f) => {
      let score = 0;
      switch (rankingMetric) {
        case "l1":
          score = f.meanAbsActivation;
          break;
        case "l0":
          score = f.nonZeroCount;
          break;
        case "max":
        default:
          score = f.maxActivation;
          break;
      }
      return { ...f, score };
    });
    return rankFeatures(featuresWithScores, rankingMetric);
  }, [allFeatures, rankingMetric]);
  const filteredAndRankedFeatures = (0, import_react13.useMemo)(() => {
    const searchTerm = featureSearchTerm.toLowerCase().trim();
    if (!searchTerm)
      return rankedFeatures;
    return rankedFeatures.filter(
      (feature) => feature.label.toLowerCase().includes(searchTerm) || String(feature.index).includes(searchTerm)
    );
  }, [rankedFeatures, featureSearchTerm]);
  const topFilteredAndRankedFeatures = (0, import_react13.useMemo)(() => {
    return filteredAndRankedFeatures.slice(0, numOverallToShow);
  }, [filteredAndRankedFeatures, numOverallToShow]);
  const coloringFeatureIndex = hoveredFeatureIndex != null ? hoveredFeatureIndex : selectedFeatureIndices.length === 1 ? selectedFeatureIndices[0] : selectedFeatureIndex;
  const isMultiSegmentMode = multiColorTokens && selectedFeatureIndices.length >= 2;
  const isMultiMaximizeMode = !multiColorTokens && selectedFeatureIndices.length >= 1;
  const selectedFeaturesData = (0, import_react13.useMemo)(() => {
    return selectedFeatureIndices.map((index) => rankedFeatures.find((f) => f.index === index)).filter((f) => f !== void 0);
  }, [selectedFeatureIndices, rankedFeatures]);
  const calculatedColorBounds = (0, import_react13.useMemo)(() => {
    const arrayIndex = featureIdToArrayIndexMap.get(coloringFeatureIndex != null ? coloringFeatureIndex : -1);
    if (arrayIndex === void 0 || !featureActivations[0]) {
      return { min: 0, max: 0 };
    }
    const actsForFeature = featureActivations.map(
      (tokenActs) => {
        var _a2;
        return (_a2 = tokenActs[arrayIndex]) != null ? _a2 : 0;
      }
    );
    return {
      min: Math.min(...actsForFeature),
      max: Math.max(...actsForFeature)
    };
  }, [coloringFeatureIndex, featureActivations, featureIdToArrayIndexMap]);
  const singleColorScale = (0, import_react13.useMemo)(() => {
    var _a2;
    const activeArrayIndex = featureIdToArrayIndexMap.get(
      coloringFeatureIndex != null ? coloringFeatureIndex : -1
    );
    if (activeArrayIndex === void 0 || !featureActivations[0]) {
      return () => styles.container.backgroundColor || "#ffffff";
    }
    const actsForFeature = featureActivations.map(
      (tokenActs) => {
        var _a3;
        return (_a3 = tokenActs[activeArrayIndex]) != null ? _a3 : 0;
      }
    );
    const calculatedMin = Math.min(...actsForFeature);
    const calculatedMax = Math.max(...actsForFeature);
    const domainMinRaw = minColorBound !== null && minColorBound !== "" ? parseFloat(minColorBound) : calculatedMin;
    const domainMaxRaw = maxColorBound !== null && maxColorBound !== "" ? parseFloat(maxColorBound) : calculatedMax;
    const domainMin = Number.isNaN(domainMinRaw) ? calculatedMin : domainMinRaw;
    const domainMax = Number.isNaN(domainMaxRaw) ? calculatedMax : domainMaxRaw;
    const userColorMapKey = selectedColorMap.toLowerCase();
    let effectiveMapKey = userColorMapKey;
    if (claudeModeActive) {
      effectiveMapKey = "claudeOranges";
    }
    const effectiveInterpolator = (_a2 = d3ColorMapLookup[effectiveMapKey]) != null ? _a2 : d3ColorMapLookup.reds;
    if (!d3ColorMapLookup[effectiveMapKey]) {
      console.warn(`Color map "${effectiveMapKey}" not supported, using Reds.`);
    }
    const isDiverging = divergingColorMapKeys.includes(effectiveMapKey);
    if (isDiverging) {
      let midpoint = (domainMin + domainMax) / 2;
      if (colorMidpoint !== null && colorMidpoint !== "") {
        const parsedMidpoint = parseFloat(colorMidpoint);
        if (!Number.isNaN(parsedMidpoint)) {
          midpoint = parsedMidpoint;
        }
      }
      const finalDomain = [
        domainMin === midpoint && domainMin === domainMax ? domainMin - 1e-3 : domainMin,
        midpoint,
        domainMax === midpoint && domainMax === domainMin ? domainMax + 1e-3 : domainMax
      ];
      return createColorScale(effectiveInterpolator, finalDomain, {
        isDiverging: true
      });
    }
    const effectiveMin = domainMin === domainMax ? domainMin : domainMin;
    const effectiveMax = domainMin === domainMax ? domainMax + 1e-5 : domainMax;
    return createColorScale(
      effectiveInterpolator,
      [effectiveMin, effectiveMax],
      {
        minClamp: 0,
        maxClamp: 0.7,
        isDiverging: false
      }
    );
  }, [
    coloringFeatureIndex,
    selectedColorMap,
    minColorBound,
    maxColorBound,
    colorMidpoint,
    featureActivations,
    styles.container.backgroundColor,
    claudeModeActive,
    featureIdToArrayIndexMap
  ]);
  const featureScales = (0, import_react13.useMemo)(() => {
    var _a2;
    const scales = {};
    if (!featureActivations[0])
      return scales;
    const numFeatures = featureActivations[0].length;
    const userColorMapKey = selectedColorMap.toLowerCase();
    const effectiveInterpolator = (_a2 = d3ColorMapLookup[userColorMapKey]) != null ? _a2 : d3ColorMapLookup.reds;
    const isDiverging = divergingColorMapKeys.includes(userColorMapKey);
    for (let arrayIndex = 0; arrayIndex < numFeatures; arrayIndex++) {
      const acts = featureActivations.map(
        (tokenActs) => {
          var _a3;
          return (_a3 = tokenActs[arrayIndex]) != null ? _a3 : 0;
        }
      );
      const minAct = Math.min(...acts);
      const maxAct = Math.max(...acts);
      const domainMinRaw = minColorBound !== null && minColorBound !== "" ? parseFloat(minColorBound) : minAct;
      const domainMaxRaw = maxColorBound !== null && maxColorBound !== "" ? parseFloat(maxColorBound) : maxAct;
      const domainMin = Number.isNaN(domainMinRaw) ? minAct : domainMinRaw;
      const domainMax = Number.isNaN(domainMaxRaw) ? maxAct : domainMaxRaw;
      if (isDiverging) {
        let midpoint = (domainMin + domainMax) / 2;
        if (colorMidpoint !== null && colorMidpoint !== "") {
          const parsedMidpoint = parseFloat(colorMidpoint);
          if (!Number.isNaN(parsedMidpoint)) {
            midpoint = parsedMidpoint;
          }
        }
        const finalDomain = [
          domainMin === midpoint && domainMin === domainMax ? domainMin - 1e-3 : domainMin,
          midpoint,
          domainMax === midpoint && domainMax === domainMin ? domainMax + 1e-3 : domainMax
        ];
        scales[arrayIndex] = createColorScale(
          effectiveInterpolator,
          finalDomain,
          {
            isDiverging: true
          }
        );
      } else {
        const effectiveMin = domainMin === domainMax ? domainMin : domainMin;
        const effectiveMax = domainMin === domainMax ? domainMax + 1e-5 : domainMax;
        scales[arrayIndex] = createColorScale(
          effectiveInterpolator,
          [effectiveMin, effectiveMax],
          {
            minClamp: 0,
            maxClamp: 0.7,
            isDiverging: false
          }
        );
      }
    }
    return scales;
  }, [
    featureActivations,
    selectedColorMap,
    minColorBound,
    maxColorBound,
    colorMidpoint,
    d3ColorMapLookup,
    divergingColorMapKeys,
    createColorScale
  ]);
  const handleFeatureMouseEnter = (0, import_react13.useCallback)(
    (index, event) => {
      var _a2, _b, _c;
      setHoveredFeatureIndex(index);
      if (isCompactView) {
        const feature = rankedFeatures.find((f) => f.index === index);
        if (feature && (!focusedFeatureInfo || !focusedFeatureInfo.isClick || focusedFeatureInfo.index !== index)) {
          const containerRect = (_a2 = containerRef.current) == null ? void 0 : _a2.getBoundingClientRect();
          const position = {
            x: event.clientX - ((_b = containerRect == null ? void 0 : containerRect.left) != null ? _b : 0) + 15,
            y: event.clientY - ((_c = containerRect == null ? void 0 : containerRect.top) != null ? _c : 0) + 15
          };
          setFocusedFeatureInfo({ ...feature, isClick: false, position });
        }
      }
    },
    [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]
  );
  const handleFeatureMouseLeave = (0, import_react13.useCallback)(() => {
    setHoveredFeatureIndex(null);
    if (isCompactView && focusedFeatureInfo && !focusedFeatureInfo.isClick) {
      setFocusedFeatureInfo(null);
    }
  }, [isCompactView, focusedFeatureInfo]);
  const handleFeatureClick = (0, import_react13.useCallback)(
    (index, event) => {
      var _a2, _b, _c;
      setSelectedFeatureIndices(
        (prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
      setSelectedFeatureIndices((currentSelected) => {
        if (currentSelected.length === 1) {
          setSelectedFeatureIndex(currentSelected[0]);
        } else {
          setSelectedFeatureIndex(null);
        }
        return currentSelected;
      });
      if (isCompactView) {
        const feature = rankedFeatures.find((f) => f.index === index);
        if (!feature)
          return;
        if ((focusedFeatureInfo == null ? void 0 : focusedFeatureInfo.index) === index && focusedFeatureInfo.isClick) {
          setFocusedFeatureInfo(null);
        } else {
          const containerRect = (_a2 = containerRef.current) == null ? void 0 : _a2.getBoundingClientRect();
          const position = {
            x: event.clientX - ((_b = containerRect == null ? void 0 : containerRect.left) != null ? _b : 0) + 15,
            y: event.clientY - ((_c = containerRect == null ? void 0 : containerRect.top) != null ? _c : 0) + 15
          };
          setFocusedFeatureInfo({ ...feature, isClick: true, position });
        }
      }
    },
    [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]
  );
  const handleTokenMouseEnter = (0, import_react13.useCallback)(
    (index, event) => {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
      setHoveredTokenIndex(index);
      if (selectedTokenIndices.includes(index)) {
        const topFeatures2 = getTopFeaturesForToken(
          index,
          featureActivations,
          featureLabels,
          featureIDs,
          numTokenToShow,
          currentThreshold
        );
        const selectedArrayIndex2 = featureIdToArrayIndexMap.get(
          selectedFeatureIndex != null ? selectedFeatureIndex : -1
        );
        const currentSelectedFeatureActivationValue2 = selectedArrayIndex2 !== void 0 ? (_b = (_a2 = featureActivations[index]) == null ? void 0 : _a2[selectedArrayIndex2]) != null ? _b : null : null;
        const containerRect2 = (_c = containerRef.current) == null ? void 0 : _c.getBoundingClientRect();
        const scrollLeft2 = (_e = (_d = containerRef.current) == null ? void 0 : _d.scrollLeft) != null ? _e : 0;
        const scrollTop2 = (_g = (_f = containerRef.current) == null ? void 0 : _f.scrollTop) != null ? _g : 0;
        const position2 = {
          x: event.clientX - ((_h = containerRect2 == null ? void 0 : containerRect2.left) != null ? _h : 0) + scrollLeft2 + 15,
          y: event.clientY - ((_i = containerRect2 == null ? void 0 : containerRect2.top) != null ? _i : 0) + scrollTop2 + 15
        };
        setHoverTokenTooltipData({
          tokenIndex: index,
          topFeatures: topFeatures2,
          selectedFeatureValue: currentSelectedFeatureActivationValue2,
          position: position2
        });
        return;
      }
      const topFeatures = getTopFeaturesForToken(
        index,
        featureActivations,
        featureLabels,
        featureIDs,
        numTokenToShow,
        currentThreshold
      );
      const selectedArrayIndex = featureIdToArrayIndexMap.get(
        selectedFeatureIndex != null ? selectedFeatureIndex : -1
      );
      const currentSelectedFeatureActivationValue = selectedArrayIndex !== void 0 ? (_k = (_j = featureActivations[index]) == null ? void 0 : _j[selectedArrayIndex]) != null ? _k : null : null;
      const containerRect = (_l = containerRef.current) == null ? void 0 : _l.getBoundingClientRect();
      const scrollLeft = (_n = (_m = containerRef.current) == null ? void 0 : _m.scrollLeft) != null ? _n : 0;
      const scrollTop = (_p = (_o = containerRef.current) == null ? void 0 : _o.scrollTop) != null ? _p : 0;
      const position = {
        x: event.clientX - ((_q = containerRect == null ? void 0 : containerRect.left) != null ? _q : 0) + scrollLeft + 15,
        y: event.clientY - ((_r = containerRect == null ? void 0 : containerRect.top) != null ? _r : 0) + scrollTop + 15
      };
      setHoverTokenTooltipData({
        tokenIndex: index,
        topFeatures,
        selectedFeatureValue: currentSelectedFeatureActivationValue,
        position
      });
    },
    [
      featureActivations,
      featureLabels,
      featureIDs,
      numTokenToShow,
      currentThreshold,
      selectedFeatureIndex,
      selectedTokenIndices,
      featureIdToArrayIndexMap
    ]
  );
  const handleTokenMouseLeave = (0, import_react13.useCallback)(() => {
    setHoveredTokenIndex(null);
    setHoverTokenTooltipData(null);
  }, []);
  const handleTokenClick = (0, import_react13.useCallback)((index) => {
    setSelectedTokenIndices((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      }
      return [...prevSelected, index];
    });
    setHoverTokenTooltipData(null);
  }, []);
  const handleTokenTooltipFeatureClick = (featureIndex) => {
    setSelectedFeatureIndices(
      (prev) => prev.includes(featureIndex) ? prev.filter((i) => i !== featureIndex) : [...prev, featureIndex]
    );
    setSelectedFeatureIndices((currentSelected) => {
      if (currentSelected.length === 1) {
        setSelectedFeatureIndex(currentSelected[0]);
      } else {
        setSelectedFeatureIndex(null);
      }
      return currentSelected;
    });
    if (isCompactView && (focusedFeatureInfo == null ? void 0 : focusedFeatureInfo.isClick)) {
      const feature = rankedFeatures.find((f) => f.index === featureIndex);
      if (feature) {
        setFocusedFeatureInfo({
          ...feature,
          isClick: true,
          position: focusedFeatureInfo.position
        });
      }
    }
  };
  const handleDeselectToken = (0, import_react13.useCallback)((indexToRemove) => {
    setSelectedTokenIndices(
      (prevSelected) => prevSelected.filter((i) => i !== indexToRemove)
    );
    setHoverTokenTooltipData(null);
  }, []);
  const handleDeselectFeature = (0, import_react13.useCallback)((indexToRemove) => {
    setSelectedFeatureIndices(
      (prevSelected) => prevSelected.filter((i) => i !== indexToRemove)
    );
    setSelectedFeatureIndices((currentSelected) => {
      if (currentSelected.length === 1) {
        setSelectedFeatureIndex(currentSelected[0]);
      } else if (currentSelected.length === 0) {
        setSelectedFeatureIndex(null);
      }
      return currentSelected;
    });
  }, []);
  const closeFeatureInfoTooltip = (0, import_react13.useCallback)(() => {
    setFocusedFeatureInfo(null);
  }, []);
  const handleBoundInputChange = (setter, value) => {
    if (value === "" || value === "-" || !Number.isNaN(parseFloat(value))) {
      setter(value);
    }
  };
  const handleResetAll = (0, import_react13.useCallback)(() => {
    setMinColorBound(null);
    setMaxColorBound(null);
    setSelectedFeatureIndex(null);
    setSelectedTokenIndices([]);
    setFocusedFeatureInfo(null);
    setHoverTokenTooltipData(null);
    setSelectedFeatureIndices([]);
    setHoveredTokenIndex(null);
    setMultiColorTokens(false);
    setSelectedColorMap(colorMap);
    setShowTokenFeatures(false);
    setColorMode("claude-brown");
    setClaudeModeActive(true);
    setColorMidpoint(propsColorMidpoint != null ? propsColorMidpoint : null);
  }, [colorMap, propsColorMidpoint]);
  const toggleCompactView = (0, import_react13.useCallback)(() => {
    setIsCompactView((prev) => !prev);
    setFocusedFeatureInfo(null);
    setHoveredFeatureIndex(null);
  }, []);
  const toggleFeatureListHeight = (0, import_react13.useCallback)(() => {
    setFeatureListHeight((prev) => prev === "200px" ? "500px" : "200px");
  }, []);
  const handleMultiColorChange = (0, import_react13.useCallback)(
    (event) => {
      setMultiColorTokens(event.target.checked);
    },
    []
  );
  const toggleColorMode = (0, import_react13.useCallback)(() => {
    setColorMode((prev) => prev === "light" ? "dark" : "light");
    setClaudeModeActive(false);
  }, []);
  const activateClaudeMode = (0, import_react13.useCallback)(() => {
    setColorMode("claude-brown");
    setSelectedColorMap("claudeOranges");
    setClaudeModeActive(true);
  }, []);
  const toggleShowTokenFeatures = (0, import_react13.useCallback)(() => {
    setShowTokenFeatures((prev) => !prev);
  }, []);
  const dropdownColorMaps = (0, import_react13.useMemo)(() => {
    return Object.keys(d3ColorMapLookup).filter(
      (name) => name !== "claudeOranges"
    );
  }, []);
  const toggleSelectedFeaturesHeight = (0, import_react13.useCallback)(() => {
    setSelectedFeaturesHeight((prev) => prev === "200px" ? "500px" : "200px");
  }, []);
  const toggleSelectedTokensHeight = (0, import_react13.useCallback)(() => {
    setSelectedTokensHeight((prev) => prev === "200px" ? "500px" : "200px");
  }, []);
  const getFeatureActivationValue = (0, import_react13.useCallback)(
    (featId, tokIdx) => {
      var _a2, _b;
      if (featId === null)
        return "N/A";
      const arrayIndex = featureIdToArrayIndexMap.get(featId);
      if (arrayIndex === void 0)
        return "N/A";
      const value = (_b = (_a2 = featureActivations[tokIdx]) == null ? void 0 : _a2[arrayIndex]) != null ? _b : 0;
      return value.toPrecision(3);
    },
    [featureIdToArrayIndexMap, featureActivations]
  );
  const getFeatureActivationColor = (0, import_react13.useCallback)(
    (featId, tokIdx) => {
      var _a2, _b;
      if (featId === null)
        return theme.bg;
      const arrayIndex = featureIdToArrayIndexMap.get(featId);
      if (arrayIndex === void 0)
        return theme.bg;
      const value = (_b = (_a2 = featureActivations[tokIdx]) == null ? void 0 : _a2[arrayIndex]) != null ? _b : 0;
      const scale = featureScales[arrayIndex];
      return scale ? scale(value) : theme.bg;
    },
    [featureIdToArrayIndexMap, featureActivations, featureScales, theme.bg]
  );
  const getFeatureActivationTextColor = (0, import_react13.useCallback)(
    (bgColor) => {
      return getLuminance(bgColor) > 0.5 ? themes.light.text : themes.dark.text;
    },
    [themes.light.text, themes.dark.text]
  );
  if (!processedTokens || !featureActivations) {
    return /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.container }, "Loading or no data...");
  }
  const isTokenSelected = (index) => {
    return selectedTokenIndices.includes(index);
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { style: { ...styles.container }, ref: containerRef }, /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.controls }, /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("label", null, "Rank by: "), /* @__PURE__ */ import_react13.default.createElement(
    "select",
    {
      value: rankingMetric,
      onChange: (e) => setRankingMetric(e.target.value)
    },
    /* @__PURE__ */ import_react13.default.createElement("option", { value: "max" }, "Max Activation"),
    /* @__PURE__ */ import_react13.default.createElement("option", { value: "l1" }, "Mean Abs Activation (L1)"),
    /* @__PURE__ */ import_react13.default.createElement("option", { value: "l0" }, "Non-Zero Count (L0)")
  )), /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("label", null, "Threshold: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      placeholder: "None",
      value: currentThreshold === null ? "" : currentThreshold,
      onChange: (e) => setCurrentThreshold(
        e.target.value === "" ? null : parseFloat(e.target.value)
      ),
      style: { width: "60px" },
      title: "Activation threshold for L0 ranking and token tooltips"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.inputGroup }, /* @__PURE__ */ import_react13.default.createElement("label", null, "Min Color: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      placeholder: calculatedColorBounds.min.toPrecision(3),
      value: minColorBound != null ? minColorBound : "",
      onChange: (e) => handleBoundInputChange(setMinColorBound, e.target.value),
      style: { width: "60px" },
      title: "Minimum value for color scale (leave blank for auto)"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.inputGroup }, /* @__PURE__ */ import_react13.default.createElement("label", null, "Max Color: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      placeholder: calculatedColorBounds.max.toPrecision(3),
      value: maxColorBound != null ? maxColorBound : "",
      onChange: (e) => handleBoundInputChange(setMaxColorBound, e.target.value),
      style: { width: "60px" },
      title: "Maximum value for color scale (leave blank for auto)"
    }
  )), divergingColorMapKeys.includes(selectedColorMap.toLowerCase()) && /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.inputGroup }, /* @__PURE__ */ import_react13.default.createElement("label", null, "Midpoint: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      placeholder: `(${(calculatedColorBounds.min + calculatedColorBounds.max) / 2})`,
      value: colorMidpoint != null ? colorMidpoint : "",
      onChange: (e) => handleBoundInputChange(setColorMidpoint, e.target.value),
      style: { width: "60px" },
      title: "Midpoint for diverging color scale (leave blank for auto)"
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.inputGroup }, /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      onClick: handleResetAll,
      title: "Reset color bounds, selected features, and selected tokens"
    },
    "Reset All"
  )), /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("label", null, "Top Overall: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      min: "1",
      step: "1",
      value: numOverallToShow,
      onChange: (e) => setNumOverallToShow(parseInt(e.target.value, 10)),
      style: { width: "50px" }
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("label", null, "Top Per Token: "), /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "number",
      min: "1",
      step: "1",
      value: numTokenToShow,
      onChange: (e) => setNumTokenToShow(parseInt(e.target.value, 10)),
      style: { width: "50px" }
    }
  )), /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.inputGroup }, /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      type: "checkbox",
      id: "multiColorCheckbox",
      checked: multiColorTokens,
      onChange: handleMultiColorChange,
      disabled: selectedFeatureIndices.length < 2,
      title: selectedFeatureIndices.length < 2 ? "Select 2 or more features to enable" : "Color tokens based on activations of all selected features"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("label", { htmlFor: "multiColorCheckbox" }, "Multi-Color Tokens")), /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("label", null, "Color Map: "), /* @__PURE__ */ import_react13.default.createElement(
    "select",
    {
      value: selectedColorMap,
      onChange: (e) => {
        setSelectedColorMap(e.target.value);
        setClaudeModeActive(false);
      },
      title: "Select color map for activations"
    },
    dropdownColorMaps.map((mapName) => /* @__PURE__ */ import_react13.default.createElement("option", { key: mapName, value: mapName }, mapName))
  )), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      onClick: toggleColorMode,
      title: `Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode`
    },
    colorMode === "light" ? "Dark Mode" : "Light Mode"
  ), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      onClick: activateClaudeMode,
      title: "Activate Claude Mode Theme",
      style: { opacity: 0.7 }
    },
    "\u2728"
  ), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      onClick: toggleCompactView,
      style: { ...styles.compactButton, marginLeft: "auto" },
      title: isCompactView ? "Show Full Labels" : "Show Compact View"
    },
    isCompactView ? "Expand View" : "Compact View"
  )), /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: "5px",
        flexWrap: "wrap",
        gap: "10px"
      }
    },
    /* @__PURE__ */ import_react13.default.createElement("div", { style: { ...styles.featureSearch, marginRight: "auto" } }, " ", /* @__PURE__ */ import_react13.default.createElement("label", null, "Search Features: "), /* @__PURE__ */ import_react13.default.createElement(
      "input",
      {
        type: "text",
        placeholder: "Index or Label...",
        value: featureSearchTerm,
        onChange: (e) => setFeatureSearchTerm(e.target.value),
        style: { width: "200px", padding: "4px" }
      }
    )),
    /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "5px",
          alignItems: "center",
          marginLeft: "10px"
        }
      },
      /* @__PURE__ */ import_react13.default.createElement(
        "button",
        {
          onClick: toggleFeatureListHeight,
          style: styles.compactButton,
          title: featureListHeight === "200px" ? "Expand Feature List" : "Collapse Feature List"
        },
        featureListHeight === "200px" ? "Expand" : "Collapse"
      )
    )
  ), /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: { ...styles.featureListContainer, maxHeight: featureListHeight }
    },
    /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingRight: "8px",
          paddingTop: "10px",
          paddingLeft: "5px",
          paddingBottom: "10px",
          position: "sticky",
          top: 0,
          backgroundColor: theme.containerBg,
          zIndex: 5,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          isolation: "isolate",
          backdropFilter: "blur(2px)"
        }
      },
      /* @__PURE__ */ import_react13.default.createElement("strong", null, "Top ", topFilteredAndRankedFeatures.length, " Features (", filteredAndRankedFeatures.length, " Total) (Ranked by", " ", getRankingMetricDisplayName(rankingMetric), featureSearchTerm ? ", Filtered" : "", "):"),
      !isCompactView && /* @__PURE__ */ import_react13.default.createElement(
        "span",
        {
          style: {
            fontSize: "0.8em",
            color: theme.dimText,
            whiteSpace: "nowrap"
          }
        },
        "Value "
      )
    ),
    isCompactView ? /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.featureGrid }, topFilteredAndRankedFeatures.map((feature) => {
      const featureTitle = `Index: ${feature.index}
Max: ${feature.maxActivation.toFixed(
        3
      )}, L1: ${feature.meanAbsActivation.toFixed(3)}, L0: ${feature.nonZeroCount}
${feature.label}`;
      const isSelected = selectedFeatureIndices.includes(feature.index);
      const isHovered = hoveredFeatureIndex === feature.index;
      return /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          key: feature.index,
          style: {
            ...styles.featureTile,
            ...isHovered ? styles.featureTileHover : {},
            ...isSelected ? styles.featureTileSelected : {}
          },
          onMouseEnter: (e) => handleFeatureMouseEnter(feature.index, e),
          onMouseLeave: handleFeatureMouseLeave,
          onClick: (e) => handleFeatureClick(feature.index, e),
          title: featureTitle
        },
        feature.index,
        " "
      );
    })) : /* @__PURE__ */ import_react13.default.createElement("div", null, topFilteredAndRankedFeatures.map((feature) => {
      var _a2, _b, _c;
      const hoveredTokenFeatureId = feature.index;
      const currentHoveredTokenArrayIndex = hoveredTokenIndex !== null ? featureIdToArrayIndexMap.get(hoveredTokenFeatureId) : void 0;
      const hoveredTokenActivation = hoveredTokenIndex !== null && currentHoveredTokenArrayIndex !== void 0 ? (_b = (_a2 = featureActivations[hoveredTokenIndex]) == null ? void 0 : _a2[currentHoveredTokenArrayIndex]) != null ? _b : 0 : null;
      const featureArrayIndex = featureIdToArrayIndexMap.get(
        feature.index
      );
      const scale = featureArrayIndex !== void 0 && featureScales ? featureScales[featureArrayIndex] : null;
      const indicatorColor = hoveredTokenActivation !== null && scale ? scale(hoveredTokenActivation) : theme.bg;
      let indicatorTextColor = theme.text;
      if (hoveredTokenActivation !== null) {
        indicatorTextColor = getLuminance(indicatorColor) > 0.5 ? themes.light.text : themes.dark.text;
      }
      const displayValue = (_c = hoveredTokenActivation == null ? void 0 : hoveredTokenActivation.toPrecision(3)) != null ? _c : "N/A";
      const valueTitle = hoveredTokenActivation !== null ? `Activation at Token ${hoveredTokenIndex}: ${hoveredTokenActivation.toPrecision(
        4
      )}` : "Hover over a token to see value";
      return /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          key: feature.index,
          style: {
            ...styles.featureListItem,
            ...hoveredFeatureIndex === feature.index ? styles.featureListItemHover : {},
            ...selectedFeatureIndices.includes(feature.index) ? styles.featureListItemSelected : {}
          },
          onMouseEnter: (e) => handleFeatureMouseEnter(feature.index, e),
          onMouseLeave: handleFeatureMouseLeave,
          onClick: (e) => handleFeatureClick(feature.index, e),
          title: `Feature ${feature.index}: ${feature.label}
Max: ${feature.maxActivation.toPrecision(
            3
          )}, L1: ${feature.meanAbsActivation.toPrecision(3)}, L0: ${feature.nonZeroCount}`
        },
        /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginRight: "10px"
            }
          },
          /* @__PURE__ */ import_react13.default.createElement("strong", null, "Feature ", feature.index, ":"),
          " ",
          feature.label,
          /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                fontSize: "0.85em",
                color: styles.featureScore.color,
                marginLeft: "5px"
              }
            },
            "(Max: ",
            feature.maxActivation.toPrecision(3),
            ", L1:",
            " ",
            feature.meanAbsActivation.toPrecision(3),
            ", L0:",
            " ",
            feature.nonZeroCount,
            ")"
          )
        ),
        /* @__PURE__ */ import_react13.default.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              flexShrink: 0
            }
          },
          /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                backgroundColor: indicatorColor,
                color: indicatorTextColor
              },
              title: valueTitle
            },
            displayValue
          )
        )
      );
    })),
    filteredAndRankedFeatures.length > numOverallToShow && /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          textAlign: "center",
          padding: "5px",
          fontSize: "0.8em",
          color: "#555"
        }
      },
      "Showing ",
      numOverallToShow,
      " of ",
      filteredAndRankedFeatures.length,
      " ",
      "features."
    ),
    filteredAndRankedFeatures.length === 0 && featureSearchTerm && /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          textAlign: "center",
          padding: "5px",
          fontSize: "0.9em",
          color: "#777"
        }
      },
      "No features match search term."
    )
  ), selectedFeaturesData.length > 0 && /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: {
        ...styles.selectedFeaturesContainer,
        maxHeight: selectedFeaturesHeight,
        position: "relative"
      }
    },
    /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
          position: "sticky",
          top: 0,
          backgroundColor: theme.containerBg,
          zIndex: 5,
          paddingBottom: "3px",
          paddingTop: "3px",
          borderBottom: `1px solid ${theme.subtleBorder}`,
          width: "100%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          isolation: "isolate"
        }
      },
      /* @__PURE__ */ import_react13.default.createElement("strong", null, "Selected Features:"),
      /* @__PURE__ */ import_react13.default.createElement(
        "button",
        {
          onClick: toggleSelectedFeaturesHeight,
          style: styles.compactButton,
          title: selectedFeaturesHeight === "200px" ? "Expand Selected Features" : "Collapse Selected Features"
        },
        selectedFeaturesHeight === "200px" ? "Expand" : "Collapse"
      )
    ),
    /* @__PURE__ */ import_react13.default.createElement("div", { style: { paddingTop: "10px" } }, " ", selectedFeaturesData.map((feature) => {
      var _a2, _b, _c, _d;
      const arrayIndex = featureIdToArrayIndexMap.get(feature.index);
      const hoveredTokenActivation = hoveredTokenIndex !== null && arrayIndex !== void 0 ? (_b = (_a2 = featureActivations[hoveredTokenIndex]) == null ? void 0 : _a2[arrayIndex]) != null ? _b : 0 : null;
      const scale = arrayIndex !== void 0 && featureScales ? featureScales[arrayIndex] : null;
      const indicatorColor = hoveredTokenActivation !== null && scale ? scale(hoveredTokenActivation) : theme.bg;
      let indicatorTextColor = theme.text;
      if (hoveredTokenActivation !== null) {
        indicatorTextColor = getLuminance(indicatorColor) > 0.5 ? themes.light.text : themes.dark.text;
      }
      const displayValue = (_c = hoveredTokenActivation == null ? void 0 : hoveredTokenActivation.toPrecision(3)) != null ? _c : "N/A";
      const isHoverTarget = hoveredTokenIndex !== null && arrayIndex !== void 0 && ((_d = featureActivations[hoveredTokenIndex]) == null ? void 0 : _d[arrayIndex]) !== void 0;
      if (isCompactView) {
        return /* @__PURE__ */ import_react13.default.createElement(
          "div",
          {
            key: feature.index,
            onMouseEnter: () => setHoveredFeatureIndex(feature.index),
            onMouseLeave: () => setHoveredFeatureIndex(null),
            style: {
              ...styles.selectedFeatureInfoBox,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 8px"
            }
          },
          /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginRight: "10px"
              },
              title: feature.label
            },
            /* @__PURE__ */ import_react13.default.createElement("strong", null, "Feature ", feature.index, ":"),
            " ",
            feature.label,
            /* @__PURE__ */ import_react13.default.createElement(
              "span",
              {
                style: {
                  fontSize: "0.85em",
                  color: styles.featureScore.color,
                  marginLeft: "5px",
                  whiteSpace: "nowrap"
                },
                title: `Max: ${feature.maxActivation.toPrecision(
                  3
                )}, L1: ${feature.meanAbsActivation.toPrecision(
                  3
                )}, L0: ${feature.nonZeroCount}`
              },
              "(Max: ",
              feature.maxActivation.toPrecision(3),
              ", L1:",
              " ",
              feature.meanAbsActivation.toPrecision(3),
              ", L0:",
              " ",
              feature.nonZeroCount,
              ")"
            )
          ),
          /* @__PURE__ */ import_react13.default.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: "auto",
                flexShrink: 0
              }
            },
            /* @__PURE__ */ import_react13.default.createElement(
              "span",
              {
                style: {
                  ...styles.featureValueIndicator,
                  backgroundColor: indicatorColor,
                  color: indicatorTextColor
                },
                title: `Activation at hovered token: ${displayValue}`
              },
              displayValue
            ),
            /* @__PURE__ */ import_react13.default.createElement(
              "button",
              {
                onClick: () => handleDeselectFeature(feature.index),
                style: {
                  ...styles.selectedItemCloseButton,
                  position: "static",
                  fontSize: "1.1em",
                  padding: "0 3px"
                },
                title: "Deselect Feature"
              },
              "\xD7"
            )
          )
        );
      }
      const fullViewBoxStyle = {
        backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
      };
      return /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          key: feature.index,
          style: {
            ...styles.selectedFeatureInfoBox,
            ...fullViewBoxStyle
          },
          onMouseEnter: () => setHoveredFeatureIndex(feature.index),
          onMouseLeave: () => setHoveredFeatureIndex(null)
        },
        /* @__PURE__ */ import_react13.default.createElement(
          "button",
          {
            onClick: () => handleDeselectFeature(feature.index),
            style: styles.selectedItemCloseButton,
            title: "Deselect Feature"
          },
          "\xD7"
        ),
        /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("strong", null, "Feature ", feature.index, ":"), " ", feature.label, " - ", /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              fontSize: "0.9em",
              color: styles.featureScore.color
            }
          },
          "(Max: ",
          feature.maxActivation.toPrecision(3),
          ", L1:",
          " ",
          feature.meanAbsActivation.toPrecision(3),
          ", L0:",
          " ",
          feature.nonZeroCount,
          ")"
        )),
        /* @__PURE__ */ import_react13.default.createElement("div", { style: { marginTop: "3px" } }, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Value at Token "), hoveredTokenIndex !== null ? /* @__PURE__ */ import_react13.default.createElement("span", { style: { fontWeight: "bold" } }, processedTokens[hoveredTokenIndex]) : "?", ":", /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              ...styles.featureValueIndicator,
              backgroundColor: indicatorColor,
              color: indicatorTextColor
            },
            title: `Activation: ${displayValue}`
          },
          displayValue
        ))
      );
    }))
  ), selectedTokenIndices.length > 0 && /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: {
        ...styles.selectedTokensContainer,
        maxHeight: selectedTokensHeight,
        position: "relative",
        ...isCompactView && !showTokenFeatures ? styles.selectedTokensContainerCompactWrap : {}
      }
    },
    /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
          position: "sticky",
          top: 0,
          backgroundColor: theme.containerBg,
          zIndex: 5,
          paddingBottom: "3px",
          paddingTop: "3px",
          borderBottom: `1px solid ${theme.subtleBorder}`,
          width: "100%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          isolation: "isolate",
          backdropFilter: "blur(2px)"
        }
      },
      /* @__PURE__ */ import_react13.default.createElement("strong", null, "Selected Tokens:"),
      /* @__PURE__ */ import_react13.default.createElement("div", { style: { display: "flex", gap: "5px" } }, !(isCompactView && !showTokenFeatures) && /* @__PURE__ */ import_react13.default.createElement(
        "button",
        {
          onClick: toggleShowTokenFeatures,
          style: styles.compactButton,
          title: showTokenFeatures ? "Hide Top Features list" : "Show Top Features list"
        },
        showTokenFeatures ? "Hide Top Features" : "Show Top Features"
      ), /* @__PURE__ */ import_react13.default.createElement(
        "button",
        {
          onClick: toggleSelectedTokensHeight,
          style: styles.compactButton,
          title: selectedTokensHeight === "200px" ? "Expand Selected Tokens" : "Collapse Selected Tokens"
        },
        selectedTokensHeight === "200px" ? "Expand" : "Collapse"
      ))
    ),
    /* @__PURE__ */ import_react13.default.createElement("div", { style: { paddingTop: "10px" } }, " ", selectedTokenIndices.map((tokenIndex) => {
      var _a2, _b, _c;
      const selectedDisplayID = selectedFeatureIndex;
      const selectedArrayIndex = selectedDisplayID !== null ? featureIdToArrayIndexMap.get(selectedDisplayID) : void 0;
      let valueOfSelectedFeatureAtToken = null;
      if (selectedArrayIndex !== void 0 && tokenIndex < featureActivations.length) {
        valueOfSelectedFeatureAtToken = (_b = (_a2 = featureActivations[tokenIndex]) == null ? void 0 : _a2[selectedArrayIndex]) != null ? _b : 0;
      } else if (selectedDisplayID !== null) {
        console.warn(
          `[SaeVis] Could not find array index for selected feature ID: ${selectedDisplayID}.`
        );
        valueOfSelectedFeatureAtToken = null;
      }
      const scaleSelected = selectedArrayIndex !== void 0 && featureScales ? featureScales[selectedArrayIndex] : null;
      const indicatorColorSelected = valueOfSelectedFeatureAtToken !== null && scaleSelected ? scaleSelected(valueOfSelectedFeatureAtToken) : theme.bg;
      let indicatorTextColorSelected = theme.text;
      if (valueOfSelectedFeatureAtToken !== null) {
        indicatorTextColorSelected = getLuminance(indicatorColorSelected) > 0.5 ? themes.light.text : themes.dark.text;
      }
      const displayValueSelected = valueOfSelectedFeatureAtToken !== null ? valueOfSelectedFeatureAtToken.toPrecision(3) : "N/A";
      const hoveredFeatureArrayIndex = featureIdToArrayIndexMap.get(
        hoveredFeatureIndex != null ? hoveredFeatureIndex : -1
      );
      const isHoverTarget = hoveredFeatureArrayIndex !== void 0 && ((_c = featureActivations[tokenIndex]) == null ? void 0 : _c[hoveredFeatureArrayIndex]) !== void 0;
      const boxStyle = {
        ...styles.selectedTokenInfoBox,
        backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
      };
      if (isCompactView && !showTokenFeatures) {
        return /* @__PURE__ */ import_react13.default.createElement(
          "div",
          {
            key: tokenIndex,
            style: styles.selectedTokenInfoBoxCompactTile
          },
          /* @__PURE__ */ import_react13.default.createElement("span", null, /* @__PURE__ */ import_react13.default.createElement("strong", null, "T", tokenIndex, ":"), ' "', processedTokens[tokenIndex].substring(0, 10), '"', processedTokens[tokenIndex].length > 10 ? "..." : ""),
          hoveredFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                padding: "0 2px",
                height: "1.3em",
                minWidth: "2em",
                fontSize: "0.8em",
                backgroundColor: getFeatureActivationColor(
                  hoveredFeatureIndex,
                  tokenIndex
                ),
                color: getFeatureActivationTextColor(
                  getFeatureActivationColor(
                    hoveredFeatureIndex,
                    tokenIndex
                  )
                )
              },
              title: `Feature ${hoveredFeatureIndex}: ${getFeatureActivationValue(
                hoveredFeatureIndex,
                tokenIndex
              )}`
            },
            getFeatureActivationValue(
              hoveredFeatureIndex,
              tokenIndex
            )
          ),
          hoveredFeatureIndex === null && selectedFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                padding: "0 2px",
                height: "1.3em",
                minWidth: "2em",
                fontSize: "0.8em",
                backgroundColor: indicatorColorSelected,
                color: indicatorTextColorSelected
              },
              title: `Feature ${selectedDisplayID != null ? selectedDisplayID : "?"}: ${displayValueSelected}`
            },
            displayValueSelected
          ),
          hoveredFeatureIndex === null && selectedFeatureIndex === null && /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                padding: "0 2px",
                height: "1.3em",
                minWidth: "2em",
                fontSize: "0.8em"
              }
            },
            "N/A"
          ),
          /* @__PURE__ */ import_react13.default.createElement(
            "button",
            {
              onClick: () => handleDeselectToken(tokenIndex),
              style: {
                ...styles.selectedItemCloseButton,
                position: "static",
                fontSize: "1em",
                padding: "0 2px"
              },
              title: "Deselect Token"
            },
            "\xD7"
          )
        );
      }
      if (isCompactView) {
        return /* @__PURE__ */ import_react13.default.createElement("div", { key: tokenIndex, style: boxStyle }, /* @__PURE__ */ import_react13.default.createElement(
          "button",
          {
            onClick: () => handleDeselectToken(tokenIndex),
            style: styles.selectedItemCloseButton,
            title: "Deselect Token"
          },
          "\xD7"
        ), /* @__PURE__ */ import_react13.default.createElement("strong", null, "Token ", tokenIndex, ': "', processedTokens[tokenIndex], '"'), /* @__PURE__ */ import_react13.default.createElement(
          "div",
          {
            style: {
              marginTop: "5px",
              paddingTop: "5px",
              borderTop: `1px dashed ${styles.container.borderColor}`
            }
          },
          hoveredFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Feature ", hoveredFeatureIndex, ":", " "), /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                backgroundColor: getFeatureActivationColor(
                  hoveredFeatureIndex,
                  tokenIndex
                ),
                color: getFeatureActivationTextColor(
                  getFeatureActivationColor(
                    hoveredFeatureIndex,
                    tokenIndex
                  )
                )
              },
              title: `Value: ${getFeatureActivationValue(
                hoveredFeatureIndex,
                tokenIndex
              )}`
            },
            getFeatureActivationValue(
              hoveredFeatureIndex,
              tokenIndex
            )
          )),
          hoveredFeatureIndex === null && selectedFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Feature ", selectedDisplayID != null ? selectedDisplayID : "?", ":", " "), /* @__PURE__ */ import_react13.default.createElement(
            "span",
            {
              style: {
                ...styles.featureValueIndicator,
                backgroundColor: indicatorColorSelected,
                color: indicatorTextColorSelected
              },
              title: `Value: ${displayValueSelected}`
            },
            displayValueSelected
          )),
          hoveredFeatureIndex === null && selectedFeatureIndex === null && /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Hover over a feature to see values")
        ));
      }
      return /* @__PURE__ */ import_react13.default.createElement("div", { key: tokenIndex, style: boxStyle }, /* @__PURE__ */ import_react13.default.createElement(
        "button",
        {
          onClick: () => handleDeselectToken(tokenIndex),
          style: styles.selectedItemCloseButton,
          title: "Deselect Token"
        },
        "\xD7"
      ), /* @__PURE__ */ import_react13.default.createElement("strong", null, "Token ", tokenIndex, ': "', processedTokens[tokenIndex], '"'), /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          style: {
            marginTop: "3px"
          }
        },
        hoveredFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Feature ", hoveredFeatureIndex, ":", " "), /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              ...styles.featureValueIndicator,
              backgroundColor: getFeatureActivationColor(
                hoveredFeatureIndex,
                tokenIndex
              ),
              color: getFeatureActivationTextColor(
                getFeatureActivationColor(
                  hoveredFeatureIndex,
                  tokenIndex
                )
              )
            },
            title: `Value: ${getFeatureActivationValue(
              hoveredFeatureIndex,
              tokenIndex
            )}`
          },
          getFeatureActivationValue(
            hoveredFeatureIndex,
            tokenIndex
          )
        )),
        hoveredFeatureIndex === null && selectedFeatureIndex !== null && /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Feature ", selectedDisplayID != null ? selectedDisplayID : "?", ":", " "), /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              ...styles.featureValueIndicator,
              backgroundColor: indicatorColorSelected,
              color: indicatorTextColorSelected
            },
            title: `Value: ${displayValueSelected}`
          },
          displayValueSelected
        )),
        hoveredFeatureIndex === null && selectedFeatureIndex === null && /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.dynamicInfoLabel }, "Hover over a feature to see values")
      ), showTokenFeatures && /* @__PURE__ */ import_react13.default.createElement(
        "div",
        {
          style: {
            marginTop: "5px",
            paddingTop: "5px",
            borderTop: `1px dashed ${styles.container.borderColor}`
          },
          title: `Showing top ${numTokenToShow} features with abs activation >= ${currentThreshold != null ? currentThreshold : 0}`
        },
        /* @__PURE__ */ import_react13.default.createElement("strong", null, "Top Features:"),
        getTopFeaturesForToken(
          tokenIndex,
          featureActivations,
          featureLabels,
          featureIDs,
          numTokenToShow,
          currentThreshold
        ).length === 0 && /* @__PURE__ */ import_react13.default.createElement("div", null, "(None above threshold)"),
        getTopFeaturesForToken(
          tokenIndex,
          featureActivations,
          featureLabels,
          featureIDs,
          numTokenToShow,
          currentThreshold
        ).map((feat) => /* @__PURE__ */ import_react13.default.createElement("div", { key: feat.index }, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.featureListIndexValue }, `Feature ${feat.index}: ${feat.activation.toFixed(
          3
        )}`), " ", /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: {
              ...styles.featureListDescription,
              cursor: "pointer"
            },
            className: "feature-list-item-clickable",
            onClick: () => handleTokenTooltipFeatureClick(feat.index),
            onMouseEnter: (e) => {
              e.target.style.textDecoration = "underline";
            },
            onMouseLeave: (e) => {
              e.target.style.textDecoration = "none";
            },
            title: `Select Feature ${feat.index} for coloring/multi-select`
          },
          "- ",
          feat.label.substring(0, 60),
          feat.label.length > 60 ? "..." : ""
        )))
      ));
    }))
  ), /* @__PURE__ */ import_react13.default.createElement("div", { style: styles.tokenSequence }, processedTokens.map((token, index) => {
    var _a2, _b, _c, _d, _e;
    const isHovered = hoveredTokenIndex === index;
    const isClicked = isTokenSelected(index);
    const isMultiSegment = isMultiSegmentMode;
    const isMultiMax = isMultiMaximizeMode;
    let tokenStyle = { ...styles.token };
    let innerContent = token;
    const hasHookRightArrow = typeof token === "string" && /[↵]/.test(token);
    if (hoveredFeatureIndex !== null) {
      const hoveredArrayIndex = featureIdToArrayIndexMap.get(
        hoveredFeatureIndex != null ? hoveredFeatureIndex : -1
      );
      if (hoveredArrayIndex !== void 0) {
        const act = (_b = (_a2 = featureActivations[index]) == null ? void 0 : _a2[hoveredArrayIndex]) != null ? _b : 0;
        const scale = singleColorScale;
        const bgColor = scale(act);
        const textColor = getLuminance(bgColor) > 0.5 ? themes.light.text : themes.dark.text;
        const isDimmed = currentThreshold !== null && act !== 0 && Math.abs(act) < currentThreshold;
        tokenStyle = {
          ...tokenStyle,
          backgroundColor: bgColor,
          color: textColor,
          opacity: isDimmed ? 0.5 : 1
        };
      } else {
        console.warn(
          "Could not find array index for hovered feature:",
          hoveredFeatureIndex
        );
      }
    } else if (isMultiSegment) {
      const numSegments = selectedFeatureIndices.length;
      const segmentHeight = 100 / numSegments;
      const backgroundSegments = selectedFeatureIndices.map(
        (featIndex) => {
          var _a3, _b2;
          const currentArrayIndex = featureIdToArrayIndexMap.get(featIndex);
          if (currentArrayIndex === void 0) {
            console.warn(
              "Could not find array index for selected feature:",
              featIndex
            );
            return null;
          }
          const act = (_b2 = (_a3 = featureActivations[index]) == null ? void 0 : _a3[currentArrayIndex]) != null ? _b2 : 0;
          const scale = featureScales[currentArrayIndex];
          const bgColor = scale ? scale(act) : "transparent";
          const segmentStyle = {
            height: `${segmentHeight}%`,
            width: "100%",
            backgroundColor: bgColor
          };
          return /* @__PURE__ */ import_react13.default.createElement("div", { key: featIndex, style: segmentStyle });
        }
      );
      tokenStyle = {
        ...tokenStyle,
        display: "inline",
        position: "relative",
        backgroundColor: "transparent",
        color: theme.text
      };
      innerContent = /* @__PURE__ */ import_react13.default.createElement(
        "span",
        {
          style: {
            position: "relative",
            display: "inline-block",
            verticalAlign: "bottom"
          }
        },
        /* @__PURE__ */ import_react13.default.createElement(
          "div",
          {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              zIndex: 0
            }
          },
          backgroundSegments
        ),
        /* @__PURE__ */ import_react13.default.createElement(
          "span",
          {
            style: { ...styles.tokenTextOverlay, position: "relative" }
          },
          typeof token === "string" ? token.replace(/\n/g, "\u21B5") : ""
        )
      );
    } else if (isMultiMax) {
      const maxActInfo = selectedFeatureIndices.reduce(
        (maxInfo, currentFeatIndex) => {
          var _a3, _b2;
          const currentArrayIndex = featureIdToArrayIndexMap.get(currentFeatIndex);
          if (currentArrayIndex === void 0) {
            console.warn(
              "Could not find array index for selected feature:",
              currentFeatIndex
            );
            return maxInfo;
          }
          const currentVal = (_b2 = (_a3 = featureActivations[index]) == null ? void 0 : _a3[currentArrayIndex]) != null ? _b2 : 0;
          if (Math.abs(currentVal) > maxInfo.maxAbs) {
            return {
              index: currentFeatIndex,
              value: currentVal,
              maxAbs: Math.abs(currentVal)
            };
          }
          return maxInfo;
        },
        { index: -1, value: 0, maxAbs: -Infinity }
      );
      const maxActArrayIndex = featureIdToArrayIndexMap.get(
        (_c = maxActInfo.index) != null ? _c : -1
      );
      const scale = maxActArrayIndex !== void 0 ? featureScales[maxActArrayIndex] : null;
      const bgColor = scale ? scale(maxActInfo.value) : "transparent";
      const textColor = getLuminance(bgColor) > 0.5 ? themes.light.text : themes.dark.text;
      tokenStyle = {
        ...tokenStyle,
        backgroundColor: bgColor,
        color: textColor
      };
    } else {
      const currentActiveArrayIndex = featureIdToArrayIndexMap.get(
        coloringFeatureIndex != null ? coloringFeatureIndex : -1
      );
      if (currentActiveArrayIndex !== void 0) {
        const act = (_e = (_d = featureActivations[index]) == null ? void 0 : _d[currentActiveArrayIndex]) != null ? _e : 0;
        const bgColor = coloringFeatureIndex !== null ? singleColorScale(act) : styles.container.backgroundColor || "transparent";
        const textColor = getLuminance(bgColor) > 0.5 ? themes.light.text : themes.dark.text;
        const isDimmed = coloringFeatureIndex !== null && currentThreshold !== null && act !== 0 && Math.abs(act) < currentThreshold;
        tokenStyle = {
          ...tokenStyle,
          backgroundColor: bgColor,
          color: textColor,
          opacity: isDimmed ? 0.5 : 1
        };
      } else {
        tokenStyle = {
          ...tokenStyle,
          backgroundColor: styles.container.backgroundColor || "transparent",
          color: theme.text
        };
      }
    }
    if (isHovered && !isClicked) {
      tokenStyle = { ...tokenStyle, ...styles.tokenHover };
    }
    if (isClicked) {
      tokenStyle = { ...tokenStyle, ...styles.tokenClicked };
    }
    return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, { key: index }, /* @__PURE__ */ import_react13.default.createElement(
      "span",
      {
        style: tokenStyle,
        onMouseEnter: (e) => handleTokenMouseEnter(index, e),
        onMouseLeave: handleTokenMouseLeave,
        onClick: () => handleTokenClick(index),
        title: token.includes("\n") ? token.replace(/\n/g, "\u21B5") : void 0
      },
      typeof innerContent === "string" ? innerContent.replace(/\n/g, "\u21B5") : innerContent
    ), hasHookRightArrow && /* @__PURE__ */ import_react13.default.createElement("br", null));
  })), hoverTokenTooltipData && /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: {
        ...styles.tooltip,
        left: `${hoverTokenTooltipData.position.x}px`,
        top: `${hoverTokenTooltipData.position.y}px`
      }
    },
    /* @__PURE__ */ import_react13.default.createElement("strong", null, "Token ", hoverTokenTooltipData.tokenIndex, ': "', processedTokens[hoverTokenTooltipData.tokenIndex], '"'),
    hoverTokenTooltipData.selectedFeatureValue !== null && /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          marginTop: "5px",
          borderTop: "1px dashed #ccc",
          paddingTop: "5px"
        }
      },
      "Selected Feature ",
      selectedFeatureIndex,
      ":",
      " ",
      hoverTokenTooltipData.selectedFeatureValue.toPrecision(3)
    ),
    /* @__PURE__ */ import_react13.default.createElement("br", null),
    /* @__PURE__ */ import_react13.default.createElement(
      "strong",
      {
        title: `Showing top ${numTokenToShow} features with abs activation >= ${currentThreshold != null ? currentThreshold : 0}`
      },
      "Top Features:"
    ),
    hoverTokenTooltipData.topFeatures.length === 0 && /* @__PURE__ */ import_react13.default.createElement("div", null, "(None above threshold)"),
    hoverTokenTooltipData.topFeatures.map((feat) => /* @__PURE__ */ import_react13.default.createElement("div", { key: feat.index }, /* @__PURE__ */ import_react13.default.createElement("span", { style: styles.featureListIndexValue }, `Feature ${feat.index}: ${feat.activation.toFixed(3)}`), /* @__PURE__ */ import_react13.default.createElement(
      "span",
      {
        style: {
          ...styles.featureListDescription,
          cursor: "pointer"
        },
        className: "feature-list-item-clickable",
        onClick: () => handleTokenTooltipFeatureClick(feat.index),
        onMouseEnter: (e) => {
          e.target.style.textDecoration = "underline";
        },
        onMouseLeave: (e) => {
          e.target.style.textDecoration = "none";
        },
        title: `Select Feature ${feat.index} for coloring/multi-select`
      },
      "- ",
      feat.label.substring(0, 60),
      feat.label.length > 60 ? "..." : ""
    )))
  ), isCompactView && focusedFeatureInfo && /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      style: {
        ...styles.tooltip,
        position: "absolute",
        left: `${focusedFeatureInfo.position.x}px`,
        top: `${focusedFeatureInfo.position.y}px`,
        ...focusedFeatureInfo.isClick ? styles.tooltipSticky : {}
      }
    },
    focusedFeatureInfo.isClick && /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        onClick: closeFeatureInfoTooltip,
        style: styles.tooltipCloseButton,
        title: "Close Feature Info"
      },
      "\xD7"
    ),
    /* @__PURE__ */ import_react13.default.createElement("strong", null, "Feature ", focusedFeatureInfo.index),
    /* @__PURE__ */ import_react13.default.createElement("div", { style: { marginTop: "5px" } }, /* @__PURE__ */ import_react13.default.createElement("strong", null, "Label:"), " ", focusedFeatureInfo.label),
    /* @__PURE__ */ import_react13.default.createElement(
      "div",
      {
        style: {
          marginTop: "5px",
          paddingTop: "5px",
          borderTop: "1px dashed #ccc"
        }
      },
      /* @__PURE__ */ import_react13.default.createElement("strong", null, "Stats:"),
      /* @__PURE__ */ import_react13.default.createElement("div", null, "Max: ", focusedFeatureInfo.maxActivation.toPrecision(3)),
      /* @__PURE__ */ import_react13.default.createElement("div", null, "L1: ", focusedFeatureInfo.meanAbsActivation.toPrecision(3)),
      /* @__PURE__ */ import_react13.default.createElement("div", null, "L0: ", focusedFeatureInfo.nonZeroCount)
    )
  ));
};

// src/examples/Hello.tsx
var import_react14 = __toESM(require("../../node_modules/react/index.js"));
function Hello({ name }) {
  return /* @__PURE__ */ import_react14.default.createElement("p", null, "Hello, ", name, "!");
}

// src/logits/TokenLogProbs.tsx
var import_react16 = __toESM(require("../../node_modules/react/index.js"));
var import_colord5 = require("../../node_modules/colord/index.mjs");
var import_mix2 = __toESM(require("../../node_modules/colord/plugins/mix.mjs"));
var import_names2 = __toESM(require("../../node_modules/colord/plugins/names.mjs"));

// src/tokens/utils/TokenCustomTooltip.tsx
var import_react15 = __toESM(require("../../node_modules/react/index.js"));
var import_colord4 = require("../../node_modules/colord/index.mjs");
var import_react_popper_tooltip2 = require("../../node_modules/react-popper-tooltip/dist/cjs/react-popper-tooltip.js");
function TokenCustomTooltip({
  token,
  value,
  min,
  max,
  negativeColor,
  positiveColor,
  tooltip = /* @__PURE__ */ import_react15.default.createElement(import_react15.default.Fragment, null, "Intentionally Left Blank")
}) {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = (0, import_react_popper_tooltip2.usePopperTooltip)({
    followCursor: true
  });
  const backgroundColor = getTokenBackgroundColor(
    value,
    min,
    max,
    negativeColor,
    positiveColor
  ).toRgbString();
  const textColor = (0, import_colord4.colord)(backgroundColor).brightness() < 0.6 ? "white" : "black";
  const spanStyle = {
    display: "inline-block",
    backgroundColor,
    color: textColor,
    lineHeight: "1em",
    padding: "3px 0",
    marginLeft: -1,
    marginBottom: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee"
  };
  const tokenReplaceLineBreaks = formatTokenText(token);
  const lineBreakElements = token.match(/\n/g);
  return /* @__PURE__ */ import_react15.default.createElement(import_react15.default.Fragment, null, /* @__PURE__ */ import_react15.default.createElement("span", { ref: setTriggerRef }, /* @__PURE__ */ import_react15.default.createElement(
    "span",
    {
      style: spanStyle,
      dangerouslySetInnerHTML: { __html: tokenReplaceLineBreaks }
    }
  ), lineBreakElements == null ? void 0 : lineBreakElements.map((_break, idx) => /* @__PURE__ */ import_react15.default.createElement("br", { key: idx }))), visible && /* @__PURE__ */ import_react15.default.createElement(
    "div",
    {
      ref: setTooltipRef,
      ...getTooltipProps({
        style: {
          background: "#eee",
          color: "black",
          textAlign: "center",
          padding: 10,
          borderRadius: 5,
          boxShadow: "5px 5px rgba(0, 0, 0, 0.03)",
          marginTop: 15
        }
      })
    },
    tooltip
  ));
}

// src/logits/TokenLogProbs.tsx
(0, import_colord5.extend)([import_mix2.default, import_names2.default]);
var maxLogProb = 5;
function logProbToColor(logProb, color = "blue", min = -maxLogProb) {
  return (0, import_colord5.colord)(color).mix((0, import_colord5.colord)("grey"), Math.min(-logProb / -min, 1));
}
function SimpleToken({ token }) {
  return /* @__PURE__ */ import_react16.default.createElement(
    "span",
    {
      style: { borderColor: "green", borderWidth: 1, borderStyle: "solid" },
      dangerouslySetInnerHTML: { __html: formatTokenText(token) }
    }
  );
}
function TooltipTableRow({
  token,
  logProb,
  rank,
  isCorrectToken
}) {
  const correctTokenStyle = {
    color: "orange",
    backgroundColor: logProbToColor(logProb).toRgbString(),
    fontWeight: "bold"
  };
  const incorrectTokenStyle = {
    color: "white",
    backgroundColor: logProbToColor(logProb).toRgbString()
  };
  return /* @__PURE__ */ import_react16.default.createElement("tr", { style: isCorrectToken ? correctTokenStyle : incorrectTokenStyle }, /* @__PURE__ */ import_react16.default.createElement("td", null, "#", rank), /* @__PURE__ */ import_react16.default.createElement("td", null, (Math.exp(logProb) * 100).toFixed(2), "%"), /* @__PURE__ */ import_react16.default.createElement("td", null, logProb.toFixed(3)), /* @__PURE__ */ import_react16.default.createElement("td", null, /* @__PURE__ */ import_react16.default.createElement(SimpleToken, { token })));
}
function Tooltip2({
  currentCorrectToken,
  currentCorrectTokenRank,
  currentCorrectTokenLogProb,
  currentTopKLogProbs,
  currentTopKTokens,
  prevToken
}) {
  return /* @__PURE__ */ import_react16.default.createElement("div", null, /* @__PURE__ */ import_react16.default.createElement(
    "div",
    {
      style: {
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: "white",
        color: "black"
      }
    },
    /* @__PURE__ */ import_react16.default.createElement(SimpleToken, { token: prevToken }),
    " -",
    ">",
    " ",
    /* @__PURE__ */ import_react16.default.createElement(SimpleToken, { token: currentCorrectToken })
  ), /* @__PURE__ */ import_react16.default.createElement("table", null, /* @__PURE__ */ import_react16.default.createElement("tr", null, /* @__PURE__ */ import_react16.default.createElement("th", null, "Rank"), /* @__PURE__ */ import_react16.default.createElement("th", null, "Prob"), /* @__PURE__ */ import_react16.default.createElement("th", null, "Log Prob"), /* @__PURE__ */ import_react16.default.createElement("th", null, "String")), /* @__PURE__ */ import_react16.default.createElement(
    TooltipTableRow,
    {
      token: currentCorrectToken,
      logProb: currentCorrectTokenLogProb,
      rank: currentCorrectTokenRank,
      isCorrectToken: true
    }
  ), /* @__PURE__ */ import_react16.default.createElement("hr", null), currentTopKTokens.map((_token, i) => /* @__PURE__ */ import_react16.default.createElement(
    TooltipTableRow,
    {
      key: i,
      token: currentTopKTokens[i],
      logProb: currentTopKLogProbs[i],
      rank: i,
      isCorrectToken: currentCorrectTokenRank === i
    }
  ))));
}
function TokenLogProbs({
  prompt,
  topKLogProbs,
  topKTokens,
  correctTokenRank,
  correctTokenLogProb
}) {
  return /* @__PURE__ */ import_react16.default.createElement("div", { style: { paddingBottom: 350 } }, prompt.slice(1).map((token, i) => /* @__PURE__ */ import_react16.default.createElement(
    TokenCustomTooltip,
    {
      key: i,
      token,
      value: Math.max(maxLogProb + correctTokenLogProb[i], 0),
      min: -0.1,
      max: maxLogProb,
      positiveColor: "red",
      tooltip: /* @__PURE__ */ import_react16.default.createElement(
        Tooltip2,
        {
          currentCorrectToken: token,
          currentCorrectTokenRank: correctTokenRank[i],
          currentCorrectTokenLogProb: correctTokenLogProb[i],
          currentTopKLogProbs: topKLogProbs[i],
          currentTopKTokens: topKTokens[i],
          prevToken: prompt[i]
        }
      )
    }
  )));
}

// src/render-helper.ts
var import_react17 = __toESM(require("../../node_modules/react/index.js"));
var import_client = __toESM(require("../../node_modules/react-dom/client.js"));
function render(divID, circuitsVisElement, props = {}) {
  const div = document.querySelector(`#${divID}`);
  const root = import_client.default.createRoot(div);
  const element = import_react17.default.createElement(circuitsVisElement, props);
  root.render(element);
}

// src/tokens/ColoredTokensMulti.tsx
var import_tfjs5 = require("../../node_modules/@tensorflow/tfjs/dist/tf.node.js");
var import_react19 = __toESM(require("../../node_modules/react/index.js"));

// src/tokens/ColoredTokensCustomTooltips.tsx
var import_react18 = __toESM(require("../../node_modules/react/index.js"));
function ColoredTokensCustomTooltips({
  maxValue,
  minValue,
  negativeColor,
  positiveColor,
  tokens,
  values,
  tooltips
}) {
  const tokenMin = minValue != null ? minValue : Math.min(...values);
  const tokenMax = maxValue != null ? maxValue : Math.max(...values);
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: "colored-tokens", style: { paddingBottom: 30 } }, tokens.map((token, key) => /* @__PURE__ */ import_react18.default.createElement(
    TokenCustomTooltip,
    {
      key,
      token,
      value: values[key],
      min: tokenMin,
      max: tokenMax,
      negativeColor,
      positiveColor,
      tooltip: tooltips[key]
    }
  )));
}

// src/tokens/ColoredTokensMulti.tsx
var PRECISION = 6;
function ValueSelector({
  values,
  labels,
  selectedValue,
  setSelectedValue
}) {
  const numValues = values.shape[1];
  const {
    focused: focusedValue,
    onClick: onClickValue,
    onMouseEnter: onMouseEnterValue,
    onMouseLeave: onMouseLeaveValue
  } = useHoverLock();
  (0, import_react19.useEffect)(() => {
    if (focusedValue !== null) {
      setSelectedValue(focusedValue);
    }
  }, [focusedValue, setSelectedValue]);
  const valueSelectors = [];
  for (let i = 0; i < numValues; i++) {
    const isSelected = i === selectedValue;
    const label = labels[i];
    valueSelectors.push(
      /* @__PURE__ */ import_react19.default.createElement(
        "div",
        {
          key: i,
          style: {
            display: "inline-block",
            padding: "0 5px",
            backgroundColor: isSelected ? "black" : "white",
            color: isSelected ? "white" : "black",
            cursor: "pointer"
          },
          onClick: () => onClickValue(i),
          onMouseEnter: () => onMouseEnterValue(i),
          onMouseLeave: onMouseLeaveValue
        },
        label
      )
    );
  }
  return /* @__PURE__ */ import_react19.default.createElement("div", null, valueSelectors);
}
function NumberInput({
  value,
  setValue,
  defaultValue,
  label
}) {
  const handleInputChange = (event) => {
    setValue(parseFloat(event.target.value));
  };
  const handleButtonClick = () => {
    setValue(defaultValue);
  };
  return /* @__PURE__ */ import_react19.default.createElement("div", null, /* @__PURE__ */ import_react19.default.createElement("label", { htmlFor: label }, label, ":"), " ", /* @__PURE__ */ import_react19.default.createElement(
    "input",
    {
      type: "text",
      id: "number",
      value,
      onChange: handleInputChange
    }
  ), defaultValue && /* @__PURE__ */ import_react19.default.createElement("button", { type: "button", onClick: handleButtonClick }, "Reset"));
}
function Tooltip3({
  title,
  labels,
  values,
  tokenIndex,
  currentValueIndex
}) {
  const numValues = values.shape[1];
  const valueRows = [];
  for (let i = 0; i < numValues; i++) {
    valueRows.push(
      /* @__PURE__ */ import_react19.default.createElement("tr", { key: i }, /* @__PURE__ */ import_react19.default.createElement("td", { style: { fontWeight: "bold" } }, labels[i]), /* @__PURE__ */ import_react19.default.createElement(
        "td",
        {
          style: {
            textAlign: "right",
            fontWeight: currentValueIndex === i ? "bold" : "normal"
          }
        },
        values.bufferSync().get(tokenIndex, i).toFixed(PRECISION)
      ))
    );
  }
  return /* @__PURE__ */ import_react19.default.createElement(import_react19.default.Fragment, null, /* @__PURE__ */ import_react19.default.createElement(
    "div",
    {
      style: { fontWeight: "bold", fontSize: 16, backgroundColor: "white" }
    },
    title
  ), /* @__PURE__ */ import_react19.default.createElement("table", null, /* @__PURE__ */ import_react19.default.createElement("tbody", null, valueRows)));
}
function ColoredTokensMulti({
  tokens,
  values,
  labels,
  positiveBounds,
  negativeBounds
}) {
  const valuesTensor = (0, import_tfjs5.tensor)(values);
  const numValues = valuesTensor.shape[1];
  const positiveBoundsTensor = positiveBounds ? (0, import_tfjs5.tensor)(positiveBounds) : valuesTensor.max(0).maximum(1e-7);
  const negativeBoundsTensor = negativeBounds ? (0, import_tfjs5.tensor)(negativeBounds) : valuesTensor.min(0).minimum(-1e-7);
  const valueLabels = labels || Array.from(Array(numValues).keys()).map((_, i) => `${i}`);
  const [displayedValueIndex, setDisplayedValueIndex] = (0, import_react19.useState)(0);
  const defaultPositiveBound = Number(
    positiveBoundsTensor.arraySync()[displayedValueIndex].toFixed(PRECISION)
  );
  const defaultNegativeBound = Number(
    negativeBoundsTensor.arraySync()[displayedValueIndex].toFixed(PRECISION)
  );
  const [positiveBound, setOverridePositiveBound] = (0, import_react19.useState)(
    Number(defaultPositiveBound)
  );
  const [negativeBound, setOverrideNegativeBound] = (0, import_react19.useState)(
    Number(defaultNegativeBound)
  );
  const displayedValues = valuesTensor.slice([0, displayedValueIndex], [-1, 1]).squeeze([1]);
  return /* @__PURE__ */ import_react19.default.createElement("div", { style: { paddingBottom: 20 * numValues } }, /* @__PURE__ */ import_react19.default.createElement(
    ValueSelector,
    {
      values: valuesTensor,
      labels: valueLabels,
      selectedValue: displayedValueIndex,
      setSelectedValue: setDisplayedValueIndex
    }
  ), /* @__PURE__ */ import_react19.default.createElement(
    NumberInput,
    {
      value: positiveBound,
      setValue: setOverridePositiveBound,
      defaultValue: defaultPositiveBound,
      label: "Positive Bound"
    }
  ), /* @__PURE__ */ import_react19.default.createElement(
    NumberInput,
    {
      value: negativeBound,
      setValue: setOverrideNegativeBound,
      defaultValue: defaultNegativeBound,
      label: "Negative Bound"
    }
  ), /* @__PURE__ */ import_react19.default.createElement("br", null), /* @__PURE__ */ import_react19.default.createElement(
    ColoredTokensCustomTooltips,
    {
      tokens,
      values: displayedValues.arraySync(),
      maxValue: positiveBound,
      minValue: negativeBound,
      tooltips: displayedValues.arraySync().map((_val, i) => /* @__PURE__ */ import_react19.default.createElement(
        Tooltip3,
        {
          key: i,
          title: tokens[i],
          labels: valueLabels,
          values: valuesTensor,
          tokenIndex: i,
          currentValueIndex: displayedValueIndex
        }
      ))
    }
  ));
}

// src/topk/TopkSamples.tsx
var import_react20 = __toESM(require("../../node_modules/react/index.js"));
var import_react_grid_system5 = require("../../node_modules/react-grid-system/build/index.js");
function TopkSamples({
  tokens,
  activations,
  zerothDimensionName = "Layer",
  firstDimensionName = "Neuron",
  zerothDimensionLabels,
  firstDimensionLabels
}) {
  const numberOfLayers = activations.length;
  const numberOfNeurons = activations[0].length;
  const numberOfSamples = activations[0][0].length;
  const [samplesPerPage, setSamplesPerPage] = (0, import_react20.useState)(
    Math.min(5, numberOfSamples)
  );
  const [sampleNumbers, setSampleNumbers] = (0, import_react20.useState)([
    ...Array(samplesPerPage).keys()
  ]);
  const [layerNumber, setLayerNumber] = (0, import_react20.useState)(0);
  const [neuronNumber, setNeuronNumber] = (0, import_react20.useState)(0);
  (0, import_react20.useEffect)(() => {
    setSampleNumbers([...Array(samplesPerPage).keys()]);
  }, [samplesPerPage]);
  const selectedActivations = sampleNumbers.map((sampleNumber) => {
    return activations[layerNumber][neuronNumber][sampleNumber];
  });
  const selectedTokens = sampleNumbers.map((sampleNumber) => {
    return tokens[layerNumber][neuronNumber][sampleNumber];
  });
  const [minValue, maxValue] = minMaxInNestedArray(
    activations[layerNumber][neuronNumber]
  );
  const selectRowStyle = {
    paddingTop: 5,
    paddingBottom: 5
  };
  return /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Container, { fluid: true }, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, null, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement("label", { htmlFor: "layer-selector", style: { marginRight: 15 } }, zerothDimensionName, ":"), /* @__PURE__ */ import_react20.default.createElement(
    NumberSelector,
    {
      id: "layer-selector",
      largestNumber: numberOfLayers - 1,
      currentValue: layerNumber,
      setCurrentValue: setLayerNumber,
      labels: zerothDimensionLabels
    }
  ))), /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } }, firstDimensionName, ":"), /* @__PURE__ */ import_react20.default.createElement(
    NumberSelector,
    {
      id: "neuron-selector",
      largestNumber: numberOfNeurons - 1,
      currentValue: neuronNumber,
      setCurrentValue: setNeuronNumber,
      labels: firstDimensionLabels
    }
  ))), numberOfSamples > 1 && /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Samples (descending):"), /* @__PURE__ */ import_react20.default.createElement(
    RangeSelector,
    {
      id: "sample-selector",
      largestNumber: numberOfSamples - 1,
      currentRangeArr: sampleNumbers,
      setCurrentValue: setSampleNumbers,
      numValsInRange: samplesPerPage
    }
  )))), /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, numberOfSamples > 1 && /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement(
    "label",
    {
      htmlFor: "samples-per-page-selector",
      style: { marginRight: 15 }
    },
    "Samples per page:"
  ), /* @__PURE__ */ import_react20.default.createElement(
    NumberSelector,
    {
      id: "samples-per-page-selector",
      smallestNumber: 1,
      largestNumber: numberOfSamples,
      currentValue: samplesPerPage,
      setCurrentValue: setSamplesPerPage
    }
  ))))), /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Row, null, /* @__PURE__ */ import_react20.default.createElement(import_react_grid_system5.Col, null, /* @__PURE__ */ import_react20.default.createElement(
    SampleItems,
    {
      activationsList: selectedActivations,
      tokensList: selectedTokens,
      minValue,
      maxValue
    }
  ))));
}

// src/topk/TopkTokens.tsx
var import_react21 = __toESM(require("../../node_modules/react/index.js"));
var import_react_grid_system6 = require("../../node_modules/react-grid-system/build/index.js");
var import_react_popper_tooltip3 = require("../../node_modules/react-popper-tooltip/dist/cjs/react-popper-tooltip.js");
var import_colord6 = require("../../node_modules/colord/index.mjs");
function TokenCell({
  tdKey,
  token,
  value,
  minValue,
  maxValue,
  negativeColor,
  positiveColor
}) {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = (0, import_react_popper_tooltip3.usePopperTooltip)({
    followCursor: true
  });
  const backgroundColor = getTokenBackgroundColor(
    value,
    minValue,
    maxValue,
    negativeColor,
    positiveColor
  ).toRgbString();
  const textColor = (0, import_colord6.colord)(backgroundColor).brightness() < 0.6 ? "white" : "black";
  const tokenReplaceSpaces = token.replace(/\s/g, "&nbsp;");
  const tokenReplaceLineBreaks = tokenReplaceSpaces.replace(/\n/g, "\xB6");
  return /* @__PURE__ */ import_react21.default.createElement(
    "td",
    {
      key: tdKey,
      style: {
        backgroundColor,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "black"
      }
    },
    /* @__PURE__ */ import_react21.default.createElement(
      "span",
      {
        ref: setTriggerRef,
        style: { display: "block", color: textColor },
        dangerouslySetInnerHTML: { __html: tokenReplaceLineBreaks }
      }
    ),
    visible && /* @__PURE__ */ import_react21.default.createElement(
      "div",
      {
        ref: setTooltipRef,
        ...getTooltipProps({
          style: {
            background: "#333",
            color: "white",
            textAlign: "center",
            padding: 10,
            borderRadius: 5,
            boxShadow: "5px 5px rgba(0, 0, 0, 0.03)",
            marginTop: 15,
            zIndex: 1
          }
        })
      },
      /* @__PURE__ */ import_react21.default.createElement("strong", null, token),
      /* @__PURE__ */ import_react21.default.createElement("br", null),
      value
    )
  );
}
function TopBottomKTable({
  topkActivations,
  bottomkActivations,
  topkTokens,
  bottomkTokens,
  neuronNumbers,
  filter,
  colLabel
}) {
  return /* @__PURE__ */ import_react21.default.createElement("table", { style: { marginTop: 15, marginLeft: 15 } }, /* @__PURE__ */ import_react21.default.createElement("thead", null, /* @__PURE__ */ import_react21.default.createElement("tr", null, /* @__PURE__ */ import_react21.default.createElement(
    "th",
    {
      colSpan: neuronNumbers.length + 1,
      style: { textAlign: "center", paddingLeft: "9ch" }
    },
    colLabel
  )), /* @__PURE__ */ import_react21.default.createElement("tr", null, /* @__PURE__ */ import_react21.default.createElement("th", { key: "default", style: { textAlign: "center" } }), neuronNumbers.map((neuronNumber) => /* @__PURE__ */ import_react21.default.createElement("th", { key: neuronNumber, style: { textAlign: "center" } }, neuronNumber)))), /* @__PURE__ */ import_react21.default.createElement("tbody", null, filter.includes("topk") && topkActivations.map((activations, tokenIdx) => /* @__PURE__ */ import_react21.default.createElement("tr", { key: tokenIdx }, tokenIdx === 0 && /* @__PURE__ */ import_react21.default.createElement(
    "td",
    {
      key: "default",
      style: { textAlign: "center", fontWeight: "bold" },
      rowSpan: topkActivations.length
    },
    "Topk \u2193"
  ), activations.map((activation, neuronIdx) => /* @__PURE__ */ import_react21.default.createElement(
    TokenCell,
    {
      key: neuronIdx,
      tdKey: neuronIdx,
      token: topkTokens[tokenIdx][neuronIdx],
      value: activation,
      minValue: 0,
      maxValue: 1
    }
  )))), filter === "topk+bottomk" && /* @__PURE__ */ import_react21.default.createElement("tr", null, /* @__PURE__ */ import_react21.default.createElement("td", { key: "default", style: { textAlign: "center" } }), Array(topkActivations[0].length).fill(0).map((_, idx) => /* @__PURE__ */ import_react21.default.createElement("td", { key: idx }, /* @__PURE__ */ import_react21.default.createElement("div", { style: { textAlign: "center" } }, "...")))), filter.includes("bottomk") && bottomkActivations.map((activations, tokenIdx) => /* @__PURE__ */ import_react21.default.createElement("tr", { key: tokenIdx }, tokenIdx === 0 && /* @__PURE__ */ import_react21.default.createElement(
    "td",
    {
      key: "default",
      style: { textAlign: "center", fontWeight: "bold" },
      rowSpan: bottomkActivations.length
    },
    "Bottomk \u2193"
  ), activations.map((activation, neuronIdx) => /* @__PURE__ */ import_react21.default.createElement(
    TokenCell,
    {
      key: neuronIdx,
      tdKey: neuronIdx,
      token: bottomkTokens[tokenIdx][neuronIdx],
      value: activation,
      minValue: 0,
      maxValue: 1
    }
  ))))));
}
function TopkTokens({
  tokens,
  topkVals,
  topkIdxs,
  bottomkVals,
  bottomkIdxs,
  firstDimensionName = "Layer",
  thirdDimensionName = "Neuron",
  sampleLabels,
  firstDimensionLabels
}) {
  const numberOfSamples = topkVals.length;
  const numberOfLayers = topkVals[0].length;
  const maxk = topkVals[0][0].length;
  const numberOfNeurons = topkVals[0][0][0].length;
  const [sampleNumber, setSampleNumber] = (0, import_react21.useState)(0);
  const [layerNumber, setLayerNumber] = (0, import_react21.useState)(0);
  const [colsToShow, setColsToShow] = (0, import_react21.useState)(5);
  const [k, setK] = (0, import_react21.useState)(maxk);
  const [neuronNumbers, setNeuronNumbers] = (0, import_react21.useState)([
    ...Array(colsToShow).keys()
  ]);
  const [filter, setFilter] = (0, import_react21.useState)("topk+bottomk");
  (0, import_react21.useEffect)(() => {
    setNeuronNumbers(numberOfSamples > 1 ? [...Array(colsToShow).keys()] : [0]);
  }, [colsToShow, numberOfSamples]);
  const currentTokens = tokens[sampleNumber];
  const dimRanges = [
    [0, k],
    [neuronNumbers[0], neuronNumbers[neuronNumbers.length - 1] + 1]
  ];
  const currentTopkVals = arraySlice2D(
    topkVals[sampleNumber][layerNumber],
    dimRanges
  );
  const currentTopkIdxs = arraySlice2D(
    topkIdxs[sampleNumber][layerNumber],
    dimRanges
  );
  const currentBottomkVals = arraySlice2D(
    bottomkVals[sampleNumber][layerNumber],
    dimRanges
  );
  const currentBottomkIdxs = arraySlice2D(
    bottomkIdxs[sampleNumber][layerNumber],
    dimRanges
  );
  const topkTokens = currentTopkIdxs.map(
    (outerArr) => outerArr.map((token_idx) => currentTokens[token_idx])
  );
  const bottomkTokens = currentBottomkIdxs.map(
    (outerArr) => outerArr.map((token_idx) => currentTokens[token_idx])
  );
  const selectRowStyle = {
    paddingTop: 5,
    paddingBottom: 5
  };
  return /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Container, { fluid: true }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, null, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: "sample-selector", style: { marginRight: 15 } }, "Sample:"), /* @__PURE__ */ import_react21.default.createElement(
    NumberSelector,
    {
      id: "sample-selector",
      smallestNumber: 0,
      largestNumber: numberOfSamples - 1,
      currentValue: sampleNumber,
      setCurrentValue: setSampleNumber,
      labels: sampleLabels
    }
  ))), /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: "layer-selector", style: { marginRight: 15 } }, firstDimensionName, ":"), /* @__PURE__ */ import_react21.default.createElement(
    NumberSelector,
    {
      id: "layer-selector",
      largestNumber: numberOfLayers - 1,
      currentValue: layerNumber,
      setCurrentValue: setLayerNumber,
      labels: firstDimensionLabels
    }
  ))), /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: "neuron-selector", style: { marginRight: 15 } }, thirdDimensionName, ":"), /* @__PURE__ */ import_react21.default.createElement(
    RangeSelector,
    {
      id: "neuron-selector",
      largestNumber: numberOfNeurons - 1,
      currentRangeArr: neuronNumbers,
      setCurrentValue: setNeuronNumbers,
      numValsInRange: colsToShow
    }
  )))), /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: "filter-select", style: { marginRight: 15 } }, "Filter:"), /* @__PURE__ */ import_react21.default.createElement(
    "select",
    {
      value: filter,
      onChange: (event) => setFilter(event.target.value),
      id: "filter-select"
    },
    /* @__PURE__ */ import_react21.default.createElement("option", { value: void 0 }, "topk+bottomk"),
    /* @__PURE__ */ import_react21.default.createElement("option", { value: "topk" }, "topk"),
    /* @__PURE__ */ import_react21.default.createElement("option", { value: "bottomk" }, "bottomk")
  ))), /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement(
    "label",
    {
      htmlFor: "visibleCols-selector",
      style: { marginRight: 15 }
    },
    thirdDimensionName,
    "s to show:"
  ), /* @__PURE__ */ import_react21.default.createElement(
    NumberSelector,
    {
      id: "visible-cols-selector",
      smallestNumber: 1,
      largestNumber: numberOfNeurons,
      currentValue: colsToShow,
      setCurrentValue: setColsToShow
    }
  ))), /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Row, { style: selectRowStyle }, /* @__PURE__ */ import_react21.default.createElement(import_react_grid_system6.Col, null, /* @__PURE__ */ import_react21.default.createElement("label", { htmlFor: "k-selector", style: { marginRight: 15 } }, "k:"), /* @__PURE__ */ import_react21.default.createElement(
    NumberSelector,
    {
      id: "k-selector",
      smallestNumber: 1,
      largestNumber: maxk,
      currentValue: k,
      setCurrentValue: setK
    }
  )))))), /* @__PURE__ */ import_react21.default.createElement(
    TopBottomKTable,
    {
      topkActivations: currentTopkVals,
      bottomkActivations: currentBottomkVals,
      topkTokens,
      bottomkTokens,
      neuronNumbers,
      filter,
      colLabel: thirdDimensionName
    }
  ));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AttentionHeads,
  AttentionPattern,
  AttentionPatterns,
  ColoredTokens,
  ColoredTokensMulti,
  Hello,
  SaeVis,
  TextNeuronActivations,
  TokenLogProbs,
  TopkSamples,
  TopkTokens,
  render
});
//# sourceMappingURL=index.js.map
