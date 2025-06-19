import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'

import { CardAddComponent } from '../../../../components/card-add/card-add.component'
import { CardModalComponent } from '../../../../components/card-modal/card-modal.component'
import { Card } from '../../../../models/card.model'
import { ManaSymbolPipe } from '../../../../pipes/mana-symbol.pipe'
import { DeckLimitsService } from '../../../../services/deck-limits.service'
import { Deck } from '../../models/deck.model'
import { DeckDetailService } from '../../services/deck-detail.service'
import { DECK_FORMATS } from '../../types/deck.types'

/**
 * Displays detailed view of a single deck
 */
@Component({
  selector: 'app-deck-detail',
  imports: [CommonModule, RouterModule, CardAddComponent, ManaSymbolPipe, CardModalComponent],
  templateUrl: './deck-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DeckDetailService], // Service scoped to this component
})
export class DeckDetailComponent {
  private route = inject(ActivatedRoute)
  private deckLimits = inject(DeckLimitsService)
  private deckDetailService = inject(DeckDetailService)

  // State from service
  deck = this.deckDetailService.deck
  loading = this.deckDetailService.loading

  // Local state
  showAddCard = signal(false)
  selectedCard = signal<Card | null>(null)
  showCardModal = signal(false)

  // Computed values for display

  /**
   * Mainboard cards sorted by mana cost
   */
  sortedMainboard = computed(() => {
    const deck = this.deck()
    if (!deck?.mainboard) return []
    return [...deck.mainboard].sort((a, b) => (a.cmc || 0) - (b.cmc || 0))
  })

  /**
   * Total number of cards in mainboard
   */
  cardCount = computed(() => {
    const deck = this.deck()
    if (!deck?.mainboard) return 0
    return deck.mainboard.length
  })

  /**
   * Maximum cards allowed based on format
   */
  mainboardLimit = computed(() => {
    const deck = this.deck()
    if (!deck) return 60
    return this.deckLimits.getLimits(deck.format).mainboard.max
  })

  /**
   * Whether more cards can be added
   */
  canAddCards = computed(() => {
    const deck = this.deck()
    if (!deck) return false
    return this.deckLimits.canAddToMainboard(deck.format, this.cardCount())
  })

  /**
   * Human-readable format name
   */
  formatLabel = computed(() => {
    const format = this.deck()?.format
    return format ? DECK_FORMATS[format as keyof typeof DECK_FORMATS] || format : ''
  })

  constructor() {
    // Option 1: Use the resolver
    const resolvedDeck = this.route.snapshot.data['deck'] as Deck | null
    if (resolvedDeck) {
      this.deckDetailService.deck.set(resolvedDeck)
    } else {
      // Option 2: Load manually if no resolver
      const deckId = this.route.snapshot.paramMap.get('id')
      if (deckId) {
        this.deckDetailService.loadDeck(deckId)
      }
    }
  }

  /**
   * Toggles the add card form
   */
  toggleAddCard() {
    this.showAddCard.update((show) => !show)
  }

  /**
   * Handles card addition from form
   */
  onAddCard({ card, quantity }: { card: Card; quantity: number }) {
    this.deckDetailService.addCardToDeck(card, quantity)
    // Close form after adding
    this.showAddCard.set(false)
  }

  /**
   * Shows card details in modal
   */
  showCard(card: Card) {
    this.selectedCard.set(card)
    this.showCardModal.set(true)
  }

  /**
   * Closes the card modal
   */
  closeCardModal() {
    this.showCardModal.set(false)
    this.selectedCard.set(null)
  }
}
