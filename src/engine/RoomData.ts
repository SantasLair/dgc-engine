/**
 * Room Data Definition System
 * 
 * Enables data-driven room creation where rooms can be defined in JSON files
 * with optional custom room classes for specialized behavior.
 * 
 * This system separates content (room data) from code (room logic).
 */

import type { SpriteLoadConfig } from './SpriteManager'
import type { EventScript } from './GameObject'

/**
 * Position data for placing objects in a room
 */
export interface RoomObjectPosition {
  /** Grid X coordinate */
  x: number
  /** Grid Y coordinate */
  y: number
  /** Optional layer/depth for rendering order */
  depth?: number
}

/**
 * Object instance data for placing in a room
 */
export interface RoomObjectData {
  /** Object type/class name (must be registered in engine) */
  objectType: string
  /** Position in the room */
  position: RoomObjectPosition
  /** Custom properties for this object instance */
  properties?: Record<string, any>
  /** Unique instance name (optional) */
  instanceName?: string
}

/**
 * Room background configuration
 */
export interface RoomBackground {
  /** Background type */
  type: 'color' | 'image' | 'tiled'
  /** Background value (color hex, image path, etc.) */
  value: string
  /** For tiled backgrounds, tile size */
  tileSize?: { width: number; height: number }
}

/**
 * Room view/camera configuration
 */
export interface RoomView {
  /** View width in pixels */
  width: number
  /** View height in pixels */
  height: number
  /** Initial camera position */
  x?: number
  /** Initial camera position */
  y?: number
  /** Follow a specific object */
  followObject?: string
}

/**
 * Complete room data definition
 * This can be loaded from JSON files or defined programmatically
 */
export interface RoomData {
  /** Unique room identifier */
  name: string
  
  /** Room dimensions in grid units */
  dimensions: {
    width: number
    height: number
  }
  
  /** Background configuration */
  background?: RoomBackground
  
  /** View/camera settings */
  view?: RoomView
  
  /** Sprites that should be loaded for this room */
  sprites?: SpriteLoadConfig[]
  
  /** Objects to create in this room */
  objects?: RoomObjectData[]
  
  /** Room event scripts (optional) */
  events?: {
    onCreate?: EventScript
    onStep?: EventScript
    onDraw?: EventScript
    onDestroy?: EventScript
  }
  
  /** Custom room properties */
  properties?: Record<string, any>
  
  /** Optional custom room class name for specialized behavior */
  customClass?: string
  
  /** Room metadata */
  metadata?: {
    description?: string
    author?: string
    version?: string
    tags?: string[]
  }
}

/**
 * Room data file structure for JSON serialization
 */
export interface RoomDataFile {
  /** File format version for compatibility */
  version: string
  /** Room data */
  room: RoomData
}

/**
 * Room factory configuration
 */
export interface RoomFactoryConfig {
  /** Base path for room data files */
  dataPath?: string
  /** Registered object types that can be created */
  objectTypes?: Map<string, new (...args: any[]) => any>
  /** Registered custom room classes */
  roomClasses?: Map<string, new (...args: any[]) => any>
}
