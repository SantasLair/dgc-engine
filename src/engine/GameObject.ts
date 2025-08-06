import type { Position } from '../game/types'

// Forward declarations to avoid circular imports
export interface EventManager {
  queueObjectEvent(gameObject: GameObject, event: GameEvent, eventData?: any): void
}

export interface GameObjectManager {
  destroyObject(objectId: number): void
}

/**
 * GameMaker-style event types
 */
export const GameEvent = {
  CREATE: 'create',
  DESTROY: 'destroy',
  STEP: 'step',
  STEP_BEGIN: 'step_begin',
  STEP_END: 'step_end',
  DRAW: 'draw',
  DRAW_GUI: 'draw_gui',
  COLLISION: 'collision',
  MOUSE_LEFT_PRESSED: 'mouse_left_pressed',
  MOUSE_LEFT_RELEASED: 'mouse_left_released',
  MOUSE_RIGHT_PRESSED: 'mouse_right_pressed',
  MOUSE_RIGHT_RELEASED: 'mouse_right_released',
  MOUSE_ENTER: 'mouse_enter',
  MOUSE_LEAVE: 'mouse_leave',
  KEY_PRESSED: 'key_pressed',
  KEY_RELEASED: 'key_released',
  ANIMATION_END: 'animation_end',
  TIMER: 'timer',
  CUSTOM: 'custom'
} as const

export type GameEvent = typeof GameEvent[keyof typeof GameEvent]

/**
 * Event script function type
 */
export type EventScript = (gameObject: GameObject, eventData?: any) => void | Promise<void>

/**
 * GameObject properties interface
 */
export interface GameObjectProperties {
  x?: number
  y?: number
  visible?: boolean
  active?: boolean
  depth?: number
  solid?: boolean
  persistent?: boolean
  sprite?: string
  maskSprite?: string
  [key: string]: any
}

/**
 * Base GameObject class - the foundation of the game engine
 * Similar to GameMaker's object system with event-driven programming
 */
export class GameObject {
  private static nextId: number = 0
  
  public readonly id: number
  public readonly objectType: string
  
  // Core properties
  public x: number = 0
  public y: number = 0
  public xPrevious: number = 0
  public yPrevious: number = 0
  public visible: boolean = true
  public active: boolean = true
  public depth: number = 0
  public solid: boolean = false
  public persistent: boolean = false
  
  // Visual properties
  public sprite: string | null = null
  public imageIndex: number = 0
  public imageSpeed: number = 1
  public imageAngle: number = 0
  public imageXScale: number = 1
  public imageYScale: number = 1
  public imageAlpha: number = 1
  public imageBlend: number = 0xFFFFFF
  
  // Collision properties
  public maskSprite: string | null = null
  public boundingBox: { left: number; top: number; right: number; bottom: number } = {
    left: 0, top: 0, right: 0, bottom: 0
  }
  
  // Event scripts
  private eventScripts: Map<GameEvent, EventScript[]> = new Map()
  
  // Custom variables (user-defined properties)
  private customVariables: Map<string, any> = new Map()
  
  // Timers
  private timers: Map<string, { duration: number; elapsed: number; callback?: () => void }> = new Map()
  
  // References
  private gameObjectManager: GameObjectManager | null = null
  
  constructor(objectType: string, properties: GameObjectProperties = {}) {
    this.id = GameObject.nextId++
    this.objectType = objectType
    
    // Apply properties
    Object.assign(this, properties)
    
    // Initialize event script maps
    Object.values(GameEvent).forEach(event => {
      this.eventScripts.set(event as GameEvent, [])
    })
  }
  
  /**
   * Set references to engine managers
   */
  public setManagers(_eventManager: EventManager, gameObjectManager: GameObjectManager): void {
    this.gameObjectManager = gameObjectManager
  }
  
