import { Card } from '../../../models/card.model'
import { CreateDeckDto } from '../models/deck.model'

// Event types for component communication
export interface DeckFormEvents {
  createDeck: CreateDeckDto
  cancelForm: void
}

export interface DeckListEvents {
  deleteDeck: string
}

export interface DeckItemEvents {
  delete: string
}

export interface CardAddEvent {
  card: Card
  quantity: number
}

// Deck formats configuration
export const DECK_FORMATS = {
  standard: 'Standard',
  modern: 'Modern',
  legacy: 'Legacy',
  vintage: 'Vintage',
  pioneer: 'Pioneer',
  commander: 'Commander',
} as const

export type DeckFormat = keyof typeof DECK_FORMATS

// Utility types
export type DeckFormState = {
  name: string
  format: string
  description: string
}

export type DeckViewMode = 'list' | 'grid' | 'table'
export type DeckSortBy = 'name' | 'format' | 'date' | 'cardCount'
