// react/src/components/SaeVis.tsx
import { scaleLinear, scaleSequential } from "d3-scale";
import * as chromatic from "d3-scale-chromatic";
import React, { useCallback, useMemo, useRef, useState } from "react";
// --- Helper: Luminance Calculation (Simple) ---
// Calculates approximate luminance (0=black, 1=white)
// Based on https://stackoverflow.com/a/1855903/1421333
function getLuminance(hexColorInput) {
    if (!hexColorInput || hexColorInput.length < 4)
        return 1; // Default to white for invalid colors
    let hexColor = hexColorInput; // Assign to new variable
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hexColor = hexColor.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    if (!result)
        return 1;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    // Formula weights from WCAG
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
// --- Colormap Lookup ---
// Add custom Claude Oranges interpolator
const claudeOrangeInterpolator = scaleLinear()
    .domain([0, 0.5, 1]) // Domain points for the colors
    .range(["#ffffff", "#ff9966", "#ff6633"]) // White at zero, then orange to dark orange
    .clamp(true); // Clamp values outside 0-1
// Consolidated clamping function for all color scales
function createColorScale(interpolator, domain, options = {}) {
    const { minClamp = 0, maxClamp = 0.7, isDiverging = false, shouldApplyRangeClamp = true } = options;
    // For regular sequential scales with range clamping
    if (!isDiverging && shouldApplyRangeClamp) {
        // Apply range adjustment to avoid pure black/white
        const adjustedInterpolator = (t) => interpolator(t * (maxClamp - minClamp) + minClamp);
        return scaleSequential(adjustedInterpolator)
            .domain(domain)
            .clamp(true);
    }
    // For diverging scales or when range clamping is disabled
    if (isDiverging) {
        return scaleSequential(interpolator)
            .domain(domain)
            .clamp(true);
    }
    // Default fallback - just clamp without range adjustments
    return scaleSequential(interpolator)
        .domain(domain)
        .clamp(true);
}
// Legacy wrapper for backward compatibility
function clampInterpolator(interpolator, minClamp = 0, maxClamp = 0.7) {
    return (t) => interpolator(t * (maxClamp - minClamp) + minClamp);
}
const d3ColorMapLookup = {
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
// Identify diverging color maps
const divergingColorMapKeys = [
    "coolwarm",
    "rdylbu",
    "piyg",
    "prgn",
    "spectral"
];
// --- Helper Functions ---
function calculateFeatureScores(activations, // [token][feature]
labels, featureIDs, // Renamed from featureIndices
threshold = null) {
    var _a, _b, _c, _d;
    if (!activations.length || !((_a = activations[0]) === null || _a === void 0 ? void 0 : _a.length))
        return [];
    const numTokens = activations.length;
    const numFeatures = activations[0].length;
    const features = [];
    const effectiveThreshold = threshold !== null && threshold !== void 0 ? threshold : 0; // Consider 0 if null threshold for L0
    for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
        let maxAct = -Infinity;
        let sumAbsAct = 0;
        let nonZero = 0;
        for (let tokIdx = 0; tokIdx < numTokens; tokIdx++) {
            const act = (_c = (_b = activations[tokIdx]) === null || _b === void 0 ? void 0 : _b[featIdx]) !== null && _c !== void 0 ? _c : 0;
            if (act > maxAct)
                maxAct = act;
            sumAbsAct += Math.abs(act);
            if (Math.abs(act) > effectiveThreshold) {
                // Use effective threshold for L0
                nonZero += 1;
            }
        }
        features.push({
            index: featureIDs ? featureIDs[featIdx] : featIdx,
            label: (_d = labels[featIdx]) !== null && _d !== void 0 ? _d : `Feature ${featIdx}`,
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
        // Descending order
        return scoreB - scoreA;
    });
}
function getTopFeaturesForToken(tokenIndex, activations, // [token][feature]
labels, featureIDs, // Renamed from featureIndices
count, threshold) {
    var _a, _b, _c, _d;
    if (!activations[tokenIndex])
        return [];
    const numFeatures = (_b = (_a = activations[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const featuresForToken = [];
    for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
        const act = (_c = activations[tokenIndex][featIdx]) !== null && _c !== void 0 ? _c : 0;
        if (threshold === null || Math.abs(act) >= threshold) {
            featuresForToken.push({
                index: featureIDs ? featureIDs[featIdx] : featIdx,
                label: (_d = labels[featIdx]) !== null && _d !== void 0 ? _d : `Feature ${featIdx}`,
                activation: act
            });
        }
    }
    // Sort by absolute activation for general importance in tooltip, descending
    return featuresForToken
        .sort((a, b) => Math.abs(b.activation) - Math.abs(a.activation))
        .slice(0, count);
}
// --- Styles ---
const themes = {
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
        boxHoverBg: "#f0f0f0" // Subtle hover for selected boxes
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
        boxHoverBg: "#333333" // Subtle hover for selected boxes
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
        boxHoverBg: "hsl(30, 35%, 92%)" // Slightly darker cream hover
    }
};
const getStyles = (mode, claudeModeActive) => {
    var _a;
    const theme = (_a = themes[mode]) !== null && _a !== void 0 ? _a : themes.light;
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
            flexShrink: 0 // Prevent controls from shrinking
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
            color: theme.text // Ensure text contrasts
        },
        featureScore: { color: theme.dimText, fontSize: "0.9em" },
        // NEW: Selected Features Area Container
        selectedFeaturesContainer: {
            marginTop: "15px",
            marginBottom: "15px",
            padding: "10px",
            border: `1px solid ${theme.border}`,
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            flexShrink: 0 // Prevent shrinking
        },
        // NEW: Individual Selected Feature Box
        selectedFeatureInfoBox: {
            border: `1px solid ${theme.border}`,
            borderRadius: "3px",
            padding: "8px",
            marginBottom: "8px",
            backgroundColor: theme.bg,
            position: "relative",
            fontSize: "0.9em",
            transition: "background-color 0.1s ease-in-out" // Added for hover effect
        },
        // NEW: Value indicator within feature box
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
        // Existing Selected Tokens Area Container
        selectedTokensContainer: {
            marginTop: "15px",
            marginBottom: "5px",
            padding: "10px",
            border: `1px solid ${theme.border}`,
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            flexShrink: 0 // Prevent shrinking
        },
        selectedTokensContainerCompactWrap: {
            display: "flex",
            flexWrap: "wrap",
            gap: "5px"
        },
        // Existing Individual Selected Token Box
        selectedTokenInfoBox: {
            border: `1px solid ${theme.border}`,
            borderRadius: "3px",
            padding: "8px",
            marginBottom: "8px",
            backgroundColor: theme.bg,
            position: "relative",
            fontSize: "0.9em",
            transition: "background-color 0.1s ease-in-out" // Added for hover effect
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
        // Shared Close Button Style (adjust color)
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
            /*    display: "flex",
            flexWrap: "wrap",
            gap: "0",
            lineHeight: 1.2, */
            display: "block",
            lineHeight: 1.5,
            border: `1px solid ${theme.subtleBorder}`,
            padding: "5px",
            marginTop: "10px",
            flexShrink: 0,
            letterSpacing: "normal" // Default letter spacing for container
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
            letterSpacing: "0.08em" // Match token letter spacing
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
// Helper to format ranking metric name for display
const getRankingMetricDisplayName = (metric) => {
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
// --- Component ---
/**
 * SaeVis Component: Visualizes Sparse Autoencoder feature activations across tokens.
 *
 * Features:
 * - Ranks features by Max Activation, L1 Norm, or L0 Norm.
 * - Colors tokens based on selected/hovered feature activations.
 * - Supports single feature coloring, multi-feature segment coloring, or max-activation coloring.
 * - Allows selection of multiple features and tokens for detailed inspection.
 * - Provides tooltips on token hover showing top activating features for that token.
 * - Includes controls for filtering, thresholds, color maps (incl. diverging with midpoint), and compact view.
 * - Supports display of custom feature IDs.
 */
export const SaeVis = ({ tokens, featureActivations, featureLabels, featureIDs, // Renamed from featureIndices
numTopFeaturesPerToken = 5, numTopFeaturesOverall = 20, initialRankingMetric = "max", activationThreshold = null, colorMap = "reds", colorMidpoint: propsColorMidpoint }) => {
    var _a;
    // --- State ---
    // Process tokens to replace newlines with arrow symbol
    const processedTokens = useMemo(() => {
        return tokens.map((token) => token.replace(/\n/g, "↵"));
    }, [tokens]);
    const [rankingMetric, setRankingMetric] = useState(initialRankingMetric);
    const [currentThreshold, setCurrentThreshold] = useState(activationThreshold);
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
    const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState(null);
    const [hoverTokenTooltipData, setHoverTokenTooltipData] = useState(null);
    const [selectedTokenIndices, setSelectedTokenIndices] = useState([]);
    const [featureSearchTerm, setFeatureSearchTerm] = useState("");
    const [numOverallToShow, setNumOverallToShow] = useState(numTopFeaturesOverall);
    const [numTokenToShow, setNumTokenToShow] = useState(numTopFeaturesPerToken);
    const [minColorBound, setMinColorBound] = useState(null);
    const [maxColorBound, setMaxColorBound] = useState(null);
    const [colorMidpoint, setColorMidpoint] = useState(propsColorMidpoint !== null && propsColorMidpoint !== void 0 ? propsColorMidpoint : null);
    const [featureListHeight, setFeatureListHeight] = useState("200px");
    const [selectedFeaturesHeight, setSelectedFeaturesHeight] = useState("200px");
    const [focusedFeatureInfo, setFocusedFeatureInfo] = useState(null);
    // NEW State
    const [selectedFeatureIndices, setSelectedFeatureIndices] = useState([]);
    const [hoveredTokenIndex, setHoveredTokenIndex] = useState(null);
    const [multiColorTokens, setMultiColorTokens] = useState(false);
    const [colorMode, setColorMode] = useState("claude-brown" // Default to claude-brown instead of light
    );
    const [selectedColorMap, setSelectedColorMap] = useState("claudeOranges" // Default to claudeOranges instead of colorMap
    );
    const [showTokenFeatures, setShowTokenFeatures] = useState(false);
    const [claudeModeActive, setClaudeModeActive] = useState(true); // Default to true
    const [isCompactView, setIsCompactView] = useState(false); // Restore state
    // NEW State
    const [selectedTokensHeight, setSelectedTokensHeight] = useState("200px"); // State for selected tokens height
    const containerRef = useRef(null);
    const styles = useMemo(() => getStyles(colorMode, claudeModeActive), [colorMode, claudeModeActive]);
    const theme = (_a = themes[colorMode]) !== null && _a !== void 0 ? _a : themes.light;
    // --- Memoized Calculations ---
    // Map display IDs back to 0-based array indices for accessing activation data
    const featureIdToArrayIndexMap = useMemo(() => {
        const map = new Map();
        if (featureIDs) {
            featureIDs.forEach((featureId, arrayIndex) => {
                map.set(featureId, arrayIndex); // Key: Feature ID, Value: Array Index
            });
        }
        else if (featureActivations.length > 0 && featureActivations[0]) {
            // Assume 0..N-1 if featureIDs not provided
            const numFeatures = featureActivations[0].length;
            for (let i = 0; i < numFeatures; i++) {
                map.set(i, i); // Feature ID is the same as Array Index
            }
        }
        return map;
    }, [featureIDs, featureActivations]); // Dependency updated
    const allFeatures = useMemo(() => {
        return calculateFeatureScores(featureActivations, featureLabels, featureIDs, // Pass renamed prop
        currentThreshold);
    }, [featureActivations, featureLabels, featureIDs, currentThreshold]); // Dependency updated
    const rankedFeatures = useMemo(() => {
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
    const filteredAndRankedFeatures = useMemo(() => {
        const searchTerm = featureSearchTerm.toLowerCase().trim();
        if (!searchTerm)
            return rankedFeatures;
        return rankedFeatures.filter((feature) => feature.label.toLowerCase().includes(searchTerm) ||
            String(feature.index).includes(searchTerm));
    }, [rankedFeatures, featureSearchTerm]);
    const topFilteredAndRankedFeatures = useMemo(() => {
        return filteredAndRankedFeatures.slice(0, numOverallToShow);
    }, [filteredAndRankedFeatures, numOverallToShow]);
    // Determine the feature index to use for temporary token coloring
    // Hover always takes precedence for previewing
    const coloringFeatureIndex = hoveredFeatureIndex !== null && hoveredFeatureIndex !== void 0 ? hoveredFeatureIndex : (selectedFeatureIndices.length === 1
        ? selectedFeatureIndices[0]
        : selectedFeatureIndex);
    // Determine if multi-color modes should be active based *only* on selection state
    const isMultiSegmentMode = multiColorTokens && selectedFeatureIndices.length >= 2;
    const isMultiMaximizeMode = !multiColorTokens && selectedFeatureIndices.length >= 1;
    // Find full feature info for selected features (needed for the new list)
    const selectedFeaturesData = useMemo(() => {
        return selectedFeatureIndices
            .map((index) => rankedFeatures.find((f) => f.index === index))
            .filter((f) => f !== undefined);
    }, [selectedFeatureIndices, rankedFeatures]);
    // Calculate actual min/max used for scale (needed for placeholder)
    const calculatedColorBounds = useMemo(() => {
        // Need array index to access activations
        const arrayIndex = featureIdToArrayIndexMap.get(coloringFeatureIndex !== null && coloringFeatureIndex !== void 0 ? coloringFeatureIndex : -1);
        if (arrayIndex === undefined || !featureActivations[0]) {
            return { min: 0, max: 0 };
        }
        const actsForFeature = featureActivations.map((tokenActs) => { var _a; return (_a = tokenActs[arrayIndex]) !== null && _a !== void 0 ? _a : 0; } // Corrected: Uses array index
        );
        return {
            min: Math.min(...actsForFeature),
            max: Math.max(...actsForFeature)
        };
    }, [coloringFeatureIndex, featureActivations, featureIdToArrayIndexMap]);
    // UPDATED: Use selectedColorMap state and clamp interpolators from lookup
    const singleColorScale = useMemo(() => {
        var _a;
        // Use the active *array* index for accessing data
        const activeArrayIndex = featureIdToArrayIndexMap.get(coloringFeatureIndex !== null && coloringFeatureIndex !== void 0 ? coloringFeatureIndex : -1);
        if (activeArrayIndex === undefined || !featureActivations[0]) {
            return () => styles.container.backgroundColor || "#ffffff";
        }
        const actsForFeature = featureActivations.map((tokenActs) => { var _a; return (_a = tokenActs[activeArrayIndex]) !== null && _a !== void 0 ? _a : 0; } // Use array index
        );
        const calculatedMin = Math.min(...actsForFeature);
        const calculatedMax = Math.max(...actsForFeature);
        const domainMinRaw = minColorBound !== null && minColorBound !== ""
            ? parseFloat(minColorBound)
            : calculatedMin;
        const domainMaxRaw = maxColorBound !== null && maxColorBound !== ""
            ? parseFloat(maxColorBound)
            : calculatedMax;
        const domainMin = Number.isNaN(domainMinRaw) ? calculatedMin : domainMinRaw;
        const domainMax = Number.isNaN(domainMaxRaw) ? calculatedMax : domainMaxRaw;
        const userColorMapKey = selectedColorMap.toLowerCase();
        // Handle Claude mode specific color map and potential override
        let effectiveMapKey = userColorMapKey;
        if (claudeModeActive) {
            effectiveMapKey = "claudeOranges"; // Force Claude map if mode is active
        }
        const effectiveInterpolator = (_a = d3ColorMapLookup[effectiveMapKey]) !== null && _a !== void 0 ? _a : d3ColorMapLookup.reds;
        if (!d3ColorMapLookup[effectiveMapKey]) {
            console.warn(`Color map "${effectiveMapKey}" not supported, using Reds.`);
        }
        const isDiverging = divergingColorMapKeys.includes(effectiveMapKey);
        if (isDiverging) {
            // Use scaleDiverging for midpoint control
            let midpoint = (domainMin + domainMax) / 2; // Default midpoint
            if (colorMidpoint !== null && colorMidpoint !== "") {
                const parsedMidpoint = parseFloat(colorMidpoint);
                if (!Number.isNaN(parsedMidpoint)) {
                    midpoint = parsedMidpoint;
                }
            }
            // Ensure domain is [min, mid, max] even if min/max/mid are same
            const finalDomain = [
                domainMin === midpoint && domainMin === domainMax
                    ? domainMin - 0.001
                    : domainMin,
                midpoint,
                domainMax === midpoint && domainMax === domainMin
                    ? domainMax + 0.001
                    : domainMax
            ];
            return createColorScale(effectiveInterpolator, finalDomain, {
                isDiverging: true
            });
        }
        const effectiveMin = domainMin === domainMax ? domainMin : domainMin; // Offset for zero range
        const effectiveMax = domainMin === domainMax ? domainMax + 1e-5 : domainMax; // Offset for zero range
        return createColorScale(effectiveInterpolator, [effectiveMin, effectiveMax], {
            minClamp: 0,
            maxClamp: 0.7,
            isDiverging: false
        });
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
    // UPDATED: Use selectedColorMap state and clamp interpolators from lookup
    const featureScales = useMemo(() => {
        var _a;
        const scales = {};
        // Iterate based on array indices (0 to numFeatures-1)
        if (!featureActivations[0])
            return scales;
        const numFeatures = featureActivations[0].length;
        const userColorMapKey = selectedColorMap.toLowerCase();
        const effectiveInterpolator = (_a = d3ColorMapLookup[userColorMapKey]) !== null && _a !== void 0 ? _a : d3ColorMapLookup.reds;
        const isDiverging = divergingColorMapKeys.includes(userColorMapKey);
        // Create scales for each ARRAY INDEX
        for (let arrayIndex = 0; arrayIndex < numFeatures; arrayIndex++) {
            const acts = featureActivations.map((tokenActs) => { var _a; return (_a = tokenActs[arrayIndex]) !== null && _a !== void 0 ? _a : 0; }); // Use arrayIndex
            const minAct = Math.min(...acts);
            const maxAct = Math.max(...acts);
            // Use bounds if provided, otherwise use calculated min/max for this feature
            const domainMinRaw = minColorBound !== null && minColorBound !== ""
                ? parseFloat(minColorBound)
                : minAct;
            const domainMaxRaw = maxColorBound !== null && maxColorBound !== ""
                ? parseFloat(maxColorBound)
                : maxAct;
            const domainMin = Number.isNaN(domainMinRaw) ? minAct : domainMinRaw;
            const domainMax = Number.isNaN(domainMaxRaw) ? maxAct : domainMaxRaw;
            if (isDiverging) {
                // Use scaleDiverging for midpoint control
                let midpoint = (domainMin + domainMax) / 2; // Default midpoint
                if (colorMidpoint !== null && colorMidpoint !== "") {
                    const parsedMidpoint = parseFloat(colorMidpoint);
                    if (!Number.isNaN(parsedMidpoint)) {
                        midpoint = parsedMidpoint;
                    }
                }
                const finalDomain = [
                    domainMin === midpoint && domainMin === domainMax
                        ? domainMin - 0.001
                        : domainMin,
                    midpoint,
                    domainMax === midpoint && domainMax === domainMin
                        ? domainMax + 0.001
                        : domainMax
                ];
                // Store scale by array index
                scales[arrayIndex] = createColorScale(effectiveInterpolator, finalDomain, {
                    isDiverging: true
                });
            }
            else {
                const effectiveMin = domainMin === domainMax ? domainMin : domainMin;
                const effectiveMax = domainMin === domainMax ? domainMax + 1e-5 : domainMax;
                // Store scale by array index
                scales[arrayIndex] = createColorScale(effectiveInterpolator, [effectiveMin, effectiveMax], {
                    minClamp: 0,
                    maxClamp: 0.7,
                    isDiverging: false
                });
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
        createColorScale // Add dependencies
        // featureIdToArrayIndexMap is NOT needed here as we iterate by array index
    ]);
    // --- Event Handlers ---
    const handleFeatureMouseEnter = useCallback((index, event) => {
        var _a, _b, _c;
        setHoveredFeatureIndex(index);
        if (isCompactView) {
            const feature = rankedFeatures.find((f) => f.index === index);
            if (feature &&
                (!focusedFeatureInfo ||
                    !focusedFeatureInfo.isClick ||
                    focusedFeatureInfo.index !== index)) {
                const containerRect = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                const position = {
                    x: event.clientX - ((_b = containerRect === null || containerRect === void 0 ? void 0 : containerRect.left) !== null && _b !== void 0 ? _b : 0) + 15,
                    y: event.clientY - ((_c = containerRect === null || containerRect === void 0 ? void 0 : containerRect.top) !== null && _c !== void 0 ? _c : 0) + 15
                };
                setFocusedFeatureInfo({ ...feature, isClick: false, position });
            }
        }
    }, [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]);
    const handleFeatureMouseLeave = useCallback(() => {
        setHoveredFeatureIndex(null);
        if (isCompactView && focusedFeatureInfo && !focusedFeatureInfo.isClick) {
            setFocusedFeatureInfo(null);
        }
    }, [isCompactView, focusedFeatureInfo]);
    const handleFeatureClick = useCallback((index, event) => {
        var _a, _b, _c;
        // Toggle in multi-select list
        setSelectedFeatureIndices((prev) => prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]);
        // Update single selected index ONLY if multi-select is becoming empty or just starting
        // This allows single-feature coloring when only one feature is selected
        setSelectedFeatureIndices((currentSelected) => {
            if (currentSelected.length === 1) {
                setSelectedFeatureIndex(currentSelected[0]);
            }
            else {
                setSelectedFeatureIndex(null); // Use multi-color logic if > 1 or 0 selected
            }
            return currentSelected; // Return current state for chaining
        });
        if (isCompactView) {
            const feature = rankedFeatures.find((f) => f.index === index);
            if (!feature)
                return;
            if ((focusedFeatureInfo === null || focusedFeatureInfo === void 0 ? void 0 : focusedFeatureInfo.index) === index && focusedFeatureInfo.isClick) {
                setFocusedFeatureInfo(null);
            }
            else {
                const containerRect = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                const position = {
                    x: event.clientX - ((_b = containerRect === null || containerRect === void 0 ? void 0 : containerRect.left) !== null && _b !== void 0 ? _b : 0) + 15,
                    y: event.clientY - ((_c = containerRect === null || containerRect === void 0 ? void 0 : containerRect.top) !== null && _c !== void 0 ? _c : 0) + 15
                };
                setFocusedFeatureInfo({ ...feature, isClick: true, position });
            }
        }
    }, [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]);
    const handleTokenMouseEnter = useCallback((index, event) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        setHoveredTokenIndex(index);
        if (selectedTokenIndices.includes(index)) {
            // Don't hide tooltip for selected tokens
            // Instead, show the tooltip with current values
            const topFeatures = getTopFeaturesForToken(index, featureActivations, featureLabels, featureIDs, numTokenToShow, currentThreshold);
            // Get array index for selected feature to fetch correct activation
            const selectedArrayIndex = featureIdToArrayIndexMap.get(selectedFeatureIndex !== null && selectedFeatureIndex !== void 0 ? selectedFeatureIndex : -1);
            const currentSelectedFeatureActivationValue = selectedArrayIndex !== undefined
                ? (_b = (_a = featureActivations[index]) === null || _a === void 0 ? void 0 : _a[selectedArrayIndex]) !== null && _b !== void 0 ? _b : null
                : null;
            // Calculate position relative to containerRef
            const containerRect = (_c = containerRef.current) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect();
            const scrollLeft = (_e = (_d = containerRef.current) === null || _d === void 0 ? void 0 : _d.scrollLeft) !== null && _e !== void 0 ? _e : 0;
            const scrollTop = (_g = (_f = containerRef.current) === null || _f === void 0 ? void 0 : _f.scrollTop) !== null && _g !== void 0 ? _g : 0;
            const position = {
                x: event.clientX - ((_h = containerRect === null || containerRect === void 0 ? void 0 : containerRect.left) !== null && _h !== void 0 ? _h : 0) + scrollLeft + 15,
                y: event.clientY - ((_j = containerRect === null || containerRect === void 0 ? void 0 : containerRect.top) !== null && _j !== void 0 ? _j : 0) + scrollTop + 15
            };
            setHoverTokenTooltipData({
                tokenIndex: index,
                topFeatures,
                selectedFeatureValue: currentSelectedFeatureActivationValue,
                position
            });
            return;
        }
        // Original code for non-selected tokens
        const topFeatures = getTopFeaturesForToken(index, featureActivations, featureLabels, featureIDs, numTokenToShow, currentThreshold);
        // Get array index for selected feature to fetch correct activation
        const selectedArrayIndex = featureIdToArrayIndexMap.get(selectedFeatureIndex !== null && selectedFeatureIndex !== void 0 ? selectedFeatureIndex : -1);
        const currentSelectedFeatureActivationValue = selectedArrayIndex !== undefined
            ? (_l = (_k = featureActivations[index]) === null || _k === void 0 ? void 0 : _k[selectedArrayIndex]) !== null && _l !== void 0 ? _l : null
            : null;
        // Calculate position relative to containerRef
        const containerRect = (_m = containerRef.current) === null || _m === void 0 ? void 0 : _m.getBoundingClientRect();
        const scrollLeft = (_p = (_o = containerRef.current) === null || _o === void 0 ? void 0 : _o.scrollLeft) !== null && _p !== void 0 ? _p : 0;
        const scrollTop = (_r = (_q = containerRef.current) === null || _q === void 0 ? void 0 : _q.scrollTop) !== null && _r !== void 0 ? _r : 0;
        const position = {
            x: event.clientX - ((_s = containerRect === null || containerRect === void 0 ? void 0 : containerRect.left) !== null && _s !== void 0 ? _s : 0) + scrollLeft + 15,
            y: event.clientY - ((_t = containerRect === null || containerRect === void 0 ? void 0 : containerRect.top) !== null && _t !== void 0 ? _t : 0) + scrollTop + 15
        };
        setHoverTokenTooltipData({
            tokenIndex: index,
            topFeatures,
            selectedFeatureValue: currentSelectedFeatureActivationValue,
            position
        });
    }, [
        featureActivations,
        featureLabels,
        featureIDs,
        numTokenToShow,
        currentThreshold,
        selectedFeatureIndex,
        selectedTokenIndices,
        featureIdToArrayIndexMap
    ]);
    const handleTokenMouseLeave = useCallback(() => {
        setHoveredTokenIndex(null);
        setHoverTokenTooltipData(null);
    }, []);
    const handleTokenClick = useCallback((index) => {
        setSelectedTokenIndices((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((i) => i !== index);
            }
            return [...prevSelected, index];
        });
        setHoverTokenTooltipData(null);
    }, []);
    const handleTokenTooltipFeatureClick = (featureIndex) => {
        // Add to multi-select list (toggle behavior)
        setSelectedFeatureIndices((prev) => prev.includes(featureIndex)
            ? prev.filter((i) => i !== featureIndex)
            : [...prev, featureIndex]);
        // Update single selected index based on multi-select state
        setSelectedFeatureIndices((currentSelected) => {
            if (currentSelected.length === 1) {
                setSelectedFeatureIndex(currentSelected[0]);
            }
            else {
                setSelectedFeatureIndex(null); // Use multi-color logic if > 1 or 0 selected
            }
            return currentSelected; // Return current state for chaining
        });
        // Keep compact view tooltip logic
        if (isCompactView && (focusedFeatureInfo === null || focusedFeatureInfo === void 0 ? void 0 : focusedFeatureInfo.isClick)) {
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
    const handleDeselectToken = useCallback((indexToRemove) => {
        setSelectedTokenIndices((prevSelected) => prevSelected.filter((i) => i !== indexToRemove));
        setHoverTokenTooltipData(null);
    }, []);
    const handleDeselectFeature = useCallback((indexToRemove) => {
        setSelectedFeatureIndices((prevSelected) => prevSelected.filter((i) => i !== indexToRemove));
        setSelectedFeatureIndices((currentSelected) => {
            if (currentSelected.length === 1) {
                setSelectedFeatureIndex(currentSelected[0]);
            }
            else if (currentSelected.length === 0) {
                setSelectedFeatureIndex(null);
            }
            return currentSelected;
        });
    }, []);
    const closeFeatureInfoTooltip = useCallback(() => {
        setFocusedFeatureInfo(null);
    }, []);
    const handleBoundInputChange = (setter, value) => {
        if (value === "" || value === "-" || !Number.isNaN(parseFloat(value))) {
            setter(value);
        }
    };
    const handleResetAll = useCallback(() => {
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
        setColorMidpoint(propsColorMidpoint !== null && propsColorMidpoint !== void 0 ? propsColorMidpoint : null);
    }, [colorMap, propsColorMidpoint]);
    const toggleCompactView = useCallback(() => {
        setIsCompactView((prev) => !prev);
        setFocusedFeatureInfo(null);
        setHoveredFeatureIndex(null);
    }, []);
    const toggleFeatureListHeight = useCallback(() => {
        setFeatureListHeight((prev) => (prev === "200px" ? "500px" : "200px"));
    }, []);
    const handleMultiColorChange = useCallback((event) => {
        setMultiColorTokens(event.target.checked);
    }, []);
    const toggleColorMode = useCallback(() => {
        setColorMode((prev) => (prev === "light" ? "dark" : "light"));
        setClaudeModeActive(false);
    }, []);
    const activateClaudeMode = useCallback(() => {
        setColorMode("claude-brown");
        setSelectedColorMap("claudeOranges");
        setClaudeModeActive(true);
    }, []);
    const toggleShowTokenFeatures = useCallback(() => {
        setShowTokenFeatures((prev) => !prev);
    }, []);
    // Filtered list of colormaps for the dropdown (exclude Claude's special one)
    const dropdownColorMaps = useMemo(() => {
        return Object.keys(d3ColorMapLookup).filter((name) => name !== "claudeOranges");
    }, []);
    // Updated handler for selected features list height toggle
    const toggleSelectedFeaturesHeight = useCallback(() => {
        setSelectedFeaturesHeight((prev) => (prev === "200px" ? "500px" : "200px"));
    }, []);
    const toggleSelectedTokensHeight = useCallback(() => {
        setSelectedTokensHeight((prev) => (prev === "200px" ? "500px" : "200px"));
    }, []);
    // --- Helper Functions (Component-specific) ---
    // Get the feature activation value for a specific token and feature ID
    const getFeatureActivationValue = useCallback((featId, tokIdx) => {
        var _a, _b;
        if (featId === null)
            return "N/A";
        const arrayIndex = featureIdToArrayIndexMap.get(featId);
        if (arrayIndex === undefined)
            return "N/A";
        const value = (_b = (_a = featureActivations[tokIdx]) === null || _a === void 0 ? void 0 : _a[arrayIndex]) !== null && _b !== void 0 ? _b : 0;
        return value.toPrecision(3);
    }, [featureIdToArrayIndexMap, featureActivations]);
    // Get the background color for a feature activation
    const getFeatureActivationColor = useCallback((featId, tokIdx) => {
        var _a, _b;
        if (featId === null)
            return theme.bg;
        const arrayIndex = featureIdToArrayIndexMap.get(featId);
        if (arrayIndex === undefined)
            return theme.bg;
        const value = (_b = (_a = featureActivations[tokIdx]) === null || _a === void 0 ? void 0 : _a[arrayIndex]) !== null && _b !== void 0 ? _b : 0;
        const scale = featureScales[arrayIndex];
        return scale ? scale(value) : theme.bg;
    }, [featureIdToArrayIndexMap, featureActivations, featureScales, theme.bg]);
    // Get the text color based on background color
    const getFeatureActivationTextColor = useCallback((bgColor) => {
        return getLuminance(bgColor) > 0.5 ? themes.light.text : themes.dark.text;
    }, [themes.light.text, themes.dark.text]);
    // --- Rendering ---
    if (!processedTokens || !featureActivations) {
        return React.createElement("div", { style: styles.container }, "Loading or no data...");
    }
    const isTokenSelected = (index) => {
        return selectedTokenIndices.includes(index);
    };
    return (React.createElement("div", { style: { ...styles.container }, ref: containerRef },
        React.createElement("div", { style: styles.controls },
            React.createElement("div", null,
                React.createElement("label", null, "Rank by: "),
                React.createElement("select", { value: rankingMetric, onChange: (e) => setRankingMetric(e.target.value) },
                    React.createElement("option", { value: "max" }, "Max Activation"),
                    React.createElement("option", { value: "l1" }, "Mean Abs Activation (L1)"),
                    React.createElement("option", { value: "l0" }, "Non-Zero Count (L0)"))),
            React.createElement("div", null,
                React.createElement("label", null, "Threshold: "),
                React.createElement("input", { type: "number", step: "any", placeholder: "None", value: currentThreshold === null ? "" : currentThreshold, onChange: (e) => setCurrentThreshold(e.target.value === "" ? null : parseFloat(e.target.value)), style: { width: "60px" }, title: "Activation threshold for L0 ranking and token tooltips" })),
            React.createElement("div", { style: styles.inputGroup },
                React.createElement("label", null, "Min Color: "),
                React.createElement("input", { type: "number", step: "any", placeholder: calculatedColorBounds.min.toPrecision(3), value: minColorBound !== null && minColorBound !== void 0 ? minColorBound : "", onChange: (e) => handleBoundInputChange(setMinColorBound, e.target.value), style: { width: "60px" }, title: "Minimum value for color scale (leave blank for auto)" })),
            React.createElement("div", { style: styles.inputGroup },
                React.createElement("label", null, "Max Color: "),
                React.createElement("input", { type: "number", step: "any", placeholder: calculatedColorBounds.max.toPrecision(3), value: maxColorBound !== null && maxColorBound !== void 0 ? maxColorBound : "", onChange: (e) => handleBoundInputChange(setMaxColorBound, e.target.value), style: { width: "60px" }, title: "Maximum value for color scale (leave blank for auto)" })),
            divergingColorMapKeys.includes(selectedColorMap.toLowerCase()) && (React.createElement("div", { style: styles.inputGroup },
                React.createElement("label", null, "Midpoint: "),
                React.createElement("input", { type: "number", step: "any", placeholder: `(${(calculatedColorBounds.min + calculatedColorBounds.max) / 2})`, value: colorMidpoint !== null && colorMidpoint !== void 0 ? colorMidpoint : "", onChange: (e) => handleBoundInputChange(setColorMidpoint, e.target.value), style: { width: "60px" }, title: "Midpoint for diverging color scale (leave blank for auto)" }))),
            React.createElement("div", { style: styles.inputGroup },
                React.createElement("button", { onClick: handleResetAll, title: "Reset color bounds, selected features, and selected tokens" }, "Reset All")),
            React.createElement("div", null,
                React.createElement("label", null, "Top Overall: "),
                React.createElement("input", { type: "number", min: "1", step: "1", value: numOverallToShow, onChange: (e) => setNumOverallToShow(parseInt(e.target.value, 10)), style: { width: "50px" } })),
            React.createElement("div", null,
                React.createElement("label", null, "Top Per Token: "),
                React.createElement("input", { type: "number", min: "1", step: "1", value: numTokenToShow, onChange: (e) => setNumTokenToShow(parseInt(e.target.value, 10)), style: { width: "50px" } })),
            React.createElement("div", { style: styles.inputGroup },
                React.createElement("input", { type: "checkbox", id: "multiColorCheckbox", checked: multiColorTokens, onChange: handleMultiColorChange, disabled: selectedFeatureIndices.length < 2, title: selectedFeatureIndices.length < 2
                        ? "Select 2 or more features to enable"
                        : "Color tokens based on activations of all selected features" }),
                React.createElement("label", { htmlFor: "multiColorCheckbox" }, "Multi-Color Tokens")),
            React.createElement("div", null,
                React.createElement("label", null, "Color Map: "),
                React.createElement("select", { value: selectedColorMap, onChange: (e) => {
                        setSelectedColorMap(e.target.value);
                        setClaudeModeActive(false); // Deactivate Claude if map manually changed
                    }, title: "Select color map for activations" }, dropdownColorMaps.map((mapName) => (React.createElement("option", { key: mapName, value: mapName }, mapName))))),
            React.createElement("button", { onClick: toggleColorMode, title: `Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode` }, colorMode === "light" ? "Dark Mode" : "Light Mode"),
            React.createElement("button", { onClick: activateClaudeMode, title: "Activate Claude Mode Theme", style: { opacity: 0.7 } }, "\u2728"),
            React.createElement("button", { onClick: toggleCompactView, style: { ...styles.compactButton, marginLeft: "auto" }, title: isCompactView ? "Show Full Labels" : "Show Compact View" }, isCompactView ? "Expand View" : "Compact View")),
        React.createElement("div", { style: {
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                marginBottom: "5px",
                flexWrap: "wrap",
                gap: "10px"
            } },
            React.createElement("div", { style: { ...styles.featureSearch, marginRight: "auto" } },
                " ",
                React.createElement("label", null, "Search Features: "),
                React.createElement("input", { type: "text", placeholder: "Index or Label...", value: featureSearchTerm, onChange: (e) => setFeatureSearchTerm(e.target.value), style: { width: "200px", padding: "4px" } })),
            React.createElement("div", { style: {
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                    marginLeft: "10px"
                } },
                React.createElement("button", { onClick: toggleFeatureListHeight, style: styles.compactButton, title: featureListHeight === "200px"
                        ? "Expand Feature List"
                        : "Collapse Feature List" }, featureListHeight === "200px" ? "Expand" : "Collapse"))),
        React.createElement("div", { style: { ...styles.featureListContainer, maxHeight: featureListHeight } },
            React.createElement("div", { style: {
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
                    backdropFilter: "blur(2px)" // Add blur effect
                } },
                React.createElement("strong", null,
                    "Top ",
                    topFilteredAndRankedFeatures.length,
                    " Features (",
                    filteredAndRankedFeatures.length,
                    " Total) (Ranked by",
                    " ",
                    getRankingMetricDisplayName(rankingMetric),
                    featureSearchTerm ? ", Filtered" : "",
                    "):"),
                !isCompactView && (React.createElement("span", { style: {
                        fontSize: "0.8em",
                        color: theme.dimText,
                        whiteSpace: "nowrap"
                    } }, "Value "))),
            isCompactView ? (React.createElement("div", { style: styles.featureGrid }, topFilteredAndRankedFeatures.map((feature) => {
                const featureTitle = `Index: ${feature.index}\nMax: ${feature.maxActivation.toFixed(3)}, L1: ${feature.meanAbsActivation.toFixed(3)}, L0: ${feature.nonZeroCount}\n${feature.label}`;
                const isSelected = selectedFeatureIndices.includes(feature.index);
                const isHovered = hoveredFeatureIndex === feature.index;
                return (React.createElement("div", { key: feature.index, style: {
                        ...styles.featureTile,
                        ...(isHovered ? styles.featureTileHover : {}),
                        ...(isSelected ? styles.featureTileSelected : {})
                    }, onMouseEnter: (e) => handleFeatureMouseEnter(feature.index, e), onMouseLeave: handleFeatureMouseLeave, onClick: (e) => handleFeatureClick(feature.index, e), title: featureTitle },
                    feature.index,
                    " "));
            }))) : (
            // Full View (Non-compact)
            React.createElement("div", null, topFilteredAndRankedFeatures.map((feature) => {
                var _a, _b, _c;
                // Define variables needed for live value display
                const hoveredTokenFeatureId = feature.index; // feature.index holds the Feature ID
                const currentHoveredTokenArrayIndex = hoveredTokenIndex !== null
                    ? featureIdToArrayIndexMap.get(hoveredTokenFeatureId)
                    : undefined;
                const hoveredTokenActivation = hoveredTokenIndex !== null &&
                    currentHoveredTokenArrayIndex !== undefined
                    ? (_b = (_a = featureActivations[hoveredTokenIndex]) === null || _a === void 0 ? void 0 : _a[currentHoveredTokenArrayIndex]) !== null && _b !== void 0 ? _b : 0
                    : null;
                const featureArrayIndex = featureIdToArrayIndexMap.get(feature.index);
                const scale = featureArrayIndex !== undefined && featureScales
                    ? featureScales[featureArrayIndex]
                    : null;
                const indicatorColor = hoveredTokenActivation !== null && scale
                    ? scale(hoveredTokenActivation)
                    : theme.bg;
                let indicatorTextColor = theme.text;
                if (hoveredTokenActivation !== null) {
                    indicatorTextColor =
                        getLuminance(indicatorColor) > 0.5
                            ? themes.light.text
                            : themes.dark.text;
                }
                const displayValue = (_c = hoveredTokenActivation === null || hoveredTokenActivation === void 0 ? void 0 : hoveredTokenActivation.toPrecision(3)) !== null && _c !== void 0 ? _c : "N/A";
                const valueTitle = hoveredTokenActivation !== null
                    ? `Activation at Token ${hoveredTokenIndex}: ${hoveredTokenActivation.toPrecision(4)}`
                    : "Hover over a token to see value";
                return (React.createElement("div", { key: feature.index, style: {
                        ...styles.featureListItem,
                        ...(hoveredFeatureIndex === feature.index
                            ? styles.featureListItemHover
                            : {}),
                        ...(selectedFeatureIndices.includes(feature.index)
                            ? styles.featureListItemSelected
                            : {})
                    }, onMouseEnter: (e) => handleFeatureMouseEnter(feature.index, e), onMouseLeave: handleFeatureMouseLeave, onClick: (e) => handleFeatureClick(feature.index, e), title: `Feature ${feature.index}: ${feature.label}\nMax: ${feature.maxActivation.toPrecision(3)}, L1: ${feature.meanAbsActivation.toPrecision(3)}, L0: ${feature.nonZeroCount}` },
                    React.createElement("span", { style: {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginRight: "10px"
                        } },
                        React.createElement("strong", null,
                            "Feature ",
                            feature.index,
                            ":"),
                        " ",
                        feature.label,
                        React.createElement("span", { style: {
                                fontSize: "0.85em",
                                color: styles.featureScore.color,
                                marginLeft: "5px"
                            } },
                            "(Max: ",
                            feature.maxActivation.toPrecision(3),
                            ", L1:",
                            " ",
                            feature.meanAbsActivation.toPrecision(3),
                            ", L0:",
                            " ",
                            feature.nonZeroCount,
                            ")")),
                    React.createElement("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                            flexShrink: 0
                        } },
                        React.createElement("span", { style: {
                                ...styles.featureValueIndicator,
                                backgroundColor: indicatorColor,
                                color: indicatorTextColor
                            }, title: valueTitle }, displayValue))));
            }))),
            filteredAndRankedFeatures.length > numOverallToShow && (React.createElement("div", { style: {
                    textAlign: "center",
                    padding: "5px",
                    fontSize: "0.8em",
                    color: "#555"
                } },
                "Showing ",
                numOverallToShow,
                " of ",
                filteredAndRankedFeatures.length,
                " ",
                "features.")),
            filteredAndRankedFeatures.length === 0 && featureSearchTerm && (React.createElement("div", { style: {
                    textAlign: "center",
                    padding: "5px",
                    fontSize: "0.9em",
                    color: "#777"
                } }, "No features match search term."))),
        selectedFeaturesData.length > 0 && (React.createElement("div", { style: {
                ...styles.selectedFeaturesContainer,
                maxHeight: selectedFeaturesHeight,
                position: "relative" // Ensure relative positioning
            } },
            React.createElement("div", { style: {
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
                    isolation: "isolate" // Create a new stacking context to prevent content showing through
                } },
                React.createElement("strong", null, "Selected Features:"),
                React.createElement("button", { onClick: toggleSelectedFeaturesHeight, style: styles.compactButton, title: selectedFeaturesHeight === "200px"
                        ? "Expand Selected Features"
                        : "Collapse Selected Features" }, selectedFeaturesHeight === "200px" ? "Expand" : "Collapse")),
            React.createElement("div", { style: { paddingTop: "10px" } },
                " ",
                selectedFeaturesData.map((feature) => {
                    var _a, _b, _c, _d;
                    // Define variables within map scope
                    const arrayIndex = featureIdToArrayIndexMap.get(feature.index);
                    const hoveredTokenActivation = hoveredTokenIndex !== null && arrayIndex !== undefined
                        ? (_b = (_a = featureActivations[hoveredTokenIndex]) === null || _a === void 0 ? void 0 : _a[arrayIndex]) !== null && _b !== void 0 ? _b : 0
                        : null;
                    const scale = arrayIndex !== undefined && featureScales
                        ? featureScales[arrayIndex]
                        : null;
                    const indicatorColor = hoveredTokenActivation !== null && scale
                        ? scale(hoveredTokenActivation)
                        : theme.bg;
                    let indicatorTextColor = theme.text;
                    if (hoveredTokenActivation !== null) {
                        indicatorTextColor =
                            getLuminance(indicatorColor) > 0.5
                                ? themes.light.text
                                : themes.dark.text;
                    }
                    const displayValue = (_c = hoveredTokenActivation === null || hoveredTokenActivation === void 0 ? void 0 : hoveredTokenActivation.toPrecision(3)) !== null && _c !== void 0 ? _c : "N/A";
                    const isHoverTarget = hoveredTokenIndex !== null &&
                        arrayIndex !== undefined &&
                        ((_d = featureActivations[hoveredTokenIndex]) === null || _d === void 0 ? void 0 : _d[arrayIndex]) !==
                            undefined;
                    // --- Compact View for Selected Feature --- //
                    if (isCompactView) {
                        return (React.createElement("div", { key: feature.index, 
                            // Add hover handlers
                            onMouseEnter: () => setHoveredFeatureIndex(feature.index), onMouseLeave: () => setHoveredFeatureIndex(null), style: {
                                ...styles.selectedFeatureInfoBox,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "4px 8px"
                            } },
                            React.createElement("span", { style: {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    marginRight: "10px"
                                }, title: feature.label },
                                React.createElement("strong", null,
                                    "Feature ",
                                    feature.index,
                                    ":"),
                                " ",
                                feature.label,
                                React.createElement("span", { style: {
                                        fontSize: "0.85em",
                                        color: styles.featureScore.color,
                                        marginLeft: "5px",
                                        whiteSpace: "nowrap" // Prevent wrapping of stats
                                    }, title: `Max: ${feature.maxActivation.toPrecision(3)}, L1: ${feature.meanAbsActivation.toPrecision(3)}, L0: ${feature.nonZeroCount}` },
                                    "(Max: ",
                                    feature.maxActivation.toPrecision(3),
                                    ", L1:",
                                    " ",
                                    feature.meanAbsActivation.toPrecision(3),
                                    ", L0:",
                                    " ",
                                    feature.nonZeroCount,
                                    ")")),
                            React.createElement("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginLeft: "auto",
                                    flexShrink: 0
                                } },
                                React.createElement("span", { style: {
                                        ...styles.featureValueIndicator,
                                        backgroundColor: indicatorColor,
                                        color: indicatorTextColor
                                    }, title: `Activation at hovered token: ${displayValue}` }, displayValue),
                                React.createElement("button", { onClick: () => handleDeselectFeature(feature.index), style: {
                                        ...styles.selectedItemCloseButton,
                                        position: "static",
                                        fontSize: "1.1em",
                                        padding: "0 3px"
                                    }, title: "Deselect Feature" }, "\u00D7"))));
                    }
                    // --- Full View for Selected Feature --- //
                    const fullViewBoxStyle = {
                        backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
                    };
                    return (React.createElement("div", { key: feature.index, style: {
                            ...styles.selectedFeatureInfoBox,
                            ...fullViewBoxStyle
                        }, 
                        // Add hover handlers
                        onMouseEnter: () => setHoveredFeatureIndex(feature.index), onMouseLeave: () => setHoveredFeatureIndex(null) },
                        React.createElement("button", { onClick: () => handleDeselectFeature(feature.index), style: styles.selectedItemCloseButton, title: "Deselect Feature" }, "\u00D7"),
                        React.createElement("div", null,
                            React.createElement("strong", null,
                                "Feature ",
                                feature.index,
                                ":"),
                            " ",
                            feature.label,
                            " - ",
                            React.createElement("span", { style: {
                                    fontSize: "0.9em",
                                    color: styles.featureScore.color
                                } },
                                "(Max: ",
                                feature.maxActivation.toPrecision(3),
                                ", L1:",
                                " ",
                                feature.meanAbsActivation.toPrecision(3),
                                ", L0:",
                                " ",
                                feature.nonZeroCount,
                                ")")),
                        React.createElement("div", { style: { marginTop: "3px" } },
                            React.createElement("span", { style: styles.dynamicInfoLabel }, "Value at Token "),
                            hoveredTokenIndex !== null ? (React.createElement("span", { style: { fontWeight: "bold" } }, processedTokens[hoveredTokenIndex])) : ("?"),
                            ":",
                            React.createElement("span", { style: {
                                    ...styles.featureValueIndicator,
                                    backgroundColor: indicatorColor,
                                    color: indicatorTextColor
                                }, title: `Activation: ${displayValue}` }, displayValue))));
                })))),
        selectedTokenIndices.length > 0 && (React.createElement("div", { style: {
                ...styles.selectedTokensContainer,
                maxHeight: selectedTokensHeight,
                position: "relative",
                ...(isCompactView && !showTokenFeatures
                    ? styles.selectedTokensContainerCompactWrap
                    : {})
            } },
            React.createElement("div", { style: {
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
                    backdropFilter: "blur(2px)" // Add blur effect for content behind
                } },
                React.createElement("strong", null, "Selected Tokens:"),
                React.createElement("div", { style: { display: "flex", gap: "5px" } },
                    !(isCompactView && !showTokenFeatures) && (React.createElement("button", { onClick: toggleShowTokenFeatures, style: styles.compactButton, title: showTokenFeatures
                            ? "Hide Top Features list"
                            : "Show Top Features list" }, showTokenFeatures
                        ? "Hide Top Features"
                        : "Show Top Features")),
                    React.createElement("button", { onClick: toggleSelectedTokensHeight, style: styles.compactButton, title: selectedTokensHeight === "200px"
                            ? "Expand Selected Tokens"
                            : "Collapse Selected Tokens" }, selectedTokensHeight === "200px" ? "Expand" : "Collapse"))),
            React.createElement("div", { style: { paddingTop: "10px" } },
                " ",
                selectedTokenIndices.map((tokenIndex) => {
                    var _a, _b, _c;
                    // --- Determine value/color based on SELECTED feature for this token --- //
                    const selectedDisplayID = selectedFeatureIndex; // The ID shown in the UI
                    const selectedArrayIndex = selectedDisplayID !== null
                        ? featureIdToArrayIndexMap.get(selectedDisplayID)
                        : undefined;
                    let valueOfSelectedFeatureAtToken = null;
                    if (selectedArrayIndex !== undefined &&
                        tokenIndex < featureActivations.length) {
                        valueOfSelectedFeatureAtToken =
                            (_b = (_a = featureActivations[tokenIndex]) === null || _a === void 0 ? void 0 : _a[selectedArrayIndex]) !== null && _b !== void 0 ? _b : 0; // Use 0 as default
                    }
                    else if (selectedDisplayID !== null) {
                        // Only warn if a feature was selected but we couldn't find its array index
                        console.warn(`[SaeVis] Could not find array index for selected feature ID: ${selectedDisplayID}.`);
                        valueOfSelectedFeatureAtToken = null; // Set to null if mapping failed
                    }
                    const scaleSelected = selectedArrayIndex !== undefined && featureScales // Ensure featureScales is defined
                        ? featureScales[selectedArrayIndex]
                        : null;
                    const indicatorColorSelected = valueOfSelectedFeatureAtToken !== null && scaleSelected
                        ? scaleSelected(valueOfSelectedFeatureAtToken)
                        : theme.bg;
                    let indicatorTextColorSelected = theme.text;
                    if (valueOfSelectedFeatureAtToken !== null) {
                        indicatorTextColorSelected =
                            getLuminance(indicatorColorSelected) > 0.5
                                ? themes.light.text
                                : themes.dark.text;
                    }
                    // Display N/A if we couldn't get a value (e.g., map failed or no feature selected)
                    const displayValueSelected = valueOfSelectedFeatureAtToken !== null
                        ? valueOfSelectedFeatureAtToken.toPrecision(3)
                        : "N/A";
                    // --- Determine background highlight based on HOVERED feature --- //
                    const hoveredFeatureArrayIndex = featureIdToArrayIndexMap.get(hoveredFeatureIndex !== null && hoveredFeatureIndex !== void 0 ? hoveredFeatureIndex : -1);
                    const isHoverTarget = hoveredFeatureArrayIndex !== undefined &&
                        ((_c = featureActivations[tokenIndex]) === null || _c === void 0 ? void 0 : _c[hoveredFeatureArrayIndex]) !==
                            undefined;
                    const boxStyle = {
                        ...styles.selectedTokenInfoBox,
                        backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
                    };
                    // --- Compact TILING View for Selected Token --- //
                    if (isCompactView && !showTokenFeatures) {
                        return (React.createElement("div", { key: tokenIndex, style: styles.selectedTokenInfoBoxCompactTile },
                            React.createElement("span", null,
                                React.createElement("strong", null,
                                    "T",
                                    tokenIndex,
                                    ":"),
                                " \"",
                                processedTokens[tokenIndex].substring(0, 10),
                                "\"",
                                processedTokens[tokenIndex].length > 10 ? "..." : ""),
                            hoveredFeatureIndex !== null && (React.createElement("span", { style: {
                                    ...styles.featureValueIndicator,
                                    padding: "0 2px",
                                    height: "1.3em",
                                    minWidth: "2em",
                                    fontSize: "0.8em",
                                    backgroundColor: getFeatureActivationColor(hoveredFeatureIndex, tokenIndex),
                                    color: getFeatureActivationTextColor(getFeatureActivationColor(hoveredFeatureIndex, tokenIndex))
                                }, title: `Feature ${hoveredFeatureIndex}: ${getFeatureActivationValue(hoveredFeatureIndex, tokenIndex)}` }, getFeatureActivationValue(hoveredFeatureIndex, tokenIndex))),
                            hoveredFeatureIndex === null &&
                                selectedFeatureIndex !== null && (React.createElement("span", { style: {
                                    ...styles.featureValueIndicator,
                                    padding: "0 2px",
                                    height: "1.3em",
                                    minWidth: "2em",
                                    fontSize: "0.8em",
                                    backgroundColor: indicatorColorSelected,
                                    color: indicatorTextColorSelected
                                }, title: `Feature ${selectedDisplayID !== null && selectedDisplayID !== void 0 ? selectedDisplayID : "?"}: ${displayValueSelected}` }, displayValueSelected)),
                            hoveredFeatureIndex === null &&
                                selectedFeatureIndex === null && (React.createElement("span", { style: {
                                    ...styles.featureValueIndicator,
                                    padding: "0 2px",
                                    height: "1.3em",
                                    minWidth: "2em",
                                    fontSize: "0.8em"
                                } }, "N/A")),
                            React.createElement("button", { onClick: () => handleDeselectToken(tokenIndex), style: {
                                    ...styles.selectedItemCloseButton,
                                    position: "static",
                                    fontSize: "1em",
                                    padding: "0 2px"
                                }, title: "Deselect Token" }, "\u00D7")));
                    }
                    // --- Compact SINGLE LINE View for Selected Token --- //
                    if (isCompactView) {
                        return (React.createElement("div", { key: tokenIndex, style: boxStyle },
                            React.createElement("button", { onClick: () => handleDeselectToken(tokenIndex), style: styles.selectedItemCloseButton, title: "Deselect Token" }, "\u00D7"),
                            React.createElement("strong", null,
                                "Token ",
                                tokenIndex,
                                ": \"",
                                processedTokens[tokenIndex],
                                "\""),
                            React.createElement("div", { style: {
                                    marginTop: "5px",
                                    paddingTop: "5px",
                                    borderTop: `1px dashed ${styles.container.borderColor}`
                                } },
                                hoveredFeatureIndex !== null && (React.createElement(React.Fragment, null,
                                    React.createElement("span", { style: styles.dynamicInfoLabel },
                                        "Feature ",
                                        hoveredFeatureIndex,
                                        ":",
                                        " "),
                                    React.createElement("span", { style: {
                                            ...styles.featureValueIndicator,
                                            backgroundColor: getFeatureActivationColor(hoveredFeatureIndex, tokenIndex),
                                            color: getFeatureActivationTextColor(getFeatureActivationColor(hoveredFeatureIndex, tokenIndex))
                                        }, title: `Value: ${getFeatureActivationValue(hoveredFeatureIndex, tokenIndex)}` }, getFeatureActivationValue(hoveredFeatureIndex, tokenIndex)))),
                                hoveredFeatureIndex === null &&
                                    selectedFeatureIndex !== null && (React.createElement(React.Fragment, null,
                                    React.createElement("span", { style: styles.dynamicInfoLabel },
                                        "Feature ", selectedDisplayID !== null && selectedDisplayID !== void 0 ? selectedDisplayID : "?",
                                        ":",
                                        " "),
                                    React.createElement("span", { style: {
                                            ...styles.featureValueIndicator,
                                            backgroundColor: indicatorColorSelected,
                                            color: indicatorTextColorSelected
                                        }, title: `Value: ${displayValueSelected}` }, displayValueSelected))),
                                hoveredFeatureIndex === null &&
                                    selectedFeatureIndex === null && (React.createElement("span", { style: styles.dynamicInfoLabel }, "Hover over a feature to see values")))));
                    }
                    // --- Full View for Selected Token --- //
                    return (React.createElement("div", { key: tokenIndex, style: boxStyle },
                        React.createElement("button", { onClick: () => handleDeselectToken(tokenIndex), style: styles.selectedItemCloseButton, title: "Deselect Token" }, "\u00D7"),
                        React.createElement("strong", null,
                            "Token ",
                            tokenIndex,
                            ": \"",
                            processedTokens[tokenIndex],
                            "\""),
                        React.createElement("div", { style: {
                                marginTop: "3px"
                            } },
                            hoveredFeatureIndex !== null && (React.createElement(React.Fragment, null,
                                React.createElement("span", { style: styles.dynamicInfoLabel },
                                    "Feature ",
                                    hoveredFeatureIndex,
                                    ":",
                                    " "),
                                React.createElement("span", { style: {
                                        ...styles.featureValueIndicator,
                                        backgroundColor: getFeatureActivationColor(hoveredFeatureIndex, tokenIndex),
                                        color: getFeatureActivationTextColor(getFeatureActivationColor(hoveredFeatureIndex, tokenIndex))
                                    }, title: `Value: ${getFeatureActivationValue(hoveredFeatureIndex, tokenIndex)}` }, getFeatureActivationValue(hoveredFeatureIndex, tokenIndex)))),
                            hoveredFeatureIndex === null &&
                                selectedFeatureIndex !== null && (React.createElement(React.Fragment, null,
                                React.createElement("span", { style: styles.dynamicInfoLabel },
                                    "Feature ", selectedDisplayID !== null && selectedDisplayID !== void 0 ? selectedDisplayID : "?",
                                    ":",
                                    " "),
                                React.createElement("span", { style: {
                                        ...styles.featureValueIndicator,
                                        backgroundColor: indicatorColorSelected,
                                        color: indicatorTextColorSelected
                                    }, title: `Value: ${displayValueSelected}` }, displayValueSelected))),
                            hoveredFeatureIndex === null &&
                                selectedFeatureIndex === null && (React.createElement("span", { style: styles.dynamicInfoLabel }, "Hover over a feature to see values"))),
                        showTokenFeatures && (React.createElement("div", { style: {
                                marginTop: "5px",
                                paddingTop: "5px",
                                borderTop: `1px dashed ${styles.container.borderColor}`
                            }, title: `Showing top ${numTokenToShow} features with abs activation >= ${currentThreshold !== null && currentThreshold !== void 0 ? currentThreshold : 0}` },
                            React.createElement("strong", null, "Top Features:"),
                            getTopFeaturesForToken(tokenIndex, featureActivations, featureLabels, featureIDs, // Pass correct prop
                            numTokenToShow, currentThreshold).length === 0 && React.createElement("div", null, "(None above threshold)"),
                            getTopFeaturesForToken(tokenIndex, featureActivations, featureLabels, featureIDs, // Pass correct prop
                            numTokenToShow, currentThreshold).map((feat) => (React.createElement("div", { key: feat.index },
                                React.createElement("span", { style: styles.featureListIndexValue }, `Feature ${feat.index}: ${feat.activation.toFixed(3)}`),
                                " ",
                                React.createElement("span", { style: {
                                        ...styles.featureListDescription,
                                        cursor: "pointer"
                                    }, className: "feature-list-item-clickable", onClick: () => handleTokenTooltipFeatureClick(feat.index), onMouseEnter: (e) => {
                                        e.target.style.textDecoration = "underline";
                                    }, onMouseLeave: (e) => {
                                        e.target.style.textDecoration = "none";
                                    }, title: `Select Feature ${feat.index} for coloring/multi-select` },
                                    "- ",
                                    feat.label.substring(0, 60),
                                    feat.label.length > 60 ? "..." : ""))))))));
                })))),
        React.createElement("div", { style: styles.tokenSequence }, processedTokens.map((token, index) => {
            var _a, _b, _c, _d, _e;
            const isHovered = hoveredTokenIndex === index;
            const isClicked = isTokenSelected(index);
            // Use independent multi-color mode flags derived earlier
            const isMultiSegment = isMultiSegmentMode;
            const isMultiMax = isMultiMaximizeMode;
            let tokenStyle = { ...styles.token };
            let innerContent = token;
            // Check for hook left arrow symbols
            const hasHookLeftArrow = typeof token === "string" && /[↵]/.test(token);
            // --- Determine Background/Content based on Hover/Selection Priority --- //
            if (hoveredFeatureIndex !== null) {
                // PRIORITY 1: Hovering over a feature - always show single color for hover target
                const hoveredArrayIndex = featureIdToArrayIndexMap.get(hoveredFeatureIndex !== null && hoveredFeatureIndex !== void 0 ? hoveredFeatureIndex : -1);
                if (hoveredArrayIndex !== undefined) {
                    const act = (_b = (_a = featureActivations[index]) === null || _a === void 0 ? void 0 : _a[hoveredArrayIndex]) !== null && _b !== void 0 ? _b : 0;
                    // Need a scale specifically for the hover index if different from single selected
                    // Re-using singleColorScale might be okay if its dependencies are correct
                    const scale = singleColorScale; // Check if singleColorScale uses activeArrayIndex correctly
                    const bgColor = scale(act);
                    const textColor = getLuminance(bgColor) > 0.5
                        ? themes.light.text
                        : themes.dark.text;
                    const isDimmed = currentThreshold !== null &&
                        act !== 0 &&
                        Math.abs(act) < currentThreshold;
                    tokenStyle = {
                        ...tokenStyle,
                        backgroundColor: bgColor,
                        color: textColor,
                        opacity: isDimmed ? 0.5 : 1
                    };
                    // innerContent remains default token text
                }
                else {
                    // Handle case where map lookup fails (shouldn't happen)
                    console.warn("Could not find array index for hovered feature:", hoveredFeatureIndex);
                    // innerContent remains default token text
                }
            }
            else if (isMultiSegment) {
                // PRIORITY 2: Multi-color segments (No hover, multi-select active)
                const numSegments = selectedFeatureIndices.length;
                const segmentHeight = 100 / numSegments;
                const backgroundSegments = selectedFeatureIndices.map((featIndex) => {
                    var _a, _b;
                    // Use map to get array index for activation lookup
                    const currentArrayIndex = featureIdToArrayIndexMap.get(featIndex);
                    if (currentArrayIndex === undefined) {
                        console.warn("Could not find array index for selected feature:", featIndex);
                        return null; // Or a default div
                    }
                    const act = (_b = (_a = featureActivations[index]) === null || _a === void 0 ? void 0 : _a[currentArrayIndex]) !== null && _b !== void 0 ? _b : 0;
                    const scale = featureScales[currentArrayIndex];
                    const bgColor = scale ? scale(act) : "transparent";
                    const segmentStyle = {
                        height: `${segmentHeight}%`,
                        width: "100%",
                        backgroundColor: bgColor
                    };
                    return React.createElement("div", { key: featIndex, style: segmentStyle });
                });
                tokenStyle = {
                    ...tokenStyle,
                    display: "inline",
                    position: "relative",
                    backgroundColor: "transparent",
                    color: theme.text
                };
                innerContent = (React.createElement("span", { style: {
                        position: "relative",
                        display: "inline-block",
                        verticalAlign: "bottom"
                    } },
                    React.createElement("div", { style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            zIndex: 0
                        } }, backgroundSegments),
                    React.createElement("span", { style: { ...styles.tokenTextOverlay, position: "relative" } }, typeof token === "string" ? token.replace(/\n/g, "↵") : "")));
            }
            else if (isMultiMax) {
                // PRIORITY 3: Maximize over selected features (No hover, multi-select active, not segment mode)
                const maxActInfo = selectedFeatureIndices.reduce((maxInfo, currentFeatIndex) => {
                    var _a, _b;
                    // Use map to get array index for activation lookup
                    const currentArrayIndex = featureIdToArrayIndexMap.get(currentFeatIndex);
                    if (currentArrayIndex === undefined) {
                        console.warn("Could not find array index for selected feature:", currentFeatIndex);
                        return maxInfo;
                    }
                    const currentVal = (_b = (_a = featureActivations[index]) === null || _a === void 0 ? void 0 : _a[currentArrayIndex]) !== null && _b !== void 0 ? _b : 0;
                    if (Math.abs(currentVal) > maxInfo.maxAbs) {
                        return {
                            index: currentFeatIndex,
                            value: currentVal,
                            maxAbs: Math.abs(currentVal)
                        };
                    }
                    return maxInfo;
                }, { index: -1, value: 0, maxAbs: -Infinity });
                // Use maxActArrayIndex for scale lookup if defined
                const maxActArrayIndex = featureIdToArrayIndexMap.get((_c = maxActInfo.index) !== null && _c !== void 0 ? _c : -1);
                const scale = maxActArrayIndex !== undefined
                    ? featureScales[maxActArrayIndex]
                    : null;
                const bgColor = scale ? scale(maxActInfo.value) : "transparent";
                const textColor = getLuminance(bgColor) > 0.5
                    ? themes.light.text
                    : themes.dark.text;
                tokenStyle = {
                    ...tokenStyle,
                    backgroundColor: bgColor,
                    color: textColor
                };
                // innerContent remains default token text
            }
            else {
                // PRIORITY 4: Single selected feature or default (No hover, no multi-select modes active)
                // Use coloringFeatureIndex which is derived from selectedFeatureIndices (if length === 1)
                // Use activeArrayIndex (already derived from coloringFeatureIndex using the map)
                const currentActiveArrayIndex = featureIdToArrayIndexMap.get(coloringFeatureIndex !== null && coloringFeatureIndex !== void 0 ? coloringFeatureIndex : -1);
                if (currentActiveArrayIndex !== undefined) {
                    const act = (_e = (_d = featureActivations[index]) === null || _d === void 0 ? void 0 : _d[currentActiveArrayIndex]) !== null && _e !== void 0 ? _e : 0;
                    const bgColor = coloringFeatureIndex !== null
                        ? singleColorScale(act)
                        : styles.container.backgroundColor || "transparent";
                    const textColor = getLuminance(bgColor) > 0.5
                        ? themes.light.text
                        : themes.dark.text;
                    const isDimmed = coloringFeatureIndex !== null && // Only dim if a feature is actually selected
                        currentThreshold !== null &&
                        act !== 0 &&
                        Math.abs(act) < currentThreshold;
                    tokenStyle = {
                        ...tokenStyle,
                        backgroundColor: bgColor,
                        color: textColor,
                        opacity: isDimmed ? 0.5 : 1
                    };
                    // innerContent remains default token text
                }
                else {
                    // No active feature, use default background
                    tokenStyle = {
                        ...tokenStyle,
                        backgroundColor: styles.container.backgroundColor || "transparent",
                        color: theme.text
                    };
                }
            }
            // --- Apply Hover/Click Outlines --- //
            if (isHovered && !isClicked) {
                tokenStyle = { ...tokenStyle, ...styles.tokenHover };
            }
            if (isClicked) {
                tokenStyle = { ...tokenStyle, ...styles.tokenClicked };
            }
            return (React.createElement(React.Fragment, { key: index },
                React.createElement("span", { style: tokenStyle, onMouseEnter: (e) => handleTokenMouseEnter(index, e), onMouseLeave: handleTokenMouseLeave, onClick: () => handleTokenClick(index), title: token.includes("\n") ? token.replace(/\n/g, "↵") : undefined }, typeof innerContent === "string"
                    ? innerContent.replace(/\n/g, "↵")
                    : innerContent),
                hasHookLeftArrow && React.createElement("br", null)));
        })),
        hoverTokenTooltipData && (React.createElement("div", { style: {
                ...styles.tooltip,
                left: `${hoverTokenTooltipData.position.x}px`,
                top: `${hoverTokenTooltipData.position.y}px`
            } },
            React.createElement("strong", null,
                "Token ",
                hoverTokenTooltipData.tokenIndex,
                ": \"",
                processedTokens[hoverTokenTooltipData.tokenIndex],
                "\""),
            hoverTokenTooltipData.selectedFeatureValue !== null && (React.createElement("div", { style: {
                    marginTop: "5px",
                    borderTop: "1px dashed #ccc",
                    paddingTop: "5px"
                } },
                "Selected Feature ",
                selectedFeatureIndex,
                ":",
                " ",
                hoverTokenTooltipData.selectedFeatureValue.toPrecision(3))),
            React.createElement("br", null),
            React.createElement("strong", { title: `Showing top ${numTokenToShow} features with abs activation >= ${currentThreshold !== null && currentThreshold !== void 0 ? currentThreshold : 0}` }, "Top Features:"),
            hoverTokenTooltipData.topFeatures.length === 0 && (React.createElement("div", null, "(None above threshold)")),
            hoverTokenTooltipData.topFeatures.map((feat) => (React.createElement("div", { key: feat.index },
                React.createElement("span", { style: styles.featureListIndexValue }, `Feature ${feat.index}: ${feat.activation.toFixed(3)}`),
                React.createElement("span", { style: {
                        ...styles.featureListDescription,
                        cursor: "pointer"
                    }, className: "feature-list-item-clickable", onClick: () => handleTokenTooltipFeatureClick(feat.index), onMouseEnter: (e) => {
                        e.target.style.textDecoration =
                            "underline";
                    }, onMouseLeave: (e) => {
                        e.target.style.textDecoration = "none";
                    }, title: `Select Feature ${feat.index} for coloring/multi-select` },
                    "- ",
                    feat.label.substring(0, 60),
                    feat.label.length > 60 ? "..." : "")))))),
        isCompactView && focusedFeatureInfo && (React.createElement("div", { style: {
                ...styles.tooltip,
                position: "absolute",
                left: `${focusedFeatureInfo.position.x}px`,
                top: `${focusedFeatureInfo.position.y}px`,
                ...(focusedFeatureInfo.isClick ? styles.tooltipSticky : {})
            } },
            focusedFeatureInfo.isClick && (React.createElement("button", { onClick: closeFeatureInfoTooltip, style: styles.tooltipCloseButton, title: "Close Feature Info" }, "\u00D7")),
            React.createElement("strong", null,
                "Feature ",
                focusedFeatureInfo.index),
            React.createElement("div", { style: { marginTop: "5px" } },
                React.createElement("strong", null, "Label:"),
                " ",
                focusedFeatureInfo.label),
            React.createElement("div", { style: {
                    marginTop: "5px",
                    paddingTop: "5px",
                    borderTop: "1px dashed #ccc"
                } },
                React.createElement("strong", null, "Stats:"),
                React.createElement("div", null,
                    "Max: ",
                    focusedFeatureInfo.maxActivation.toPrecision(3)),
                React.createElement("div", null,
                    "L1: ",
                    focusedFeatureInfo.meanAbsActivation.toPrecision(3)),
                React.createElement("div", null,
                    "L0: ",
                    focusedFeatureInfo.nonZeroCount))))));
};
// Add prop types for robustness (optional but recommended)
// import PropTypes from 'prop-types';
// SaeVis.propTypes = { ... };
export default SaeVis; // Make sure it's the default export if render uses it directly
//# sourceMappingURL=SaeVis.js.map