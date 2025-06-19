# MTG Sideboard Frontend Angular 19

Angular frontend for Magic: The Gathering sideboard management application.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm start
   ```

The application will be available at `http://localhost:4200`

## Environment Configuration

To change the API URL, modify the `apiUrl` in:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Features

- Create and manage MTG decks
- Create sideboard plans for specific matchups
- Search cards using Scryfall API
- Track cards going in/out for each matchup
