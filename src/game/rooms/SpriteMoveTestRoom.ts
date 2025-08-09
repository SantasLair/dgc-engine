import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'
import { Player } from '../gameobjects'

/**
 * Sprite Movement Test Room
 * Simple hardcoded room for testing sprite movement without JSON dependencies
 */
export class SpriteMoveTestRoom extends Room {
  private game: Game

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'sprite_move_test',
      width: 800,
      height: 600,
      background: '#1a1a1a',
      sprites: [
        {
          name: 'pixel_player_sprite',
          source: '/images/pixel-player.png',
          frameWidth: 32,
          frameHeight: 32
        },
        {
          name: 'logo_sprite',
          source: '/images/platformChar_idle.png',
          frameWidth: 32,
          frameHeight: 32
        },
        {
          name: 'button_sprite',
          source: '/images/platformerPack_character@2.png',
          frameWidth: 32,
          frameHeight: 32
        }
      ]
    }
    super(config)
    
    this.game = game
    console.log('🏠 SpriteMoveTestRoom created')
  }

  /**
   * Preload hook - called after sprites are loaded but before room creation
   */
  protected async preload(): Promise<void> {
    console.log('🔄 SpriteMoveTestRoom preload - creating game objects with sprites')
    
    // Create the test player
    const testPlayer = new Player(200, 150)
    testPlayer.visible = true
    this.game.addGameObject(testPlayer)
    
    // Assign sprite to player (sprites are guaranteed to be loaded at this point)
    const pixelPlayerSprite = this.getSprite('pixel_player_sprite')
    if (pixelPlayerSprite) {
      testPlayer.sprite = pixelPlayerSprite
      console.log('🎮 Player created with pixel-player sprite at (200, 150)')
    } else {
      console.warn('⚠️ pixel_player_sprite not found, falling back to logo_sprite')
      const logoSprite = this.getSprite('logo_sprite')
      if (logoSprite) {
        testPlayer.sprite = logoSprite
        console.log('🎮 Player created with fallback logo sprite')
      } else {
        console.error('❌ No sprites available for player!')
      }
    }
  }

  public async onRoomStart(): Promise<void> {
    console.log('� SpriteMoveTestRoom started - all setup complete')
  }

  public async onRoomUpdate(): Promise<void> {
    // Room update logic if needed
  }

  public onRoomEnd(): void {
    console.log('🏠 SpriteMoveTestRoom ended')
  }
}
