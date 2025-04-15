// react/src/components/SaeVis.tsx
import { scaleSequential } from "d3-scale";
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
// Maps user-friendly names to D3 interpolator functions
const d3ColorMapLookup: { [key: string]: (t: number) => string } = {
  // Sequential
  viridis: chromatic.interpolateViridis,
  plasma: chromatic.interpolatePlasma,
  inferno: chromatic.interpolateInferno,
  magma: chromatic.interpolateMagma,
  cividis: chromatic.interpolateCividis,
  gray: chromatic.interpolateGreys,
  // Diverging
  coolwarm: chromatic.interpolateWarm,
  rdylbu: chromatic.interpolateRdYlBu,
  piyg: chromatic.interpolatePiYG,
  prgn: chromatic.interpolatePRGn,
  spectral: chromatic.interpolateSpectral,
  // Single Hue / Sequential
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

// --- Styles --- (Basic inline styles)

const styles: { [key: string]: CSSProperties } = {
  container: {
    fontFamily: "sans-serif",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    position: "relative"
  },
  controls: {
    marginBottom: "10px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  featureSearch: { marginBottom: "10px" },
  featureListContainer: {
    marginBottom: "15px",
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #eee"
  },
  featureListItem: {
    padding: "5px 8px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "0.9em",
    display: "flex",
    justifyContent: "space-between"
  },
  featureListItemHover: { outline: "1px solid #cccccc" },
  featureListItemSelected: {
    backgroundColor: "#e0e8ff", // Lighter blue
    fontWeight: "bold",
    borderLeft: "3px solid #4a90e2", // Slightly brighter blue border
    color: "#000000" // Ensure text is black
  },
  featureScore: { color: "#555", fontSize: "0.9em" },
  tokenSequence: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0px",
    lineHeight: 1.2,
    border: "1px solid #eee",
    padding: "5px",
    marginTop: "10px" // Add margin if selected token boxes are present
  },
  token: {
    padding: "2px 0px",
    margin: "0.5px",
    marginLeft: "0.5px",
    borderRadius: "2px",
    cursor: "pointer",
    whiteSpace: "pre-wrap",
    border: "none",
    transition: "border 0.1s ease-in-out"
  },
  tokenHover: {
    border: "1px solid #aaa"
  },
  tokenClicked: {
    border: "1.5px solid #333",
    textDecoration: "underline",
    textUnderlineOffset: "2px"
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "white",
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
    color: "#ccc",
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
    padding: "2px 5px",
    fontSize: "0.85em",
    border: "1px solid #ddd",
    borderRadius: "3px",
    cursor: "pointer",
    textAlign: "center",
    minWidth: "50px"
  },
  featureTileHover: { outline: "1px solid #cccccc" },
  featureTileSelected: {
    backgroundColor: "#e0e8ff",
    fontWeight: "bold",
    borderColor: "#4a90e2",
    color: "#000000"
  },
  selectedTokensContainer: {
    marginTop: "15px",
    marginBottom: "5px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9"
  },
  selectedTokenInfoBox: {
    border: "1px solid #ccc",
    borderRadius: "3px",
    padding: "8px",
    marginBottom: "8px",
    backgroundColor: "#fff",
    position: "relative", // For close button positioning
    fontSize: "0.9em"
  },
  selectedTokenCloseButton: {
    position: "absolute",
    top: "2px",
    right: "5px",
    background: "none",
    border: "none",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "1.2em",
    padding: "0",
    lineHeight: "1"
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
  colorMap = "reds" // Changed default colormap
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
  // State for custom color bounds
  const [minColorBound, setMinColorBound] = useState<number | string | null>(
    null
  );
  const [maxColorBound, setMaxColorBound] = useState<number | string | null>(
    null
  );
  const [isCompactView, setIsCompactView] = useState<boolean>(false); // State for compact view
  const [featureListHeight, setFeatureListHeight] = useState<string>("200px"); // State for list height
  // State for compact feature tooltip
  const [focusedFeatureInfo, setFocusedFeatureInfo] =
    useState<FocusedFeatureData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Memoized Calculations ---

  const allFeatures = useMemo(() => {
    // console.log("Recalculating all feature scores"); // Keep if debugging needed
    return calculateFeatureScores(
      featureActivations,
      featureLabels,
      currentThreshold
    );
  }, [featureActivations, featureLabels, currentThreshold]); // Rerun if threshold changes for L0

  const rankedFeatures = useMemo(() => {
    console.log("Ranking features");
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
    if (!searchTerm) {
      return rankedFeatures;
    }
    return rankedFeatures.filter(
      (feature) =>
        feature.label.toLowerCase().includes(searchTerm) ||
        String(feature.index).includes(searchTerm)
    );
  }, [rankedFeatures, featureSearchTerm]);

  const topFilteredAndRankedFeatures = useMemo(() => {
    return filteredAndRankedFeatures.slice(0, numOverallToShow);
  }, [filteredAndRankedFeatures, numOverallToShow]);

  // Determine the feature to use for coloring
  const coloringFeatureIndex = selectedFeatureIndex ?? hoveredFeatureIndex;

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

  // Calculate color scale
  const colorScale = useMemo(() => {
    if (coloringFeatureIndex === null) {
      return () => "#ffffff";
    }

    const { min: calculatedMin, max: calculatedMax } = calculatedColorBounds;

    // Use custom bounds if set and valid, otherwise use calculated min/max
    const domainMinRaw =
      minColorBound !== null && minColorBound !== ""
        ? parseFloat(minColorBound as string)
        : calculatedMin;
    const domainMaxRaw =
      maxColorBound !== null && maxColorBound !== ""
        ? parseFloat(maxColorBound as string)
        : calculatedMax;

    // Use Number.isNaN for stricter checking
    const domainMin = Number.isNaN(domainMinRaw) ? calculatedMin : domainMinRaw;
    const domainMax = Number.isNaN(domainMaxRaw) ? calculatedMax : domainMaxRaw;

    // Look up the D3 interpolator function using the provided name
    const userColorMapKey = colorMap.toLowerCase();
    const interpolator = d3ColorMapLookup[userColorMapKey];

    if (!interpolator) {
      console.warn(
        `Color map "${colorMap}" not found or not supported, defaulting to Reds. Supported maps: ${Object.keys(
          d3ColorMapLookup
        ).join(", ")}`
      );
      return scaleSequential(chromatic.interpolateReds) // Default to Reds
        .domain([domainMin, domainMax])
        .clamp(true);
    }

    // Check for diverging map type based on user-provided name
    const isDiverging = [
      "coolwarm",
      "rdylbu",
      "piyg",
      "prgn",
      "spectral"
    ].includes(userColorMapKey);

    if (isDiverging) {
      const absMax = Math.max(Math.abs(domainMin), Math.abs(domainMax));
      const effectiveAbsMax = absMax === 0 ? 0.001 : absMax;
      return scaleSequential(interpolator)
        .domain([-effectiveAbsMax, effectiveAbsMax])
        .clamp(true);
    }
    // Ensure domain isn't degenerate for sequential maps
    const effectiveMin =
      domainMin === domainMax ? domainMin - 0.001 : domainMin;
    const effectiveMax =
      domainMin === domainMax ? domainMax + 0.001 : domainMax;
    return scaleSequential(interpolator)
      .domain([effectiveMin, effectiveMax])
      .clamp(true);
  }, [
    coloringFeatureIndex,
    colorMap,
    minColorBound,
    maxColorBound,
    calculatedColorBounds
  ]); // Add calculatedColorBounds dependency

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
      const newIndexSelected = index !== selectedFeatureIndex;
      setSelectedFeatureIndex(newIndexSelected ? index : null);

      if (isCompactView) {
        const feature = rankedFeatures.find((f) => f.index === index);
        if (!feature) return;

        // If clicking the already clicked feature, clear the info
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
    [
      isCompactView,
      rankedFeatures,
      selectedFeatureIndex,
      focusedFeatureInfo,
      containerRef
    ]
  );

  const handleTokenMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      // Don't show hover tooltip if this token is already selected
      if (selectedTokenIndices.includes(index)) {
        setHoverTokenTooltipData(null); // Ensure no hover tooltip if selected
        return;
      }

      const topFeatures = getTopFeaturesForToken(
        index,
        featureActivations,
        featureLabels,
        numTokenToShow,
        currentThreshold
      );
      const selectedValue =
        selectedFeatureIndex !== null
          ? featureActivations[index]?.[selectedFeatureIndex] ?? null
          : null;

      const containerRect = containerRef.current?.getBoundingClientRect();
      const position = {
        x: event.clientX - (containerRect?.left ?? 0) + 15,
        y: event.clientY - (containerRect?.top ?? 0) + 15
      };
      setHoverTokenTooltipData({
        // Set hover-specific state
        tokenIndex: index,
        topFeatures,
        selectedFeatureValue: selectedValue,
        position
      });
    },
    [
      featureActivations,
      featureLabels,
      numTokenToShow,
      currentThreshold,
      selectedFeatureIndex,
      selectedTokenIndices // Add dependency
    ]
  );

  const handleTokenMouseLeave = useCallback(() => {
    setHoverTokenTooltipData(null); // Clear hover-specific state
  }, []);

  const handleTokenClick = useCallback(
    (index: number) => {
      setSelectedTokenIndices((prevSelected) => {
        if (prevSelected.includes(index)) {
          // If already selected, remove it
          return prevSelected.filter((i) => i !== index);
        }
        // If not selected, add it (removed unnecessary else)
        return [...prevSelected, index];
      });
      // Clear any hover tooltip when clicking
      setHoverTokenTooltipData(null);
    },
    [] // No dependencies needed for this logic
  );

  const handleTokenTooltipFeatureClick = (featureIndex: number) => {
    setSelectedFeatureIndex(featureIndex);
    // Potentially update compact feature info IF it's sticky (mirror selection)
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
  }, []);

  const closeFeatureInfoTooltip = useCallback(() => {
    setFocusedFeatureInfo(null);
  }, []);

  const handleBoundInputChange = (
    setter: React.Dispatch<React.SetStateAction<number | string | null>>,
    value: string
  ) => {
    // Allow empty string, a single minus sign, or valid numbers
    if (value === "" || value === "-" || !Number.isNaN(parseFloat(value))) {
      setter(value);
    }
  };

  const handleResetAll = useCallback(() => {
    setMinColorBound(null);
    setMaxColorBound(null);
    setSelectedFeatureIndex(null); // Reset selected feature
    setSelectedTokenIndices([]); // Reset selected tokens
    setFocusedFeatureInfo(null); // Reset compact feature focus/tooltip
    setHoverTokenTooltipData(null); // Reset hover tooltip just in case
  }, []);

  const toggleCompactView = useCallback(() => {
    setIsCompactView((prev) => !prev);
    // Clear focused feature when toggling view modes
    setFocusedFeatureInfo(null);
    setHoveredFeatureIndex(null); // Also reset hover index
  }, []);

  const toggleFeatureListHeight = useCallback(() => {
    setFeatureListHeight((prev) => (prev === "200px" ? "500px" : "200px"));
  }, []);

  // --- Rendering ---

  if (!tokens || !featureActivations) {
    return <div style={styles.container}>Loading or no data...</div>;
  }

  // Determine styling for clicked tokens (used in map)
  const isTokenSelected = (index: number): boolean => {
    return selectedTokenIndices.includes(index);
  };

  return (
    <div style={styles.container} ref={containerRef}>
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
            step="any" // Allow finer steps for bounds
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
            // Show calculated value as placeholder when state is null/empty
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
            // Show calculated value as placeholder when state is null/empty
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
      </div>

      {/* --- Feature Search & List Controls --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px"
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
        <div>
          <button
            onClick={toggleCompactView}
            style={styles.compactButton}
            title={isCompactView ? "Show Full Labels" : "Show Compact View"}
          >
            {isCompactView ? "Expand View" : "Compact View"}
          </button>
          <button
            onClick={toggleFeatureListHeight}
            style={{ ...styles.compactButton, marginLeft: "5px" }}
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

      {/* --- Overall Feature List --- */}
      <div
        style={{ ...styles.featureListContainer, maxHeight: featureListHeight }}
      >
        <strong>
          Top Features ({filteredAndRankedFeatures.length}) (Ranked by{" "}
          {rankingMetric}
          {featureSearchTerm ? ", Filtered" : ""}):
        </strong>
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
              // Highlight based on selected/hovered state (shared coloring)
              const isSelected = selectedFeatureIndex === feature.index;
              const isHovered = hoveredFeatureIndex === feature.index;

              return (
                <div
                  key={feature.index}
                  style={{
                    ...styles.featureTile,
                    // Use standard hover/selected for consistency now
                    ...(isHovered ? styles.featureTileHover : {}),
                    ...(isSelected ? styles.featureTileSelected : {})
                  }}
                  // Pass event to handlers
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
                      : {}) // Use selectedFeatureIndex for list view highlight
                  }}
                  onMouseEnter={(e) =>
                    handleFeatureMouseEnter(feature.index, e)
                  } // Pass event
                  onMouseLeave={handleFeatureMouseLeave}
                  onClick={(e) => handleFeatureClick(feature.index, e)} // Pass event
                  title={featureTitle}
                >
                  <span>{`Feat ${feature.index}: ${feature.label.substring(
                    0,
                    80
                  )}${feature.label.length > 80 ? "..." : ""}`}</span>
                  <span style={styles.featureScore}>
                    {feature.score.toFixed(3)}
                  </span>
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

      {/* --- NEW: Persistent Selected Token Info Area --- */}
      {selectedTokenIndices.length > 0 && (
        <div style={styles.selectedTokensContainer}>
          <strong>Selected Tokens:</strong>
          {selectedTokenIndices.map((tokenIndex) => {
            const topFeatures = getTopFeaturesForToken(
              tokenIndex,
              featureActivations,
              featureLabels,
              numTokenToShow, // Use same count as hover tooltip
              currentThreshold // Use same threshold as hover tooltip
            );
            const selectedValue =
              selectedFeatureIndex !== null
                ? featureActivations[tokenIndex]?.[selectedFeatureIndex] ?? null
                : null;

            return (
              <div key={tokenIndex} style={styles.selectedTokenInfoBox}>
                <button
                  onClick={() => handleDeselectToken(tokenIndex)}
                  style={styles.selectedTokenCloseButton}
                  title="Deselect Token"
                >
                  ×
                </button>
                <strong>
                  Token {tokenIndex}: &quot;{tokens[tokenIndex]}&quot;
                </strong>
                {selectedValue !== null && (
                  <div
                    style={{
                      marginTop: "5px",
                      borderTop: "1px dashed #ccc",
                      paddingTop: "5px"
                    }}
                  >
                    Selected Feature ({selectedFeatureIndex}):{" "}
                    {selectedValue.toPrecision(3)}
                  </div>
                )}
                <div
                  style={{
                    marginTop: "5px",
                    paddingTop: "5px",
                    borderTop:
                      selectedValue !== null ? "none" : "1px dashed #ccc"
                  }}
                >
                  {" "}
                  {/* Avoid double border */}
                  Top Features (by abs activation):
                  {topFeatures.length === 0 && (
                    <div>(None above threshold)</div>
                  )}
                  {topFeatures.map((feat) => (
                    <div
                      key={feat.index}
                      style={styles.tooltipFeature} // Reuse style
                      onClick={() => handleTokenTooltipFeatureClick(feat.index)} // Reuse handler
                      onMouseEnter={(e: React.MouseEvent) => {
                        (e.target as HTMLDivElement).style.textDecoration =
                          "underline";
                        (e.target as HTMLDivElement).style.cursor = "pointer";
                      }}
                      onMouseLeave={(e: React.MouseEvent) => {
                        (e.target as HTMLDivElement).style.textDecoration =
                          "none";
                        (e.target as HTMLDivElement).style.cursor = "default";
                      }}
                      title={`Select Feature ${feat.index} for coloring`}
                    >
                      {`Feat ${feat.index}: ${feat.activation.toFixed(
                        3
                      )} - ${feat.label.substring(0, 50)}${
                        feat.label.length > 50 ? "..." : ""
                      }`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Token Sequence --- */}
      <div style={styles.tokenSequence}>
        {tokens.map((token, index) => {
          const activationValue =
            coloringFeatureIndex !== null
              ? featureActivations[index]?.[coloringFeatureIndex] ?? 0
              : 0;

          const backgroundColor =
            coloringFeatureIndex !== null
              ? (colorScale(activationValue) as string)
              : "#ffffff";
          const luminance = getLuminance(backgroundColor);
          const textColor = luminance > 0.5 ? "#000000" : "#ffffff";

          const isDimmed =
            coloringFeatureIndex !== null &&
            currentThreshold !== null &&
            activationValue !== 0 &&
            Math.abs(activationValue) < currentThreshold;

          // Determine if token is hovered (and not selected)
          const isHovered = hoverTokenTooltipData?.tokenIndex === index;
          // Determine if token is selected
          const isClicked = isTokenSelected(index);

          return (
            <span
              key={index}
              style={{
                ...styles.token,
                backgroundColor,
                color: textColor,
                opacity: isDimmed ? 0.5 : 1,
                // Apply hover style only if actually hovered (and not selected)
                ...(isHovered && !isClicked ? styles.tokenHover : {}),
                // Apply clicked style if selected
                ...(isClicked ? styles.tokenClicked : {})
              }}
              onMouseEnter={(e) => handleTokenMouseEnter(index, e)}
              onMouseLeave={handleTokenMouseLeave}
              onClick={() => handleTokenClick(index)} // Pass only index
            >
              {token}
            </span>
          );
        })}
      </div>

      {/* --- HOVER Token Tooltip --- */}
      {hoverTokenTooltipData && (
        <div
          style={{
            ...styles.tooltip,
            left: `${hoverTokenTooltipData.position.x}px`,
            top: `${hoverTokenTooltipData.position.y}px`
          }}
        >
          {/* No close button needed for hover tooltip */}
          <strong>
            Token {hoverTokenTooltipData.tokenIndex}: &quot;
            {tokens[hoverTokenTooltipData.tokenIndex]}&quot;
          </strong>
          {hoverTokenTooltipData.selectedFeatureValue !== null && (
            // ... Render selected feature value ...
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
          Top Features (by abs activation):
          {hoverTokenTooltipData.topFeatures.length === 0 && (
            // ... None above threshold ...
            <div>(None above threshold)</div>
          )}
          {hoverTokenTooltipData.topFeatures.map((feat) => (
            <div
              key={feat.index}
              style={styles.tooltipFeature}
              onClick={() => {
                // Click feature in HOVER tooltip - select it
                handleTokenTooltipFeatureClick(feat.index);
              }}
              onMouseEnter={(e: React.MouseEvent) => {
                (e.target as HTMLDivElement).style.textDecoration = "underline";
                (e.target as HTMLDivElement).style.cursor = "pointer";
              }}
              onMouseLeave={(e: React.MouseEvent) => {
                (e.target as HTMLDivElement).style.textDecoration = "none";
                (e.target as HTMLDivElement).style.cursor = "default";
              }}
              title={`Select Feature ${feat.index} for coloring`}
            >
              {/* ... Render feature info ... */}
              {`Feat ${feat.index}: ${feat.activation.toFixed(
                3
              )} - ${feat.label.substring(0, 50)}${
                feat.label.length > 50 ? "..." : ""
              }`}
            </div>
          ))}
        </div>
      )}

      {/* --- Feature Info Tooltip (Compact Mode Only) --- */}
      {isCompactView && focusedFeatureInfo && (
        <div
          style={{
            ...styles.tooltip, // Reuse tooltip styles
            left: `${focusedFeatureInfo.position.x}px`,
            top: `${focusedFeatureInfo.position.y}px`,
            // Make it sticky (allow interaction) only if clicked
            ...(focusedFeatureInfo.isClick ? styles.tooltipSticky : {})
          }}
        >
          {/* Add close button only if it's a clicked tooltip */}
          {focusedFeatureInfo.isClick && (
            <button
              onClick={closeFeatureInfoTooltip} // Use specific close handler
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
