import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs'

import { ScryfallCard } from '../../models/scryfall.model'
import { ManaSymbolPipe } from '../../pipes/mana-symbol.pipe'
import { ApiService } from '../../services/api.service'

@Component({
  selector: 'app-card-search',
  imports: [FormsModule, ManaSymbolPipe],
  templateUrl: './card-search.component.html',
  styleUrl: './card-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSearchComponent {
  private api = inject(ApiService)

  searchQuery = signal('')
  searchResults = signal<ScryfallCard[]>([])
  loading = signal(false)

  cardSelected = output<{ card: ScryfallCard; action: 'IN' | 'OUT' }>()

  private searchSubject = new Subject<string>()

  constructor() {
    // Debounce search input
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 3) {
            this.searchResults.set([])
            return []
          }
          this.loading.set(true)
          return this.api.searchCards(query)
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results.slice(0, 10))
          this.loading.set(false)
        },
        error: (err) => {
          console.error('Error searching cards:', err)
          this.searchResults.set([])
          this.loading.set(false)
        },
      })
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value)
    this.searchSubject.next(value)
  }

  selectCard(card: ScryfallCard, action: 'IN' | 'OUT') {
    this.cardSelected.emit({ card, action })
  }

  clearSearch() {
    this.searchQuery.set('')
    this.searchResults.set([])
    this.searchSubject.next('')
  }
}
