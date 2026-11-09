import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EditorBar } from "@/components/byline"
import { getBlogById } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Edit blog" }

/**
 * Editor shell for an existing blog (S-09). The blog is loaded from mock
 * data; the editing surface itself is left for the editor implementation.
 *
 * TODO(editor): load the real blog, then mount the banner, title and block
 * editor with `blog.bannerUrl`, `blog.title` and `blog.blocks` as initial data.
 */
export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ blogId: string }>
}) {
  const { blogId } = await params
  const blog = getBlogById(blogId)
  if (!blog) notFound()

  return (
    <div className="min-h-svh bg-canvas">
      <EditorBar title={blog.title} status={blog.status} savedAt="just now" />
      <main className="mx-auto max-w-read px-4 pt-10 pb-24 sm:px-6">
        {/* TODO(editor): <BannerUpload /> */}
        {/* TODO(editor): title input (display-lg) */}
        {/* TODO(editor): block editor */}
      </main>
    </div>
  )
}
