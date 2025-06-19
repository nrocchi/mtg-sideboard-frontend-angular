import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

import { Observable } from 'rxjs'

import { environment } from '../../environments/environment'
import { CreateDeckDto, Deck, UpdateDeckDto } from '../features/deck/models/deck.model'
import { Card } from '../models/card.model'
import { ScryfallCard } from '../models/scryfall.model'
import { CreateSideboardDto, Sideboard, UpdateSideboardDto } from '../models/sideboard.model'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient)

  private apiUrl = environment.apiUrl

  searchCards(query: string): Observable<ScryfallCard[]> {
    return this.http.get<ScryfallCard[]>(`${this.apiUrl}/cards/search?q=${query}`)
  }

  getCardAutocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/cards/autocomplete?q=${query}`)
  }

  importCard(scryfallCard: ScryfallCard): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards/import`, scryfallCard)
  }

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(`${this.apiUrl}/decks`)
  }

  getDeck(id: string): Observable<Deck> {
    return this.http.get<Deck>(`${this.apiUrl}/decks/${id}`)
  }

  createDeck(deck: CreateDeckDto): Observable<Deck> {
    return this.http.post<Deck>(`${this.apiUrl}/decks`, deck)
  }

  updateDeck(id: string, deck: UpdateDeckDto): Observable<Deck> {
    return this.http.patch<Deck>(`${this.apiUrl}/decks/${id}`, deck)
  }

  deleteDeck(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/decks/${id}`)
  }

  getSideboards(deckId?: string): Observable<Sideboard[]> {
    const url = deckId ? `${this.apiUrl}/sideboards?deckId=${deckId}` : `${this.apiUrl}/sideboards`
    return this.http.get<Sideboard[]>(url)
  }

  getSideboard(id: string): Observable<Sideboard> {
    return this.http.get<Sideboard>(`${this.apiUrl}/sideboards/${id}`)
  }

  createSideboard(sideboard: CreateSideboardDto): Observable<Sideboard> {
    return this.http.post<Sideboard>(`${this.apiUrl}/sideboards`, sideboard)
  }

  updateSideboard(id: string, sideboard: UpdateSideboardDto): Observable<Sideboard> {
    return this.http.patch<Sideboard>(`${this.apiUrl}/sideboards/${id}`, sideboard)
  }

  deleteSideboard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sideboards/${id}`)
  }
}
