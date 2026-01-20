<h1 align="center">Prism code editor</h1>
<p align="center">
  <a href="https://prism-code-editor.netlify.app">Documentation</a> | <a href="https://prism-code-editor.netlify.app/playground">Playground</a>
</p>
<p align="center">
  <a href="https://bundlephobia.com/package/prism-code-editor"><img src="https://img.shields.io/bundlephobia/minzip/prism-code-editor?label=size" alt="Bundle size"></a>
  <a href="https://npmjs.com/prism-code-editor"><img src="https://img.shields.io/npm/v/prism-code-editor" alt="NPM package"></a>
</p>
<p align="center">
  <strong>Lightweight, extensible code editor component for the web using <a href="https://github.com/PrismJS/prism">Prism</a>.</strong>
</p>
<p align="center">
  <a href="https://prism-code-editor.netlify.app"><img src="https://github.com/jonpyt/prism-code-editor/blob/8eccecab74f07067c846a05612bd5d7c7e0fc86e/assets/demo.png?raw=true" width="640" alt="Editor example"></a>
</p>

## Why?

There are multiple fully featured code editors for the web such as Monaco, Ace and CodeMirror. While these are awesome, they have a large footprint and are likely overkill for code examples, forms, playgrounds or anywhere you won't display large documents.

## How?

This library overlays syntax highlighted code over a `<textarea>`. Libraries like [CodeFlask](https://github.com/kazzkiq/CodeFlask), [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor), and many others have been doing this for years, but this library offers some distinct advantages:

- It uses a trimmed Prism's core less than ⅓ the size that no longer relies on global variables.
- It re-exports Prism's languages that now automatically import their required dependencies and embedded languages are resolved at runtime.
- It splits the highlighted code into lines. This makes it easy to add line numbers, highlight a line and only update changed lines in the DOM for efficient updates.
- The core is light as a feather with a wide array of extensions you can choose from and multiple events to listen to.

## Key features

- Line numbers
- Optional word wrap
- Line- and block comment toggling
- Search and replace functionality
- Wraps selection in brackets/quotes
- Automatic indentation
- Automatic closing of brackets, quotes and tags
- Indent selected lines with tab key
- Custom undo/redo behavior
- Language specific autocomplete
- Highlights the line with the cursor
- Bracket matching and rainbow brackets
- Accessible to screen readers and keyboard-only users
- Works great on mobile

## Installation

    npm i prism-code-editor

If you're not using NPM and a bundler in your project, then you might be interested in this [bundle builder](https://stackblitz.com/edit/pce-bundle-builder) where you can create a customized, minified bundle to use directly.

## Basic usage

The library includes 3 different setups you can import. These will automatically import the necessary styles and scope them with a shadow root, add various extensions and import all language specific behavior. There are also web components wrapping these setups if that's preferred.

```javascript
import { minimalEditor, basicEditor, readonlyEditor } from "prism-code-editor/setups"
// Importing Prism grammars
import "prism-code-editor/prism/languages/markup"

const editor = basicEditor(
  "#editor",
  {
    language: "html",
    theme: "github-dark",
  },
  () => console.log("ready"),
)
```

**Note:** You might want to add `display: grid` to the container the editor is added to.

## Advanced usage

For more advanced usage where you have full control over styling and the added extensions, check [the documentation](https://prism-code-editor.netlify.app).

## Usage with frameworks

This library has rewrites for both React and SolidJS. These rewrites better integrate with their respective framework than any wrapper ever could and are recommended if you're already using React or SolidJS.

- [React rewrite](https://github.com/jonpyt/prism-code-editor/tree/main/react-package)
- [SolidJS rewrite](https://github.com/jonpyt/prism-code-editor/tree/main/solid-package)

## Examples

- [`height: auto` without layout shifts](https://stackblitz.com/edit/vitejs-vite-sbvab7?file=index.html,src%2Fstyle.css,src%2Fmain.ts,readme.md)
- [Simple tooltip example](https://stackblitz.com/edit/vitejs-vite-z2fgpu?file=src%2Fmain.ts)
- [Autocomplete example](https://stackblitz.com/edit/vitejs-vite-tjcjyl?file=src%2Fautocomplete.ts)
- [Formatting with Prettier](https://stackblitz.com/edit/vitejs-vite-x7tzhu?file=src%2Fmain.ts,src%2Fextensions.ts)
- [Relative line numbers](https://stackblitz.com/edit/vitejs-vite-2wytja?file=src%2Fextensions.ts,src%2Fmain.ts)
- [Usage in forms](https://stackblitz.com/edit/vitejs-vite-pk9ud7?file=src%2Fmain.ts)
- [Adding elements to code lines](https://stackblitz.com/edit/vitejs-vite-y5pwon?file=src%2Fmain.ts,readme.md)
- [Custom cursor](https://stackblitz.com/edit/vitejs-vite-sza5zx?file=src%2Fstyle.css,src%2Fextensions.ts)

## Performance

All the code is tokenized each time for simplicity's sake. Even though only lines that change are updated in the DOM, the editor slows down as more code is added, although not as quickly as with zero optimizations.

Once you start exceeding 1000 LOC, the editor will start slowing down on most hardware. If you need to display that much code, consider a more robust/heavy library.

## Compatibility

This has been tested to work in the latest desktop and mobile versions of both Safari, Chrome, and Firefox. It should work in slightly older browsers too, but there will be many bugs present in browsers that don't support `beforeinput` events.

This library does not support any Prism plugins since Prism hooks have been removed, but behavior like the [Highlight Keywords](https://prismjs.com/plugins/highlight-keywords/) plugin is included.

Some grammars have had small changes, most notably markup tags' grammar. Prism themes will work to style the tokens, but there can be some slight differences.

In PrismJS, greedy matching is controlled by a `greedy` flag on the token. Here, it's instead controlled by the `g` flag on the pattern. When copying Prism grammars, be sure to remove the `greedy` flags and instead add the `g` flag to the regex.

Lists of aliases are not supported. To add multiple aliases to a token, separate them with spaces in a single string instead. For example convert `["foo", "bar"]` to `"foo bar"`.

## Credits

This library is made possible thanks to [Prism](https://prismjs.com).

## Contributing

Feature requests, bug reports, optimizations and potentially new themes and extensions are all welcome.

To test your changes during development, install dependencies:

    cd package
    pnpm install

And run the development server:

    pnpm run dev
