import { DGCGame } from '../engine'
import type { DGCEngineConfig } from '../engine'
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
    
    // Create and add the hardcoded sprite test room
    const spriteTestRoom = new SpriteMoveTestRoom(this)
    this.addRoom(spriteTestRoom)
    
    // Go to the sprite test room (room will create its own objects)
    await this.goToRoom('sprite_move_test')
  }

  /**
   * Get the current game instance (for compatibility)
   */
  public getGame(): Game {
    return this
  }
}
