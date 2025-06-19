import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { ErrorService } from '../../services/error.service'

@Component({
  selector: 'app-error-display',
  imports: [],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDisplayComponent {
  errorService = inject(ErrorService)

  dismiss() {
    this.errorService.clearError()
  }
}
