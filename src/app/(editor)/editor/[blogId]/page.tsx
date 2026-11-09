import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EditorScreen } from "@/components/editor/editor-screen"
import { requireUser } from "@/lib/auth-guards"
import { getEditableBlog } from "@/lib/services/blogs"

export const metadata: Metadata = { title: "Edit blog" }

/** S-09 — existing blog; only its author may open it (FR-EDIT-08). */
export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ blogId: string }>
}) {
  const { blogId } = await params
  const user = await requireUser(`/editor/${blogId}`)
  const blog = await getEditableBlog(user.id, blogId)
  if (!blog) notFound()

  return <EditorScreen key={blog.id} initial={blog} />
}
