# Prism react editor

Code editor component for React apps

[![Bundle size](https://img.shields.io/bundlephobia/minzip/prism-react-editor?label=size)](https://bundlephobia.com/package/prism-react-editor)
[![NPM Package](https://img.shields.io/npm/v/prism-react-editor)](https://npmjs.com/prism-react-editor)

## What?

This is a rewrite of [Prism code editor](https://github.com/jonpyt/prism-code-editor) using React and hooks. It's a lightweight, extensible code editor optimized for fast load times with many optional extensions.

## Contents

- [Installation](#installation)
- [Demo](#demo)
- [Examples](#examples)
- [Basic usage](#basic-usage)
- [Props](#props)
- [Extensions](#extensions)
  - [Creating your own](#creating-your-own)
- [Editor API](#editor-api)
  - [Properties](#properties)
    - [DOM Elements](#dom-elements)
  - [Methods](#methods)
  - [Extensions property](#extensions-property)
- [Languages](#languages)
- [Styling](#styling)
- [Themes](#themes)
  - [Theme switcher](#theme-switcher)
- [Code blocks](#code-blocks)
  - [Code block props](#code-block-props)
- [Performance](#performance)
- [Contributing](#contributing)

## Installation

    npm i prism-react-editor

You must already have `react` and `react-dom` version 16.8.0 or greater installed.

## Demo

[Prism code editor's demo](https://prism-code-editor.netlify.app/playground). There's no demo for this React rewrite since its behavior is nearly identical.

## Examples

- [Usage in forms](https://stackblitz.com/edit/vitejs-vite-6wmrpx?file=src%2FApp.tsx)
- [Next.js example](https://stackblitz.com/edit/stackblitz-starters-8spwks?file=app%2Fcode-block.tsx,app%2Feditor.tsx,app%2Fpage.tsx)
- [Preact example](https://stackblitz.com/edit/vitejs-vite-t88xmd?file=src%2Fapp.tsx)
- [Tooltip example](https://stackblitz.com/edit/vitejs-vite-jq7zfh?file=src%2FApp.tsx)
- [Relative line numbers](https://stackblitz.com/edit/vitejs-vite-d3zxwt?file=src%2FApp.tsx)
- [Custom cursor](https://stackblitz.com/edit/vitejs-vite-cg3zpz?file=src%2FApp.tsx)

## Basic usage

Below is an example of a simple JSX editor.

```jsx
import { Editor } from "prism-react-editor"
import { BasicSetup } from "prism-react-editor/setups"

// Adding the JSX grammar
import "prism-react-editor/prism/languages/jsx"

// Adds comment toggling and auto-indenting for JSX
import "prism-react-editor/languages/jsx"

import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"

// Required by the basic setup
import "prism-react-editor/search.css"
import "prism-react-editor/invisibles.css"

function MyEditor() {
  return <Editor language="jsx" value="const foo = 'bar'">
    {editor => <BasicSetup editor={editor} />}
  </Editor>
}
```

## Props

| Name                | Type                                                                                  | Description                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`          | `string`                                                                              | Language used for syntax highlighting. Defaults to `text`.                                                                                      |
| `tabSize`           | `number`                                                                              | Tab size used for indentation. Defaults to `2`.                                                                                                 |
| `insertSpaces`      | `boolean`                                                                             | Whether the editor should insert spaces for indentation. Defaults to `true`. Requires `useDefaultCommands()` extension to work.                 |
| `lineNumbers`       | `boolean`                                                                             | Whether line numbers should be shown. Defaults to `true`.                                                                                       |
| `readOnly`          | `boolean`                                                                             | Whether the editor should be read only. Defaults to `false`.                                                                                    |
| `wordWrap`          | `boolean`                                                                             | Whether the editor should have word wrap. Defaults to `false`.                                                                                  |
| `value`             | `string`                                                                              | Initial value to display in the editor.                                                                                                         |
| `rtl`               | `boolean`                                                                             | Whether the editor uses right to left directionality. Defaults to `false`. Requires extra CSS from `prism-react-editor/rtl-layout.css` to work. |
| `style`             | `Omit<React.CSSProperties, "tabSize">`                                                | Allows adding inline styles to the container element.                                                                                           |
| `className`         | `string`                                                                              | Additional classes for the container element.                                                                                                   |
| `textareaProps`     | `Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaProps>`       | Allows adding props to the editor's textarea element.                                                                                           |
| `onUpdate`          | `(value: string, editor: PrismEditor) => void`                                        | Function called after the editor updates.                                                                                                       |
| `onSelectionChange` | `(selection: InputSelection, value: string, editor: PrismEditor) => void`             | Function called when the editor's selection changes.                                                                                            |
| `onTokenize`        | `(tokens: TokenStream, language: string, value: string, editor: PrismEditor) => void` | Function called before the tokens are stringified to HTML.                                                                                      |
| `children`          | `(editor: PrismEditor) => React.ReactNode`                                            | Callback used to render extensions.                                                                                                             |

## Pitfall

This component is not controlled, and the `value` prop should be treated like an initial value. Do not change the `value` prop in the `onUpdate` handler. Doing so will negatively impact performance and reset both the cursor position and undo/redo history on every input.

```jsx
// counterexample: do NOT do this
function MyEditor() {
  const [value, setValue] = useState("const foo = 'bar'")

  return (
    <Editor language="jsx" value={value} onUpdate={setValue} />
  )
}
```

## Extensions

To keep the core light, most functionality is added by optional extensions.

There are extensions adding:

- Many common commands
- Bracket matching and rainbow brackets
- Tag matching
- Indentation guides
- Search, regex search and replace
- Selection match highlighting
- A copy button
- Read-only code folding
- Custom undo/redo
- And more...

Many commonly used extensions are added by `BasicSetup`, but if you want to fully customize which extensions are added. Below it's shown how to import most extensions.

```tsx
import { Editor, PrismEditor } from "prism-react-editor"
import "prism-react-editor/prism/languages/jsx"
import "prism-react-editor/layout.css"
// Needed for the search widget
import "prism-react-editor/search.css"
// Needed for the copy button
import "prism-react-editor/copy-button.css"

import { useBracketMatcher } from "prism-react-editor/match-brackets"
import { useHighlightBracketPairs } from "prism-react-editor/highlight-brackets"
import { IndentGuides } from "prism-react-editor/guides"
import { useHighlightSelectionMatches, useSearchWidget, useShowInvisibles } from "prism-react-editor/search"
import { useHighlightMatchingTags, useTagMatcher } from "prism-react-editor/match-tags"
import { useCursorPosition } from "prism-react-editor/cursor"
import { useDefaultCommands, useEditHistory } from "prism-react-editor/commands"
import { useCopyButton } from "prism-react-editor/copy-button"
import { useOverscroll } from "prism-react-editor/overscroll"

function MyExtensions({ editor }: { editor: PrismEditor }) {
  useBracketMatcher(editor)
  useHighlightBracketPairs(editor)
  useOverscroll(editor)
  useTagMatcher(editor)
  useHighlightMatchingTags(editor)
  useDefaultCommands(editor)
  useEditHistory(editor)
  useSearchWidget(editor)
  useHighlightSelectionMatches(editor)
  useShowInvisibles(editor)
  useCopyButton(editor)
  useCursorPosition(editor)

  return <IndentGuides editor={editor} />
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => <MyExtensions editor={editor} />}
    </Editor>
  )
}
```

**Note:** The extensions will rerender whenever the editor component's props change. The editor object does not change reference between rerenders, so if you memoize the extensions component with `React.memo`, the extensions won't rerender causing potential issues. If you're using the React Compiler, you might need to add the `"use no memo"` directive to your extensions component so the compiler doesn't memoize it.

Lazy loading extensions is also possible for code splitting. It's not recommended to lazy load `useBracketMatcher` and you might want `IndentGuides` to be present on first render. All other extensions will work perfectly fine while lazy loaded.

```jsx
import { lazy, Suspense } from "react"

const LazyExtensions = lazy(() => import("./extensions"))

function MyExtensions({ editor }: { editor: PrismEditor }) {
  useBracketMatcher(editor)

  return <IndentGuides editor={editor} />
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => (
        <>
          <MyExtensions editor={editor} />
          <Suspense>
            <LazyExtensions editor={editor} />
          </Suspense>
        </>
      )}
    </Editor>
  )
}

```

### Creating your own

If you need to do anything more than adding an `onUpdate` or `onSelectionChange` prop, you should consider creating your own extension.

```tsx
import { useLayoutEffect, useEffect } from "react"
import { PrismEditor, Editor } from "prism-react-editor"
import { BasicSetup } from "prism-react-editor/setups"

function MyExtension({ editor }: { editor: PrismEditor }) {
  // Layout effects will run before the editor has mounted
  useLayoutEffect(() => {
    return editor.on("selectionChange", selection => {
      console.log("Selection changed:", selection)
    })
  }, [])

  useEffect(() => {
    // The editor has mounted now
    editor.textarea!.focus()
  }, [])

  // The elements returned are added to the editor's overlays
  // Keep in mind that they will get some default styles
  return (
    <>
      <div>My overlay</div>
      <BasicSetup editor={editor} />
    </>
  )
}

function MyEditor() {
  return (
    <Editor language="jsx" value="const foo = 'bar'">
      {editor => <MyExtension editor={editor} />}
    </Editor>
  )
}
```

## Editor API

The editor object you can access with the `children` property has many useful properties and methods.

### Properties

- `value: string`: Current value of the editor.
- `activeLine: number`: Line number of the line with the cursor. You can index into `editor.lines` to get the DOM node for the active line.
- `inputCommandMap: Record<string, InputCommandCallback | null | undefined>`: Record mapping an input to a function called when that input is typed.
- `keyCommandMap: Record<string, KeyCommandCallback | null | undefined>`: Record mapping KeyboardEvent.key to a function called when that key is pressed.
- `extensions: Object`: Object storing some of the extensions added to the editor. [Read more](#extensions-property).
- `props: EditorProps`: The component props passed to the editor.
- `focused: boolean`. Whether the `textarea` is focused.
- `tokens: TokenStream`. Current tokens displayed in the editor.

#### DOM Elements

- `container: HTMLDivElement`: This is the outermost element of the editor.
- `wrapper: HTMLDivElement`: Element wrapping the lines and overlays.
- `lines: HTMLCollectionOf<HTMLDivElement>`: Collection containing the overlays as the first element, followed by all code lines.
- `textarea: HTMLTextAreaElement`: Underlying `textarea` in the editor.

### Methods

- `update(): void`: Forces the editor to update. Can be useful after modifying a grammar for example.
- `getSelection(): InputSelection`: Gets the `selectionStart`, `selectionEnd` and `selectionDirection` for the `textarea`.
- `on<T extends keyof EditorEventMap>(name: T, listener: EditorEventMap[T]): () => void`: Adds a listener for editor events and returns a cleanup function. Intended to be used by extensions inside a `useLayoutEffect` or `useEffect` hook.

### Extensions property

Multiple extensions have an entry on `editor.extensions` allowing you to interact with the extension.

- `matchBrackets: BracketMatcher`: Allows access to all brackets found in the editor along with which are paired together.
- `matchTags: TagMatcher`: Allows access to all tags found in the editor along with which tags are paired together.
- `cursor: Cursor`: Allows you to get the cursor position relative to the editor's overlays and to scroll the cursor into view.
- `searchWidget: SearchWidget`: Allows you to open or close the search widget.
- `history: EditHistory`: Allows you to clear the history or navigate it.
- `folding: ReadOnlyCodeFolding`: Allows access to the full unfolded code and to toggle folded ranges.
- `autoComplete: AutoComplete`: Allows inserting snippets and starting completion queries programmatically.

## Utilities

The `prism-react-editor/utils` entry point exports various utilities for inserting text, changing the selection, finding token elements, and more.

## Prism

The Prism instance used by this library is exported from `prism-react-editor/prism`. This allows you to add your own Prism grammars or perform syntax highlighting outside of an editor. All modules under `prism-react-editor/prism` can run outside the browser in for example Node.js to do syntax highlighting on the server. Check the [working with prism](https://prism-code-editor.netlify.app/guides/working-with-prism) guide for more info.

## Languages

Prism supports syntax highlighting for hundreds of languages, but none of them are imported by default. You need to choose which languages to import. Importing `prism-react-editor/prism/languages/javascript` for example will register the JavaScript grammar through side effects.

If you need access to many languages, you can import the following entry points:

- `prism-react-editor/prism/languages` for all languages (~180kB)
- `prism-react-editor/prism/languages/common` for [42 common languages](https://github.com/jonpyt/prism-code-editor/tree/main/package/src/prism/languages/common.js) (~30kB)

This library also supports auto-indenting, comment toggling and self-closing tags for most of these languages. For it to work, you need the `useDefaultCommands()` hook (or the basic setup) and to import the behavior for the language.

The easiest way is to import all languages at ~3.6kB gzipped. You can dynamically import this since it's usually not needed before the page has loaded.

```javascript
import("prism-react-editor/languages")
```

You can also import `prism-react-editor/languages/common` instead to support a subset of common languages at less than 2kB gzipped.

Lastly, if you only need support for a few languages, you can do individual imports, for example `prism-react-editor/languages/html`. [Read more](https://prism-code-editor.netlify.app/guides/language-specific-behavior#individual-imports).

## Styling

This library does not inject any styles onto the webpage, instead you must import them. If the default styles don't work for you, you can import your own styles instead.

- `prism-react-editor/layout.css`: layout for the editor.
- `prism-react-editor/scrollbar.css`: custom scrollbar to desktop Chrome and Safari you can color with `--pce-scrollbar`.
- `prism-react-editor/copy-button.css`: styles for the `useCopybutton()` extension.
- `prism-react-editor/search.css`: styles for the `useSearchWidget()` extension.
- `prism-react-editor/rtl-layout.css`: adds support for the `rtl` prop.
- `prism-react-editor/invisibles.css`: styles for the `useShowInvisibles()` extension.
- `prism-react-editor/autocomplete.css`: styles for the `useAutoComplete()` extension.
- `prism-react-editor/autocomplete-icons.css`: default icons for the autocompletion tooltip.
- `prism-react-editor/code-block.css`: additional styles required for [code blocks](#code-blocks).

By default, the editor's height will fit the content, so you might want to add a `height` or `max-height` to `.prism-code-editor` depending on your use case.

## Themes

There are currently 14 different themes you can import, one of them being from `prism-react-editor/themes/github-dark.css`. If none of the themes fit your website, use one of them as an example to help implement your own.

### Theme switcher

If you're making a theme switcher, you might want to use the `useEditorTheme` hook. This hook is a simple wrapper around the `loadTheme` utility exported from the same entry point. If want something more sophisticated, use `loadTheme` directly instead.

```jsx
import { useState } from "react"
import { useEditorTheme } from "prism-react-editor/themes"

export function App() {
  const [theme, setTheme] = useState("github-dark")
  const themeCss = useEditorTheme(theme)

  return <>
    <style>{themeCss}</style>
    ...
  </>
}
```

The hook and `<style>` tag can be placed in any component you want. Just make sure that component is only used once since you don't want multiple `<style>` elements with themes on the page.

To limit [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content), you may want to provide a fallback stylesheet for when the theme is loading using something like `<style>{themeCss ?? fallbackCss}</style>`. Alternatively, you can avoid rendering editors before the theme has loaded using `themeCss && <Editor ... />`.

If you're just switching between two themes (light/dark), using CSS variables would have fewer downsides, but this does require maintaining your own theme.

### Registering themes

If you want to use your own themes with `useEditorTheme` or `loadTheme` or want to override existing themes, use `registerTheme`. The example below might look different if you're not using Vite as your bundler.

```js
import { registerTheme } from "prism-react-editor/themes"

// Might look different if you're not using Vite
registerTheme("my-theme", () => import("./my-theme.css?inline"))
```

## Code blocks

This library can also create static code blocks. These support some features not supported by editors such as hover descriptions and highlighting brackets/tag-names on hover.

```tsx
import {
  CodeBlock,
  CopyButton,
  HighlightBracketPairsOnHover,
  HighlightTagPairsOnHover,
  HoverDescriptions,
  rainbowBrackets,
} from "prism-react-editor/code-blocks"
import "prism-react-editor/layout.css"
import "prism-react-editor/code-block.css"
import "prism-react-editor/themes/github-dark.css"

// External to minimize rerenders
const onTokenize = rainbowBrackets()

function MyCodeBlock({ lang, code }: { lang: string, code: string }) {
  return <CodeBlock
    language={lang}
    code={code}
    onTokenize={onTokenize}
  >
    {(codeBlock, props) => (
      <>
        <HoverDescriptions
          callback={(types, language, text, element) => {
            if (types.includes("string")) return ["This is a string token."]
          }}
          codeBlock={codeBlock}
          props={props}
        />
        <CopyButton codeBlock={codeBlock} props={props} />
        <HighlightTagPairsOnHover codeBlock={codeBlock} props={props} />
        <HighlightBracketPairsOnHover codeBlock={codeBlock} props={props} />
      </>
    )}
  </CodeBlock>
}
```

### Code block props

| Name                | Type                                                                    | Description                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`          | `string`                                                                | Language used for syntax highlighting. Defaults to `text`.                                                                                      |
| `tabSize`           | `number`                                                                | Tab size used for indentation. Defaults to `2`.                                                                                                 |
| `lineNumbers`       | `boolean`                                                               | Whether line numbers should be shown. Defaults to `false`.                                                                                      |
| `wordWrap`          | `boolean`                                                               | Whether the code block should have word wrap. Defaults to `false`.                                                                              |
| `preserveIndent`    | `boolean`                                                               | Whether or not indentation is preserved on wrapped lines. Defaults to `true` when `wordWrap` is enabled.                                        |
| `guideIndents`      | `boolean`                                                               | Whether or not to display indentation guides. Does not work with `rtl` set to `true`. Defaults to `false`                                       |
| `rtl`               | `boolean`                                                               | Whether the editor uses right to left directionality. Defaults to `false`. Requires extra CSS from `prism-react-editor/rtl-layout.css` to work. |
| `code`              | `string`                                                                | Code to display in the code block.                                                                                                              |
| `style`             | `Omit<React.CSSProperties, "tabSize" \| "counterReset">`                | Allows adding inline styles to the container element.                                                                                           |
| `className`         | `string`                                                                | Additional classes for the container element.                                                                                                   |
| `onTokenize`        | `(tokens: TokenStream) => void`                                         | Callback that can be used to modify the tokens before they're stringified to HTML.                                                              |
| `children`          | `(codeBlock: PrismCodeBlock, props: CodeBlockProps) => React.ReactNode` | Callback used to render extensions.                                                                                                             |

## Performance

Manual DOM manipulation has been kept almost everywhere. This rewrite therefore has very similar performance to the original which would not be the case if only JSX was used.

## Development

To run the development server locally, install dependencies.

    pnpm install

Next, you must build the prism-code-editor package.

    cd ../package
    pnpm install
    pnpm build

Finally, you can run the development server to test your changes.

    cd ../react-package
    pnpm dev
