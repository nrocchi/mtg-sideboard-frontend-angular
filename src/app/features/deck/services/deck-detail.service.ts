import { DestroyRef, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { Card } from '../../../models/card.model'
import { ApiService } from '../../../services/api.service'
import { ErrorService } from '../../../services/error.service'
import { Deck, UpdateDeckDto } from '../models/deck.model'

/**
 * Service to manage an individual deck
 */
@Injectable()
export class DeckDetailService {
  private api = inject(ApiService)
  private errorService = inject(ErrorService)
  private destroyRef = inject(DestroyRef)

  // Current deck state
  deck = signal<Deck | null>(null)
  loading = signal(false)

  /**
   * Loads a deck by ID
   */
  loadDeck(id: string): void {
    this.loading.set(true)

    this.api
      .getDeck(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (deck) => {
          this.deck.set(deck)
          this.loading.set(false)
        },
        error: (err) => {
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to load deck details')
        },
      })
  }

  /**
   * Adds a card to the deck
   */
  addCardToDeck(card: Card, quantity: number): void {
    const deck = this.deck()
    if (!deck) return

    this.loading.set(true)

    // Build the updated mainboard array with the new card
    const currentCardIds = deck.mainboard.map((c) => c.id)
    const updatedCardIds = [...currentCardIds]

    // Add the card multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      updatedCardIds.push(card.id)
    }

    this.updateDeck(deck.id, { mainboardCards: updatedCardIds })
  }

  /**
   * Removes a card from the deck
   */
  removeCardFromDeck(cardId: string): void {
    const deck = this.deck()
    if (!deck) return

    this.loading.set(true)

    // Remove one instance of the card
    const currentCardIds = deck.mainboard.map((c) => c.id)
    const cardIndex = currentCardIds.findIndex((id) => id === cardId)

    if (cardIndex !== -1) {
      const updatedCardIds = [...currentCardIds]
      updatedCardIds.splice(cardIndex, 1)
      this.updateDeck(deck.id, { mainboardCards: updatedCardIds })
    }
  }

  /**
   * Updates the deck via API
   */
  private updateDeck(deckId: string, updateDto: UpdateDeckDto): void {
    this.api
      .updateDeck(deckId, updateDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedDeck) => {
          this.deck.set(updatedDeck)
          this.loading.set(false)
        },
        error: (err) => {
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to update deck')
        },
      })
  }

  /**
   * Refreshes the current deck
   */
  refreshCurrentDeck(): void {
    const deckId = this.deck()?.id
    if (!deckId) {
      console.warn('No deck to refresh')
      return
    }

    this.loadDeck(deckId)
  }
}
