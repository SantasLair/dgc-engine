import { DGCGame } from '../engine'
import type { DGCEngineConfig } from '../engine'
import { Player } from './gameobjects'
import { SpriteMoveTestRoom } from './rooms/SpriteMoveTestRoom'
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
    
    // Create and add the hardcoded sprite test room
    const spriteTestRoom = new SpriteMoveTestRoom(this)
    this.roomManager.addRoom(spriteTestRoom)
    
    // Go to the sprite test room (room will create its own objects)
    await this.roomManager.goToRoom('sprite_move_test')
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
   * Switch to a room by name (simplified for hardcoded rooms)
   */
  public async goToRoom(roomName: string): Promise<void> {
    try {
      console.log(`🚪 Switching to room: ${roomName}`)
      
      const success = await this.roomManager.goToRoom(roomName)
      
      if (success) {
        console.log(`✅ Successfully switched to room: ${roomName}`)
      } else {
        console.error(`❌ Failed to switch to room: ${roomName} - room not found`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to switch to room ${roomName}:`, error)
    }
  }

  /**
   * Get the current game instance (for compatibility)
   */
  public getGame(): Game {
    return this
  }
}
