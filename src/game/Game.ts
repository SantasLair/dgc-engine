import { GridGame } from './GridGame'
import type { GridGameConfig } from './GridGameConfig'
import { GameRoom, MenuRoom } from './rooms'

/**
 * Main game class with room management functionality
 */
export class Game extends GridGame {
  private currentRoomName: string = 'game'

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
    console.log('🎮 Setting up game with room management...')
    
    // Room manager is already initialized in the base DGCGame class
    console.log('✅ RoomManager available from engine')
    
    // Create and register rooms
    this.setupRooms()
    
    // Start with the game room
    await this.goToRoom('game')
    
    console.log('🎮 Game setup complete with room management')
  }

  private setupRooms(): void {
    console.log('🏠 Setting up rooms...')
    
    // Create room instances
    const gameRoom = new GameRoom(this)
    const menuRoom = new MenuRoom(this)

    // Add rooms to manager
    this.roomManager.addRoom(gameRoom)
    this.roomManager.addRoom(menuRoom)
    
    console.log('🏠 Rooms registered: game, menu')
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
   * Get the current room
   */
  public getCurrentRoom(): any {
    return this.roomManager.getCurrentRoom()
  }

  /**
   * Get the current room name
   */
  public getCurrentRoomName(): string {
    return this.currentRoomName
  }
}
