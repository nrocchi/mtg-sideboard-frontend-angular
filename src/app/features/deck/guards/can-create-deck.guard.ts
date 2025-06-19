import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'

import { DeckStateService } from '../services/deck-state.service'

/**
 * Checks if user can create a new deck
 * Limits the number of decks to MAX_DECKS
 */
export const canCreateDeckGuard: CanActivateFn = () => {
  const deckState = inject(DeckStateService)
  const MAX_DECKS = 10

  return deckState.decks().length < MAX_DECKS
    ? true
    : (() => {
        alert(`You have reached the limit of ${MAX_DECKS} decks`)
        return false
      })()
}
