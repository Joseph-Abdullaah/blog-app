/** Error codes from docs/08-API-SPEC.md §1.2. */
export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
}

/** Thrown by services; route handlers turn it into the error envelope. */
export class ApiError extends Error {
  readonly status: number

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string>
  ) {
    super(message)
    this.status = STATUS[code]
  }

  static notFound(message = "Not found") {
    return new ApiError("NOT_FOUND", message)
  }
  static forbidden(message = "You can't do that") {
    return new ApiError("FORBIDDEN", message)
  }
  static conflict(message: string) {
    return new ApiError("CONFLICT", message)
  }
  static validation(message: string, fields?: Record<string, string>) {
    return new ApiError("VALIDATION_ERROR", message, fields)
  }
}
