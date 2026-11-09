import { requireApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { fileBytes, uploadImage } from "@/lib/services/uploads"
import { editorFailure, editorSuccess } from "../response"

/** E32 — Editor.js Image tool `endpoints.byFile` (field `image`). */
export async function POST(request: Request) {
  try {
    const user = await requireApiUser()
    const form = await request.formData().catch(() => {
      throw new ApiError("BAD_REQUEST", "Expected multipart/form-data")
    })
    const bytes = await fileBytes(form, "image")
    return editorSuccess(await uploadImage(user.id, "content", bytes))
  } catch (error) {
    return editorFailure(error)
  }
}
