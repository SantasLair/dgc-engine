// Main engine exports
export { GameEngine } from './GameEngine'
export { GameObject, GameEvent, type EventScript, type GameObjectProperties } from './GameObject'
export { EventManager, type EventListener } from './EventManager'
export { GameObjectManager } from './GameObjectManager'

// Pre-built game objects
export { createPlayerObject, createEnemyObject, createItemObject } from './GameObjects'
