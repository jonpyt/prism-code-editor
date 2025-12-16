markdown-it plugin to create code editors and highlight code blocks using [prism code editor](https://github.com/jonpyt/prism-code-editor).

[![Bundle size](https://img.shields.io/bundlephobia/minzip/markdown-it-prism-code-editor?label=size)](https://bundlephobia.com/package/markdown-it-prism-code-editor)
[![NPM package](https://img.shields.io/npm/v/markdown-it-prism-code-editor)](https://npmjs.com/markdown-it-prism-code-editor)

## Installation

This extension has prism-code-editor version 4.0.0 or greater as a peer dependency

    npm i prism-code-editor
    npm i markdown-it-prism-code-editor
    npm i @olets/markdown-it-wrapperless-fence-rule

## Basic usage

```js
import MarkdownIt from "markdown-it"
import prismCodeEditor from "markdown-it-prism-code-editor"
import markdownItWrapperlessFenceRule from "@olets/markdown-it-wrapperless-fence-rule"

const md = MarkdownIt()

md.renderer.rules.fence = markdownItWrapperlessFenceRule
md.use(prismCodeEditor, {
	// More on configuration later
})

md.render(/* some markdown */)
```

`markdown-it` will enforce `<pre><code>` as the outermost elements of fenced code blocks. Since the editors don't use `<pre><code>`, [`@olets/markdown-it-wrapperless-fence-rule`](https://github.com/olets/markdown-it-wrapperless-fence-rule) is recommended.

## Documentation

For more examples and a detailed description of the included features, check the [documentation website](https://prism-code-editor.netlify.app/markdown-plugins/getting-started).

## Demo

There's a [demo page](https://marked-pce.netlify.app) where you can write markdown and view the resulting editors and code blocks. Note that the demo uses [marked](https://github.com/markedjs/marked), but this `markdown-it` plugin has an identical API and feature set.

## Development

To run the development server locally, install dependencies.

    pnpm install

Next, you must build the prism-code-editor package.

    cd ../package
    pnpm install
    pnpm build

Finally, you can run the development server to test your changes.

    cd ../markdown-it-plugin
    pnpm dev
