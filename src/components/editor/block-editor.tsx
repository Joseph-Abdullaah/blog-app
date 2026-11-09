"use client"

import EditorJS, { type OutputData } from "@editorjs/editorjs"
import { useEffect, useRef } from "react"

import { createEditorTools } from "@/lib/editor/tools"
import type { EditorJsData } from "@/types/dto"

export type BlockEditorHandle = {
  /** Current content from Editor.js. */
  save: () => Promise<EditorJsData>
}

/**
 * Editor.js canvas. Load it with `next/dynamic({ ssr: false })` — Editor.js
 * touches `window`. The instance is created once per mount; `initialData` is
 * only read on mount.
 */
export default function BlockEditor({
  initialData,
  editorRef,
  onChange,
}: {
  initialData?: EditorJsData
  /** Filled with `{ save }` once the editor is ready. */
  editorRef: React.RefObject<BlockEditorHandle | null>
  /** Fires on every content change (use it to mark the screen dirty). */
  onChange?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const initialRef = useRef(initialData)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // A fresh holder per mount keeps React's dev double-mount from stacking editors.
    const holder = document.createElement("div")
    container.appendChild(holder)

    const editor = new EditorJS({
      holder,
      data: (initialRef.current ?? { blocks: [] }) as OutputData,
      tools: createEditorTools(),
      placeholder: "Let's write an awesome story!",
      minHeight: 240,
      inlineToolbar: ["bold", "italic", "link", "marker", "inlineCode"],
      onChange: () => onChangeRef.current?.(),
    })

    editorRef.current = {
      save: async () => {
        await editor.isReady
        return (await editor.save()) as EditorJsData
      },
    }

    return () => {
      editorRef.current = null
      editor.isReady
        .then(() => editor.destroy())
        .catch(() => {})
        .finally(() => holder.remove())
    }
  }, [editorRef])

  return <div ref={containerRef} className="byline-editor" />
}
