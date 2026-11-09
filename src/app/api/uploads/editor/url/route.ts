import { parseOrThrow, readJson, requireApiUser } from "@/lib/api"
import { fetchRemoteImage, uploadImage } from "@/lib/services/uploads"
import { imageUrlUploadSchema } from "@/lib/validations/blog"
import { editorFailure, editorSuccess } from "../response"

/** E33 — Editor.js Image tool `endpoints.byUrl`: download, validate, re-host. */
export async function POST(request: Request) {
  try {
    const user = await requireApiUser()
    const { url } = parseOrThrow(imageUrlUploadSchema, await readJson(request))
    const bytes = await fetchRemoteImage(url)
    return editorSuccess(await uploadImage(user.id, "content", bytes))
  } catch (error) {
    return editorFailure(error)
  }
}
