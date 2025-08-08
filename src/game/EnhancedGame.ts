/**
 * Enhanced Game Class with Data-Driven Room Support
 * 
 * Example showing how to use the new room data system alongside 
 * traditional custom room classes.
 */

import { DGCGame, type DGCEngineConfig, RoomManager } from '../engine'
import { GameRoom, MenuRoom, SpriteTestRoom } from './rooms'
import { Player, Enemy, GameBoard } from './gameobjects'

export class EnhancedGame extends DGCGame {
  public roomManager!: RoomManager
  private currentRoomName: string = 'main_menu'

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  public getEngineConfig(): DGCEngineConfig {
    return {
      gridWidth: 20,
      gridHeight: 15,
      targetFPS: 60,
      cellSize: 30,
      gridOffset: { x: 50, y: 50 }
    }
  }

  public async setupGame(): Promise<void> {
    console.log('🎮 Setting up enhanced game with data-driven rooms...')
    
    // Initialize room manager with factory configuration
    this.roomManager = new RoomManager({
      dataPath: '/data/rooms/',
      objectTypes: new Map(),
      roomClasses: new Map()
    })
    
    // Register object types that can be created in data-driven rooms
    this.setupObjectTypes()
    
    // Register custom room classes (optional)
    this.setupCustomRoomClasses()
    
    // Setup rooms (mix of data-driven and custom classes)
    await this.setupRooms()
    
    // Start with the main menu
    await this.goToRoom('main_menu')
    
    console.log('🎮 Enhanced game setup complete')
  }

  /**
   * Register object types that can be created in room data files
   */
  private setupObjectTypes(): void {
    const factory = this.roomManager.getFactory()
    
    // Register all game object types
    factory.registerObjectType('Player', Player)
    factory.registerObjectType('Enemy', Enemy)
    factory.registerObjectType('GameBoard', GameBoard)
    
    console.log('🏭 Registered object types: Player, Enemy, GameBoard')
  }

  /**
   * Register custom room classes for specialized behavior
   */
  private setupCustomRoomClasses(): void {
    const factory = this.roomManager.getFactory()
    
    // Register custom room classes (only needed for special behavior)
    factory.registerRoomClass('SpriteTestRoom', SpriteTestRoom)
    factory.registerRoomClass('GameRoom', GameRoom)
    factory.registerRoomClass('MenuRoom', MenuRoom)
    
    console.log('🏭 Registered custom room classes')
  }

  /**
   * Setup rooms using both data files and custom classes
   */
  private async setupRooms(): Promise<void> {
    console.log('🏠 Setting up rooms...')
    
    try {
      // Load data-driven rooms from TOML files (automatically copied from src/game/rooms/data/)
      await this.roomManager.addRoomFromFile('main_menu.toml')
      await this.roomManager.addRoomFromFile('test_level.toml')
      await this.roomManager.addRoomFromFile('sprite_demo.toml')
      
      console.log('✅ Loaded data-driven rooms: main_menu, test_level, sprite_demo')
      
      // Add traditional custom room classes if needed
      // const gameRoom = new GameRoom(this)
      // this.roomManager.addRoom(gameRoom)
      
    } catch (error) {
      console.error('❌ Error loading room data files:', error)
      
      // Fallback to traditional rooms if data files fail
      console.log('🔄 Falling back to traditional room creation')
      this.setupTraditionalRooms()
    }
  }

  /**
   * Fallback method for traditional room setup
   */
  private setupTraditionalRooms(): void {
    // Create simple rooms without requiring Game parameter
    // This is a fallback when data files fail to load
    
    console.log('🔄 Creating fallback rooms with minimal configuration')
    
    // For now, we'll skip the fallback since our data files should work
    // In a production app, you could create minimal Room instances here
    console.log('⚠️ Data-driven room loading failed - implement fallback if needed')
  }

  /**
   * Switch to a different room
   */
  public async goToRoom(roomName: string): Promise<boolean> {
    try {
      console.log(`🚪 Switching to room: ${roomName}`)
      const success = await this.roomManager.goToRoom(roomName)
      
      if (success) {
        this.currentRoomName = roomName
        console.log(`✅ Successfully switched to room: ${roomName}`)
      } else {
        console.error(`❌ Failed to switch to room: ${roomName}`)
      }
      
      return success
    } catch (error) {
      console.error(`❌ Error switching to room '${roomName}':`, error)
      return false
    }
  }

  /**
   * Get the current room name
   */
  public getCurrentRoomName(): string {
    return this.currentRoomName
  }

  /**
   * Get the current room (for compatibility with existing room classes)
   */
  public getCurrentRoom(): any {
    return this.roomManager.getCurrentRoom()
  }

  /**
   * Get the room manager (for compatibility with existing room classes)
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }

  /**
   * Get all available room names
   */
  public getAvailableRooms(): string[] {
    return this.roomManager.getRoomNames()
  }

  /**
   * Create a new room from data at runtime
   */
  public async createDynamicRoom(roomName: string, width: number, height: number): Promise<void> {
    const factory = this.roomManager.getFactory()
    
    // Create room data template
    const roomData = factory.createRoomDataTemplate(roomName, width, height)
    
    // Customize the room data
    roomData.background = { type: 'color', value: '#34495e' }
    roomData.objects = [
      {
        objectType: 'Player',
        position: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
        properties: { health: 100 },
        instanceName: 'dynamic_player'
      }
    ]
    
    // Add the room
    this.roomManager.addRoomFromData(roomData)
    console.log(`🏗️ Created dynamic room: ${roomName}`)
  }

  /**
   * Export current room data (for level editor functionality)
   */
  public exportCurrentRoomData(): string | null {
    const currentRoom = this.roomManager.getCurrentRoom()
    if (!currentRoom) {
      console.warn('No current room to export')
      return null
    }
    
    const factory = this.roomManager.getFactory()
    
    // Create room data from current room state
    const roomData = factory.createRoomDataTemplate(
      currentRoom.name,
      currentRoom.width,
      currentRoom.height
    )
    
    return factory.exportRoomData(roomData)
  }
}
