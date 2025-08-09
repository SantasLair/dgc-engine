import { DGCGame } from '../engine'
import type { DGCEngineConfig } from '../engine'
import { Player } from './gameobjects'
import { Color } from 'rapid-render'

/**
 * Simplified main game class extending DGCGame directly
 */
export class Game extends DGCGame {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  /**
   * Get engine configuration
   */
  protected getEngineConfig(): DGCEngineConfig {
    return {
      targetFPS: 60,
      rapidConfig: {
        backgroundColor: Color.fromHex("#1a1a1a")
      }
    }
  }

  /**
   * Setup the game with object types and initial room
   */
  protected async setupGame(): Promise<void> {
    console.log('🎮 Setting up simplified Game')
    
    // Register object types that can be created from JSON data
    this.setupObjectTypes()
    
    // Load the initial room
    await this.goToRoom('main_menu')
  }

  /**
   * Register object types for JSON instantiation
   */
  private setupObjectTypes(): void {
    // Register Player class so it can be instantiated from room data
    const roomManager = this.getRoomManager()
    const factory = roomManager.getFactory()
    factory.registerObjectType('Player', Player)
    
    console.log('📝 Registered object types: Player')
  }

  /**
   * Load a room by name from JSON data
   */
  public async goToRoom(roomName: string): Promise<void> {
    try {
      console.log(`🚪 Loading room: ${roomName}`)
      
      const roomManager = this.getRoomManager()
      
      // First, try to load the room from file if it doesn't exist
      const existingRoom = roomManager.getRoom(roomName)
      if (!existingRoom) {
        console.log(`📁 Loading room from file: ${roomName}.json`)
        const factory = roomManager.getFactory()
        const room = await factory.createRoomFromFile(roomName)
        console.log(`✅ Room file loaded successfully: ${roomName}.json`)
        roomManager.addRoom(room)
      }
      
      console.log(`🚀 Switching to room: ${roomName}`)
      const success = await roomManager.goToRoom(roomName)
      
      if (success) {
        console.log(`✅ Successfully switched to room: ${roomName}`)
      } else {
        console.error(`❌ Failed to switch to room: ${roomName}`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to load room ${roomName}:`, error)
    }
  }

  /**
   * Get the current game instance (for compatibility)
   */
  public getGame(): Game {
    return this
  }
}
