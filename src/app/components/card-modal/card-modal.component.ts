import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { Card } from '../../models/card.model'
import { ManaSymbolPipe } from '../../pipes/mana-symbol.pipe'

@Component({
  selector: 'app-card-modal',
  imports: [CommonModule, ManaSymbolPipe],
  templateUrl: './card-modal.component.html',
  styleUrl: './card-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardModalComponent {
  card = input.required<Card>()
  closeModal = output<void>()

  onClose() {
    this.closeModal.emit()
  }
}
