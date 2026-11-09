"use client"

import { HashIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { TopicChip } from "@/components/byline"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { normalizeTopicName, topicNameSchema } from "@/lib/validations/blog"
import type { TopicDTO } from "@/types/dto"

const MAX_TOPICS = 5

type Option = { kind: "existing"; name: string } | { kind: "create"; name: string }

/** Topic chips + autocomplete from E26 (S-10). Enter adds, Backspace removes the last. */
export function TopicsInput({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string[]
  onChange: (topics: string[]) => void
  invalid?: boolean
}) {
  const listId = useId()
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [suggestions, setSuggestions] = useState<TopicDTO[]>([])

  const query = normalizeTopicName(text)
  const full = value.length >= MAX_TOPICS
  const chosen = new Set(value.map((v) => v.toLowerCase()))

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/topics?q=${encodeURIComponent(query)}&limit=6`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((body: { data?: TopicDTO[] }) => setSuggestions(body.data ?? []))
        .catch(() => {})
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const visible = query ? suggestions : []
  const options: Option[] = [
    ...visible
      .filter((t) => !chosen.has(t.name.toLowerCase()))
      .map((t) => ({ kind: "existing" as const, name: t.name })),
  ]
  const exact = visible.some((t) => t.name.toLowerCase() === query.toLowerCase())
  if (query && !exact && !chosen.has(query.toLowerCase()) && topicNameSchema.safeParse(query).success) {
    options.push({ kind: "create", name: query })
  }
  const showList = open && !full && options.length > 0
  const activeIndex = Math.min(active, Math.max(options.length - 1, 0))

  function add(name: string) {
    const clean = normalizeTopicName(name)
    if (!clean || full || chosen.has(clean.toLowerCase())) return
    onChange([...value, clean])
    setText("")
    setActive(0)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <InputGroup className={cn(full && "opacity-60")}>
          <InputGroupAddon>
            <HashIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id={id}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList ? `${listId}-${activeIndex}` : undefined}
            aria-invalid={invalid}
            autoComplete="off"
            disabled={full}
            placeholder={full ? "5 topics added" : "Add a topic and press Enter"}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setOpen(true)
              setActive(0)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && options.length) {
                e.preventDefault()
                setActive((activeIndex + 1) % options.length)
              } else if (e.key === "ArrowUp" && options.length) {
                e.preventDefault()
                setActive((activeIndex - 1 + options.length) % options.length)
              } else if (e.key === "Enter") {
                e.preventDefault()
                if (showList) add(options[activeIndex].name)
                else if (query && topicNameSchema.safeParse(query).success) add(query)
              } else if (e.key === "Escape") {
                setOpen(false)
              } else if (e.key === "Backspace" && !text && value.length) {
                onChange(value.slice(0, -1))
              }
            }}
          />
        </InputGroup>

        {showList ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-hairline bg-popover p-1 shadow-pop dark:border-hairline-strong"
          >
            {options.map((option, i) => (
              <li
                key={`${option.kind}-${option.name}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(option.name)
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex h-9 cursor-pointer items-center rounded-sm px-2.5 text-body-sm text-ink",
                  i === activeIndex && "bg-surface-1",
                  option.kind === "create" && "text-ink-subtle"
                )}
              >
                {option.kind === "create" ? `Create “${option.name}”` : option.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((topic) => (
            <TopicChip
              key={topic}
              onRemove={() => onChange(value.filter((t) => t !== topic))}
            >
              {topic}
            </TopicChip>
          ))}
        </div>
      ) : null}
    </div>
  )
}
