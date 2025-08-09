// Forward declarations to avoid circular imports
export interface EventManager {
  queueObjectEvent(gameObject: GameObject, event: GameEvent, eventData?: any): void
}

// Forward declaration for GameObjectManager to avoid circular imports
export interface IGameObjectManager {
  destroyObject(objectId: number): void
  getObjectsByType(objectType: string): GameObject[]
}

// Forward declaration for drawing system
export interface IDrawingSystem {
  drawSpriteFromSprite(sprite: any, x: number, y: number, frame?: number, scaleX?: number, scaleY?: number, rotation?: number, alpha?: number): void
  drawRectangle(x1: number, y1: number, x2: number, y2: number, filled?: boolean, color?: number, alpha?: number): void
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
  DRAW_BEGIN: 'draw_begin',
  DRAW: 'draw',
  DRAW_END: 'draw_end',
  DRAW_GUI_BEGIN: 'draw_gui_begin',
  DRAW_GUI: 'draw_gui',
  DRAW_GUI_END: 'draw_gui_end',
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
  sprite?: any // DGCSprite reference instead of string
  maskSprite?: string
  [key: string]: any
}

/**
 * Base GameObject class - the foundation of the game engine
 * Similar to GameMaker's object system with event-driven programming
 */
export class GameObject {
  private static nextId: number = 0
  
  // Object-level variables (shared across ALL instances of this object type)
  private static objectVariables: Map<string, Map<string, any>> = new Map()
  
  // Reference to the global GameObjectManager for instance lookups
  private static globalGameObjectManager: IGameObjectManager | null = null
  
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
  public sprite: any | null = null // DGCSprite reference instead of string
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
  private gameObjectManager: IGameObjectManager | null = null
  private drawingSystem: IDrawingSystem | null = null
  
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
   * Static method to set object variables for a specific object type - GameMaker style
   * This affects ALL instances of the given object type
   */
  public static setObjectVariable(objectType: string, name: string, value: any): void {
    if (!GameObject.objectVariables.has(objectType)) {
      GameObject.objectVariables.set(objectType, new Map())
    }
    
    const objectVars = GameObject.objectVariables.get(objectType)!
    objectVars.set(name, value)
  }
  
  /**
   * Static method to get object variables for a specific object type - GameMaker style
   * Returns undefined if not found (like GameMaker's behavior)
   */
  public static getObjectVariable(objectType: string, name: string): any {
    const objectVars = GameObject.objectVariables.get(objectType)
    return objectVars ? objectVars.get(name) : undefined
  }
  
  /**
   * Static method to check if an object variable exists for a specific object type
   */
  public static hasObjectVariable(objectType: string, name: string): boolean {
    const objectVars = GameObject.objectVariables.get(objectType)
    return objectVars ? objectVars.has(name) : false
  }
  
  /**
   * Set the global GameObjectManager reference for instance lookups
   */
  public static setGlobalGameObjectManager(manager: IGameObjectManager): void {
    GameObject.globalGameObjectManager = manager
  }
  
  /**
   * Get instance property from the first instance of an object type - GameMaker style
   * Throws error if no instances exist (matches GameMaker behavior)
   */
  public static getInstanceProperty(objectType: string, propertyName: string): any {
    if (!GameObject.globalGameObjectManager) {
      throw new Error('GameObjectManager not set. Call GameObject.setGlobalGameObjectManager() first.')
    }
    
    const instances = GameObject.globalGameObjectManager.getObjectsByType(objectType)
    
    if (instances.length === 0) {
      throw new Error(`Unable to find instance for object type '${objectType}'`)
    }
    
    const firstInstance = instances[0]
    
    // Check if it's a built-in property
    if (propertyName === 'x') return firstInstance.x
    if (propertyName === 'y') return firstInstance.y
    if (propertyName === 'visible') return firstInstance.visible
    if (propertyName === 'active') return firstInstance.active
    if (propertyName === 'depth') return firstInstance.depth
    if (propertyName === 'solid') return firstInstance.solid
    if (propertyName === 'persistent') return firstInstance.persistent
    if (propertyName === 'sprite') return firstInstance.sprite
    if (propertyName === 'imageIndex') return firstInstance.imageIndex
    if (propertyName === 'imageSpeed') return firstInstance.imageSpeed
    if (propertyName === 'imageAngle') return firstInstance.imageAngle
    if (propertyName === 'imageXScale') return firstInstance.imageXScale
    if (propertyName === 'imageYScale') return firstInstance.imageYScale
    if (propertyName === 'imageAlpha') return firstInstance.imageAlpha
    
    // Check instance variables
    return firstInstance.getVariable(propertyName)
  }
  
