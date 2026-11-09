import type { Metadata } from "next"

import { EditorBar } from "@/components/byline"

export const metadata: Metadata = { title: "Write" }

/**
 * Editor shell for a new blog (S-09). Only the page frame is set up:
 * the EditorBar and the 720px (`max-w-read`) writing column.
 *
 * TODO(editor): banner upload, title input, block editor, autosave and the
 * publish panel (S-10). Wire the EditorBar's onPreview / onSaveDraft /
 * onPublish props, which need this page (or a child) to be a client component.
 */
export default function NewEditorPage() {
  return (
    <div className="min-h-svh bg-canvas">
      <EditorBar title="" status="DRAFT" />
      <main className="mx-auto max-w-read px-4 pt-10 pb-24 sm:px-6">
        {/* TODO(editor): <BannerUpload /> */}
        {/* TODO(editor): title input (display-lg) */}
        {/* TODO(editor): block editor */}
      </main>
    </div>
  )
}
