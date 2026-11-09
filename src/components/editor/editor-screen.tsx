"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { EditorBar } from "@/components/byline"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import type { EditableBlog, EditorJsData } from "@/types/dto"
import { BannerUpload } from "./banner-upload"
import type { BlockEditorHandle } from "./block-editor"
import { EditorPreview } from "./editor-preview"
import { PublishPanel, type PublishResult } from "./publish-panel"
import { TitleInput } from "./title-input"

const BlockEditor = dynamic(() => import("./block-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  ),
})

const AUTOSAVE_MS = 30_000

const timeLabel = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

type ApiResult<T> = { data?: T; error?: { message: string } }

async function request<T>(url: string, init: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  })
  const body = (await res.json().catch(() => ({}))) as ApiResult<T>
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? "Something went wrong. Try again.")
  }
  return body.data
}

/** S-09 editor: banner, title, Editor.js canvas, Save Draft, autosave, preview and publish (S-10). */
export function EditorScreen({ initial }: { initial?: EditableBlog }) {
  const router = useRouter()
  const editorRef = useRef<BlockEditorHandle | null>(null)

  const [blogId, setBlogId] = useState(initial?.id ?? null)
  const [status] = useState(initial?.status ?? "DRAFT")
  const [title, setTitle] = useState(initial?.title ?? "")
  const [bannerUrl, setBannerUrl] = useState(initial?.bannerUrl ?? null)
  const [description, setDescription] = useState(initial?.description ?? "")
  const [topics, setTopics] = useState<string[]>(
    initial?.topics.map((t) => t.name) ?? []
  )
  const [topicsChanged, setTopicsChanged] = useState(false)
  const [previewContent, setPreviewContent] = useState<EditorJsData | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(
    initial ? new Date(initial.updatedAt) : null
  )
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const published = status === "PUBLISHED"
  const initialContent = initial?.content
  const markDirty = useCallback(() => setDirty(true), [])

  // Latest values for the autosave timer without restarting it.
  const stateRef = useRef({
    blogId, title, bannerUrl, description, topics, topicsChanged, dirty, saving,
  })
  useEffect(() => {
    stateRef.current = {
      blogId, title, bannerUrl, description, topics, topicsChanged, dirty, saving,
    }
  })

  /** Current content: from the preview snapshot or the live editor. */
  const currentContent = useCallback(async (): Promise<EditorJsData> => {
    return (
      (await editorRef.current?.save()) ?? initialContent ?? { blocks: [] }
    )
  }, [initialContent])

  const saveDraft = useCallback(
    async ({ silent = false } = {}) => {
      const s = stateRef.current
      if (s.saving || published) return s.blogId
      setSaving(true)
      try {
        const content = await currentContent()
        const body = JSON.stringify({
          title: s.title,
          description: s.description,
          bannerUrl: s.bannerUrl,
          content,
          // Topics are only sent when they changed (keeps saves to one query).
          ...(s.topicsChanged || !s.blogId ? { topics: s.topics } : {}),
        })

        const saved = s.blogId
          ? await request<EditableBlog>(`/api/blogs/${s.blogId}`, { method: "PATCH", body })
          : await request<EditableBlog>("/api/blogs", { method: "POST", body })

        if (!s.blogId) {
          setBlogId(saved.id)
          // Keep the mounted editor; just reflect the new URL (FR-EDIT-01).
          window.history.replaceState(null, "", `/editor/${saved.id}`)
        }
        setDirty(false)
        setTopicsChanged(false)
        setSavedAt(new Date(saved.updatedAt))
        if (!silent) toast.add({ title: "Draft saved", type: "success" })
        return saved.id
      } catch (error) {
        toast.add({
          title: silent ? "Autosave failed" : "Couldn't save draft",
          description: (error as Error).message,
          type: "error",
        })
      } finally {
        setSaving(false)
      }
      return null
    },
    [currentContent, published]
  )

  /** Publish panel needs an id: a brand-new blog is saved as a draft first. */
  const prepare = useCallback(async () => {
    const content = await currentContent()
    let id = stateRef.current.blogId
    if (!id) id = (await saveDraft({ silent: true })) ?? null
    if (!id) throw new Error("Couldn't save your draft. Try again.")
    return { blogId: id, content }
  }, [currentContent, saveDraft])

  async function openPreview() {
    setPreviewContent(await currentContent())
    window.scrollTo({ top: 0 })
  }

  function onPublished(result: PublishResult) {
    setPublishing(true)
    setDirty(false)
    setPublishOpen(false)
    toast.add({ title: result.firstPublish ? "Published" : "Updated", type: "success" })
    router.push(`/blog/${result.slug}`)
  }

  // Autosave every 30 s while there are unsaved changes (FR-EDIT-06).
  useEffect(() => {
    if (published) return
    const timer = setInterval(() => {
      if (stateRef.current.dirty && !stateRef.current.saving) {
        void saveDraft({ silent: true })
      }
    }, AUTOSAVE_MS)
    return () => clearInterval(timer)
  }, [published, saveDraft])

  // Tab close / refresh with unsaved changes (FR-EDIT-07).
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  // In-app links with unsaved changes ask first (FR-EDIT-07).
  useEffect(() => {
    if (!dirty) return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
      const link = (e.target as HTMLElement).closest("a[href]")
      if (!link || link.getAttribute("target") === "_blank") return
      const url = new URL((link as HTMLAnchorElement).href)
      if (url.origin !== window.location.origin) return
      e.preventDefault()
      setPendingHref(url.pathname + url.search)
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [dirty])

  return (
    <>
      <EditorBar
        title={title}
        status={status}
        dirty={dirty}
        saving={saving}
        publishing={publishing}
        savedAt={savedAt ? `· ${timeLabel(savedAt)}` : undefined}
        previewing={previewContent !== null}
        onBack={() => setPreviewContent(null)}
        onPreview={() => void openPreview()}
        onSaveDraft={() => void saveDraft()}
        onPublish={() => setPublishOpen(true)}
      />

      {previewContent ? (
        <EditorPreview
          title={title}
          description={description}
          bannerUrl={bannerUrl}
          topics={topics}
          content={previewContent}
        />
      ) : null}

      {/* Kept mounted while previewing so Editor.js keeps its state. */}
      <main
        hidden={previewContent !== null}
        className="mx-auto flex max-w-read flex-col gap-8 px-4 pt-8 pb-24 sm:px-6 sm:pt-10"
      >
        <BannerUpload
          value={bannerUrl}
          onChange={(url) => {
            setBannerUrl(url)
            setDirty(true)
          }}
        />
        <div>
          <TitleInput
            value={title}
            onChange={(value) => {
              setTitle(value)
              setDirty(true)
            }}
          />
          <Separator className="mt-4 bg-hairline" />
        </div>
        <BlockEditor
          initialData={initial?.content}
          editorRef={editorRef}
          onChange={markDirty}
        />
      </main>

      <PublishPanel
        open={publishOpen}
        status={status}
        title={title}
        bannerUrl={bannerUrl}
        description={description}
        topics={topics}
        prepare={prepare}
        onPublished={onPublished}
        onClose={(values) => {
          setPublishOpen(false)
          if (values.description !== description) {
            setDescription(values.description)
            setDirty(true)
          }
          if (values.topics.join("|") !== topics.join("|")) {
            setTopics(values.topics)
            setTopicsChanged(true)
            setDirty(true)
          }
        }}
      />

      <Dialog
        open={pendingHref !== null}
        onOpenChange={(open) => !open && setPendingHref(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              Your latest edits haven’t been saved yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>
              Keep editing
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                const href = pendingHref
                setDirty(false)
                setPendingHref(null)
                if (href) router.push(href)
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
