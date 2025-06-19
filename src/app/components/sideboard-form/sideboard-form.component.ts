import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'

import { ScryfallCard } from '../../models/scryfall.model'
import { DeckLimitsService } from '../../services/deck-limits.service'
import { CardSearchComponent } from '../card-search/card-search.component'

interface SideboardEntryForm {
  scryfallCard: ScryfallCard
  action: 'IN' | 'OUT'
  quantity: number
  configuration: 'play' | 'draw'
}

interface SideboardFormData {
  matchup: string
  description: string
  entries: SideboardEntryForm[]
}

@Component({
  selector: 'app-sideboard-form',
  imports: [FormsModule, CardSearchComponent],
  templateUrl: './sideboard-form.component.html',
  styleUrl: './sideboard-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideboardFormComponent {
  private deckLimits = inject(DeckLimitsService)

  deckId = input.required<string>()
  deckFormat = input<string>('standard')

  createSideboard = output<SideboardFormData>()
  cancelForm = output<void>()

  matchup = signal('')
  description = signal('')
  entries = signal<SideboardEntryForm[]>([])

  totalIn = computed(() => {
    return this.entries()
      .filter((e) => e.action === 'IN')
      .reduce((sum, e) => sum + e.quantity, 0)
  })

  totalOut = computed(() => {
    return this.entries()
      .filter((e) => e.action === 'OUT')
      .reduce((sum, e) => sum + e.quantity, 0)
  })

  isValid = computed(() => {
    if (this.matchup().trim().length === 0 || this.entries().length === 0) {
      return false
    }
    // Check if we're within the 15 card sideboard limit
    const totalCards = this.totalIn() + this.totalOut()
    return totalCards <= 15
  })

  canAddMoreCards = computed(() => {
    const totalCards = this.totalIn() + this.totalOut()
    const limits = this.deckLimits.getLimits(this.deckFormat())
    return totalCards < limits.sideboard.max
  })

  remainingSlots = computed(() => {
    const totalCards = this.totalIn() + this.totalOut()
    const limits = this.deckLimits.getLimits(this.deckFormat())
    return limits.sideboard.max - totalCards
  })

  onCardSelected(event: { card: ScryfallCard; action: 'IN' | 'OUT' }) {
    // Check if we can add more cards
    if (!this.canAddMoreCards()) {
      alert(`Cannot add more cards. Sideboard limit is 15 cards.`)
      return
    }

    this.entries.update((current) => {
      const existingEntry = current.find(
        (e) => e.scryfallCard.id === event.card.id && e.action === event.action
      )

      if (existingEntry) {
        // Check if incrementing would exceed limit
        const newTotal = this.totalIn() + this.totalOut() + 1
        if (newTotal > 15) {
          alert(`Cannot add more cards. Sideboard limit is 15 cards.`)
          return current
        }
        existingEntry.quantity++
        return [...current]
      } else {
        return [
          ...current,
          {
            scryfallCard: event.card,
            action: event.action,
            quantity: 1,
            configuration: 'play' as const, // Default configuration, will be duplicated for both
          },
        ]
      }
    })
  }

  removeEntry(index: number) {
    this.entries.update((current) => current.filter((_, i) => i !== index))
  }

  updateQuantity(index: number, quantity: number) {
    if (quantity < 1) return

    // Calculate what the new total would be
    const currentTotal = this.totalIn() + this.totalOut()
    const currentQuantity = this.entries()[index].quantity
    const difference = quantity - currentQuantity
    const newTotal = currentTotal + difference

    // Check if new total exceeds limit
    if (newTotal > 15) {
      alert(`Cannot set quantity to ${quantity}. Sideboard limit is 15 cards.`)
      return
    }

    this.entries.update((current) => {
      const updated = [...current]
      updated[index].quantity = quantity
      return updated
    })
  }

  onSubmit() {
    if (!this.isValid()) return

    // Duplicate entries for both play and draw configurations
    const allEntries: SideboardEntryForm[] = []
    this.entries().forEach((entry) => {
      // Add entry for "on the play"
      allEntries.push({ ...entry, configuration: 'play' })
      // Add entry for "on the draw"
      allEntries.push({ ...entry, configuration: 'draw' })
    })

    this.createSideboard.emit({
      matchup: this.matchup(),
      description: this.description(),
      entries: allEntries,
    })
  }

  onCancel() {
    this.resetForm()
    this.cancelForm.emit()
  }

  private resetForm() {
    this.matchup.set('')
    this.description.set('')
    this.entries.set([])
  }
}
