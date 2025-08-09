/**
 * Demo Game Class with Data-Driven Room Support
 * 
 * Example showing how to use the new room data system alongside
 * traditional custom room classes.
 */

import { GridGame } from './GridGame'
import type { GridGameConfig } from './GridGameConfig'
import { GameRoom, MenuRoom } from './rooms'
import { Player, Enemy, GameBoard } from './gameobjects'

export class DemoGame extends GridGame {
  private currentRoomName: string = 'sprite_demo' // Changed to test sprite demo directly

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  public getGridConfig(): GridGameConfig {
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
    console.log('🎮 Current working directory and config check')
    
    try {
      // Room manager is already initialized in the base DGCGame class
      console.log('✅ RoomManager available from engine')
      
      // Register object types that can be created in data-driven rooms
      console.log('🏗️ Setting up object types...')
      this.setupObjectTypes()
      console.log('✅ Object types registered')
      
      // Register custom room classes (optional)
      console.log('🏗️ Setting up custom room classes...')
      this.setupCustomRoomClasses()
      console.log('✅ Custom room classes registered')
      
      // Setup rooms (mix of data-driven and custom classes)
      console.log('🏗️ Setting up rooms...')
      await this.setupRooms()
      console.log('✅ Rooms setup completed')
      
      // Start with the sprite demo for testing
      console.log('🎮 About to load sprite_demo room...')
      const success = await this.goToRoom('sprite_demo')
      if (success) {
        console.log('✅ Successfully loaded sprite_demo room')
      } else {
        console.error('❌ Failed to load sprite_demo room')
        // Try fallback to main_menu
        console.log('🔄 Trying main_menu as fallback...')
        await this.goToRoom('main_menu')
      }
    } catch (error) {
      console.error('❌ Error in setupGame:', error)
      throw error
    }
    
    console.log('🎮 Enhanced game setup complete')
  }

  /**
   * Register object types that can be created in room data files
   */
  private setupObjectTypes(): void {
    console.log('🏭 Registering object types...')
    const factory = this.roomManager.getFactory()
    
    // Register all game object types
    factory.registerObjectType('Player', Player)
    console.log('✅ Registered Player class')
    factory.registerObjectType('Enemy', Enemy)
    console.log('✅ Registered Enemy class')
    factory.registerObjectType('GameBoard', GameBoard)
    console.log('✅ Registered GameBoard class')
    
    console.log('🏭 Registered object types: Player, Enemy, GameBoard')
  }

  /**
   * Register custom room classes for specialized behavior
   */
  private setupCustomRoomClasses(): void {
    const factory = this.roomManager.getFactory()
    
    // Register custom room classes (only needed for special behavior)
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
      // Load data-driven rooms from JSON files
      await this.roomManager.addRoomFromFile('main_menu.json')
      await this.roomManager.addRoomFromFile('test_level.json')
      await this.roomManager.addRoomFromFile('sprite_demo.json')
      
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
    
    return factory.exportRoomDataAsJson(roomData)
  }
}
