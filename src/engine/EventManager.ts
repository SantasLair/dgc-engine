import type { GameObject, GameEvent } from './GameObject'

/**
 * Interface for event listeners
 */
export interface EventListener {
  (eventData?: any): void | Promise<void>
}

/**
 * Manages global events and event propagation throughout the game engine
 * Similar to GameMaker's event system but more flexible
 */
export class EventManager {
  private globalEventListeners: Map<string, EventListener[]> = new Map()
  private objectEventQueue: Array<{
    gameObject: GameObject
    event: GameEvent
    eventData?: any
  }> = []
  
  constructor() {
    // Initialize common event types
    this.globalEventListeners.set('game_start', [])
    this.globalEventListeners.set('game_end', [])
    this.globalEventListeners.set('room_start', [])
    this.globalEventListeners.set('room_end', [])
  }
  
  /**
   * Register a global event listener
   */
  public addEventListener(eventType: string, listener: EventListener): void {
    if (!this.globalEventListeners.has(eventType)) {
      this.globalEventListeners.set(eventType, [])
    }
    
    const listeners = this.globalEventListeners.get(eventType)!
    listeners.push(listener)
  }
  
  /**
   * Remove a global event listener
   */
  public removeEventListener(eventType: string, listener: EventListener): void {
    const listeners = this.globalEventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  /**
   * Emit a global event
   */
  public async emitGlobalEvent(eventType: string, eventData?: any): Promise<void> {
    const listeners = this.globalEventListeners.get(eventType) || []
    
    for (const listener of listeners) {
      try {
        await listener(eventData)
      } catch (error) {
        console.error(`Error executing global event '${eventType}':`, error)
      }
    }
  }
  
  /**
   * Queue an object event for processing
   */
  public queueObjectEvent(gameObject: GameObject, event: GameEvent, eventData?: any): void {
    this.objectEventQueue.push({ gameObject, event, eventData })
  }
  
  /**
   * Process all queued object events
   */
  public async processObjectEvents(): Promise<void> {
    const eventsToProcess = [...this.objectEventQueue]
    this.objectEventQueue.length = 0
    
    for (const { gameObject, event, eventData } of eventsToProcess) {
      if (gameObject.active || event === 'destroy') {
        await gameObject.executeEvent(event, eventData)
      }
    }
  }
  
  /**
   * Clear all event listeners and queues
   */
  public clear(): void {
    this.globalEventListeners.clear()
    this.objectEventQueue.length = 0
  }
}
