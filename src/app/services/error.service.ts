import { Injectable, signal } from '@angular/core'

export interface AppError {
  message: string
  code?: string
  details?: unknown
  timestamp: Date
}

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  // Signal to track current error
  currentError = signal<AppError | null>(null)

  // History of errors for debugging
  errorHistory = signal<AppError[]>([])

  handleError(error: unknown, userMessage?: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = error as any // Type assertion for property access
    const appError: AppError = {
      message: userMessage || this.extractErrorMessage(error),
      code: errorObj?.code || errorObj?.status?.toString() || 'UNKNOWN',
      details: error,
      timestamp: new Date(),
    }

    // Update current error
    this.currentError.set(appError)

    // Add to history (keep last 10 errors)
    this.errorHistory.update((history) => {
      const newHistory = [appError, ...history.slice(0, 9)]
      return newHistory
    })

    // Log to console in development
    console.error('Application Error:', appError)

    // Handle specific error codes
    this.handleSpecificErrors(error)
  }

  clearError(): void {
    this.currentError.set(null)
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = error as any

    // HTTP error response
    if (errorObj?.error?.message) {
      return errorObj.error.message
    }

    // Standard Error object
    if (errorObj?.message) {
      return errorObj.message
    }

    // Network errors
    if (errorObj?.status === 0) {
      return 'Network error. Please check your connection.'
    }

    // HTTP status codes
    switch (errorObj?.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required. Please log in.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  private handleSpecificErrors(error: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = error as any
    // Handle 401 - Redirect to login if implemented
    if (errorObj?.status === 401) {
      // this.router.navigate(['/login'])
    }

    // Handle 404 - Could redirect to not found page
    if (errorObj?.status === 404) {
      // this.router.navigate(['/not-found'])
    }
  }
}
