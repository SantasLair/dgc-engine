import { GameObject, type GameObjectProperties, GameEvent, type IDrawingSystem } from './GameObject'
import type { EventManager } from './EventManager'

// Modern TypeScript types instead of GameMaker compatibility
export type ObjectFilter = string | 'all'

/**
 * Manages all game objects in the engine
 * Handles creation, destruction, updating, and collision detection
 */
export class GameObjectManager {
  private gameObjects: Map<number, GameObject> = new Map()
  private activeGameObjects: Map<number, GameObject> = new Map()
  private inactiveGameObjects: Map<number, GameObject> = new Map()
  private pendingDestroyObjects: Map<number, GameObject> = new Map()
  private objectsByType: Map<string, Set<GameObject>> = new Map()
  private eventManager: EventManager
  private drawingSystem: IDrawingSystem | null = null
  
  constructor(eventManager: EventManager, drawingSystem?: IDrawingSystem) {
    this.eventManager = eventManager
    this.drawingSystem = drawingSystem || null
    
    // Set this manager as the global reference for GameMaker-style object property access
    GameObject.setGlobalGameObjectManager(this)
  }
  
  /**
   * Create a new game object
   */
  public createObject(objectType: string, x: number = 0, y: number = 0, properties: GameObjectProperties = {}): GameObject {
    const gameObject = new GameObject(objectType, {
      x,
      y,
      ...properties
    })
    
    gameObject.setManagers(this.eventManager, this, this.drawingSystem || undefined)
    
    // Add to collections
    this.gameObjects.set(gameObject.id, gameObject)
    
    // Objects are active by default
    if (gameObject.active) {
      this.activeGameObjects.set(gameObject.id, gameObject)
    } else {
      this.inactiveGameObjects.set(gameObject.id, gameObject)
    }
    
    if (!this.objectsByType.has(objectType)) {
      this.objectsByType.set(objectType, new Set())
    }
    this.objectsByType.get(objectType)!.add(gameObject)
    
    // Queue create event
    this.eventManager.queueObjectEvent(gameObject, GameEvent.CREATE)
    
    return gameObject
  }

  /**
   * Add an existing GameObject to the manager
   */
  public addExistingObject(gameObject: GameObject): void {
    gameObject.setManagers(this.eventManager, this, this.drawingSystem || undefined)
    
    // Add to collections
    this.gameObjects.set(gameObject.id, gameObject)
    
    // Add to appropriate active/inactive collection
    if (gameObject.active) {
      this.activeGameObjects.set(gameObject.id, gameObject)
    } else {
      this.inactiveGameObjects.set(gameObject.id, gameObject)
    }
    
    if (!this.objectsByType.has(gameObject.objectType)) {
      this.objectsByType.set(gameObject.objectType, new Set())
    }
    this.objectsByType.get(gameObject.objectType)!.add(gameObject)
    
    // Queue create event
    this.eventManager.queueObjectEvent(gameObject, GameEvent.CREATE)
  }
  
  /**
   * Mark an object for destruction
   */
  public destroyObject(objectId: number): void {
    const gameObject = this.gameObjects.get(objectId)
    if (gameObject) {
      // Move to pending destroy collection
      this.pendingDestroyObjects.set(objectId, gameObject)
      
      // Remove from active/inactive collections
      this.activeGameObjects.delete(objectId)
      this.inactiveGameObjects.delete(objectId)
    }
  }
  
  /**
   * Get an object by its ID
   */
  public getObject(objectId: number): GameObject | undefined {
    return this.gameObjects.get(objectId)
  }
  
  /**
   * Get all objects of a specific type or all objects
   */
  public getObjectsByType(objectType: ObjectFilter): GameObject[] {
    if (objectType === 'all') {
      return this.getAllObjects()
    }
    const objectSet = this.objectsByType.get(objectType as string)
    return objectSet ? Array.from(objectSet) : []
  }
  
  /**
   * Get all game objects
   */
  public getAllObjects(): GameObject[] {
    return Array.from(this.gameObjects.values())
  }
  
  /**
   * Get all active game objects
   */
  public getAllActiveObjects(): GameObject[] {
    return Array.from(this.activeGameObjects.values())
  }
  
  /**
   * Get all inactive game objects
   */
  public getAllInactiveObjects(): GameObject[] {
    return Array.from(this.inactiveGameObjects.values())
  }
  
  /**
   * Get all objects pending destruction
   */
  public getPendingDestroyObjects(): GameObject[] {
    return Array.from(this.pendingDestroyObjects.values())
  }
  
  /**
   * Update object's active state - moves object between active/inactive collections
   * This should be called when an object's active property changes
   */
  public updateObjectActiveState(gameObject: GameObject): void {
    const objectId = gameObject.id
    
    // Remove from both collections first
    this.activeGameObjects.delete(objectId)
    this.inactiveGameObjects.delete(objectId)
    
    // Add to appropriate collection based on current state
    if (gameObject.active) {
      this.activeGameObjects.set(objectId, gameObject)
    } else {
      this.inactiveGameObjects.set(objectId, gameObject)
    }
  }
  
