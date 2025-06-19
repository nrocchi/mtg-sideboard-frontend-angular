import { Routes } from '@angular/router'

import { SideboardComponent } from './components/sideboard/sideboard.component'
import { SideboardDetailComponent } from './components/sideboard-detail/sideboard-detail.component'

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/deck/deck.routes').then((m) => m.deckRoutes),
  },
  {
    path: 'deck',
    loadChildren: () => import('./features/deck/deck.routes').then((m) => m.deckRoutes),
  },
  { path: 'sideboard/:deckId', component: SideboardComponent },
  { path: 'sideboard-detail/:id', component: SideboardDetailComponent },
]
