"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { publishBlogSchema } from "@/lib/validations/blog"
import type { BlogStatus, EditorJsData } from "@/types/dto"
import { TopicsInput } from "./topics-input"

const panelSchema = publishBlogSchema.pick({ description: true, topics: true })
type PanelValues = z.input<typeof panelSchema>

export type PublishResult = { id: string; slug: string; firstPublish: boolean }

type OtherField = "title" | "bannerUrl" | "content"
const OTHER_LABEL: Record<OtherField, string> = {
  title: "Title",
  bannerUrl: "Banner",
  content: "Story",
}

/**
 * S-10 publish panel: preview card, short description, topics and Publish.
 * Title, banner and content live in the editor; their errors are listed here.
 */
export function PublishPanel({
  open,
  onClose,
  status,
  title,
  bannerUrl,
  description,
  topics,
  prepare,
  onPublished,
}: {
  open: boolean
  /** Called with the latest description/topics so the editor keeps them. */
  onClose: (values: { description: string; topics: string[] }) => void
  status: BlogStatus
  title: string
  bannerUrl: string | null
  description: string
  topics: string[]
  /** Saves a new draft if needed and returns its id plus the current content. */
  prepare: () => Promise<{ blogId: string; content: EditorJsData }>
  onPublished: (result: PublishResult) => void
}) {
  const update = status === "PUBLISHED"
  const [otherErrors, setOtherErrors] = useState<Partial<Record<OtherField, string>>>({})
  const [formError, setFormError] = useState<string>()

  const form = useForm<PanelValues>({
    resolver: zodResolver(panelSchema),
    values: { description, topics },
    resetOptions: { keepDirtyValues: true },
  })
  const watchedDescription = useWatch({ control: form.control, name: "description" }) ?? ""

  function close() {
    const values = form.getValues()
    onClose({
      description: values.description ?? "",
      topics: values.topics ?? [],
    })
  }

  async function submit(values: PanelValues) {
    setFormError(undefined)
    setOtherErrors({})
    try {
      const { blogId, content } = await prepare()
      const body = { title, bannerUrl, content, ...values }

      // Same rules as the server, so problems show before the request.
      const check = publishBlogSchema.safeParse(body)
      if (!check.success) {
        applyErrors(
          Object.fromEntries(
            check.error.issues.map((i) => [String(i.path[0]), i.message])
          )
        )
        return
      }

      const res = await fetch(`/api/blogs/${blogId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check.data),
      })
      const json = (await res.json().catch(() => ({}))) as {
        data?: PublishResult
        error?: { message: string; fields?: Record<string, string> }
      }
      if (!res.ok || !json.data) {
        if (json.error?.fields) applyErrors(json.error.fields)
        else setFormError(json.error?.message ?? "Couldn't publish. Try again.")
        return
      }
      onPublished(json.data)
    } catch (error) {
      setFormError((error as Error).message)
    }
  }

  function applyErrors(fields: Record<string, string>) {
    const others: Partial<Record<OtherField, string>> = {}
    for (const [key, message] of Object.entries(fields)) {
      if (key === "description" || key === "topics") {
        form.setError(key, { message })
      } else if (key in OTHER_LABEL) {
        others[key as OtherField] = message
      }
    }
    setOtherErrors(others)
  }

  const otherList = Object.entries(otherErrors) as [OtherField, string][]

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 grid h-svh max-h-none w-full max-w-none translate-x-0 translate-y-0 content-start gap-0 overflow-y-auto rounded-none border-0 bg-canvas p-0 shadow-none sm:max-w-none dark:bg-canvas"
      >
        <div className="flex justify-end px-4 py-4 sm:px-6">
          <DialogClose
            render={
              <Button variant="ghost" size="icon" aria-label="Close publish panel" />
            }
          >
            <XIcon aria-hidden />
          </DialogClose>
        </div>

        <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-4 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-12">
          <section className="min-w-0">
            <p className="mb-4 text-eyebrow tracking-[1px] text-ink-subtle uppercase">
              Preview
            </p>
            <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
              {bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <div className="grid aspect-video w-full place-items-center bg-surface-1 text-body-sm text-ink-subtle">
                  No banner yet
                </div>
              )}
              <div className="p-6">
                <h2 className="mb-2 text-headline text-ink">{title || "Untitled"}</h2>
                <p className="font-serif text-[16px] leading-[1.6] text-ink-subtle">
                  {watchedDescription || "Your short description shows here."}
                </p>
              </div>
            </div>
          </section>

          <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="flex min-w-0 flex-col gap-6"
          >
            <DialogTitle className="text-headline">
              {update ? "Ready to update?" : "Ready to publish?"}
            </DialogTitle>

            {otherList.length || formError ? (
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  {formError ? <p>{formError}</p> : null}
                  {otherList.length ? (
                    <ul className="flex flex-col gap-1">
                      {otherList.map(([field, message]) => (
                        <li key={field}>
                          <b>{OTHER_LABEL[field]}:</b> {message}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="publish-description">Short description</FieldLabel>
                  <Textarea
                    {...field}
                    id="publish-description"
                    maxLength={200}
                    placeholder="What is this story about?"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      {200 - (field.value?.length ?? 0)} characters left
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="topics"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-baseline justify-between gap-4">
                    <FieldLabel htmlFor="publish-topics">
                      Topics{" "}
                      <span className="font-normal text-ink-subtle">(used for search)</span>
                    </FieldLabel>
                    <span className="text-caption text-ink-subtle">
                      {field.value?.length ?? 0} / 5
                    </span>
                  </div>
                  <TopicsInput
                    id="publish-topics"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
                {update ? "Update" : "Publish"}
              </Button>
              <DialogClose render={<Button type="button" variant="ghost" size="lg" />}>
                Back to editing
              </DialogClose>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
