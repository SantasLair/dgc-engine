import { GameObject, GameEvent, type EventScript } from './GameObject'

/**
 * Room configuration interface
 */
export interface RoomConfig {
  /** Room identifier */
  name: string
  /** Room width in grid units */
  width: number
  /** Room height in grid units */
  height: number
  /** Background color or image */
  background?: string | HTMLImageElement
  /** Room creation script */
  onCreate?: EventScript
  /** Room step script (called every frame) */
  onStep?: EventScript
  /** Room draw script (called during rendering) */
  onDraw?: EventScript
  /** Room cleanup script */
  onDestroy?: EventScript
}

/**
 * Represents a game room/level/scene
 * Manages game objects within a specific area and handles room-level events
 * Core room management component for the DGC Engine.
 * 
 * Rooms are containers for game objects, providing:
 * - Object lifecycle management (create, step, draw, destroy)
 * - Persistent vs temporary rooms
 * - Event-driven architecture
 * 
 * Follows GameMaker-style room architecture with Rapid.js immediate mode rendering
 */
export class Room {
  /** Room identifier */
  public readonly name: string
  
  /** Room dimensions (logical game units) */
  public readonly width: number
  public readonly height: number
  
  /** Background configuration */
  public background?: string | HTMLImageElement
  
  /** Rendering handled by immediate mode Rapid.js drawing system */
  // Rapid.js uses immediate mode rendering - no retained containers needed
  
  /** Room event scripts */
  private eventScripts: Map<string, EventScript> = new Map()
  
  /** Game objects currently in this room */
  private gameObjects: Set<GameObject> = new Set()
  
  /** Room state */
  private isActive: boolean = false
  private isCreated: boolean = false

  constructor(config: RoomConfig) {
    this.name = config.name
    this.width = config.width
    this.height = config.height
    this.background = config.background
    
    // Register event scripts
    if (config.onCreate) {
      this.eventScripts.set(GameEvent.CREATE, config.onCreate)
    }
    if (config.onStep) {
      this.eventScripts.set(GameEvent.STEP, config.onStep)
    }
    if (config.onDraw) {
      this.eventScripts.set(GameEvent.DRAW, config.onDraw)
    }
    if (config.onDestroy) {
      this.eventScripts.set(GameEvent.DESTROY, config.onDestroy)
    }
  }

  /**
   * Initialize the room
   * Note: Room primarily manages game objects which handle their own lifecycle
   */
  public initialize(): void {
    // Room initialization logic can be added here if needed
  }

  /**
   * Activate this room (called when room becomes current)
   */
  public async activate(): Promise<void> {
    if (this.isActive) return
    
    this.isActive = true
    
    // Execute create event if not already created
    if (!this.isCreated) {
      await this.executeEvent(GameEvent.CREATE)
      this.isCreated = true
    }
  }

  /**
   * Deactivate this room (called when switching to another room)
   */
  public deactivate(): void {
    this.isActive = false
  }

  /**
   * Destroy this room and cleanup resources
   */
  public async destroy(): Promise<void> {
    await this.executeEvent(GameEvent.DESTROY)
    
    // Remove all game objects from this room
    for (const gameObject of this.gameObjects) {
      gameObject.destroy()
    }
    this.gameObjects.clear()
    
    this.isActive = false
    this.isCreated = false
  }

  /**
   * Execute room step logic (called every frame when active)
   */
  public async step(): Promise<void> {
    if (!this.isActive) return
    
    await this.executeEvent(GameEvent.STEP)
  }

  /**
   * Execute room draw logic (called during rendering when active)
   */
  public async draw(): Promise<void> {
    if (!this.isActive) return
    
    await this.executeEvent(GameEvent.DRAW)
  }

  /**
   * Add a game object to this room
   */
  public addGameObject(gameObject: GameObject): void {
    this.gameObjects.add(gameObject)
  }

  /**
   * Remove a game object from this room
   */
  public removeGameObject(gameObject: GameObject): void {
    this.gameObjects.delete(gameObject)
  }

  /**
   * Get all game objects in this room
   */
  public getGameObjects(): ReadonlySet<GameObject> {
    return this.gameObjects
  }

