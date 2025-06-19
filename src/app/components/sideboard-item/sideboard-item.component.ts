import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { Router } from '@angular/router'

import { Card } from '../../models/card.model'
import { Sideboard } from '../../models/sideboard.model'
import { ManaSymbolPipe } from '../../pipes/mana-symbol.pipe'
import { CardModalComponent } from '../card-modal/card-modal.component'

@Component({
  selector: 'app-sideboard-item',
  imports: [ManaSymbolPipe, CardModalComponent],
  templateUrl: './sideboard-item.component.html',
  styleUrl: './sideboard-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideboardItemComponent {
  private router = inject(Router)

  sideboard = input.required<Sideboard>()
  delete = output<string>()
  selectedCard = signal<Card | null>(null)
  showDeleteModal = signal(false)

  playEntriesIn = computed(() => {
    return this.sideboard()
      .entries.filter((e) => e.configuration === 'play' && e.action === 'IN')
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  playEntriesOut = computed(() => {
    return this.sideboard()
      .entries.filter((e) => e.configuration === 'play' && e.action === 'OUT')
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  drawEntriesIn = computed(() => {
    return this.sideboard()
      .entries.filter((e) => e.configuration === 'draw' && e.action === 'IN')
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  drawEntriesOut = computed(() => {
    return this.sideboard()
      .entries.filter((e) => e.configuration === 'draw' && e.action === 'OUT')
      .sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0))
  })

  totalPlayIn = computed(() => {
    return this.playEntriesIn().reduce((sum, e) => sum + e.quantity, 0)
  })

  totalPlayOut = computed(() => {
    return this.playEntriesOut().reduce((sum, e) => sum + e.quantity, 0)
  })

  totalDrawIn = computed(() => {
    return this.drawEntriesIn().reduce((sum, e) => sum + e.quantity, 0)
  })

  totalDrawOut = computed(() => {
    return this.drawEntriesOut().reduce((sum, e) => sum + e.quantity, 0)
  })

  navigateToDetail() {
    this.router.navigate(['/sideboard-detail', this.sideboard().id])
  }

  onDelete(event: Event) {
    event.stopPropagation()
    this.showDeleteModal.set(true)
  }

  confirmDelete() {
    this.delete.emit(this.sideboard().id)
    this.showDeleteModal.set(false)
  }

  cancelDelete() {
    this.showDeleteModal.set(false)
  }

  showCard(card: Card) {
    this.selectedCard.set(card)
  }

  closeModal() {
    this.selectedCard.set(null)
  }
}
