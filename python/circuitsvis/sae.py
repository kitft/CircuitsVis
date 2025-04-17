# circuitsvis/sae.py

"""Sparse Autoencoder (SAE) Feature Activation Visualization"""
from typing import List, Optional, Union

import numpy as np
import torch
from circuitsvis.utils.render import RenderedHTML, render

# Define accepted types for activation arrays
ActivationArray = Union[np.ndarray, torch.Tensor, List[List[float]]]

def sae_vis(
    tokens: List[str],
    feature_activations: ActivationArray,
    feature_labels: List[str],
    num_top_features_per_token: int = 5,
    num_top_features_overall: int = 20,
    initial_ranking_metric: str = "max", # Options: "max", "l1", "l0" (approx)
    activation_threshold: Optional[float] = None,
    color_map: str = "reds", # Changed default colormap
    height: Optional[Union[int, str]] = "auto",
    feature_ids: Optional[List[int]] = None,
) -> RenderedHTML:
    """
    Visualizes Sparse Autoencoder (SAE) feature activations on a text sequence.

    Shows tokens colored by the activation strength of a selected feature.
    Provides interactive exploration of features based on their overall activation
    across the sequence and their specific activation on individual tokens.

    Args:
        tokens: List of token strings for the sequence (e.g., `["Hello", " world"]`).
        feature_activations: 2D array/tensor of activation values. Must have
            shape `[num_tokens, num_features]`.
        feature_labels: List of strings, providing user-defined explanations for
            each feature. Must have length `num_features`.
        num_top_features_per_token: Default number of top activating features
            to display in the tooltip when hovering over a token. Defaults to 5.
        num_top_features_overall: Default number of top features to display in
            the overall ranked list view. Defaults to 20.
        initial_ranking_metric: Metric used to initially rank features in the
            overall view ('max': max activation, 'l1': mean absolute activation,
            'l0': approx number of non-zero activations). Defaults to "max".
        activation_threshold: Optional minimum activation value. Activations below
            this threshold might be dimmed or excluded from "top" lists in the UI.
            If None, no threshold is applied. Defaults to None.
        color_map: Name of the color map to use for visualizing activation
            strength on tokens (e.g., 'reds', 'blues', 'viridis', 'coolwarm'). Defaults to "reds".
        height: Desired height of the visualization container in CSS units (e.g.,
            500 for pixels, "80vh", "auto"). If None, a default height (e.g., auto)
            with vertical scrolling will be used. Defaults to None.
        feature_ids: Optional list of IDs for the features. If None, defaults
            to range(num_features). Defaults to None.

    Returns:
        RenderedHTML: An HTML object for interactive visualization in environments
            like Jupyter notebooks.
    """
    # --- Input Validation ---
    if not isinstance(tokens, list) or not all(isinstance(t, str) for t in tokens):
        raise TypeError("`tokens` must be a list of strings.")
    
    num_tokens = len(tokens)

    # Handle Activation Tensor/Array Type and Shape
    if isinstance(feature_activations, (np.ndarray, torch.Tensor)):
        if feature_activations.ndim != 2:
            raise ValueError(
                f"`feature_activations` must be a 2D array/tensor, but got shape "
                f"{feature_activations.shape}"
            )
        acts_shape = feature_activations.shape
        # Conversion to list for JSON serialization happens in `render` via `convert_props`
        activations_data = feature_activations 
    elif isinstance(feature_activations, list):
        if not feature_activations or not isinstance(feature_activations[0], list):
             raise TypeError("`feature_activations` as list must be a list of lists.")
        acts_shape = (len(feature_activations), len(feature_activations[0]) if feature_activations else 0)
        # Mypy gets confused by the union type and later conversion, safe to ignore.
        activations_data = feature_activations # type: ignore [assignment]
    else:
        raise TypeError(
            "`feature_activations` must be a NumPy array, PyTorch tensor, or list of lists."
        )

    if acts_shape[0] != num_tokens:
        raise ValueError(
            f"Mismatch between number of tokens ({num_tokens}) and first dimension "
            f"of `feature_activations` ({acts_shape[0]}). Shape must be "
            f"[num_tokens, num_features]."
        )
    
    num_features = acts_shape[1]

    if not isinstance(feature_labels, list) or not all(isinstance(lbl, str) for lbl in feature_labels):
        raise TypeError("`feature_labels` must be a list of strings.")

    if len(feature_labels) != num_features:
        raise ValueError(
            f"Mismatch between number of feature labels ({len(feature_labels)}) and "
            f"second dimension of `feature_activations` ({num_features}). "
            f"Shape must be [num_tokens, num_features]."
        )
        
    if initial_ranking_metric not in ["max", "l1", "l0"]:
        raise ValueError("`initial_ranking_metric` must be one of 'max', 'l1', 'l0'.")

    # Set default feature indices if not provided
    if feature_ids is None:
        feature_ids = list(range(num_features))

    # --- Prepare Props for Rendering ---
    # `render` function handles NumPy/Tensor conversion via `convert_props`
    
    # --- Render ---
    return render(
        "SaeVis",  # Name of the React component
        height=height,
        tokens=tokens,
        featureActivations=activations_data, # Use camelCase for JS props
        featureLabels=feature_labels,
        numTopFeaturesPerToken=num_top_features_per_token,
        numTopFeaturesOverall=num_top_features_overall,
        initialRankingMetric=initial_ranking_metric,
        activationThreshold=activation_threshold,
        colorMap=color_map,
        featureIDs=feature_ids,
    ) 