  /**
   * Add an event script to this object
   */
  public addEventScript(event: GameEvent, script: EventScript): void {
    const scripts = this.eventScripts.get(event) || []
    scripts.push(script)
    this.eventScripts.set(event, scripts)
  }
  
  /**
   * Remove an event script from this object
   */
  public removeEventScript(event: GameEvent, script: EventScript): void {
    const scripts = this.eventScripts.get(event) || []
    const index = scripts.indexOf(script)
    if (index !== -1) {
      scripts.splice(index, 1)
    }
  }
  
  /**
   * Execute all scripts for a given event
   */
  public async executeEvent(event: GameEvent, eventData?: any): Promise<void> {
    const scripts = this.eventScripts.get(event) || []
    
    for (const script of scripts) {
      try {
        await script(this, eventData)
      } catch (error) {
        console.error(`Error executing ${event} event for ${this.objectType}:`, error)
      }
    }
  }
  
  /**
   * Get the current position as a Position object
   */
  public getPosition(): Position {
    return { x: this.x, y: this.y }
  }
  
  /**
   * Set the position
   */
  public setPosition(x: number, y: number): void {
    this.xPrevious = this.x
    this.yPrevious = this.y
    this.x = x
    this.y = y
  }
  
  /**
   * Move the object by relative amounts
   */
  public move(deltaX: number, deltaY: number): void {
    this.setPosition(this.x + deltaX, this.y + deltaY)
  }
  
  /**
   * Set a custom variable
   */
  public setVariable(name: string, value: any): void {
    this.customVariables.set(name, value)
  }
  
  /**
   * Get a custom variable
   */
  public getVariable(name: string): any {
    return this.customVariables.get(name)
  }
  
  /**
   * Check if a custom variable exists
   */
  public hasVariable(name: string): boolean {
    return this.customVariables.has(name)
  }
  
  /**
   * Set a timer
   */
  public setTimer(name: string, duration: number, callback?: () => void): void {
    this.timers.set(name, { duration, elapsed: 0, callback })
  }
  
  /**
   * Update timers (called during step event)
   */
  public updateTimers(deltaTime: number): void {
    for (const [name, timer] of this.timers) {
      timer.elapsed += deltaTime
      if (timer.elapsed >= timer.duration) {
        // Timer finished
        this.timers.delete(name)
        
        // Execute callback if provided
        if (timer.callback) {
          timer.callback()
        }
        
        // Fire timer event
        this.executeEvent(GameEvent.TIMER, { timerName: name })
      }
    }
  }
  
  /**
   * Check if object collides with another object
   */
  public collidesWith(other: GameObject): boolean {
    if (!this.solid || !other.solid) return false
    
    return (
      this.x < other.x + other.boundingBox.right &&
      this.x + this.boundingBox.right > other.x &&
      this.y < other.y + other.boundingBox.bottom &&
      this.y + this.boundingBox.bottom > other.y
    )
  }
  
  /**
   * Destroy this object
   */
  public destroy(): void {
    this.executeEvent(GameEvent.DESTROY)
    
    if (this.gameObjectManager) {
      this.gameObjectManager.destroyObject(this.id)
    }
  }
  
  /**
   * Clone this object (create a copy)
   */
  public clone(): GameObject {
    const clone = new GameObject(this.objectType, {
      x: this.x,
      y: this.y,
      visible: this.visible,
      active: this.active,
      depth: this.depth,
      solid: this.solid,
      persistent: this.persistent,
      sprite: this.sprite ?? undefined,
      maskSprite: this.maskSprite ?? undefined
    })
    
    // Copy custom variables
    for (const [name, value] of this.customVariables) {
      clone.setVariable(name, value)
    }
    
    // Copy event scripts
    for (const [event, scripts] of this.eventScripts) {
      clone.eventScripts.set(event, [...scripts])
    }
    
    return clone
  }
  
  /**
   * Update the object (called every frame)
   */
  public update(deltaTime: number): void {
    if (!this.active) return
    
    this.updateTimers(deltaTime)
  }
}
