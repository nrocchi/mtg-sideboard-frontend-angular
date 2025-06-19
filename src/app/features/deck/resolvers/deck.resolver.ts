import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router'

import { catchError, of } from 'rxjs'

import { ApiService } from '../../../services/api.service'
import { Deck } from '../models/deck.model'

/**
 * Preloads deck data before displaying the page
 * Avoids loading state in the component
 */
export const deckResolver: ResolveFn<Deck | null> = (route: ActivatedRouteSnapshot) => {
  const api = inject(ApiService)
  const router = inject(Router)
  const deckId = route.paramMap.get('id')

  // No ID provided, redirect and return null
  if (!deckId) {
    router.navigate(['/'])
    return of(null)
  }

  // Load deck data
  return api.getDeck(deckId).pipe(
    catchError((error) => {
      console.error('Error loading deck:', error)
      router.navigate(['/']) // Redirect on error
      return of(null)
    })
  )
}
