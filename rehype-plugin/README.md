Rehype plugin to create code editors and highlight code blocks using [prism code editor](https://github.com/jonpyt/prism-code-editor).

[![NPM package](https://img.shields.io/npm/v/rehype-prism-code-editor)](https://npmjs.com/rehype-prism-code-editor)

## Installation

This plugin has prism-code-editor version 4.0.0 or greater as a peer dependency

    npm i prism-code-editor rehype-prism-code-editor

## Basic usage

```js
import rehype from "rehype"
import prismCodeEditor from "rehype-prism-code-editor"
import "prism-code-editor/prism/languages/common"

rehype().use(prismCodeEditor, {
  // Configuration options
}).process(/* some html */)
```

## Documentation

For more examples and a detailed description of the included features, check the [documentation website](https://prism-code-editor.netlify.app/markdown-plugins/getting-started).

## Demo

There's a [demo page](https://marked-pce.netlify.app) where you can write markdown and view the resulting editors and code blocks. Note that the demo uses [marked](https://github.com/markedjs/marked), but this rehype plugin has an identical API and feature set.

## Development

To run the development server locally, install dependencies.

    pnpm install

Next, you must build the prism-code-editor package.

    cd ../package
    pnpm install
    pnpm build

Finally, you can run the development server to test your changes.

    cd ../rehype-plugin
    pnpm dev
