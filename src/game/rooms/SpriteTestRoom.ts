import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'
import * as PIXI from 'pixi.js'

/**
 * Sprite test room for testing sprite functionality with direct PIXI access via DGC Engine
 */
export class SpriteTestRoom extends Room {
  private game: Game
  private testSprites: PIXI.Container | null = null

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
    
    // Get direct access to PIXI for advanced sprite functionality through DGC Engine
    const pixiApp = this.game.getPixiApp()
    const layers = this.game.getLayers()
    
    // Create a container for our test sprites
    this.testSprites = new PIXI.Container()
    this.testSprites.name = 'SpriteTestContainer'
    
    // Add to the game layer
    layers.game.addChild(this.testSprites)
    
    // Create some test sprites using PIXI directly
    await this.createTestSprites(pixiApp)
    
    console.log('🏠 SpriteTestRoom: Sprite test room created with PIXI sprites!')
  }

  /**
   * Create various test sprites to demonstrate PIXI capabilities
   */
  private async createTestSprites(pixiApp: PIXI.Application): Promise<void> {
    if (!this.testSprites) return

    // Get canvas dimensions for debugging
    const canvasWidth = pixiApp.canvas.width
    const canvasHeight = pixiApp.canvas.height
    console.log(`🎯 SpriteTestRoom: Canvas size is ${canvasWidth}x${canvasHeight} (mobile portrait)`)

    // Test 1: Simple colored rectangle (upper area)
    const rect = new PIXI.Graphics()
    rect.rect(80, 120, 100, 60)
    rect.fill(0x66CCFF)
    rect.stroke({ width: 2, color: 0x4444CC })
    this.testSprites.addChild(rect)
    console.log(`🎯 Blue rect at (80, 120)`)

    // Test 2: Circle with gradient (upper right)
    const circle = new PIXI.Graphics()
    circle.circle(200, 180, 35)
    circle.fill(0xFF6666)
    this.testSprites.addChild(circle)
    console.log(`🎯 Red circle at (200, 180)`)

    // Test 3: Text sprite (top center)
    const text = new PIXI.Text({
      text: 'PIXI.js Mobile Portrait!',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xFFFFFF,
        align: 'center'
      }
    })
    text.x = 60
    text.y = 80
    this.testSprites.addChild(text)
    console.log(`🎯 Text at (60, 80)`)

    // Test 4: Animated sprite (middle area)
    const animatedRect = new PIXI.Graphics()
    animatedRect.rect(150, 300, 50, 50)
    animatedRect.fill(0x00FF00)
    this.testSprites.addChild(animatedRect)
    console.log(`🎯 Green animated rect at (150, 300)`)

    // Add animation using PIXI's ticker
    let rotation = 0
    pixiApp.ticker.add(() => {
      rotation += 0.02
      animatedRect.rotation = rotation
      
      // Pulsing effect
      const scale = 1 + Math.sin(rotation * 2) * 0.2
      animatedRect.scale.set(scale)
    })

    // Test 5: Interactive sprite (lower area)
    const interactiveSprite = new PIXI.Graphics()
    interactiveSprite.rect(100, 450, 80, 40)
    interactiveSprite.fill(0xFFAA00)
    interactiveSprite.eventMode = 'static'
    interactiveSprite.cursor = 'pointer'
    
    interactiveSprite.on('pointerdown', () => {
      interactiveSprite.tint = 0xFF0000
      console.log('🎯 Interactive sprite clicked!')
    })
    
    interactiveSprite.on('pointerup', () => {
      interactiveSprite.tint = 0xFFFFFF
    })
    
    this.testSprites.addChild(interactiveSprite)
    console.log(`🎯 Orange interactive rect at (100, 450)`)

    console.log('✨ Created test sprites for mobile portrait layout with PIXI features')
  }

  /**
   * Called when the room is being destroyed/deactivated
   */
  private async onDestroyRoom(): Promise<void> {
    console.log('🏠 SpriteTestRoom: onDestroyRoom() called')
    
    // Clean up PIXI sprites
    if (this.testSprites) {
      // Remove from parent and destroy
      this.testSprites.parent?.removeChild(this.testSprites)
      this.testSprites.destroy({
        children: true,
        texture: false // Keep textures for reuse
      })
      this.testSprites = null
    }
    
    console.log('🏠 SpriteTestRoom: Sprite test room destroyed and cleaned up')
  }
}
