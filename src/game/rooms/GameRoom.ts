import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Simplified Game Room for basic functionality testing
 */
export class GameRoom extends Room {
  constructor(_game: Game) {
    const config: RoomConfig = {
      name: 'game',
      width: 800,
      height: 600
    }
    super(config)
    // Store game reference for future use
    console.log('GameRoom initialized with game instance')
  }

  public async onRoomStart(): Promise<void> {
    console.log('🎮 Game Room Started')
    // Basic initialization without complex game logic
  }

  public async onRoomUpdate(): Promise<void> {
    // Basic update logic
  }

  public onRoomEnd(): void {
    console.log('🎮 Game Room Ended')
  }
}
