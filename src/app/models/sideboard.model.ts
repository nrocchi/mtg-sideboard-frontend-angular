import { Deck } from '../features/deck/models/deck.model'

import { Card } from './card.model'

export interface SideboardEntry {
  id: string
  sideboardId: string
  cardId: string
  card: Card
  action: 'IN' | 'OUT'
  quantity: number
  configuration: 'play' | 'draw'
}

export interface Sideboard {
  id: string
  deckId: string
  deck?: Deck
  matchup: string
  description?: string
  entries: SideboardEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateSideboardDto {
  deckId: string
  matchup: string
  description?: string
  entries: {
    cardId: string
    action: 'IN' | 'OUT'
    quantity: number
    configuration: 'play' | 'draw'
  }[]
}

export interface UpdateSideboardDto {
  matchup?: string
  description?: string
  entries?: {
    cardId: string
    action: 'IN' | 'OUT'
    quantity: number
    configuration: 'play' | 'draw'
  }[]
}
