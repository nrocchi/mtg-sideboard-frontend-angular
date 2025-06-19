import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'

import { switchMap } from 'rxjs'

import { Card } from '../../models/card.model'
import { Sideboard, SideboardEntry } from '../../models/sideboard.model'
import { ManaSymbolPipe } from '../../pipes/mana-symbol.pipe'
import { ApiService } from '../../services/api.service'
import { DeckLimitsService } from '../../services/deck-limits.service'
import { ErrorService } from '../../services/error.service'
import { CardModalComponent } from '../card-modal/card-modal.component'
import { SideboardCardAddComponent } from '../sideboard-card-add/sideboard-card-add.component'

@Component({
  selector: 'app-sideboard-detail',
  imports: [
    CommonModule,
    RouterModule,
    SideboardCardAddComponent,
    CardModalComponent,
    ManaSymbolPipe,
  ],
  templateUrl: './sideboard-detail.component.html',
  styleUrl: './sideboard-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideboardDetailComponent {
  private api = inject(ApiService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private errorService = inject(ErrorService)
  private deckLimits = inject(DeckLimitsService)
  private destroyRef = inject(DestroyRef)

  sideboard = signal<Sideboard | null>(null)
  loading = signal(false)
  showAddCard = signal(false)
  addCardMode = signal<'IN' | 'OUT' | null>(null)
  selectedCard = signal<Card | null>(null)
  showCardModal = signal(false)
  currentConfiguration = signal<'play' | 'draw'>('play')
  showDeleteModal = signal(false)
  showRemoveEntryModal = signal(false)
  entryToRemove = signal<SideboardEntry | null>(null)

  // Computed values
  totalIn = computed(() => {
    const sb = this.sideboard()
    const config = this.currentConfiguration()
    if (!sb) return 0
    return sb.entries
      .filter((e) => e.action === 'IN' && e.configuration === config)
      .reduce((sum, e) => sum + e.quantity, 0)
  })

  totalOut = computed(() => {
    const sb = this.sideboard()
    const config = this.currentConfiguration()
    if (!sb) return 0
    return sb.entries
      .filter((e) => e.action === 'OUT' && e.configuration === config)
      .reduce((sum, e) => sum + e.quantity, 0)
  })

  cardsIn = computed(() => {
    const sb = this.sideboard()
    const config = this.currentConfiguration()
    if (!sb) return []
    return sb.entries
      .filter((e) => e.action === 'IN' && e.configuration === config)
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  cardsOut = computed(() => {
    const sb = this.sideboard()
    const config = this.currentConfiguration()
    if (!sb) return []
    return sb.entries
      .filter((e) => e.action === 'OUT' && e.configuration === config)
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  sideboardLimit = computed(() => {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return 15
    return this.deckLimits.getLimits(sb.deck.format).sideboard.max
  })

  sideboardLimitIn = computed(() => {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return 15
    const limits = this.deckLimits.getLimits(sb.deck.format).sideboard
    return limits.maxIn || limits.max
  })

  sideboardLimitOut = computed(() => {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return 15
    const limits = this.deckLimits.getLimits(sb.deck.format).sideboard
    return limits.maxOut || limits.max
  })

  currentSideboardCount = computed(() => {
    return this.totalIn() + this.totalOut()
  })

  canAddCardsIn = computed(() => {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return false
    return this.deckLimits.canAddToSideboardIn(sb.deck.format, this.totalIn())
  })

  canAddCardsOut = computed(() => {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return false
    return this.deckLimits.canAddToSideboardOut(sb.deck.format, this.totalOut())
  })

  constructor() {
    // Use takeUntilDestroyed to auto-unsubscribe
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id')
          if (!id) {
            throw new Error('No sideboard ID provided')
          }
          this.loading.set(true)
          return this.api.getSideboard(id)
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (sideboard) => {
          this.sideboard.set(sideboard)
          this.loading.set(false)
        },
        error: (err) => {
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to load sideboard details')
        },
      })
  }

  deleteSideboard() {
    this.showDeleteModal.set(true)
  }

  confirmDelete() {
    const sb = this.sideboard()
    if (!sb) return

    console.log('Deleting sideboard:', sb.id)
    this.loading.set(true)
    this.showDeleteModal.set(false)

    this.api
      .deleteSideboard(sb.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Sideboard deleted successfully')
          // Navigate back to sideboards list
          const sb = this.sideboard()
          if (sb?.deck?.id) {
            this.router.navigate(['/sideboard', sb.deck.id])
          } else {
            this.router.navigate(['/'])
          }
        },
        error: (err) => {
          console.error('Delete error:', err)
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to delete sideboard')
        },
      })
  }

  cancelDelete() {
    this.showDeleteModal.set(false)
  }

  toggleAddCard() {
    this.showAddCard.update((show) => !show)
  }

  showAddCardIn() {
    this.addCardMode.set('IN')
    this.showAddCard.set(true)
  }

  showAddCardOut() {
    this.addCardMode.set('OUT')
    this.showAddCard.set(true)
  }

  cancelAddCard() {
    this.showAddCard.set(false)
    this.addCardMode.set(null)
  }

  setConfiguration(config: 'play' | 'draw') {
    this.currentConfiguration.set(config)
  }

  showCard(card: Card) {
    this.selectedCard.set(card)
    this.showCardModal.set(true)
  }

  closeCardModal() {
    this.showCardModal.set(false)
    this.selectedCard.set(null)
  }

  updateEntryQuantity(entry: SideboardEntry, change: number) {
    console.log('updateEntryQuantity called', {
      loading: this.loading(),
      entry: entry.card.name,
      currentQuantity: entry.quantity,
      change,
      hasSideboard: !!this.sideboard(),
      hasDeck: !!this.sideboard()?.deck,
    })

    const sb = this.sideboard()
    if (!sb || !sb.deck) {
      console.log('No sideboard or deck, returning')
      return
    }

    const newQuantity = entry.quantity + change
    console.log('Calculating new quantity:', { current: entry.quantity, change, newQuantity })

    if (newQuantity < 1) {
      console.log('Quantity would be < 1, removing entry')
      this.removeEntry(entry)
      return
    }

    if (newQuantity > 4) {
      console.log('Quantity would be > 4, showing error')
      this.errorService.handleError(null, `Cannot have more than 4 copies of ${entry.card.name}`)
      return
    }

    // Check limits before updating
    if (change > 0) {
      if (
        entry.action === 'IN' &&
        !this.deckLimits.canAddToSideboardIn(sb.deck.format, this.totalIn(), change)
      ) {
        this.errorService.handleError(
          null,
          `Cannot add more cards IN. Limit is ${this.sideboardLimitIn()}`
        )
        return
      }
      if (
        entry.action === 'OUT' &&
        !this.deckLimits.canAddToSideboardOut(sb.deck.format, this.totalOut(), change)
      ) {
        this.errorService.handleError(
          null,
          `Cannot add more cards OUT. Limit is ${this.sideboardLimitOut()}`
        )
        return
      }
    }

    this.loading.set(true)
    console.log('Current entries:', sb.entries)
    console.log('Looking for entry:', { cardId: entry.card.id, action: entry.action })

    const updatedEntries = sb.entries.map((e) => ({
      cardId: e.card.id,
      action: e.action as 'IN' | 'OUT',
      quantity:
        e.card.id === entry.card.id &&
        e.action === entry.action &&
        e.configuration === entry.configuration
          ? newQuantity
          : e.quantity,
      configuration: e.configuration as 'play' | 'draw',
    }))

    console.log('Updated entries:', updatedEntries)

    this.api
      .updateSideboard(sb.id, { entries: updatedEntries })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Reload the sideboard to get populated entries
          this.api
            .getSideboard(sb.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (reloadedSideboard) => {
                this.sideboard.set(reloadedSideboard)
                this.loading.set(false)
              },
              error: (err) => {
                console.error('Failed to reload sideboard:', err)
                this.loading.set(false)
                this.errorService.handleError(err, 'Failed to reload sideboard')
              },
            })
        },
        error: (err) => {
          console.error('Update failed, setting loading to false', err)
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to update card quantity')
        },
      })
  }

  removeEntry(entry: SideboardEntry) {
    this.entryToRemove.set(entry)
    this.showRemoveEntryModal.set(true)
  }

  confirmRemoveEntry() {
    const sb = this.sideboard()
    const entry = this.entryToRemove()
    if (!sb || !entry) return

    this.showRemoveEntryModal.set(false)
    this.loading.set(true)
    const updatedEntries = sb.entries
      .filter(
        (e) =>
          !(
            e.card.id === entry.card.id &&
            e.action === entry.action &&
            e.configuration === entry.configuration
          )
      )
      .map((e) => ({
        cardId: e.card.id,
        action: e.action as 'IN' | 'OUT',
        quantity: e.quantity,
        configuration: e.configuration as 'play' | 'draw',
      }))

    this.api
      .updateSideboard(sb.id, { entries: updatedEntries })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Reload the sideboard to get populated entries
          this.api
            .getSideboard(sb.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (reloadedSideboard) => {
                this.sideboard.set(reloadedSideboard)
                this.loading.set(false)
              },
              error: (err) => {
                console.error('Failed to reload sideboard:', err)
                this.loading.set(false)
                this.errorService.handleError(err, 'Failed to reload sideboard')
              },
            })
        },
        error: (err) => {
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to remove card')
        },
      })
  }

  cancelRemoveEntry() {
    this.showRemoveEntryModal.set(false)
    this.entryToRemove.set(null)
  }

  onAddCard({ card, quantity, action }: { card: Card; quantity: number; action: 'IN' | 'OUT' }) {
    const sb = this.sideboard()
    if (!sb || !sb.deck) return

    // Check limits
    if (
      action === 'IN' &&
      !this.deckLimits.canAddToSideboardIn(sb.deck.format, this.totalIn(), quantity)
    ) {
      this.errorService.handleError(
        null,
        `Cannot add ${quantity} cards IN. Limit is ${this.sideboardLimitIn()}`
      )
      return
    }
    if (
      action === 'OUT' &&
      !this.deckLimits.canAddToSideboardOut(sb.deck.format, this.totalOut(), quantity)
    ) {
      this.errorService.handleError(
        null,
        `Cannot add ${quantity} cards OUT. Limit is ${this.sideboardLimitOut()}`
      )
      return
    }

    this.loading.set(true)

    // Build the updated entries array
    const currentEntries = sb.entries.map((entry) => ({
      cardId: entry.card.id,
      action: entry.action as 'IN' | 'OUT',
      quantity: entry.quantity,
      configuration: entry.configuration as 'play' | 'draw',
    }))

    // Add the new card with the specified action and current configuration
    currentEntries.push({
      cardId: card.id,
      action: action,
      quantity: quantity,
      configuration: this.currentConfiguration(),
    })

    // Update the sideboard with the new entries
    this.api
      .updateSideboard(sb.id, { entries: currentEntries })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Reload the sideboard to get populated entries
          this.api
            .getSideboard(sb.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (reloadedSideboard) => {
                this.sideboard.set(reloadedSideboard)
                this.loading.set(false)
                this.showAddCard.set(false)
                this.addCardMode.set(null)
              },
              error: (err) => {
                console.error('Failed to reload sideboard:', err)
                this.loading.set(false)
                this.errorService.handleError(err, 'Failed to reload sideboard')
              },
            })
        },
        error: (err) => {
          console.error('Update error:', err)
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to add card to sideboard')
        },
      })
  }
}
