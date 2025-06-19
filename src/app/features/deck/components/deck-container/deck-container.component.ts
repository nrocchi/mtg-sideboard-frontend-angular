import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'

import { CreateDeckDto } from '../../models/deck.model'
import { DeckStateService } from '../../services/deck-state.service'
import { DeckFormComponent } from '../deck-form/deck-form.component'
import { DeckListComponent } from '../deck-list/deck-list.component'

/**
 * Container component for deck list and creation
 */
@Component({
  selector: 'app-deck-container',
  imports: [DeckListComponent, DeckFormComponent],
  templateUrl: './deck-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckContainerComponent {
  private deckState = inject(DeckStateService)

  // State from service
  decks = this.deckState.decks
  loading = this.deckState.loading
  error = this.deckState.error

  // Local state
  showCreateForm = signal(false)

  /**
   * Handles deck creation from form
   */
  onCreateDeck(deckData: CreateDeckDto) {
    this.deckState.createDeckAndRefresh(deckData).subscribe({
      next: () => {
        this.showCreateForm.set(false)
      },
      error: () => {
        // Error handled in service
      },
    })
  }

  /**
   * Toggles the create form visibility
   */
  toggleCreateForm() {
    this.showCreateForm.update((show) => !show)
  }

  /**
   * Hides the create form
   */
  onCancelCreate() {
    this.showCreateForm.set(false)
  }
}
