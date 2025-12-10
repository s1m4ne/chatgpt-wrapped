export type ParseErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_FORMAT'
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'READ_ERROR'

export interface ParseError {
  code: ParseErrorCode
  message: string
  details?: string
}

export type ApiErrorCode =
  | 'RATE_LIMIT'
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface ApiError {
  code: ApiErrorCode
  message: string
  retryAfter?: number
}

export interface ParseResult<T> {
  success: boolean
  data?: T
  error?: ParseError
  stats?: {
    totalConversations: number
    totalMessages: number
    skippedMessages: number
  }
}

export interface AnalysisResult<T> {
  success: boolean
  data?: T
  error?: ApiError
}
