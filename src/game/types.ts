/**
 * Common types used throughout the game
 */

export interface Position {
  x: number
  y: number
}

export interface GridCell {
  x: number
  y: number
  walkable: boolean
  type: CellType
}

export const CellType = {
  EMPTY: 0,
  OBSTACLE: 1,
  PLAYER: 2
} as const

export type CellType = typeof CellType[keyof typeof CellType]

export interface GameState {
  currentTurn: number
  isPlayerTurn: boolean
  playerPosition: Position
}
