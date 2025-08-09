// DGC Engine - Rapid.js-powered game engine
export { DGCEngine } from './DGCEngine'
export { DGCGame } from './DGCGame'
export { type DGCEngineConfig, createDGCEngineConfig } from './DGCEngineConfig'

// Core engine components
export { GameObject, GameEvent, type EventScript, type GameObjectProperties } from './GameObject'
export { EventManager, type EventListener } from './EventManager'
export { GameObjectManager, type ObjectFilter } from './GameObjectManager'
export { Room, RoomManager, type RoomConfig } from './Room'

// Data-driven room system
export { RoomFactory, type RoomData, type RoomDataFile, type RoomFactoryConfig, type RoomObjectData } from './RoomFactory'
export type { RoomBackground, RoomView, RoomObjectPosition } from './RoomData'

// DGC sprite system
export { DGCSprite, DGCSpriteManager, type DGCSpriteConfig } from './DGCSprite'
export { SpriteManager, type SpriteLoadConfig } from './SpriteManager'

// Drawing systems
export { DGCDrawingSystem } from './DGCDrawingSystem'

// Input management
export { InputManager } from './InputManager'
