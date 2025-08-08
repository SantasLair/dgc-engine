import { Room, type RoomConfig, GameEvent, type SpriteLoadConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Sprite test room for testing Rapid.js drawing functionality
 */
export class SpriteTestRoom extends Room {
  private game: Game
  private animationFrame: number = 0

  constructor(game: Game) {
    // Define test sprites for this room
    const testSprites: SpriteLoadConfig[] = [
      {
        name: 'test_sprite',
        source: '/vite.svg', // Use the existing vite.svg as a test sprite
        frames: 1,
        frameWidth: 32,
        frameHeight: 32,
        origin: { x: 0.5, y: 0.5 }
      }
    ]

    const config: RoomConfig = {
      name: 'sprite_test',
      width: 20,
      height: 15,
      background: '#1a1a1a',
      sprites: testSprites, // Room will automatically load these sprites
      onCreate: async (_gameObject) => await this.onCreateRoom(),
      onDestroy: async (_gameObject) => await this.onDestroyRoom()
    }
    
    super(config)
    this.game = game
  }

  /**
   * Called when the room is created/activated
   */
  private async onCreateRoom(): Promise<void> {
    console.log('🏠 SpriteTestRoom: onCreateRoom() called')
    console.log('🎯 Sprites loaded for room:', this.getSprite('test_sprite') ? 'test_sprite ✅' : 'test_sprite ❌')
    
    // Create a test object to demonstrate the new sprite system
    const spriteTestObject = this.game.createGameObject('sprite_test_object', 200, 150)
    
    // Get the loaded sprite from this room
    const testSprite = this.getSprite('test_sprite')
    if (testSprite) {
      // Assign the sprite to the game object
      spriteTestObject.sprite = testSprite
      console.log('✅ Sprite assigned to game object')
    }
    
    // Add step event for animation and movement
    spriteTestObject.addEventScript(GameEvent.STEP, (self) => {
      this.animationFrame += 1
      
      // Move the sprite object in a circle
      const time = this.animationFrame * 0.02
      self.x = 200 + Math.cos(time) * 80
      self.y = 150 + Math.sin(time) * 50
      
      // Rotate the sprite
      self.imageAngle = this.animationFrame * 2
      
      // Scale animation
      const scale = 1 + Math.sin(time * 2) * 0.3
      self.imageXScale = scale
      self.imageYScale = scale
    })
    
    // Add draw event - GameMaker style: manually call draw_self()
    spriteTestObject.addEventScript(GameEvent.DRAW, (self) => {
      const drawingSystem = this.game.getEngine().getDrawingSystem()
      
      // Draw some background elements first
      drawingSystem.drawRectangle(50, 50, 150, 100, true, 0xFF0000, 1)
      drawingSystem.drawText(50, 120, 'Background Elements', 0xFFFFFF, 14, 'Arial')
      
      // GameMaker-style: draw_self() renders the object's sprite
      self.drawSelf()
      
      // Draw UI elements on top
      drawingSystem.drawText(self.x - 30, self.y + 30, 'Sprite Object!', 0x00FFFF, 12, 'Arial')
      drawingSystem.drawText(50, 200, `Frame: ${this.animationFrame}`, 0x00FFFF, 12, 'Arial')
      drawingSystem.drawText(50, 220, `Pos: (${Math.round(self.x)}, ${Math.round(self.y)})`, 0x00FFFF, 12, 'Arial')
      drawingSystem.drawText(50, 240, `Angle: ${Math.round(self.imageAngle)}°`, 0x00FFFF, 12, 'Arial')
    })
    
    // Create another test object to show regular drawing without sprites
    const regularObject = this.game.createGameObject('regular_object', 300, 300)
    regularObject.addEventScript(GameEvent.DRAW, (_self) => {
      const drawingSystem = this.game.getEngine().getDrawingSystem()
      
      // Regular drawing without sprites
      drawingSystem.drawCircle(300, 300, 20, true, 0x00FF00, 1)
      drawingSystem.drawText(280, 330, 'No Sprite', 0xFFFFFF, 12, 'Arial')
    })
    
    console.log('✅ SpriteTestRoom: Test objects created with sprite system demo')
  }

  /**
   * Called when the room is destroyed/deactivated
   */
  private async onDestroyRoom(): Promise<void> {
    console.log('� SpriteTestRoom: onDestroyRoom() called')
    
    // Reset animation frame
    this.animationFrame = 0
    
    console.log('✅ SpriteTestRoom: Cleanup completed')
  }

  /**
   * Handle room-specific input (override from base Room class)
   */
  public handleInput(): void {
    // Space key to reset animation
    if (this.game.isKeyJustPressed('Space')) {
      this.animationFrame = 0
      console.log('🔄 SpriteTestRoom: Animation reset')
    }
    
    // R key to restart room
    if (this.game.isKeyJustPressed('KeyR')) {
      console.log('🔄 SpriteTestRoom: Restarting room...')
      // Restart logic would go here
    }
  }

  /**
   * Get instructions for this room
   */
  public getInstructions(): string[] {
    return [
      'Sprite Test Room - Rapid.js Rendering Demo',
      '',
      'This room demonstrates Rapid.js immediate mode rendering:',
      '• Red/Green rectangles (filled/outline)',
      '• Blue circle (filled)',
      '• White cross lines',
      '• Text rendering with animation counter',
      '• Animated rotating sprite',
      '• Arrow drawing',
      '• Animated health bar',
      '',
      'Controls:',
      'SPACE - Reset animation',
      'R - Restart room',
      'ESC - Return to menu'
    ]
  }
}
