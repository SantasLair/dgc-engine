/**
 * GameMaker-style object type definitions
 * Define your custom object types here to use them without quotes
 */

import { all } from './GameMakerConstants'

// Define your custom object types as constants
export const Player = 'Player' as const
export const Enemy = 'Enemy' as const
export const PowerUp = 'PowerUp' as const
export const Bullet = 'Bullet' as const
export const Boss = 'Boss' as const

// You can add more object types here:
// export const Coin = 'Coin' as const
// export const Platform = 'Platform' as const
// export const Door = 'Door' as const

// Create a union type of all valid object types
export type GameObjectType = 
  | typeof Player
  | typeof Enemy 
  | typeof PowerUp
  | typeof Bullet
  | typeof Boss
  // Add new types to this union when you create them

// Combined type for functions that accept object types or 'all'
export type ObjectTypeOrAll = GameObjectType | typeof all

// Re-export all for convenience
export { all }
