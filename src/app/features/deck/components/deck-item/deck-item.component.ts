import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core'
import { RouterModule } from '@angular/router'

import { Deck } from '../../models/deck.model'

/**
 * Individual deck card display
 */
@Component({
  selector: 'app-deck-item',
  imports: [RouterModule],
  templateUrl: './deck-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckItemComponent {
  deck = input.required<Deck>()
  delete = output<string>()

  // Local state
  showDeleteModal = signal(false)

  /**
   * Shows delete confirmation modal
   */
  onDelete() {
    this.showDeleteModal.set(true)
  }

  /**
   * Confirms deletion and emits event
   */
  confirmDelete() {
    this.delete.emit(this.deck().id)
    this.showDeleteModal.set(false)
  }

  /**
   * Cancels deletion
   */
  cancelDelete() {
    this.showDeleteModal.set(false)
  }
}
