import { GameObject, GameEvent, type EventScript } from './GameObject'
import { SpriteManager, type SpriteLoadConfig } from './SpriteManager'
import { RoomFactory, type RoomFactoryConfig, type RoomData } from './RoomFactory'

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
  /** Sprites to load for this room */
  sprites?: SpriteLoadConfig[]
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
export class DGCRoom {
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
  
  /** Sprite manager for this room */
  private spriteManager: SpriteManager = new SpriteManager()
  
  /** Sprites to load for this room */
  private requiredSprites: SpriteLoadConfig[] = []
  
  /** Room state */
  private isActive: boolean = false
  private isCreated: boolean = false

  constructor(config: RoomConfig) {
    this.name = config.name
    this.width = config.width
    this.height = config.height
    this.background = config.background
    
    // Store required sprites
    this.requiredSprites = config.sprites || []
    
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
    
    // Load required sprites for this room
    if (this.requiredSprites.length > 0) {
      console.log(`🏠 Loading ${this.requiredSprites.length} sprites for room: ${this.name}`)
      await this.spriteManager.loadSprites(this.requiredSprites)
    }
    
    // Now that sprites are loaded, resolve sprite names to sprite objects for all game objects
    this.resolveSpriteReferences()
    
    // Call preload hook for custom room setup
    await this.preload()
    
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
    
    // Unload sprites to free memory
    if (this.requiredSprites.length > 0) {
      const spriteNames = this.requiredSprites.map(s => s.name)
      this.spriteManager.unloadSprites(spriteNames)
      console.log(`🧹 Unloaded ${spriteNames.length} sprites from room: ${this.name}`)
    }
  }

  /**
   * Preload room assets and setup game objects
   * Override this method in subclasses to customize room initialization
   */
  protected async preload(): Promise<void> {
    // Default implementation - can be overridden by subclasses
    console.log(`🔄 Room ${this.name} preload complete (default implementation)`)
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
  
  /**
   * Get a loaded sprite by name (for game objects to use)
   */
  public getSprite(name: string): any {
    return this.spriteManager.getSprite(name)
  }
  
  /**
   * Check if a sprite is loaded in this room
   */
  public hasSprite(name: string): boolean {
    return this.spriteManager.hasSprite(name)
  }
  
  /**
   * Resolve sprite name references to actual sprite objects for all game objects
   * Called after sprites are loaded but before room create event
   */
  private resolveSpriteReferences(): void {
    console.log(`🎨 Resolving sprite references for ${this.gameObjects.size} objects in room: ${this.name}`)
    
    for (const gameObject of this.gameObjects) {
      console.log(`🔍 Checking object: ${gameObject.objectType} sprite property:`, (gameObject as any).sprite)
      
      // Check if the object has a sprite property that's a string (sprite name)
      if (typeof (gameObject as any).sprite === 'string') {
        const spriteName = (gameObject as any).sprite as string
        const spriteObject = this.getSprite(spriteName)
        
        if (spriteObject) {
          (gameObject as any).sprite = spriteObject
          console.log(`🎨 Resolved sprite '${spriteName}' for ${gameObject.objectType}`)
        } else {
          // Set sprite to null so the object knows it doesn't have a sprite
          (gameObject as any).sprite = null
        }
      }
    }
  }
}

/**
 * Room manager for handling multiple rooms
 */
/**
 * Room Manager with Data-Driven Room Support
 * 
 * Manages room lifecycle and supports both traditional Room classes
 * and data-driven room creation from JSON files.
 */
export class RoomManager {
  private rooms: Map<string, DGCRoom> = new Map()
  private currentRoom?: DGCRoom
  private roomFactory: RoomFactory
  private gameInstance?: any  // Reference to the game instance for adding/removing objects

  constructor(factoryConfig?: RoomFactoryConfig) {
    this.roomFactory = new RoomFactory(factoryConfig)
  }

  /**
   * Set the game instance for object management
   */
  public setGameInstance(game: any): void {
    this.gameInstance = game
  }

  /**
   * Get the room factory for registering object types and room classes
   */
  public getFactory(): RoomFactory {
    return this.roomFactory
  }

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
  public addRoom(room: DGCRoom): void {
    this.rooms.set(room.name, room)
    
    // Initialize room when added
    room.initialize()
  }

  /**
   * Create and add a room from data
   */
  public addRoomFromData(roomData: RoomData): Room {
    const room = this.roomFactory.createRoomFromData(roomData)
    this.addRoom(room)
    return room
  }

  /**
   * Create and add a room from a data file
   */
  public async addRoomFromFile(filename: string): Promise<Room> {
    const room = await this.roomFactory.createRoomFromFile(filename)
    this.addRoom(room)
    return room
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
      // Remove all game objects from the engine
      if (this.gameInstance) {
        for (const gameObject of this.currentRoom.getGameObjects()) {
          this.gameInstance.removeGameObject(gameObject)
        }
        console.log(`🧹 Removed ${this.currentRoom.getGameObjects().size} objects from engine`)
      }
      
      // Fully destroy the room and all its game objects
      await this.currentRoom.destroy()
    }

    // Activate new room
    this.currentRoom = newRoom
    await newRoom.activate()
    
    // Add all game objects from the new room to the engine
    if (this.gameInstance) {
      for (const gameObject of newRoom.getGameObjects()) {
        this.gameInstance.addGameObject(gameObject)
      }
      console.log(`🎮 Added ${newRoom.getGameObjects().size} objects to engine for room: ${roomName}`)
      
      // Additional verification
      if (newRoom.getGameObjects().size > 0) {
        console.log('🎯 SPRITE RENDERING FIX: Objects successfully transferred to engine!')
        for (const obj of newRoom.getGameObjects()) {
          console.log(`  - ${obj.objectType} at (${obj.x}, ${obj.y}) with sprite:`, (obj as any).sprite)
        }
      }
    }
    
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
