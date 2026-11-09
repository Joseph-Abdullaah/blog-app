"use client"

const MAX = 120

/** Blog title: display-lg, grows with its content, 120 max, Enter doesn't add a line. */
export function TitleInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label htmlFor="blog-title" className="sr-only">
        Blog title
      </label>
      <textarea
        id="blog-title"
        rows={1}
        maxLength={MAX}
        value={value}
        placeholder="Blog Title"
        onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
        className="field-sizing-content w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-display-lg text-ink outline-none placeholder:text-ink-tertiary"
      />
      <p className="mt-2 text-right text-caption text-ink-subtle" aria-live="polite">
        {value.length} / {MAX}
      </p>
    </div>
  )
}
