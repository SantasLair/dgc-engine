import { Room, type RoomConfig, GameEvent } from '../../engine'
import type { Game } from '../Game'

/**
 * Sprite test room for testing Rapid.js drawing functionality
 */
export class SpriteTestRoom extends Room {
  private game: Game
  private animationFrame: number = 0

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'sprite_test',
      width: 20,
      height: 15,
      background: '#1a1a1a',
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
    
    // Create a test object to demonstrate Rapid.js drawing
    const testObject = this.game.createGameObject('sprite_test_object', 0, 0)
    
    // Add step event for animation
    testObject.addEventScript(GameEvent.STEP, (_self) => {
      this.animationFrame += 1
    })
    
    // Add draw event to demonstrate Rapid.js immediate mode rendering
    testObject.addEventScript(GameEvent.DRAW, (_self) => {
      const drawingSystem = this.game.getEngine().getDrawingSystem()
      
      // Test 1: Draw rectangles
      drawingSystem.drawRectangle(50, 50, 150, 100, true, 0xFF0000, 1) // Red filled rectangle
      drawingSystem.drawRectangle(160, 50, 260, 100, false, 0x00FF00, 1) // Green outline rectangle
      
      // Test 2: Draw circles
      drawingSystem.drawCircle(100, 150, 30, true, 0x0000FF, 1) // Blue filled circle
      drawingSystem.drawCircle(200, 150, 30, false, 0xFFFF00, 1) // Yellow outline circle (note: Rapid.js doesn't support outline circles natively)
      
      // Test 3: Draw lines
      drawingSystem.drawLine(50, 200, 250, 200, 0xFFFFFF, 2) // White horizontal line
      drawingSystem.drawLine(150, 180, 150, 220, 0xFFFFFF, 2) // White vertical line
      
      // Test 4: Draw text
      drawingSystem.drawText(50, 250, 'Rapid.js Rendering Test!', 0xFFFFFF, 16, 'Arial')
      drawingSystem.drawText(50, 280, `Frame: ${this.animationFrame}`, 0x00FFFF, 14, 'Arial')
      
      // Test 5: Draw animated sprite (simple colored rectangle)
      const time = this.animationFrame * 0.1
      const x = 300 + Math.sin(time) * 50
      const y = 150 + Math.cos(time) * 30
      drawingSystem.drawSprite(x, y, 1, 1, time * 180 / Math.PI, 0xFF00FF, 1)
      
      // Test 6: Draw arrow
      drawingSystem.drawArrow(50, 320, 200, 350, 15, 0x00FF00)
      
      // Test 7: Draw health bar
      const healthPercent = (Math.sin(time) + 1) / 2 // Animate between 0 and 1
      drawingSystem.drawHealthbar(50, 380, 250, 400, healthPercent, 0x333333, 0xFF0000, 0x00FF00)
      
      // Add health percentage text
      drawingSystem.drawText(260, 385, `${Math.round(healthPercent * 100)}%`, 0xFFFFFF, 12, 'Arial')
    })
    
    console.log('✅ SpriteTestRoom: Test objects created with Rapid.js rendering')
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
