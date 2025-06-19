export enum LoadingState {
  // eslint-disable-next-line no-unused-vars
  IDLE = 'idle',
  // eslint-disable-next-line no-unused-vars
  LOADING = 'loading',
  // eslint-disable-next-line no-unused-vars
  SUCCESS = 'success',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

export type Result<T> = { success: true; data: T } | { success: false; error: ApiError }
