import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterModule } from '@angular/router'

import { firstValueFrom } from 'rxjs'

import { CreateSideboardDto } from '../../models/sideboard.model'
import { ApiService } from '../../services/api.service'
import { ErrorService } from '../../services/error.service'
import { SideboardStateService } from '../../services/sideboard-state.service'
import { SideboardFormComponent } from '../sideboard-form/sideboard-form.component'
import { SideboardListComponent } from '../sideboard-list/sideboard-list.component'

interface SideboardFormData {
  matchup: string
  description: string
  entries: Array<{
    scryfallCard: import('../../models/scryfall.model').ScryfallCard
    action: 'IN' | 'OUT'
    quantity: number
    configuration: 'play' | 'draw'
  }>
}

@Component({
  selector: 'app-sideboard',
  imports: [CommonModule, RouterModule, SideboardListComponent, SideboardFormComponent],
  templateUrl: './sideboard.component.html',
  styleUrl: './sideboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideboardComponent {
  private api = inject(ApiService)
  private route = inject(ActivatedRoute)
  private sideboardState = inject(SideboardStateService)
  private errorService = inject(ErrorService)

  deckId = this.route.snapshot.paramMap.get('deckId') || ''
  showCreateForm = signal(false)
  loading = signal(false)

  // Use toSignal for reactive data
  deck = toSignal(this.api.getDeck(this.deckId), { initialValue: null })
  sideboards = this.sideboardState.getSideboards(this.deckId)

  toggleCreateForm() {
    this.showCreateForm.update((show) => !show)
  }

  async onCreateSideboard(formData: SideboardFormData) {
    this.loading.set(true)

    try {
      // Get unique cards to import (avoid duplicates)
      const uniqueCards = new Map<string, import('../../models/scryfall.model').ScryfallCard>()
      formData.entries.forEach((entry) => {
        uniqueCards.set(entry.scryfallCard.id, entry.scryfallCard)
      })

      // Import unique cards first
      const importPromises = Array.from(uniqueCards.values()).map((card) =>
        firstValueFrom(this.api.importCard(card))
      )

      const importedCards = await Promise.all(importPromises)

      // Create a map of scryfall ID to imported card ID
      const cardIdMap = new Map<string, string>()
      importedCards.forEach((card, index) => {
        const scryfallCard = Array.from(uniqueCards.values())[index]
        cardIdMap.set(scryfallCard.id, card.id)
      })

      // Create sideboard with imported card IDs
      const sideboardData: CreateSideboardDto = {
        deckId: this.deckId,
        matchup: formData.matchup,
        description: formData.description,
        entries: formData.entries.map((entry) => ({
          cardId: cardIdMap.get(entry.scryfallCard.id)!,
          action: entry.action,
          quantity: entry.quantity,
          configuration: entry.configuration,
        })),
      }

      await firstValueFrom(this.api.createSideboard(sideboardData))

      // Refresh sideboards
      this.sideboardState.refresh()
      this.showCreateForm.set(false)
      this.loading.set(false)
    } catch (err) {
      this.loading.set(false)
      this.errorService.handleError(err, 'Failed to create sideboard')
    }
  }

  onDeleteSideboard(id: string) {
    this.loading.set(true)
    this.api
      .deleteSideboard(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.sideboardState.refresh()
          this.loading.set(false)
        },
        error: (err) => {
          this.loading.set(false)
          this.errorService.handleError(err, 'Failed to delete sideboard')
        },
      })
  }
}
