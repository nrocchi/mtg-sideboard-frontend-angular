import { HttpInterceptorFn } from '@angular/common/http'

import { tap } from 'rxjs/operators'

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚀 HTTP Request:', req.method, req.url)
  if (req.body) {
    console.log('📦 Request Body:', req.body)
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) {
          // HttpResponse
          console.log('✅ HTTP Response:', req.method, req.url, event.status)
          console.log('📥 Response Body:', event.body)
        }
      },
      error: (error) => {
        console.error('❌ HTTP Error:', req.method, req.url, error.status)
        console.error('💥 Error Details:', error)
      },
    })
  )
}
