"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"

type TextFieldProps = Omit<React.ComponentProps<"input">, "size"> & {
  label?: string
  icon?: LucideIcon
  /** Helper text under the field. */
  help?: string
  helpTone?: "default" | "success"
  error?: string
  /** Visually hide the label (it stays for screen readers). */
  hideLabel?: boolean
  /** Fill the control with canvas instead of surface-1, for use inside a Card. */
  onCard?: boolean
}

/** Labeled input: surface-1 fill, optional leading icon, helper and error text. */
function TextField({
  label,
  icon: Icon,
  help,
  helpTone = "default",
  error,
  hideLabel = false,
  onCard = false,
  id,
  type,
  ...props
}: TextFieldProps) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  const [shown, setShown] = React.useState(false)
  const isPassword = type === "password"
  const describedBy = error || help ? `${fieldId}-desc` : undefined
  const controlProps = {
    id: fieldId,
    type: isPassword && shown ? "text" : type,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    ...props,
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      {label ? (
        <FieldLabel htmlFor={fieldId} className={hideLabel ? "sr-only" : undefined}>
          {label}
        </FieldLabel>
      ) : null}
      {Icon || isPassword ? (
        <InputGroup className={onCard ? "bg-canvas" : undefined}>
          {Icon ? (
            <InputGroupAddon>
              <Icon aria-hidden />
            </InputGroupAddon>
          ) : null}
          <InputGroupInput {...controlProps} />
          {isPassword ? (
            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={shown ? "Hide password" : "Show password"}
                aria-pressed={shown}
                onClick={() => setShown((v) => !v)}
              >
                {shown ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              </Button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : (
        <Input className={onCard ? "bg-canvas" : undefined} {...controlProps} />
      )}
      {error ? (
        <FieldError id={`${fieldId}-desc`}>{error}</FieldError>
      ) : help ? (
        <FieldDescription
          id={`${fieldId}-desc`}
          className={helpTone === "success" ? "text-success" : undefined}
        >
          {help}
        </FieldDescription>
      ) : null}
    </Field>
  )
}

type TextareaFieldProps = React.ComponentProps<"textarea"> & {
  label?: string
  error?: string
}

/** Labeled textarea with an "N characters left" counter when `maxLength` is set. */
function TextareaField({
  label,
  error,
  id,
  maxLength,
  defaultValue,
  value,
  onChange,
  ...props
}: TextareaFieldProps) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  const [inner, setInner] = React.useState(String(defaultValue ?? ""))
  const current = value !== undefined ? String(value) : inner
  const left = maxLength !== undefined ? maxLength - current.length : undefined

  return (
    <Field data-invalid={error ? true : undefined}>
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <Textarea
        id={fieldId}
        maxLength={maxLength}
        value={current}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          setInner(e.target.value)
          onChange?.(e)
        }}
        {...props}
      />
      {error ? (
        <FieldError>{error}</FieldError>
      ) : left !== undefined ? (
        <FieldDescription aria-live="polite">
          {left} characters left
        </FieldDescription>
      ) : null}
    </Field>
  )
}

export { TextField, TextareaField }
