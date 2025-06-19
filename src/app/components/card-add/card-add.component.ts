import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'

import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs'

import { Card } from '../../models/card.model'
import { ScryfallCard } from '../../models/scryfall.model'
import { ManaSymbolPipe } from '../../pipes/mana-symbol.pipe'
import { ApiService } from '../../services/api.service'

@Component({
  selector: 'app-card-add',
  imports: [FormsModule, ManaSymbolPipe],
  templateUrl: './card-add.component.html',
  styleUrl: './card-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAddComponent {
  private api = inject(ApiService)

  maxCards = input<number>()
  currentCount = input<number>(0)
  placeholder = input<string>('Search for cards to add...')

  addCard = output<{ card: Card; quantity: number }>()

  searchTerm = signal('')
  searchResults = signal<ScryfallCard[]>([])
  searching = signal(false)
  selectedCard = signal<ScryfallCard | null>(null)
  quantity = signal(1)
  showDropdown = signal(false)

  private searchSubject = new Subject<string>()

  canAddCards = computed(() => {
    const max = this.maxCards()
    if (!max || max <= 0) return true
    return this.currentCount() + this.quantity() <= max
  })

  remainingSlots = computed(() => {
    const max = this.maxCards()
    if (!max || max <= 0) return -1
    return max - this.currentCount()
  })

  constructor() {
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 2) {
            this.searchResults.set([])
            this.searching.set(false)
            return []
          }
          this.searching.set(true)
          return this.api.searchCards(term)
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results || [])
          this.searching.set(false)
          this.showDropdown.set(true)
        },
        error: () => {
          this.searching.set(false)
          this.searchResults.set([])
        },
      })
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    this.searchTerm.set(value)
    this.searchSubject.next(value)
  }

  selectCard(card: ScryfallCard) {
    this.selectedCard.set(card)
    this.searchTerm.set(card.name)
    this.showDropdown.set(false)
    this.searchResults.set([])
  }

  onQuantityInput(event: Event) {
    const target = event.target as HTMLInputElement
    const value = +target.value
    this.updateQuantity(value)
  }

  updateQuantity(value: number) {
    if (value < 1) return
    const max = this.maxCards()
    if (max && max > 0) {
      const maxQuantity = max - this.currentCount()
      this.quantity.set(Math.min(value, maxQuantity))
    } else {
      this.quantity.set(value)
    }
  }

  onAdd() {
    const card = this.selectedCard()
    if (!card || !this.canAddCards()) return

    // Import the card first
    this.api.importCard(card).subscribe({
      next: (importedCard) => {
        this.addCard.emit({ card: importedCard, quantity: this.quantity() })
        this.resetForm()
      },
      error: (error) => {
        console.error('Failed to import card:', error)
      },
    })
  }

  onCancel() {
    this.resetForm()
  }

  private resetForm() {
    this.searchTerm.set('')
    this.selectedCard.set(null)
    this.quantity.set(1)
    this.searchResults.set([])
    this.showDropdown.set(false)
  }
}
