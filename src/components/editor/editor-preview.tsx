import { BlockRenderer, TopicChip } from "@/components/byline"
import type { EditorJsData } from "@/types/dto"

/** Read-only preview with the reader layout (FR-PUB-01). Interactions are left out. */
export function EditorPreview({
  title,
  description,
  bannerUrl,
  topics,
  content,
}: {
  title: string
  description: string
  bannerUrl: string | null
  topics: string[]
  content: EditorJsData
}) {
  return (
    <article className="mx-auto max-w-read px-4 pt-8 pb-24 sm:px-6 sm:pt-10">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerUrl}
          alt=""
          className="aspect-video w-full rounded-lg border border-hairline object-cover"
        />
      ) : null}
      <h1 className="mt-8 mb-4 text-display-lg text-ink sm:mt-10">
        {title || "Untitled"}
      </h1>
      {description ? (
        <p className="mb-8 font-serif text-reading-lead text-ink-subtle">{description}</p>
      ) : null}
      <BlockRenderer blocks={content.blocks} />
      {topics.length ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {topics.map((t) => (
            <TopicChip key={t}>{t}</TopicChip>
          ))}
        </div>
      ) : null}
    </article>
  )
}
