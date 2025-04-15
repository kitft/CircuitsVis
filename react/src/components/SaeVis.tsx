// react/src/components/SaeVis.tsx
import { scaleLinear, scaleSequential } from "d3-scale";
import * as chromatic from "d3-scale-chromatic";
import React, {
  CSSProperties,
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";

// --- Helper: Luminance Calculation (Simple) ---
// Calculates approximate luminance (0=black, 1=white)
// Based on https://stackoverflow.com/a/1855903/1421333
function getLuminance(hexColorInput: string): number {
  if (!hexColorInput || hexColorInput.length < 4) return 1; // Default to white for invalid colors
  let hexColor = hexColorInput; // Assign to new variable
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexColor = hexColor.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!result) return 1;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Formula weights from WCAG
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// --- Colormap Lookup ---
// Add custom Claude Oranges interpolator
const claudeOrangeInterpolator = scaleLinear<string>()
  .domain([0, 0.5, 1]) // Domain points for the colors
  .range(["#ffcc99", "#ff9966", "#ff6633"]) // Light to dark orange
  .clamp(true); // Clamp values outside 0-1

// Function to wrap interpolators to avoid pure black/white extremes
function clampInterpolator(
  interpolator: (t: number) => string,
  minClamp = 0, // Adjusted minClamp
  maxClamp = 0.7 // Adjusted maxClamp
): (t: number) => string {
  return (t: number) => interpolator(t * (maxClamp - minClamp) + minClamp);
}

const d3ColorMapLookup: { [key: string]: (t: number) => string } = {
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

// --- Interfaces ---

interface SaeVisProps {
  tokens: string[];
  featureActivations: number[][]; // [token][feature]
  featureLabels: string[];
  numTopFeaturesPerToken?: number;
  numTopFeaturesOverall?: number;
  initialRankingMetric?: "max" | "l1" | "l0";
  activationThreshold?: number | null;
  colorMap?: string; // e.g., "interpolateViridis", "interpolateCoolwarm" from d3-scale-chromatic
}

interface FeatureInfo {
  index: number;
  label: string;
  score: number; // Based on ranking metric
  maxActivation: number; // Always useful to have
  meanAbsActivation: number;
  nonZeroCount: number;
}

interface TokenFeatureInfo {
  index: number;
  label: string;
  activation: number;
}

// Renamed from TooltipData - now only for hover tooltips
interface HoverTokenTooltipData {
  tokenIndex: number;
  topFeatures: TokenFeatureInfo[];
  selectedFeatureValue: number | null;
  position: { x: number; y: number };
  // Removed type property as it's always hover now
}

// For compact feature tooltip
interface FocusedFeatureData {
  index: number;
  label: string;
  maxActivation: number;
  meanAbsActivation: number;
  nonZeroCount: number;
  isClick: boolean;
  position: { x: number; y: number };
}

// --- Helper Functions ---

function calculateFeatureScores(
  activations: number[][], // [token][feature]
  labels: string[],
  threshold: number | null = null
): FeatureInfo[] {
  if (!activations.length || !activations[0]?.length) return [];
  const numTokens = activations.length;
  const numFeatures = activations[0].length;
  const features: FeatureInfo[] = [];
  const effectiveThreshold = threshold ?? 0; // Consider 0 if null threshold for L0

  for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
    let maxAct = -Infinity;
    let sumAbsAct = 0;
    let nonZero = 0;
    for (let tokIdx = 0; tokIdx < numTokens; tokIdx++) {
      const act = activations[tokIdx]?.[featIdx] ?? 0;
      if (act > maxAct) maxAct = act;
      sumAbsAct += Math.abs(act);
      if (Math.abs(act) > effectiveThreshold) {
        // Use effective threshold for L0
        nonZero += 1;
      }
    }
    features.push({
      index: featIdx,
      label: labels[featIdx] ?? `Feature ${featIdx}`,
      score: 0, // Will be set based on metric
      maxActivation: maxAct,
      meanAbsActivation: sumAbsAct / numTokens,
      nonZeroCount: nonZero
    });
  }
  return features;
}

function rankFeatures(
  features: FeatureInfo[],
  metric: "max" | "l1" | "l0"
): FeatureInfo[] {
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

function getTopFeaturesForToken(
  tokenIndex: number,
  activations: number[][], // [token][feature]
  labels: string[],
  count: number,
  threshold: number | null
): TokenFeatureInfo[] {
  if (!activations[tokenIndex]) return [];
  const numFeatures = activations[0]?.length ?? 0;
  const featuresForToken: TokenFeatureInfo[] = [];

  for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
    const act = activations[tokenIndex][featIdx] ?? 0;
    if (threshold === null || Math.abs(act) >= threshold) {
      featuresForToken.push({
        index: featIdx,
        label: labels[featIdx] ?? `Feature ${featIdx}`,
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
    bg: "hsl(30, 40%, 96%)", // Creamy background
    text: "hsl(30, 30%, 20%)", // Dark brown text
    border: "hsl(30, 20%, 70%)", // Light brown border
    containerBg: "hsl(30, 30%, 90%)", // Slightly darker container bg
    selectedItemBg: "hsl(30, 50%, 80%)", // Soft orange-brown selection
    selectedItemBorder: "hsl(30, 70%, 50%)", // Stronger orange border
    hoverOutline: "hsl(30, 30%, 60%)", // Medium brown hover
    subtleBorder: "hsl(30, 25%, 85%)", // Very light brown subtle border
    dimText: "hsl(30, 20%, 40%)", // Muted brown dim text
    closeButton: "hsl(30, 25%, 50%)", // Medium brown close button
    boxHoverBg: "hsl(30, 35%, 92%)" // Slightly darker cream hover
  }
};

const getStyles = (
  mode: "light" | "dark" | "claude-brown",
  claudeModeActive: boolean
): { [key: string]: CSSProperties } => {
  const theme = themes[mode] ?? themes.light;
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
      maxHeight: "200px", // Initial height, can be toggled
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
      maxHeight: "200px", // Limit height
      overflowY: "auto", // Allow scrolling
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
      maxHeight: "200px", // Limit height
      overflowY: "auto", // Allow scrolling
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
      display: "flex",
      flexWrap: "wrap",
      gap: "0px",
      lineHeight: 1.2,
      border: `1px solid ${theme.subtleBorder}`,
      padding: "5px",
      marginTop: "10px",
      flexShrink: 0 // Prevent shrinking
    },
    token: {
      padding: "2px 0px",
      margin: "0",
      marginLeft: "-1px",
      borderRadius: "2px",
      cursor: "pointer",
      whiteSpace: "pre-wrap",
      border: "1px solid transparent",
      transition: "outline 0.1s ease-in-out, background-color 0.1s ease-in-out",
      letterSpacing: "0.5px",
      display: "inline-block",
      position: "relative",
      verticalAlign: "bottom",
      lineHeight: 1.2
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
      height: "100%"
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
      backgroundColor:
        mode === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(40, 40, 40, 0.9)",
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
const getRankingMetricDisplayName = (metric: "max" | "l1" | "l0"): string => {
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
export const SaeVis: React.FC<SaeVisProps> = ({
  tokens,
  featureActivations,
  featureLabels,
  numTopFeaturesPerToken = 5,
  numTopFeaturesOverall = 20,
  initialRankingMetric = "max",
  activationThreshold = null,
  colorMap = "reds"
}) => {
  // --- State ---
  const [rankingMetric, setRankingMetric] = useState<"max" | "l1" | "l0">(
    initialRankingMetric
  );
  const [currentThreshold, setCurrentThreshold] = useState<number | null>(
    activationThreshold
  );
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<
    number | null
  >(null);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(
    null
  );
  const [hoverTokenTooltipData, setHoverTokenTooltipData] =
    useState<HoverTokenTooltipData | null>(null);
  const [selectedTokenIndices, setSelectedTokenIndices] = useState<number[]>(
    []
  );
  const [featureSearchTerm, setFeatureSearchTerm] = useState("");
  const [numOverallToShow, setNumOverallToShow] = useState(
    numTopFeaturesOverall
  );
  const [numTokenToShow, setNumTokenToShow] = useState(numTopFeaturesPerToken);
  const [minColorBound, setMinColorBound] = useState<number | string | null>(
    null
  );
  const [maxColorBound, setMaxColorBound] = useState<number | string | null>(
    null
  );
  const [isCompactView, setIsCompactView] = useState<boolean>(false);
  const [featureListHeight, setFeatureListHeight] = useState<string>("200px"); // Reverted state
  const [focusedFeatureInfo, setFocusedFeatureInfo] =
    useState<FocusedFeatureData | null>(null);

  // NEW State
  const [selectedFeatureIndices, setSelectedFeatureIndices] = useState<
    number[]
  >([]);
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(
    null
  );
  const [multiColorTokens, setMultiColorTokens] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<"light" | "dark" | "claude-brown">(
    "light"
  );
  const [selectedColorMap, setSelectedColorMap] = useState<string>(colorMap);
  const [showTokenFeatures, setShowTokenFeatures] = useState<boolean>(false); // Hidden by default
  const [claudeModeActive, setClaudeModeActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const styles = useMemo(
    () => getStyles(colorMode, claudeModeActive),
    [colorMode, claudeModeActive]
  );
  const theme = themes[colorMode] ?? themes.light;

  // --- Memoized Calculations ---

  const scoreMetricDescription = useMemo(() => {
    switch (rankingMetric) {
      case "l1":
        return "Mean Abs Activation (L1)";
      case "l0":
        return "Non-Zero Count (L0)";
      case "max":
      default:
        return "Max Activation";
    }
  }, [rankingMetric]);

  const allFeatures = useMemo(() => {
    return calculateFeatureScores(
      featureActivations,
      featureLabels,
      currentThreshold
    );
  }, [featureActivations, featureLabels, currentThreshold]);

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
    if (!searchTerm) return rankedFeatures;
    return rankedFeatures.filter(
      (feature) =>
        feature.label.toLowerCase().includes(searchTerm) ||
        String(feature.index).includes(searchTerm)
    );
  }, [rankedFeatures, featureSearchTerm]);

  const topFilteredAndRankedFeatures = useMemo(() => {
    return filteredAndRankedFeatures.slice(0, numOverallToShow);
  }, [filteredAndRankedFeatures, numOverallToShow]);

  // Determine the feature index to use for temporary token coloring
  // Hover always takes precedence for previewing
  const coloringFeatureIndex =
    hoveredFeatureIndex ??
    (selectedFeatureIndices.length === 1 ? selectedFeatureIndices[0] : null);

  // Determine if multi-color modes should be active based *only* on selection state
  const isMultiSegmentMode =
    multiColorTokens && selectedFeatureIndices.length >= 2;
  const isMultiMaximizeMode =
    !multiColorTokens && selectedFeatureIndices.length >= 1;

  // Find full feature info for selected features (needed for the new list)
  const selectedFeaturesData = useMemo(() => {
    return selectedFeatureIndices
      .map((index) => rankedFeatures.find((f) => f.index === index))
      .filter((f): f is FeatureInfo => f !== undefined);
  }, [selectedFeatureIndices, rankedFeatures]);

  // Calculate actual min/max used for scale (needed for placeholder)
  const calculatedColorBounds = useMemo(() => {
    if (coloringFeatureIndex === null || !featureActivations[0]) {
      return { min: 0, max: 0 };
    }
    const actsForFeature = featureActivations.map(
      (tokenActs) => tokenActs[coloringFeatureIndex] ?? 0
    );
    return {
      min: Math.min(...actsForFeature),
      max: Math.max(...actsForFeature)
    };
  }, [coloringFeatureIndex, featureActivations]);

  // UPDATED: Use selectedColorMap state and clamp interpolators from lookup
  const singleColorScale = useMemo(() => {
    if (coloringFeatureIndex === null || !featureActivations[0]) {
      return () => styles.container.backgroundColor || "#ffffff";
    }
    const actsForFeature = featureActivations.map(
      (tokenActs) => tokenActs[coloringFeatureIndex] ?? 0
    );
    const calculatedMin = Math.min(...actsForFeature);
    const calculatedMax = Math.max(...actsForFeature);
    const domainMinRaw =
      minColorBound !== null && minColorBound !== ""
        ? parseFloat(minColorBound as string)
        : calculatedMin;
    const domainMaxRaw =
      maxColorBound !== null && maxColorBound !== ""
        ? parseFloat(maxColorBound as string)
        : calculatedMax;
    const domainMin = Number.isNaN(domainMinRaw) ? calculatedMin : domainMinRaw;
    const domainMax = Number.isNaN(domainMaxRaw) ? calculatedMax : domainMaxRaw;
    const userColorMapKey = selectedColorMap.toLowerCase();

    // Handle Claude mode specific color map and potential override
    let effectiveMapKey = userColorMapKey;
    if (claudeModeActive) {
      effectiveMapKey = "claudeOranges"; // Force Claude map if mode is active
    }
    const effectiveInterpolator =
      d3ColorMapLookup[effectiveMapKey] ?? d3ColorMapLookup.reds;

    if (!d3ColorMapLookup[effectiveMapKey]) {
      console.warn(`Color map "${effectiveMapKey}" not supported, using Reds.`);
    }
    const isDiverging = [
      "coolwarm",
      "rdylbu",
      "piyg",
      "prgn",
      "spectral"
    ].includes(effectiveMapKey);
    if (isDiverging) {
      const absMax = Math.max(Math.abs(domainMin), Math.abs(domainMax));
      const effectiveAbsMax = absMax === 0 ? 0.001 : absMax;
      return scaleSequential(effectiveInterpolator)
        .domain([-effectiveAbsMax, effectiveAbsMax])
        .clamp(true);
    }
    const effectiveMin =
      domainMin === domainMax ? domainMin - 0.001 : domainMin;
    const effectiveMax =
      domainMin === domainMax ? domainMax + 0.001 : domainMax;

    // Apply clipping/scaling (0.7 clamp on upper end) universally
    const scaleDomainMin = effectiveMin;
    const scaleDomainMax = effectiveMin + (effectiveMax - effectiveMin) * 0.7; // Applied unconditionally

    return scaleSequential(effectiveInterpolator)
      .domain([scaleDomainMin, scaleDomainMax]) // Use potentially clipped domain
      .clamp(true);
  }, [
    coloringFeatureIndex,
    selectedColorMap,
    minColorBound,
    maxColorBound,
    featureActivations,
    styles.container.backgroundColor,
    claudeModeActive
  ]);

  // UPDATED: Use selectedColorMap state and clamp interpolators from lookup
  const featureScales = useMemo(() => {
    const scales: { [key: number]: (t: number) => string } = {};
    if (!featureActivations[0]) return scales;
    const numFeatures = featureActivations[0].length;
    const userColorMapKey = selectedColorMap.toLowerCase();
    const effectiveInterpolator =
      d3ColorMapLookup[userColorMapKey] ?? d3ColorMapLookup.reds;
    const isDiverging = [
      "coolwarm",
      "rdylbu",
      "piyg",
      "prgn",
      "spectral"
    ].includes(userColorMapKey);
    for (let i = 0; i < numFeatures; i++) {
      const acts = featureActivations.map((tokenActs) => tokenActs[i] ?? 0);
      const minAct = Math.min(...acts);
      const maxAct = Math.max(...acts);
      const domainMinRaw =
        minColorBound !== null && minColorBound !== ""
          ? parseFloat(minColorBound as string)
          : minAct;
      const domainMaxRaw =
        maxColorBound !== null && maxColorBound !== ""
          ? parseFloat(maxColorBound as string)
          : maxAct;
      const domainMin = Number.isNaN(domainMinRaw) ? minAct : domainMinRaw;
      const domainMax = Number.isNaN(domainMaxRaw) ? maxAct : domainMaxRaw;
      if (isDiverging) {
        const absMax = Math.max(Math.abs(domainMin), Math.abs(domainMax));
        const effectiveAbsMax = absMax === 0 ? 0.001 : absMax;
        scales[i] = scaleSequential(effectiveInterpolator)
          .domain([-effectiveAbsMax, effectiveAbsMax])
          .clamp(true);
      } else {
        const effectiveMin =
          domainMin === domainMax ? domainMin - 0.001 : domainMin;
        const effectiveMax =
          domainMin === domainMax ? domainMax + 0.001 : domainMax;
        scales[i] = scaleSequential(effectiveInterpolator)
          .domain([effectiveMin, effectiveMax])
          .clamp(true);
      }
    }
    return scales;
  }, [featureActivations, selectedColorMap, minColorBound, maxColorBound]);

  // --- Event Handlers ---

  const handleFeatureMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      setHoveredFeatureIndex(index);

      if (isCompactView) {
        const feature = rankedFeatures.find((f) => f.index === index);
        if (
          feature &&
          (!focusedFeatureInfo ||
            !focusedFeatureInfo.isClick ||
            focusedFeatureInfo.index !== index)
        ) {
          const containerRect = containerRef.current?.getBoundingClientRect();
          const position = {
            x: event.clientX - (containerRect?.left ?? 0) + 15,
            y: event.clientY - (containerRect?.top ?? 0) + 15
          };
          setFocusedFeatureInfo({ ...feature, isClick: false, position });
        }
      }
    },
    [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]
  );

  const handleFeatureMouseLeave = useCallback(() => {
    setHoveredFeatureIndex(null);

    if (isCompactView && focusedFeatureInfo && !focusedFeatureInfo.isClick) {
      setFocusedFeatureInfo(null);
    }
  }, [isCompactView, focusedFeatureInfo]);

  const handleFeatureClick = useCallback(
    (index: number, event: React.MouseEvent) => {
      // Toggle in multi-select list
      setSelectedFeatureIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );

      // Update single selected index ONLY if multi-select is becoming empty or just starting
      // This allows single-feature coloring when only one feature is selected
      setSelectedFeatureIndices((currentSelected) => {
        if (currentSelected.length === 1) {
          setSelectedFeatureIndex(currentSelected[0]);
        } else {
          setSelectedFeatureIndex(null); // Use multi-color logic if > 1 or 0 selected
        }
        return currentSelected; // Return current state for chaining
      });

      if (isCompactView) {
        const feature = rankedFeatures.find((f) => f.index === index);
        if (!feature) return;

        if (focusedFeatureInfo?.index === index && focusedFeatureInfo.isClick) {
          setFocusedFeatureInfo(null);
        } else {
          const containerRect = containerRef.current?.getBoundingClientRect();
          const position = {
            x: event.clientX - (containerRect?.left ?? 0) + 15,
            y: event.clientY - (containerRect?.top ?? 0) + 15
          };
          setFocusedFeatureInfo({ ...feature, isClick: true, position });
        }
      }
    },
    [isCompactView, rankedFeatures, focusedFeatureInfo, containerRef]
  );

  const handleTokenMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      setHoveredTokenIndex(index);

      if (selectedTokenIndices.includes(index)) {
        setHoverTokenTooltipData(null);
        return;
      }
      const topFeatures = getTopFeaturesForToken(
        index,
        featureActivations,
        featureLabels,
        numTokenToShow,
        currentThreshold
      );
      const currentSelectedFeatureIndexValue =
        selectedFeatureIndex !== null
          ? featureActivations[index]?.[selectedFeatureIndex] ?? null
          : null;

      // Calculate position relative to containerRef
      const containerRect = containerRef.current?.getBoundingClientRect();
      const scrollLeft = containerRef.current?.scrollLeft ?? 0;
      const scrollTop = containerRef.current?.scrollTop ?? 0;
      const position = {
        x: event.clientX - (containerRect?.left ?? 0) + scrollLeft + 15,
        y: event.clientY - (containerRect?.top ?? 0) + scrollTop + 15 // Adjust for scroll
      };

      setHoverTokenTooltipData({
        tokenIndex: index,
        topFeatures,
        selectedFeatureValue: currentSelectedFeatureIndexValue,
        position
      });
    },
    [
      featureActivations,
      featureLabels,
      numTokenToShow,
      currentThreshold,
      selectedFeatureIndex,
      selectedTokenIndices
    ]
  );

  const handleTokenMouseLeave = useCallback(() => {
    setHoveredTokenIndex(null);
    setHoverTokenTooltipData(null);
  }, []);

  const handleTokenClick = useCallback((index: number) => {
    setSelectedTokenIndices((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      }
      return [...prevSelected, index];
    });
    setHoverTokenTooltipData(null);
  }, []);

  const handleTokenTooltipFeatureClick = (featureIndex: number) => {
    // Add to multi-select list (toggle behavior)
    setSelectedFeatureIndices((prev) =>
      prev.includes(featureIndex)
        ? prev.filter((i) => i !== featureIndex)
        : [...prev, featureIndex]
    );

    // Update single selected index based on multi-select state
    setSelectedFeatureIndices((currentSelected) => {
      if (currentSelected.length === 1) {
        setSelectedFeatureIndex(currentSelected[0]);
      } else {
        setSelectedFeatureIndex(null); // Use multi-color logic if > 1 or 0 selected
      }
      return currentSelected; // Return current state for chaining
    });

    // Keep compact view tooltip logic
    if (isCompactView && focusedFeatureInfo?.isClick) {
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

  const handleDeselectToken = useCallback((indexToRemove: number) => {
    setSelectedTokenIndices((prevSelected) =>
      prevSelected.filter((i) => i !== indexToRemove)
    );
    setHoverTokenTooltipData(null);
  }, []);

  const handleDeselectFeature = useCallback((indexToRemove: number) => {
    setSelectedFeatureIndices((prevSelected) =>
      prevSelected.filter((i) => i !== indexToRemove)
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

  const closeFeatureInfoTooltip = useCallback(() => {
    setFocusedFeatureInfo(null);
  }, []);

  const handleBoundInputChange = (
    setter: React.Dispatch<React.SetStateAction<number | string | null>>,
    value: string
  ) => {
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
    setColorMode("light");
    setClaudeModeActive(false);
  }, [colorMap]);

  const toggleCompactView = useCallback(() => {
    setIsCompactView((prev) => !prev);
    setFocusedFeatureInfo(null);
    setHoveredFeatureIndex(null);
  }, []);

  const toggleFeatureListHeight = useCallback(() => {
    setFeatureListHeight((prev) => (prev === "200px" ? "500px" : "200px"));
  }, []);

  const handleMultiColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMultiColorTokens(event.target.checked);
    },
    []
  );

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
    return Object.keys(d3ColorMapLookup).filter(
      (name) => name !== "claudeOranges"
    );
  }, []);

  // --- Rendering ---

  if (!tokens || !featureActivations) {
    return <div style={styles.container}>Loading or no data...</div>;
  }

  const isTokenSelected = (index: number): boolean => {
    return selectedTokenIndices.includes(index);
  };

  return (
    <div style={{ ...styles.container }} ref={containerRef}>
      {/* --- Controls --- */}
      <div style={styles.controls}>
        <div>
          <label>Rank by: </label>
          <select
            value={rankingMetric}
            onChange={(e) =>
              setRankingMetric(e.target.value as "max" | "l1" | "l0")
            }
          >
            <option value="max">Max Activation</option>
            <option value="l1">Mean Abs Activation (L1)</option>
            <option value="l0">Non-Zero Count (L0)</option>
          </select>
        </div>
        <div>
          <label>Threshold: </label>
          <input
            type="number"
            step="any"
            placeholder="None"
            value={currentThreshold === null ? "" : currentThreshold}
            onChange={(e) =>
              setCurrentThreshold(
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            style={{ width: "60px" }}
            title="Activation threshold for L0 ranking and token tooltips"
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Min Color: </label>
          <input
            type="number"
            step="any"
            placeholder={calculatedColorBounds.min.toPrecision(3)}
            value={minColorBound ?? ""}
            onChange={(e) =>
              handleBoundInputChange(setMinColorBound, e.target.value)
            }
            style={{ width: "60px" }}
            title="Minimum value for color scale (leave blank for auto)"
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Max Color: </label>
          <input
            type="number"
            step="any"
            placeholder={calculatedColorBounds.max.toPrecision(3)}
            value={maxColorBound ?? ""}
            onChange={(e) =>
              handleBoundInputChange(setMaxColorBound, e.target.value)
            }
            style={{ width: "60px" }}
            title="Maximum value for color scale (leave blank for auto)"
          />
          <button
            onClick={handleResetAll}
            title="Reset color bounds, selected features, and selected tokens"
          >
            Reset All
          </button>
        </div>
        <div>
          <label>Top Overall: </label>
          <input
            type="number"
            min="1"
            step="1"
            value={numOverallToShow}
            onChange={(e) => setNumOverallToShow(parseInt(e.target.value, 10))}
            style={{ width: "50px" }}
          />
        </div>
        <div>
          <label>Top Per Token: </label>
          <input
            type="number"
            min="1"
            step="1"
            value={numTokenToShow}
            onChange={(e) => setNumTokenToShow(parseInt(e.target.value, 10))}
            style={{ width: "50px" }}
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            type="checkbox"
            id="multiColorCheckbox"
            checked={multiColorTokens}
            onChange={handleMultiColorChange}
            disabled={selectedFeatureIndices.length < 2}
            title={
              selectedFeatureIndices.length < 2
                ? "Select 2 or more features to enable"
                : "Color tokens based on activations of all selected features"
            }
          />
          <label htmlFor="multiColorCheckbox">Multi-Color Tokens</label>
        </div>
        <div>
          <label>Color Map: </label>
          <select
            value={selectedColorMap}
            onChange={(e) => {
              setSelectedColorMap(e.target.value);
              setClaudeModeActive(false); // Deactivate Claude if map manually changed
            }}
            title="Select color map for activations"
          >
            {/* Use filtered list for options */}
            {dropdownColorMaps.map((mapName) => (
              <option key={mapName} value={mapName}>
                {mapName}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={toggleColorMode}
          title={`Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode`}
        >
          {colorMode === "light" ? "Dark Mode" : "Light Mode"}
        </button>
        <button
          onClick={activateClaudeMode}
          title="Activate Claude Mode Theme"
          style={{ opacity: 0.7, marginLeft: "auto" }}
        >
          ✨
        </button>
      </div>

      {/* --- Feature Search & List Controls --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={styles.featureSearch}>
          <label>Search Features: </label>
          <input
            type="text"
            placeholder="Index or Label..."
            value={featureSearchTerm}
            onChange={(e) => setFeatureSearchTerm(e.target.value)}
            style={{ width: "200px", padding: "4px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <button
            onClick={toggleCompactView}
            style={styles.compactButton}
            title={isCompactView ? "Show Full Labels" : "Show Compact View"}
          >
            {isCompactView ? "Expand View" : "Compact View"}
          </button>
          <button
            onClick={toggleFeatureListHeight}
            style={styles.compactButton}
            title={
              featureListHeight === "200px"
                ? "Expand Feature List"
                : "Collapse Feature List"
            }
          >
            {featureListHeight === "200px" ? "Expand List" : "Collapse List"}
          </button>
        </div>
      </div>

      {/* --- Overall Feature List (Conditionally Rendered) --- */}
      <div
        style={{ ...styles.featureListContainer, maxHeight: featureListHeight }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingRight: "8px",
            position: "sticky",
            top: 0,
            backgroundColor: theme.containerBg,
            zIndex: 1
          }}
        >
          <strong>
            Top {topFilteredAndRankedFeatures.length} Features ({" "}
            {filteredAndRankedFeatures.length} Total) (Ranked by{" "}
            {getRankingMetricDisplayName(rankingMetric)}
            {featureSearchTerm ? ", Filtered" : ""}):
          </strong>
          {!isCompactView && (
            <span
              style={{
                fontSize: "0.8em",
                color: theme.dimText,
                whiteSpace: "nowrap"
              }}
            >
              Score: {scoreMetricDescription}
            </span>
          )}
        </div>
        {isCompactView ? (
          <div style={styles.featureGrid}>
            {topFilteredAndRankedFeatures.map((feature) => {
              const featureTitle = `Index: ${
                feature.index
              }\nMax: ${feature.maxActivation.toFixed(
                3
              )}, L1: ${feature.meanAbsActivation.toFixed(3)}, L0: ${
                feature.nonZeroCount
              }\n${feature.label}`;
              const isSelected = selectedFeatureIndex === feature.index;
              const isHovered = hoveredFeatureIndex === feature.index;

              return (
                <div
                  key={feature.index}
                  style={{
                    ...styles.featureTile,
                    ...(isHovered ? styles.featureTileHover : {}),
                    ...(isSelected ? styles.featureTileSelected : {})
                  }}
                  onMouseEnter={(e) =>
                    handleFeatureMouseEnter(feature.index, e)
                  }
                  onMouseLeave={handleFeatureMouseLeave}
                  onClick={(e) => handleFeatureClick(feature.index, e)}
                  title={featureTitle}
                >
                  {feature.index}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {topFilteredAndRankedFeatures.map((feature) => {
              const featureTitle = `Index: ${
                feature.index
              }\nMax: ${feature.maxActivation.toFixed(
                3
              )}, L1: ${feature.meanAbsActivation.toFixed(3)}, L0: ${
                feature.nonZeroCount
              }\n${feature.label}`;
              return (
                <div
                  key={feature.index}
                  style={{
                    ...styles.featureListItem,
                    ...(hoveredFeatureIndex === feature.index
                      ? styles.featureListItemHover
                      : {}),
                    ...(selectedFeatureIndex === feature.index
                      ? styles.featureListItemSelected
                      : {})
                  }}
                  onMouseEnter={(e) =>
                    handleFeatureMouseEnter(feature.index, e)
                  }
                  onMouseLeave={handleFeatureMouseLeave}
                  onClick={(e) => handleFeatureClick(feature.index, e)}
                  title={featureTitle}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 1,
                      marginRight: "5px"
                    }}
                  >
                    <strong>F{feature.index}:</strong> {feature.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginLeft: "auto",
                      flexShrink: 0
                    }}
                  >
                    <span
                      style={{
                        ...styles.dynamicInfoLabel,
                        whiteSpace: "nowrap"
                      }}
                    >
                      Value:
                    </span>
                    <span
                      style={{
                        ...styles.featureValueIndicator,
                        backgroundColor: selectedTokenIndices.includes(
                          feature.index
                        )
                          ? theme.selectedItemBg
                          : theme.bg
                      }}
                    >
                      {selectedTokenIndices.includes(feature.index)
                        ? tokens[selectedTokenIndices[0]]
                        : "N/A"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {filteredAndRankedFeatures.length > numOverallToShow && (
          <div
            style={{
              textAlign: "center",
              padding: "5px",
              fontSize: "0.8em",
              color: "#555"
            }}
          >
            Showing {numOverallToShow} of {filteredAndRankedFeatures.length}{" "}
            features.
          </div>
        )}
        {filteredAndRankedFeatures.length === 0 && featureSearchTerm && (
          <div
            style={{
              textAlign: "center",
              padding: "5px",
              fontSize: "0.9em",
              color: "#777"
            }}
          >
            No features match search term.
          </div>
        )}
      </div>

      {/* --- NEW: Persistent Selected Features Area --- */}
      {selectedFeaturesData.length > 0 && (
        <div style={styles.selectedFeaturesContainer}>
          <strong>Selected Features:</strong>
          {selectedFeaturesData.map((feature) => {
            const valueAtHoveredToken =
              hoveredTokenIndex !== null
                ? featureActivations[hoveredTokenIndex]?.[feature.index] ?? 0
                : null;
            const scale = featureScales[feature.index];
            const indicatorColor =
              valueAtHoveredToken !== null && scale
                ? scale(valueAtHoveredToken)
                : theme.bg;
            let indicatorTextColor = theme.text;
            if (valueAtHoveredToken !== null) {
              indicatorTextColor =
                getLuminance(indicatorColor) > 0.5
                  ? themes.light.text
                  : themes.dark.text;
            }
            const isHoverTarget =
              hoveredTokenIndex !== null &&
              featureActivations[hoveredTokenIndex]?.[feature.index] !==
                undefined;
            const displayValue = valueAtHoveredToken?.toPrecision(3) ?? "N/A";

            // --- Compact View for Selected Feature --- //
            if (isCompactView) {
              return (
                <div
                  key={feature.index}
                  style={{
                    ...styles.selectedFeatureInfoBox,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 8px"
                  }}
                >
                  {/* Left side: Feature Info - Apply CSS truncation */}
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 1,
                      marginRight: "5px"
                    }}
                    title={feature.label}
                  >
                    <strong>F{feature.index}:</strong> {feature.label}
                  </span>

                  {/* Right side: Value + Close Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginLeft: "auto",
                      flexShrink: 0
                    }}
                  >
                    {/* Simplified Value Label */}
                    <span
                      style={{
                        ...styles.dynamicInfoLabel,
                        whiteSpace: "nowrap"
                      }}
                    >
                      Value:
                    </span>

                    {/* Value Indicator */}
                    <span
                      style={{
                        ...styles.featureValueIndicator,
                        backgroundColor: indicatorColor,
                        color: indicatorTextColor
                      }}
                      title={`Activation: ${displayValue}`}
                    >
                      {displayValue}
                    </span>

                    {/* Close Button */}
                    <button
                      onClick={() => handleDeselectFeature(feature.index)}
                      style={{
                        ...styles.selectedItemCloseButton,
                        position: "static",
                        fontSize: "1.1em",
                        padding: "0 3px"
                      }}
                      title="Deselect Feature"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            }

            // --- Full View for Selected Feature --- //
            const fullViewBoxStyle = {
              ...styles.selectedFeatureInfoBox,
              backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
            };
            return (
              <div key={feature.index} style={fullViewBoxStyle}>
                <button
                  onClick={() => handleDeselectFeature(feature.index)}
                  style={styles.selectedItemCloseButton}
                  title="Deselect Feature"
                >
                  ×
                </button>
                <div>
                  <strong>Feature {feature.index}:</strong> {feature.label}
                  {" - "}
                  <span
                    style={{
                      fontSize: "0.9em",
                      color: styles.featureScore.color
                    }}
                  >
                    (Max: {feature.maxActivation.toPrecision(3)}, L1:{" "}
                    {feature.meanAbsActivation.toPrecision(3)}, L0:{" "}
                    {feature.nonZeroCount})
                  </span>
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span style={styles.dynamicInfoLabel}>Value at Token </span>
                  {hoveredTokenIndex !== null ? (
                    <span style={{ fontWeight: "bold" }}>
                      {tokens[hoveredTokenIndex]}
                    </span>
                  ) : (
                    "?"
                  )}
                  :
                  <span
                    style={{
                      ...styles.featureValueIndicator,
                      backgroundColor: indicatorColor,
                      color: indicatorTextColor
                    }}
                    title={`Activation: ${displayValue}`}
                  >
                    {displayValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- NEW: Persistent Selected Token Info Area --- */}
      {selectedTokenIndices.length > 0 && (
        <div
          style={{
            ...styles.selectedTokensContainer,
            ...(isCompactView && !showTokenFeatures
              ? styles.selectedTokensContainerCompactWrap
              : {})
          }}
        >
          {/* Header with Show/Hide button - only shown if NOT in compact tiling view */}
          {!(isCompactView && !showTokenFeatures) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px"
              }}
            >
              <strong>Selected Tokens:</strong>
              <button
                onClick={toggleShowTokenFeatures}
                style={styles.compactButton}
                title={
                  showTokenFeatures
                    ? "Hide Top Features list"
                    : "Show Top Features list"
                }
              >
                {showTokenFeatures ? "Hide Top Features" : "Show Top Features"}
              </button>
            </div>
          )}

          {selectedTokenIndices.map((tokenIndex) => {
            const valueOfHoveredFeature =
              hoveredFeatureIndex !== null
                ? featureActivations[tokenIndex]?.[hoveredFeatureIndex] ?? 0
                : null;
            const hoveredFeatureInfo =
              hoveredFeatureIndex !== null
                ? rankedFeatures.find((f) => f.index === hoveredFeatureIndex)
                : null;
            const scale =
              hoveredFeatureIndex !== null
                ? featureScales[hoveredFeatureIndex]
                : null;
            const indicatorColor =
              valueOfHoveredFeature !== null && scale
                ? scale(valueOfHoveredFeature)
                : theme.bg;
            let indicatorTextColor = theme.text;
            if (valueOfHoveredFeature !== null) {
              indicatorTextColor =
                getLuminance(indicatorColor) > 0.5
                  ? themes.light.text
                  : themes.dark.text;
            }
            const isHoverTarget =
              hoveredFeatureIndex !== null &&
              featureActivations[tokenIndex]?.[hoveredFeatureIndex] !==
                undefined;
            const boxStyle = {
              ...styles.selectedTokenInfoBox,
              backgroundColor: isHoverTarget ? theme.boxHoverBg : theme.bg
            };
            const displayValue = valueOfHoveredFeature?.toPrecision(3) ?? "N/A";

            // --- Compact TILING View for Selected Token --- //
            if (isCompactView && !showTokenFeatures) {
              return (
                <div
                  key={tokenIndex}
                  style={styles.selectedTokenInfoBoxCompactTile} // Tile style
                >
                  <span>
                    <strong>T{tokenIndex}:</strong> &quot;
                    {tokens[tokenIndex].substring(0, 10)}&quot;
                    {/* Shorter substring */}
                    {tokens[tokenIndex].length > 10 ? "..." : ""}
                  </span>
                  <span
                    style={{
                      ...styles.featureValueIndicator,
                      padding: "0 2px", // Tighter padding
                      height: "1.3em",
                      minWidth: "2em",
                      fontSize: "0.8em",
                      backgroundColor: indicatorColor,
                      color: indicatorTextColor
                    }}
                    title={`Activation: ${displayValue}`}
                  >
                    {displayValue}
                  </span>
                  <button
                    onClick={() => handleDeselectToken(tokenIndex)}
                    style={{
                      ...styles.selectedItemCloseButton,
                      position: "static",
                      fontSize: "1em",
                      padding: "0 2px"
                    }}
                    title="Deselect Token"
                  >
                    ×
                  </button>
                </div>
              );
            }

            // --- Compact SINGLE LINE View for Selected Token (when top features ARE shown) --- //
            if (isCompactView) {
              return (
                <div key={tokenIndex} style={boxStyle}>
                  <button
                    onClick={() => handleDeselectToken(tokenIndex)}
                    style={styles.selectedItemCloseButton}
                    title="Deselect Token"
                  >
                    ×
                  </button>
                  <strong>
                    Token {tokenIndex}: &quot;{tokens[tokenIndex]}&quot;
                  </strong>
                  <div
                    style={{
                      marginTop: "5px",
                      paddingTop: "5px",
                      borderTop: `1px dashed ${styles.container.borderColor}`
                    }}
                  >
                    <span style={styles.dynamicInfoLabel}>
                      Value of feature (
                      {coloringFeatureIndex ?? hoveredFeatureIndex ?? "?"}):
                    </span>
                    <span
                      style={{
                        ...styles.featureValueIndicator,
                        backgroundColor: indicatorColor,
                        color: indicatorTextColor
                      }}
                      title={`Activation: ${displayValue}`}
                    >
                      {displayValue}
                    </span>
                    {hoveredFeatureInfo && (
                      <span
                        style={{
                          ...styles.featureListDescription,
                          marginLeft: "8px"
                        }}
                      >
                        - {hoveredFeatureInfo.label.substring(0, 60)}
                        {hoveredFeatureInfo.label.length > 60 ? "..." : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={tokenIndex} style={boxStyle}>
                <button
                  onClick={() => handleDeselectToken(tokenIndex)}
                  style={styles.selectedItemCloseButton}
                  title="Deselect Token"
                >
                  ×
                </button>
                <strong>
                  Token {tokenIndex}: &quot;{tokens[tokenIndex]}&quot;
                </strong>
                <div
                  style={{
                    marginTop: "5px",
                    paddingTop: "5px",
                    borderTop: `1px dashed ${styles.container.borderColor}`
                  }}
                >
                  <span style={styles.dynamicInfoLabel}>
                    Value of feature (
                    {coloringFeatureIndex ?? hoveredFeatureIndex ?? "?"}):
                  </span>
                  <span
                    style={{
                      ...styles.featureValueIndicator,
                      backgroundColor: indicatorColor,
                      color: indicatorTextColor
                    }}
                    title={`Activation: ${displayValue}`}
                  >
                    {displayValue}
                  </span>
                  {hoveredFeatureInfo && (
                    <span
                      style={{
                        ...styles.featureListDescription,
                        marginLeft: "8px"
                      }}
                    >
                      - {hoveredFeatureInfo.label.substring(0, 60)}
                      {hoveredFeatureInfo.label.length > 60 ? "..." : ""}
                    </span>
                  )}
                </div>
                {showTokenFeatures && (
                  <div
                    style={{
                      marginTop: "5px",
                      paddingTop: "5px",
                      borderTop: `1px dashed ${styles.container.borderColor}`
                    }}
                    title={`Showing top ${numTokenToShow} features with abs activation >= ${
                      currentThreshold ?? 0
                    }`}
                  >
                    <strong>Top Features (Token-Specific):</strong>
                    {getTopFeaturesForToken(
                      tokenIndex,
                      featureActivations,
                      featureLabels,
                      numTokenToShow,
                      currentThreshold
                    ).length === 0 && <div>(None above threshold)</div>}
                    {getTopFeaturesForToken(
                      tokenIndex,
                      featureActivations,
                      featureLabels,
                      numTokenToShow,
                      currentThreshold
                    ).map((feat) => (
                      <div key={feat.index}>
                        <span style={styles.featureListIndexValue}>{`Feat ${
                          feat.index
                        }: ${feat.activation.toFixed(3)}`}</span>
                        <span
                          style={{
                            ...styles.featureListDescription,
                            cursor: "pointer"
                          }}
                          className="feature-list-item-clickable"
                          onClick={() =>
                            handleTokenTooltipFeatureClick(feat.index)
                          }
                          onMouseEnter={(e: React.MouseEvent) => {
                            (e.target as HTMLDivElement).style.textDecoration =
                              "underline";
                          }}
                          onMouseLeave={(e: React.MouseEvent) => {
                            (e.target as HTMLDivElement).style.textDecoration =
                              "none";
                          }}
                          title={`Select Feature ${feat.index} for coloring/multi-select`}
                        >
                          - {feat.label.substring(0, 60)}
                          {feat.label.length > 60 ? "..." : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Token Sequence --- */}
      <div style={styles.tokenSequence}>
        {tokens.map((token, index) => {
          const isHovered = hoveredTokenIndex === index;
          const isClicked = isTokenSelected(index);
          // Use independent multi-color mode flags derived earlier
          const isMultiSegment = isMultiSegmentMode;
          const isMultiMax = isMultiMaximizeMode;
          let tokenStyle: CSSProperties = { ...styles.token };
          let innerContent: React.ReactNode = token;

          // --- Determine Background/Content based on Hover/Selection Priority --- //

          if (hoveredFeatureIndex !== null) {
            // PRIORITY 1: Hovering over a feature - always show single color for hover target
            const act = featureActivations[index]?.[hoveredFeatureIndex] ?? 0;
            const bgColor = singleColorScale(act); // Use the scale derived from hover index
            const textColor =
              getLuminance(bgColor) > 0.5
                ? themes.light.text
                : themes.dark.text;
            const isDimmed =
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
          } else if (isMultiSegment) {
            // PRIORITY 2: Multi-color segments (No hover, multi-select active)
            const numSegments = selectedFeatureIndices.length;
            const segmentHeight = 100 / numSegments;

            const backgroundSegments = selectedFeatureIndices.map(
              (featIndex) => {
                const act = featureActivations[index]?.[featIndex] ?? 0;
                const scale = featureScales[featIndex];
                const bgColor = scale ? scale(act) : "transparent";
                const segmentStyle: CSSProperties = {
                  height: `${segmentHeight}%`,
                  width: "100%",
                  backgroundColor: bgColor
                };
                return <div key={featIndex} style={segmentStyle}></div>;
              }
            );

            tokenStyle = {
              ...tokenStyle,
              display: "inline",
              position: "relative",
              backgroundColor: "transparent",
              color: theme.text
            };

            innerContent = (
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  verticalAlign: "bottom"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 0
                  }}
                >
                  {backgroundSegments}
                </div>
                <span
                  style={{ ...styles.tokenTextOverlay, position: "relative" }}
                >
                  {token}
                </span>
              </span>
            );
          } else if (isMultiMax) {
            // PRIORITY 3: Maximize over selected features (No hover, multi-select active, not segment mode)
            const maxActInfo = selectedFeatureIndices.reduce(
              (maxInfo, currentFeatIndex) => {
                const currentVal =
                  featureActivations[index]?.[currentFeatIndex] ?? 0;
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

            const scale = featureScales[maxActInfo.index];
            const bgColor = scale ? scale(maxActInfo.value) : "transparent";
            const textColor =
              getLuminance(bgColor) > 0.5
                ? themes.light.text
                : themes.dark.text;

            tokenStyle = {
              ...tokenStyle,
              backgroundColor: bgColor,
              color: textColor
            };
            // innerContent remains default token text
          } else {
            // PRIORITY 4: Single selected feature or default (No hover, no multi-select modes active)
            // Use coloringFeatureIndex which is derived from selectedFeatureIndices (if length === 1)
            const act =
              coloringFeatureIndex !== null
                ? featureActivations[index]?.[coloringFeatureIndex] ?? 0
                : 0;
            const bgColor =
              coloringFeatureIndex !== null
                ? singleColorScale(act)
                : styles.container.backgroundColor || "transparent";
            const textColor =
              getLuminance(bgColor) > 0.5
                ? themes.light.text
                : themes.dark.text;
            const isDimmed =
              coloringFeatureIndex !== null && // Only dim if a feature is actually selected
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

          // --- Apply Hover/Click Outlines --- //
          if (isHovered && !isClicked) {
            tokenStyle = { ...tokenStyle, ...styles.tokenHover };
          }
          if (isClicked) {
            tokenStyle = { ...tokenStyle, ...styles.tokenClicked };
          }

          return (
            <span
              key={index}
              style={tokenStyle}
              onMouseEnter={(e) => handleTokenMouseEnter(index, e)}
              onMouseLeave={handleTokenMouseLeave}
              onClick={() => handleTokenClick(index)}
            >
              {innerContent}
            </span>
          );
        })}
      </div>

      {/* --- HOVER Token Tooltip (Using Portal) --- */}
      {hoverTokenTooltipData && (
        <div
          style={{
            ...styles.tooltip,
            left: `${hoverTokenTooltipData.position.x}px`,
            top: `${hoverTokenTooltipData.position.y}px`
          }}
        >
          <strong>
            Token {hoverTokenTooltipData.tokenIndex}: &quot;
            {tokens[hoverTokenTooltipData.tokenIndex]}&quot;
          </strong>
          {hoverTokenTooltipData.selectedFeatureValue !== null && (
            <div
              style={{
                marginTop: "5px",
                borderTop: "1px dashed #ccc",
                paddingTop: "5px"
              }}
            >
              Selected Feature ({selectedFeatureIndex}):{" "}
              {hoverTokenTooltipData.selectedFeatureValue.toPrecision(3)}
            </div>
          )}
          <br />
          <strong
            title={`Showing top ${numTokenToShow} features with abs activation >= ${
              currentThreshold ?? 0
            }`}
          >
            Top Features (Token-Specific):
          </strong>
          {hoverTokenTooltipData.topFeatures.length === 0 && (
            <div>(None above threshold)</div>
          )}
          {hoverTokenTooltipData.topFeatures.map((feat) => (
            <div key={feat.index}>
              <span style={styles.featureListIndexValue}>{`Feat ${
                feat.index
              }: ${feat.activation.toFixed(3)}`}</span>
              <span
                style={{
                  ...styles.featureListDescription,
                  cursor: "pointer"
                }}
                className="feature-list-item-clickable"
                onClick={() => handleTokenTooltipFeatureClick(feat.index)}
                onMouseEnter={(e: React.MouseEvent) => {
                  (e.target as HTMLDivElement).style.textDecoration =
                    "underline";
                }}
                onMouseLeave={(e: React.MouseEvent) => {
                  (e.target as HTMLDivElement).style.textDecoration = "none";
                }}
                title={`Select Feature ${feat.index} for coloring/multi-select`}
              >
                - {feat.label.substring(0, 60)}
                {feat.label.length > 60 ? "..." : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* --- Feature Info Tooltip (Compact Mode Only - NOT Portalled) --- */}
      {isCompactView && focusedFeatureInfo && (
        <div
          style={{
            ...styles.tooltip,
            position: "absolute",
            left: `${focusedFeatureInfo.position.x}px`,
            top: `${focusedFeatureInfo.position.y}px`,
            ...(focusedFeatureInfo.isClick ? styles.tooltipSticky : {})
          }}
        >
          {focusedFeatureInfo.isClick && (
            <button
              onClick={closeFeatureInfoTooltip}
              style={styles.tooltipCloseButton}
              title="Close Feature Info"
            >
              ×
            </button>
          )}
          <strong>Feature {focusedFeatureInfo.index}</strong>
          <div style={{ marginTop: "5px" }}>
            <strong>Label:</strong> {focusedFeatureInfo.label}
          </div>
          <div
            style={{
              marginTop: "5px",
              paddingTop: "5px",
              borderTop: "1px dashed #ccc"
            }}
          >
            <strong>Stats:</strong>
            <div>Max: {focusedFeatureInfo.maxActivation.toPrecision(3)}</div>
            <div>L1: {focusedFeatureInfo.meanAbsActivation.toPrecision(3)}</div>
            <div>L0: {focusedFeatureInfo.nonZeroCount}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add prop types for robustness (optional but recommended)
// import PropTypes from 'prop-types';
// SaeVis.propTypes = { ... };

export default SaeVis; // Make sure it's the default export if render uses it directly
