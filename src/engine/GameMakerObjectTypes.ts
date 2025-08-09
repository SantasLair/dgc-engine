/**
 * Alternative: Object-based GameMaker object types
 * This approach uses an object structure similar to GameMaker's obj_ prefix
 */

import { all } from './GameMakerConstants'

// GameMaker-style object definitions (like obj_Player, obj_Enemy in GameMaker)
export const obj = {
  Player: 'Player' as const,
  Enemy: 'Enemy' as const,
  PowerUp: 'PowerUp' as const,
  Bullet: 'Bullet' as const,
  Boss: 'Boss' as const,
  Coin: 'Coin' as const,
  Platform: 'Platform' as const,
  Door: 'Door' as const,
  
  // Special GameMaker keyword
  all: all
} as const

// Extract the object type values
export type GameObjectTypeFromObj = typeof obj[keyof Omit<typeof obj, 'all'>]
export type ObjectTypeOrAllFromObj = GameObjectTypeFromObj | typeof all

// Usage would be: obj.Player, obj.Enemy, obj.all
// This matches GameMaker's obj_Player, obj_Enemy pattern more closely
