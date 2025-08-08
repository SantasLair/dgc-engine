import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Simplified Menu Room for basic functionality testing
 */
export class MenuRoom extends Room {
  constructor(_game: Game) {
    const config: RoomConfig = {
      name: 'menu',
      width: 800,
      height: 600
    }
    super(config)
    // Store game reference for future use
    console.log('MenuRoom initialized with game instance')
  }

  public async onRoomStart(): Promise<void> {
    console.log('🏠 Menu Room Started')
  }

  public async onRoomUpdate(): Promise<void> {
    // Basic update logic
  }

  public onRoomEnd(): void {
    console.log('🏠 Menu Room Ended')
  }
}
