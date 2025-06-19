export interface Card {
  id: string
  scryfallId: string
  name: string
  manaCost?: string
  typeLine: string
  oracleText?: string
  colors: string[]
  colorIdentity: string[]
  cmc: number
  imageUris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
    art_crop?: string
    border_crop?: string
  }
  createdAt: Date
  updatedAt: Date
}