  /**
   * Get objects within a certain distance of a position
   */
  public getObjectsNear(x: number, y: number, radius: number, objectType?: ObjectFilter): GameObject[] {
    const objects = objectType && objectType !== 'all' ? this.getObjectsByType(objectType) : this.getAllObjects()
    
    return objects.filter(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
      )
      return distance <= radius
    })
  }
  
  /**
   * Get the nearest object to a position
   */
  public getNearestObject(x: number, y: number, objectType?: ObjectFilter): GameObject | null {
    const objects = objectType && objectType !== 'all' ? this.getObjectsByType(objectType) : this.getAllObjects()
    
    if (objects.length === 0) return null
    
    let nearest = objects[0]
    let nearestDistance = Math.sqrt(
      Math.pow(nearest.x - x, 2) + Math.pow(nearest.y - y, 2)
    )
    
    for (let i = 1; i < objects.length; i++) {
      const obj = objects[i]
      const distance = Math.sqrt(
        Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
      )
      
      if (distance < nearestDistance) {
        nearest = obj
        nearestDistance = distance
      }
    }
    
    return nearest
  }
  
  /**
   * Check for collisions between objects
   */
  public checkCollisions(): void {
    const solidObjects = this.getAllObjects().filter(obj => obj.solid && obj.active)
    
    for (let i = 0; i < solidObjects.length; i++) {
      for (let j = i + 1; j < solidObjects.length; j++) {
        const obj1 = solidObjects[i]
        const obj2 = solidObjects[j]
        
        if (obj1.collidesWith(obj2)) {
          // Queue collision events for both objects
          this.eventManager.queueObjectEvent(obj1, GameEvent.COLLISION, { other: obj2 })
          this.eventManager.queueObjectEvent(obj2, GameEvent.COLLISION, { other: obj1 })
        }
      }
    }
  }
  
  /**
   * Update all game objects
   */
  public update(deltaTime: number): void {
    // Execute step_begin events
    for (const gameObject of this.gameObjects.values()) {
      if (gameObject.active) {
        this.eventManager.queueObjectEvent(gameObject, GameEvent.STEP_BEGIN)
      }
    }
    
    // Update all objects
    for (const gameObject of this.gameObjects.values()) {
      if (gameObject.active) {
        gameObject.update(deltaTime)
        this.eventManager.queueObjectEvent(gameObject, GameEvent.STEP)
      }
    }
    
    // Check collisions
    this.checkCollisions()
    
    // Execute step_end events
    for (const gameObject of this.gameObjects.values()) {
      if (gameObject.active) {
        this.eventManager.queueObjectEvent(gameObject, GameEvent.STEP_END)
      }
    }
    
    // Clean up destroyed objects
    this.cleanupDestroyedObjects()
  }
  
  /**
   * Execute draw events for all objects (sorted by depth)
   */
  public draw(): void {
    const visibleObjects = Array.from(this.gameObjects.values())
      .filter(obj => obj.visible && obj.active)
      .sort((a, b) => a.depth - b.depth) // Lower depth values draw first (background)
    
    console.log(`🎨 GameObjectManager.draw() called with ${visibleObjects.length} visible objects`)
    
    for (const gameObject of visibleObjects) {
      console.log(`🎨 Queuing DRAW event for ${gameObject.objectType} at (${gameObject.x}, ${gameObject.y})`)
      this.eventManager.queueObjectEvent(gameObject, GameEvent.DRAW)
    }
  }
  
  /**
   * Execute GUI draw events for all objects
   */
  public drawGUI(): void {
    const visibleObjects = Array.from(this.gameObjects.values())
      .filter(obj => obj.visible && obj.active)
      .sort((a, b) => a.depth - b.depth)
    
    for (const gameObject of visibleObjects) {
      this.eventManager.queueObjectEvent(gameObject, GameEvent.DRAW_GUI)
    }
  }
  
  /**
   * Clean up objects marked for destruction
   */
  private cleanupDestroyedObjects(): void {
    for (const gameObject of this.pendingDestroyObjects.values()) {
      // Remove from type collection
      const typeSet = this.objectsByType.get(gameObject.objectType)
      if (typeSet) {
        typeSet.delete(gameObject)
        if (typeSet.size === 0) {
          this.objectsByType.delete(gameObject.objectType)
        }
      }
      
      // Remove from main collection
      this.gameObjects.delete(gameObject.id)
    }
    
    this.pendingDestroyObjects.clear()
  }
  
  /**
   * Clear all objects
   */
  public clear(): void {
    // Queue destroy events for all objects
    for (const gameObject of this.gameObjects.values()) {
      this.eventManager.queueObjectEvent(gameObject, GameEvent.DESTROY)
    }
    
    this.gameObjects.clear()
    this.activeGameObjects.clear()
    this.inactiveGameObjects.clear()
    this.pendingDestroyObjects.clear()
    this.objectsByType.clear()
  }
  
  /**
   * Get count of objects of a specific type
   */
  public getObjectCount(objectType?: ObjectFilter): number {
    if (!objectType || objectType === 'all') {
      return this.gameObjects.size
    }
    const typeSet = this.objectsByType.get(objectType as string)
    return typeSet ? typeSet.size : 0
  }
}
