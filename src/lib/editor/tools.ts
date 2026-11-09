/**
 * Editor.js tools (FR-EDIT-02). Browser-only: import this module only from a
 * component loaded with `next/dynamic({ ssr: false })`.
 */
import Code from "@editorjs/code"
import Delimiter from "@editorjs/delimiter"
import type { EditorConfig, ToolConstructable } from "@editorjs/editorjs"
import Embed from "@editorjs/embed"
import Header from "@editorjs/header"
import ImageTool from "@editorjs/image"
import InlineCode from "@editorjs/inline-code"
import List from "@editorjs/list"
import Marker from "@editorjs/marker"
import Quote from "@editorjs/quote"
import Table from "@editorjs/table"

const tool = (cls: unknown) => cls as ToolConstructable

export function createEditorTools(): NonNullable<EditorConfig["tools"]> {
  return {
    header: {
      class: tool(Header),
      inlineToolbar: true,
      config: { levels: [2, 3, 4], defaultLevel: 2, placeholder: "Heading" },
    },
    list: {
      class: tool(List),
      inlineToolbar: true,
      config: { defaultStyle: "unordered" },
    },
    image: {
      class: tool(ImageTool),
      config: {
        endpoints: {
          byFile: "/api/uploads/editor/file",
          byUrl: "/api/uploads/editor/url",
        },
        field: "image",
        types: "image/jpeg,image/png,image/webp,image/gif",
        captionPlaceholder: "Caption (optional)",
      },
    },
    code: { class: tool(Code), config: { placeholder: "Paste or write code" } },
    quote: {
      class: tool(Quote),
      inlineToolbar: true,
      config: { quotePlaceholder: "Quote", captionPlaceholder: "Author" },
    },
    delimiter: tool(Delimiter),
    table: { class: tool(Table), inlineToolbar: true },
    embed: {
      class: tool(Embed),
      config: { services: { youtube: true, twitter: true, codepen: true } },
    },
    inlineCode: { class: tool(InlineCode), shortcut: "CMD+SHIFT+M" },
    marker: { class: tool(Marker), shortcut: "CMD+SHIFT+H" },
  }
}
