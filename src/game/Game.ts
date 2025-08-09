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
    
    // Start with main menu first to test basic room loading
    await this.goToRoom('main_menu')
    
    // Create a test player for the demo - use regular Player first to confirm visibility
    console.log('🎮 Creating regular Player to test visibility')
    const testPlayer = new Player(200, 150)
    testPlayer.visible = true
    this.addGameObject(testPlayer)
    
    // Set the player sprite to pixel-player
    const currentRoom = this.roomManager.getCurrentRoom()
    if (currentRoom) {
      const pixelPlayerSprite = currentRoom.getSprite('pixel_player_sprite')
      if (pixelPlayerSprite) {
        testPlayer.sprite = pixelPlayerSprite
        console.log('🎮 Player ready with pixel-player sprite at (200, 150)')
      } else {
        console.warn('⚠️ pixel_player_sprite not found, falling back to logo_sprite')
        const logoSprite = currentRoom.getSprite('logo_sprite')
        if (logoSprite) {
          testPlayer.sprite = logoSprite
          console.log('🎮 Player using fallback logo sprite')
        }
      }
    }
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
        try {
          await roomManager.addRoomFromFile(`${roomName}.json`)
          console.log(`✅ Room file loaded successfully: ${roomName}.json`)
        } catch (fileError) {
          console.error(`❌ Failed to load room file ${roomName}.json:`, fileError)
          throw fileError
        }
      } else {
        console.log(`♻️  Room ${roomName} already loaded`)
      }
      
      // Now try to go to the room
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