  /**
   * Set instance property on the first instance of an object type - GameMaker style
   * Throws error if no instances exist (matches GameMaker behavior)
   */
  public static setInstanceProperty(objectType: string, propertyName: string, value: any): void {
    if (!GameObject.globalGameObjectManager) {
      throw new Error('GameObjectManager not set. Call GameObject.setGlobalGameObjectManager() first.')
    }
    
    const instances = GameObject.globalGameObjectManager.getObjectsByType(objectType)
    
    if (instances.length === 0) {
      throw new Error(`Unable to find instance for object type '${objectType}'`)
    }
    
    const firstInstance = instances[0]
    
    // Set built-in properties
    if (propertyName === 'x') { firstInstance.x = value; return }
    if (propertyName === 'y') { firstInstance.y = value; return }
    if (propertyName === 'visible') { firstInstance.visible = value; return }
    if (propertyName === 'active') { firstInstance.active = value; return }
    if (propertyName === 'depth') { firstInstance.depth = value; return }
    if (propertyName === 'solid') { firstInstance.solid = value; return }
    if (propertyName === 'persistent') { firstInstance.persistent = value; return }
    if (propertyName === 'sprite') { firstInstance.sprite = value; return }
    if (propertyName === 'imageIndex') { firstInstance.imageIndex = value; return }
    if (propertyName === 'imageSpeed') { firstInstance.imageSpeed = value; return }
    if (propertyName === 'imageAngle') { firstInstance.imageAngle = value; return }
    if (propertyName === 'imageXScale') { firstInstance.imageXScale = value; return }
    if (propertyName === 'imageYScale') { firstInstance.imageYScale = value; return }
    if (propertyName === 'imageAlpha') { firstInstance.imageAlpha = value; return }
    
    // Set instance variable
    firstInstance.setVariable(propertyName, value)
  }
  
  /**
   * Set references to engine managers
   */
  public setManagers(_eventManager: EventManager, gameObjectManager: IGameObjectManager, drawingSystem?: IDrawingSystem): void {
    this.gameObjectManager = gameObjectManager
    if (drawingSystem) {
      this.drawingSystem = drawingSystem
    }
  }
  
  /**
   * Get the drawing system (for custom drawing in events)
   */
  public getDrawingSystem(): IDrawingSystem | null {
    return this.drawingSystem
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
   * Execute all scripts for a given event synchronously (for game loop performance)
   */
  public executeEventSync(event: GameEvent, eventData?: any): void {
    const scripts = this.eventScripts.get(event) || []
    
    for (const script of scripts) {
      try {
        // Call script synchronously - if it returns a Promise, we ignore it
        script(this, eventData)
      } catch (error) {
        console.error(`Error executing ${event} event for ${this.objectType}:`, error)
      }
    }
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
   * Set an instance variable (unique to this instance) - GameMaker style
   */
  public setVariable(name: string, value: any): void {
    this.customVariables.set(name, value)
  }
  
  /**
   * Get an instance variable, falls back to object variable if not found - GameMaker style
   */
  public getVariable(name: string): any {
    // First check instance variables
    if (this.customVariables.has(name)) {
      return this.customVariables.get(name)
    }
    
    // Fall back to object variables
    const objectVars = GameObject.objectVariables.get(this.objectType)
    if (objectVars && objectVars.has(name)) {
      return objectVars.get(name)
    }
    
    return undefined
  }
  
  /**
   * Set an object variable (shared across ALL instances of this object type) - GameMaker style
   */
  public setObjectVariable(name: string, value: any): void {
    if (!GameObject.objectVariables.has(this.objectType)) {
      GameObject.objectVariables.set(this.objectType, new Map())
    }
    
    const objectVars = GameObject.objectVariables.get(this.objectType)!
    objectVars.set(name, value)
  }
  
  /**
   * Get an object variable (shared across all instances)
   */
  public getObjectVariable(name: string): any {
    const objectVars = GameObject.objectVariables.get(this.objectType)
    return objectVars ? objectVars.get(name) : undefined
  }
  
  /**
   * Check if a variable exists (checks both instance and object variables)
   */
  public hasVariable(name: string): boolean {
    // Check instance variables first
    if (this.customVariables.has(name)) {
      return true
    }
    
    // Check object variables
    const objectVars = GameObject.objectVariables.get(this.objectType)
    return objectVars ? objectVars.has(name) : false
  }
  
  /**
   * Check if an object variable exists
   */
  public hasObjectVariable(name: string): boolean {
    const objectVars = GameObject.objectVariables.get(this.objectType)
    return objectVars ? objectVars.has(name) : false
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
   * Update sprite animation (called during animation event phase)
   */
  public updateAnimation(): void {
    // TODO: Implement sprite animation system
    // This would update sprite frame based on animation speed
    // and trigger ANIMATION_END events when animations complete
    
    // For now, this is a placeholder for future sprite animation system
    // When implemented, this would:
    // 1. Update current animation frame based on deltaTime and animation speed
    // 2. Handle animation looping
    // 3. Trigger ANIMATION_END event when non-looping animations finish
    // 4. Handle animation blending/transitions
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
  
  /**
   * GameMaker-style draw_self() - renders the object's sprite
   * Called manually in draw events when you want to render the object's sprite
   */
  public drawSelf(): void {
    if (!this.sprite || !this.drawingSystem) {
      console.log(`❌ Cannot draw ${this.objectType}: sprite=${!!this.sprite}, drawingSystem=${!!this.drawingSystem}`)
      return
    }
    
    // Calculate current animation frame
    const currentFrame = this.imageSpeed > 0 ? 
      Math.floor(this.imageIndex) % this.sprite.frameCount : 
      Math.floor(this.imageIndex)
    
    // Draw the sprite using the drawing system
    this.drawingSystem.drawSpriteFromSprite(
      this.sprite,
      this.x,
      this.y,
      currentFrame,
      this.imageXScale,
      this.imageYScale,
      this.imageAngle,
      this.imageAlpha
    )
  }
}
