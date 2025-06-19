import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { Deck } from '../../models/deck.model'
import { DeckItemComponent } from '../deck-item/deck-item.component'

/**
 * Displays a list of deck items
 */
@Component({
  selector: 'app-deck-list',
  imports: [DeckItemComponent],
  templateUrl: './deck-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckListComponent {
  decks = input.required<Deck[]>()
  deleteDeck = output<string>()

  /**
   * Emits delete event to parent
   */
  onDeleteDeck(id: string) {
    this.deleteDeck.emit(id)
  }
}
