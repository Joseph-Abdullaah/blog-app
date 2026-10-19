import { handler, ok, parseOrThrow, requireApiUser } from "@/lib/api"
import { ApiError } from "@/lib/errors"
import { fileBytes, uploadImage } from "@/lib/services/uploads"
import { uploadPurposeSchema } from "@/lib/validations/blog"

/** E31 — banner (≤ 5 MB) or avatar (≤ 2 MB) upload, multipart `file` + `purpose`. */
export const POST = handler(async (request: Request) => {
  const user = await requireApiUser()
  const form = await request.formData().catch(() => {
    throw new ApiError("BAD_REQUEST", "Expected multipart/form-data")
  })
  const purpose = parseOrThrow(uploadPurposeSchema, form.get("purpose"))
  const bytes = await fileBytes(form, "file")
  return ok(await uploadImage(user.id, purpose, bytes), { status: 201 })
})
