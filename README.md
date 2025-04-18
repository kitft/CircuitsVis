# CircuitsVis

A small extension to the original CircuitsVis library:


#### `sae_vis`

sae_vis`  interactively visualizes SAE feature activations on a text sequence. It is agnostic to the
source of the features, and is simply run with an array of activations, a list of labels and a list
of feature IDs.

It shows tokens colored by activation strength and provides interactive exploration of features. You can
select/pin tokens or features, hover over tokens/features to see details, view top activating tokens
for each feature, and color tokens with multiple features simultaneously. A demonstration of its
functionality can be found in `Demonstration.ipynb`.

This method uses the artifacts built by the GitHub Actions workflow upon creating a new release tag.

```bash
# Replace vX.Y.Z with the desired release tag (e.g., v0.1.0)
# Find the correct wheel name in the release assets.
uv pip install https://github.com/kitft/CircuitsVis/releases/download/vX.Y.Z/circuitsvis-X.Y.Z-py3-none-any.whl
```

Make sure to replace `vX.Y.Z` with the specific version you want to install and verify the wheel filename. You can find available releases and their assets [here](https://github.com/kitft/CircuitsVis/releases).
The wheel file (`.whl`) contains the pre-built React components. 

To install for development, see below.

*nb - this repo deactivates `cdn` usage in `python/utils/render.py`.


#### Repo

[![Release](https://github.com/alan-cooney/CircuitsVis/actions/workflows/release.yml/badge.svg)](https://github.com/alan-cooney/CircuitsVis/actions/workflows/release.yml)
[![NPMJS](https://img.shields.io/npm/v/circuitsvis)](https://www.npmjs.com/package/circuitsvis)
[![Pypi](https://img.shields.io/pypi/v/circuitsvis)](https://pypi.org/project/circuitsvis/)

Mechanistic Interpretability visualizations, that work both in both Python (e.g. with
[Jupyter Lab](https://jupyter.org/)) and JavaScript (e.g. [React](https://reactjs.org/) or plain HTML).

View them all at [https://transformerlensorg.github.io/CircuitsVis](https://transformerlensorg.github.io/CircuitsVis)

## Use

### Install

#### Python

**Option 1: Install from GitHub Releases (Recommended for this fork)**

This method uses the artifacts built by the GitHub Actions workflow upon creating a new release tag.

```bash
# Replace vX.Y.Z with the desired release tag (e.g., v0.1.0)
# Find the correct wheel name in the release assets.
uv pip install https://github.com/kitft/CircuitsVis/releases/download/vX.Y.Z/circuitsvis-X.Y.Z-py3-none-any.whl
```

Make sure to replace `vX.Y.Z` with the specific version you want to install and verify the wheel filename. You can find available releases and their assets [here](https://github.com/kitft/CircuitsVis/releases).
The wheel file (`.whl`) contains the pre-built React components.

**Option 2: Install from PyPI (Original Method - Currently Disabled in CI)**

This package is also configured for PyPI deployment (though currently disabled in the default release workflow for this fork).

```bash
pip install circuitsvis
```

#### React

**Original Method (Currently Disabled in CI)**

The React component is also configured for npm deployment (though currently disabled in the default release workflow for this fork).

```bash
yarn add circuitsvis
```



### Add visualizations

You can use any of the components from the [demo
page](https://transformerlensorg.github.io/CircuitsVis). These show the source code for
use with React, and for Python you can instead import the function with the same
name.

```Python
# Python Example
from circuitsvis.tokens import colored_tokens
colored_tokens(["My", "tokens"], [0.123, -0.226])
```

```TypeScript
// React Example
import ColoredTokens from "circuitsvis";

function Example() {
    <ColoredTokens
        tokens=["My", "tokens"]
        values=[0.123, -0.266]
    />
}
```

## Contribute

### Development requirements

#### DevContainer

For a one-click setup of your development environment, this project includes a
DevContainer. It can be used locally with [VS
Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
or with [GitHub Codespaces](https://github.com/features/codespaces).

#### Manual setup

To create new visualizations you need [Node](https://nodejs.org/en/) (including
[yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)) and Python
(with [Poetry](https://python-poetry.org/)).

Once you have these, you need to install both the Node & Python packages (note
that for Python we use the
[Poetry](https://python-poetry.org/docs/#installation) package management
system).

```bash
cd react && yarn
```

```bash
cd python && poetry install --with dev
```

#### Jupyter install

If you want Jupyter as well, run `poetry install --with jupyter` or, if this
fails due to a PyTorch bug on M1 MacBooks, run `poetry run pip install jupyter`.

### Creating visualizations

#### React

You'll first want to create the visualisation in React. To do this, you can copy
the example from `/react/src/examples/Hello.tsx`. To view changes whilst editing
this (in [Storybook](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)), 
run the following from the `/react/` directory:

```bash
yarn storybook
```

#### Python

This project uses [Poetry](https://python-poetry.org/docs/#installation) for
package management. To install run:

```bash
poetry install
```

Once you've created your visualization in React, you can then create a short
function in the Python library to render it. You can see an example in
`/python/circuitsvis/examples.py`.

Note that **this example will render from the CDN**, unless development mode is
specified. Your visualization will only be available on the CDN once it has been
released to the latest production version of this library.

#### Publishing a new release

When a new GitHub release is created, the codebase will be automatically built.
The default workflow for this fork uploads Python artifacts (`.whl`, `.tar.gz`) to the GitHub release.

Publishing to PyPI and npm, and deploying Storybook to GitHub Pages are included in the workflow but disabled by default (`if: false`). They can be manually enabled if needed.

### Citation

Please cite this library as:

```