import { computed, inject, Injectable, signal } from '@angular/core'

import { firstValueFrom } from 'rxjs'

import { ApiError, LoadingState } from '../../../models/types'
import { ApiService } from '../../../services/api.service'
import { CreateDeckDto, Deck } from '../models/deck.model'

/**
 * Alternative version of DeckStateService without RxJS streams
 * Uses only Signals and Promises for state management
 */
@Injectable({
  providedIn: 'root',
})
export class DeckStateNoObservableService {
  private api = inject(ApiService)

  // Application state with signals
  private _decks = signal<Deck[]>([])
  private _loadingState = signal<LoadingState>(LoadingState.IDLE)
  private _error = signal<ApiError | null>(null)

  // Public readonly signals
  readonly decks = this._decks.asReadonly()
  readonly loadingState = this._loadingState.asReadonly()
  readonly error = this._error.asReadonly()

  // Computed signals
  readonly loading = computed(() => this._loadingState() === LoadingState.LOADING)
  readonly deckCount = computed(() => this._decks().length)
  readonly hasDecks = computed(() => this._decks().length > 0)

  constructor() {
    // Initial load
    this.loadDecks()
  }

  /**
   * Loads all decks from the API
   */
  async loadDecks(): Promise<void> {
    this._loadingState.set(LoadingState.LOADING)
    this._error.set(null)

    try {
      // Convert Observable to Promise
      const decks = await firstValueFrom(this.api.getDecks())
      this._decks.set(decks)
      this._loadingState.set(LoadingState.SUCCESS)
    } catch (err) {
      console.error('Error loading decks:', err)
      this._error.set({
        message: 'Failed to load decks',
        details: err,
      })
      this._loadingState.set(LoadingState.ERROR)
    }
  }

  /**
   * Creates a new deck
   */
  async createDeck(deck: CreateDeckDto): Promise<Deck | null> {
    this._loadingState.set(LoadingState.LOADING)
    this._error.set(null)

    try {
      const newDeck = await firstValueFrom(this.api.createDeck(deck))

      // Update the decks list optimistically
      this._decks.update((current) => [...current, newDeck])

      this._loadingState.set(LoadingState.SUCCESS)
      return newDeck
    } catch (err) {
      console.error('Error creating deck:', err)
      this._error.set({
        message: 'Failed to create deck',
        details: err,
      })
      this._loadingState.set(LoadingState.ERROR)
      return null
    }
  }

  /**
   * Creates a deck and refreshes the list
   * Alternative implementation without RxJS pipe
   */
  async createDeckAndRefresh(deckData: CreateDeckDto): Promise<Deck | null> {
    const newDeck = await this.createDeck(deckData)

    if (newDeck) {
      // Refresh to ensure consistency with server
      await this.loadDecks()
    }

    return newDeck
  }

  /**
   * Deletes a deck
   */
  async deleteDeck(id: string): Promise<boolean> {
    this._loadingState.set(LoadingState.LOADING)
    this._error.set(null)

    try {
      await firstValueFrom(this.api.deleteDeck(id))

      // Optimistically remove from local state
      this._decks.update((current) => current.filter((deck) => deck.id !== id))

      this._loadingState.set(LoadingState.SUCCESS)
      return true
    } catch (err) {
      console.error('Error deleting deck:', err)
      this._error.set({
        message: 'Failed to delete deck',
        details: err,
      })
      this._loadingState.set(LoadingState.ERROR)
      return false
    }
  }

  /**
   * Deletes a deck and refreshes the list
   */
  async deleteDeckAndRefresh(id: string): Promise<boolean> {
    const success = await this.deleteDeck(id)

    if (success) {
      // Refresh to ensure consistency
      await this.loadDecks()
    }

    return success
  }

  /**
   * Refreshes the deck list
   */
  private async refreshDecks(): Promise<void> {
    await this.loadDecks()
  }
}
