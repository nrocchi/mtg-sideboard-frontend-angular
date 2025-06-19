import { computed, inject, Injectable, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'

import { catchError, Observable, of, startWith, Subject, switchMap, tap } from 'rxjs'

import { ApiError, LoadingState } from '../../../models/types'
import { ApiService } from '../../../services/api.service'
import { CreateDeckDto, Deck } from '../models/deck.model'

/**
 * Global service to manage the deck collection
 */
@Injectable({
  providedIn: 'root',
})
export class DeckStateService {
  private api = inject(ApiService)
  private refreshDecks$ = new Subject<void>()

  // Application state
  loadingState = signal<LoadingState>(LoadingState.IDLE)
  error = signal<ApiError | null>(null)
  loading = computed(() => this.loadingState() === LoadingState.LOADING)

  // Stream that loads decks on each refresh
  private decksObservable$ = this.refreshDecks$.pipe(
    startWith(undefined),
    switchMap(() => {
      this.loadingState.set(LoadingState.LOADING)
      this.error.set(null)
      return this.api.getDecks().pipe(
        tap(() => {
          this.loadingState.set(LoadingState.SUCCESS)
        }),
        catchError((err) => {
          console.error('Error loading decks:', err)
          this.error.set({
            message: 'Failed to load decks',
            details: err,
          })
          this.loadingState.set(LoadingState.ERROR)
          return of([])
        })
      )
    })
  )

  // Exposed data
  decks = toSignal(this.decksObservable$, { initialValue: [] })
  deckCount = computed(() => this.decks().length)
  hasDecks = computed(() => this.decks().length > 0)

  constructor() {
    this.decksObservable$.subscribe()
  }

  /**
   * Refreshes the deck list
   */
  refreshDecks() {
    this.refreshDecks$.next()
  }

  /**
   * Creates a new deck
   */
  createDeck(deck: CreateDeckDto): Observable<Deck> {
    this.loadingState.set(LoadingState.LOADING)
    return this.api.createDeck(deck).pipe(
      tap(() => {
        this.loadingState.set(LoadingState.SUCCESS)
      }),
      catchError((err) => {
        console.error('Error creating deck:', err)
        this.error.set({
          message: 'Failed to create deck',
          details: err,
        })
        this.loadingState.set(LoadingState.ERROR)
        throw err
      })
    )
  }

  /**
   * Creates a deck and refreshes the list
   */
  createDeckAndRefresh(deckData: CreateDeckDto): Observable<Deck> {
    return this.createDeck(deckData).pipe(tap(() => this.refreshDecks()))
  }

  /**
   * Deletes a deck
   */
  deleteDeck(id: string): Observable<void> {
    this.loadingState.set(LoadingState.LOADING)
    return this.api.deleteDeck(id).pipe(
      tap(() => {
        this.loadingState.set(LoadingState.SUCCESS)
      }),
      catchError((err) => {
        console.error('Error deleting deck:', err)
        this.error.set({
          message: 'Failed to delete deck',
          details: err,
        })
        this.loadingState.set(LoadingState.ERROR)
        throw err
      })
    )
  }

  /**
   * Deletes a deck and refreshes the list
   */
  deleteDeckAndRefresh(id: string): Observable<void> {
    return this.deleteDeck(id).pipe(tap(() => this.refreshDecks()))
  }
}
