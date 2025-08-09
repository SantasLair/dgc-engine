// DGC Engine - Rapid.js-powered game engine
export { Engine } from './Engine.ts'
export { DGCGame } from './BaseGame.ts'
export { type EngineConfig, createDGCEngineConfig } from './EngineConfig.ts'

// Core engine components
export { GameObject, GameEvent, type EventScript, type GameObjectProperties } from './GameObject'
export { EventManager, type EventListener } from './EventManager'
export { GameObjectManager, type ObjectFilter } from './GameObjectManager'
export { Room, type RoomConfig } from './Room.ts'

// DGC sprite system
export { Sprite, DGCSpriteManager, type DGCSpriteConfig } from './Sprite.ts'
export { SpriteManager, type SpriteLoadConfig } from './SpriteManager'

// Drawing systems
export { DrawingSystem } from './DrawingSystem.ts'

// Input management
export { InputManager } from './InputManager'
