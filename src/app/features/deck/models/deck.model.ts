import { Card } from '../../../models/card.model'
import { Sideboard } from '../../../models/sideboard.model'

export interface Deck {
  id: string
  name: string
  format: string
  description?: string
  mainboard: Card[]
  sideboards: Sideboard[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateDeckDto {
  name: string
  format: string
  description?: string
  mainboardCards?: string[]
}

export interface UpdateDeckDto {
  name?: string
  format?: string
  description?: string
  mainboardCards?: string[]
}