  /**
   * Check if a position is within room bounds - GameMaker style
   */
  public isPositionInBounds(x: number, y: number): boolean {
    return x >= 0 && 
           x < this.width && 
           y >= 0 && 
           y < this.height
  }

  /**
   * Get game objects at a specific position - GameMaker style
   */
  public getGameObjectsAtPosition(x: number, y: number): GameObject[] {
    return Array.from(this.gameObjects).filter(obj => 
      obj.x === x && obj.y === y
    )
  }

  /**
   * Get game objects of a specific type in this room
   */
  public getGameObjectsByType<T extends GameObject>(type: new (...args: any[]) => T): T[] {
    return Array.from(this.gameObjects)
      .filter((obj): obj is T => obj instanceof type)
  }

  /**
   * Find the first game object of a specific type
   */
  public findGameObjectByType<T extends GameObject>(type: new (...args: any[]) => T): T | undefined {
    for (const obj of this.gameObjects) {
      if (obj instanceof type) {
        return obj as T
      }
    }
    return undefined
  }

  /**
   * Add an event script to this room
   */
  public addEventScript(event: string, script: EventScript): void {
    this.eventScripts.set(event, script)
  }

  /**
   * Remove an event script from this room
   */
  public removeEventScript(event: string): void {
    this.eventScripts.delete(event)
  }

  /**
   * Execute a room event script
   */
  public async executeEvent(event: string, eventData?: any): Promise<void> {
    const script = this.eventScripts.get(event)
    if (script) {
      // Create a dummy game object for room events (rooms don't inherit from GameObject)
      const roomAsGameObject = {
        id: -1,
        x: 0,
        y: 0,
        room: this
      } as any
      
      await script(roomAsGameObject, eventData)
    }
  }

  // Getters
  public get isRoomActive(): boolean {
    return this.isActive
  }

  public get isRoomCreated(): boolean {
    return this.isCreated
  }
}

/**
 * Room manager for handling multiple rooms
 */
export class RoomManager {
  private rooms: Map<string, Room> = new Map()
  private currentRoom?: Room

  constructor() {}

  /**
   * Initialize the room manager
   */
  public initialize(): void {
    // Initialize all existing rooms
    for (const room of this.rooms.values()) {
      room.initialize()
    }
  }

  /**
   * Add a room to the manager
   */
  public addRoom(room: Room): void {
    this.rooms.set(room.name, room)
    
    // Initialize room when added
    room.initialize()
  }

  /**
   * Remove a room from the manager
   */
  public async removeRoom(roomName: string): Promise<void> {
    const room = this.rooms.get(roomName)
    if (room) {
      // Switch away from this room if it's current
      if (this.currentRoom === room) {
        this.currentRoom = undefined
      }
      
      await room.destroy()
      this.rooms.delete(roomName)
    }
  }

  /**
   * Switch to a different room
   */
  public async goToRoom(roomName: string): Promise<boolean> {
    const newRoom = this.rooms.get(roomName)
    if (!newRoom) {
      console.warn(`Room '${roomName}' not found`)
      return false
    }

    // Deactivate and cleanup current room
    if (this.currentRoom) {
      // Fully destroy the room and all its game objects
      await this.currentRoom.destroy()
    }

    // Activate new room
    this.currentRoom = newRoom
    await newRoom.activate()
    
    return true
  }

  /**
   * Get the current active room
   */
  public getCurrentRoom(): Room | undefined {
    return this.currentRoom
  }

  /**
   * Get a room by name
   */
  public getRoom(roomName: string): Room | undefined {
    return this.rooms.get(roomName)
  }

  /**
   * Get all room names
   */
  public getRoomNames(): string[] {
    return Array.from(this.rooms.keys())
  }

  /**
   * Execute step logic for the current room
   */
  public async step(): Promise<void> {
    if (this.currentRoom) {
      await this.currentRoom.step()
    }
  }

  /**
   * Execute draw logic for the current room
   */
  public async draw(): Promise<void> {
    if (this.currentRoom) {
      await this.currentRoom.draw()
    }
  }

  /**
   * Cleanup all rooms
   */
  public async cleanup(): Promise<void> {
    for (const room of this.rooms.values()) {
      await room.destroy()
    }
    this.rooms.clear()
    this.currentRoom = undefined
  }
}
