import type { Metadata } from "next"

import { EditorScreen } from "@/components/editor/editor-screen"
import { requireUser } from "@/lib/auth-guards"

export const metadata: Metadata = { title: "Write" }

/** S-09 — new blog. The draft row is created on first save (FR-EDIT-01). */
export default async function NewEditorPage() {
  await requireUser("/editor")
  return <EditorScreen />
}
