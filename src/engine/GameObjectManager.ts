import { GameObject, GameEvent, type GameObjectProperties } from './GameObject'
import type { EventManager } from './EventManager'

/**
 * Manages all game objects in the engine
 * Handles creation, destruction, updating, and collision detection
 */
export class GameObjectManager {
  private gameObjects: Map<number, GameObject> = new Map()
  private objectsByType: Map<string, Set<GameObject>> = new Map()
  private objectsToDestroy: Set<number> = new Set()
  private eventManager: EventManager
  
  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    
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
    
    gameObject.setManagers(this.eventManager, this)
    
    // Add to collections
    this.gameObjects.set(gameObject.id, gameObject)
    
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
    gameObject.setManagers(this.eventManager, this)
    
    // Add to collections
    this.gameObjects.set(gameObject.id, gameObject)
    
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
    this.objectsToDestroy.add(objectId)
  }
  
  /**
   * Get an object by its ID
   */
  public getObject(objectId: number): GameObject | undefined {
    return this.gameObjects.get(objectId)
  }
  
  /**
   * Get all objects of a specific type
   */
  public getObjectsByType(objectType: string): GameObject[] {
    const objectSet = this.objectsByType.get(objectType)
    return objectSet ? Array.from(objectSet) : []
  }
  
  /**
   * Get all game objects
   */
  public getAllObjects(): GameObject[] {
    return Array.from(this.gameObjects.values())
  }
  
  /**
   * Get objects within a certain distance of a position - GameMaker style
   */
  public getObjectsNear(x: number, y: number, radius: number, objectType?: string): GameObject[] {
    const objects = objectType ? this.getObjectsByType(objectType) : this.getAllObjects()
    
    return objects.filter(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
      )
      return distance <= radius
    })
  }
  
  /**
   * Get the nearest object to a position - GameMaker style
   */
  public getNearestObject(x: number, y: number, objectType?: string): GameObject | null {
    const objects = objectType ? this.getObjectsByType(objectType) : this.getAllObjects()
    
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
    
    for (const gameObject of visibleObjects) {
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
    for (const objectId of this.objectsToDestroy) {
      const gameObject = this.gameObjects.get(objectId)
      if (gameObject) {
        // Remove from type collection
        const typeSet = this.objectsByType.get(gameObject.objectType)
        if (typeSet) {
          typeSet.delete(gameObject)
          if (typeSet.size === 0) {
            this.objectsByType.delete(gameObject.objectType)
          }
        }
        
        // Remove from main collection
        this.gameObjects.delete(objectId)
      }
    }
    
    this.objectsToDestroy.clear()
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
    this.objectsByType.clear()
    this.objectsToDestroy.clear()
  }
  
  /**
   * Get count of objects of a specific type
   */
  public getObjectCount(objectType?: string): number {
    if (objectType) {
      const typeSet = this.objectsByType.get(objectType)
      return typeSet ? typeSet.size : 0
    }
    return this.gameObjects.size
  }
}
