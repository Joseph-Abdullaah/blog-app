import { NextResponse } from "next/server"

import { ApiError } from "@/lib/errors"
import type { UploadedImage } from "@/lib/services/uploads"

/** Editor.js Image tool expects `{ success, file }` with no envelope (E32/E33). */
export function editorSuccess(image: UploadedImage) {
  return NextResponse.json({ success: 1, file: image })
}

export function editorFailure(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: 0, message: error.message },
      { status: error.status }
    )
  }
  console.error(error)
  return NextResponse.json(
    { success: 0, message: "Upload failed. Try again." },
    { status: 500 }
  )
}
