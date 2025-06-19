import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { CreateDeckDto } from '../../models/deck.model'

@Component({
  selector: 'app-deck-form',
  imports: [FormsModule],
  templateUrl: './deck-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckFormComponent {
  createDeck = output<CreateDeckDto>()
  cancelForm = output<void>()

  // Local state
  name = signal('')
  format = signal('')
  description = signal('')

  // Available deck formats
  formats = [
    { value: 'standard', label: 'Standard' },
    { value: 'modern', label: 'Modern' },
    { value: 'legacy', label: 'Legacy' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'pioneer', label: 'Pioneer' },
    { value: 'commander', label: 'Commander' },
  ]

  /**
   * Submits form if valid
   */
  onSubmit() {
    if (this.name() && this.format()) {
      this.createDeck.emit({
        name: this.name(),
        format: this.format(),
        description: this.description() || undefined,
      })
      this.resetForm()
    }
  }

  /**
   * Cancels form and emits event
   */
  onCancel() {
    this.resetForm()
    this.cancelForm.emit()
  }

  /**
   * Resets form fields
   */
  private resetForm() {
    this.name.set('')
    this.format.set('')
    this.description.set('')
  }
}
