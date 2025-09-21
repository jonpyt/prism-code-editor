Marked extension to create code editors and highlight code blocks using [prism code editor](https://github.com/jonpyt/prism-code-editor).

[![Bundle size](https://img.shields.io/bundlephobia/minzip/marked-prism-code-editor?label=size)](https://bundlephobia.com/package/marked-prism-code-editor)
[![NPM package](https://img.shields.io/npm/v/marked-prism-code-editor)](https://npmjs.com/marked-prism-code-editor)

## Installation

This extension has prism-code-editor version 4.0.0 or greater as a peer dependency

    npm i prism-code-editor marked-prism-code-editor

## Basic usage

```js
import { marked } from "marked"
import { markedPrismCodeEditor } from "marked-prism-code-editor"
import "prism-code-editor/prism/languages/common"

marked.use(markedPrismCodeEditor({
  // Configuration options
}))

marked.parse(/* Some markdown */)
```

## Documentation

For more examples and a detailed description of the included features, check the [documentation website](https://prism-code-editor.netlify.app/markdown-plugins/getting-started).

## Demo

There's a [demo page](https://marked-pce.netlify.app) where you can write markdown and view the resulting editors and code blocks.

## Development

To run the development server locally, install dependencies.

    pnpm install

Next, you must build the prism-code-editor package.

    cd ../package
    pnpm install
    pnpm build

Finally, you can run the development server to test your changes.

    cd ../marked-extension
    pnpm dev

