import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router'

import { catchError, map, of } from 'rxjs'

import { ApiService } from '../../../services/api.service'

/**
 * Verifies that a deck exists before accessing the route
 * Redirects to deck list if deck not found
 */
export const deckExistsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const api = inject(ApiService)
  const router = inject(Router)
  const deckId = route.paramMap.get('id')

  // No ID provided, redirect to home
  if (!deckId) {
    return router.createUrlTree(['/'])
  }

  // Check if deck exists
  return api.getDeck(deckId).pipe(
    map(() => true), // Deck exists, allow access
    catchError(() => {
      // Deck not found, redirect to list
      return of(router.createUrlTree(['/']))
    })
  )
}
