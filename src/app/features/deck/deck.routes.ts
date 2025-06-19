import { Routes } from '@angular/router'

import { deckExistsGuard } from './guards/deck-exists.guard'
import { deckResolver } from './resolvers/deck.resolver'

export const deckRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/deck-container/deck-container.component').then(
        (m) => m.DeckContainerComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/deck-detail/deck-detail.component').then((m) => m.DeckDetailComponent),
    // Guard verifies deck exists before accessing route
    canActivate: [deckExistsGuard],
    // Resolver preloads deck data
    resolve: {
      deck: deckResolver,
    },
  },
]
