import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { Sideboard } from '../../models/sideboard.model'
import { SideboardItemComponent } from '../sideboard-item/sideboard-item.component'

@Component({
  selector: 'app-sideboard-list',
  imports: [SideboardItemComponent],
  templateUrl: './sideboard-list.component.html',
  styleUrl: './sideboard-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideboardListComponent {
  sideboards = input.required<Sideboard[]>()
  deleteSideboard = output<string>()

  onDeleteSideboard(id: string) {
    this.deleteSideboard.emit(id)
  }
}
