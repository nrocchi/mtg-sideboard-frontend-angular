import { inject, Injectable } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'

import { BehaviorSubject, switchMap } from 'rxjs'

import { ApiService } from './api.service'

@Injectable({
  providedIn: 'root',
})
export class SideboardStateService {
  private api = inject(ApiService)

  private refreshTrigger$ = new BehaviorSubject<void>(undefined)

  getSideboards(deckId: string) {
    const sideboards$ = this.refreshTrigger$.pipe(switchMap(() => this.api.getSideboards(deckId)))

    return toSignal(sideboards$, { initialValue: [] })
  }

  refresh() {
    this.refreshTrigger$.next()
  }
}
