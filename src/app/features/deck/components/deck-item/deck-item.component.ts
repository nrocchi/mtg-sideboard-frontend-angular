import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core'
import { RouterModule } from '@angular/router'

import { Deck } from '../../models/deck.model'
import { DeckStateService } from '../../services/deck-state.service'

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
  private deckState = inject(DeckStateService)

  deck = input.required<Deck>()

  // Local state
  showDeleteModal = signal(false)

  /**
   * Shows delete confirmation modal
   */
  onDelete() {
    this.showDeleteModal.set(true)
  }

  /**
   * Confirms deletion and calls service directly
   */
  confirmDelete() {
    this.deckState.deleteDeckAndRefresh(this.deck().id).subscribe({
      next: () => {
        this.showDeleteModal.set(false)
      },
      error: () => {
        // Error is handled in the service
        this.showDeleteModal.set(false)
      },
    })
  }

  /**
   * Cancels deletion
   */
  cancelDelete() {
    this.showDeleteModal.set(false)
  }
}
