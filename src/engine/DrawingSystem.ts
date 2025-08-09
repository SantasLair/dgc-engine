import { Rapid, Color, Vec2 } from 'rapid-render'
import { Sprite } from './Sprite.ts'

/**
 * GameMaker-style drawing system using Rapid.js
 * Provides immediate drawing functions like draw_sprite(), draw_line(), etc.
 * Uses Rapid.js's native immediate mode rendering which aligns perfectly with GameMaker's draw events
 */
export class DrawingSystem {
  private rapid: Rapid
  
  constructor(rapid: Rapid) {
    this.rapid = rapid
  }
  
  /**
   * Clear all drawings from the previous frame (handled by Rapid.js automatically)
   * This method is kept for API compatibility but Rapid.js handles frame clearing
   */
  public clearFrame(): void {
    // Rapid.js handles frame clearing automatically in its render loop
    // This method is kept for compatibility with the existing API
  }
  
  /**
   * GameMaker-style draw_sprite equivalent for actual sprites
   */
  public drawSpriteFromSprite(sprite: Sprite, x: number, y: number, _frame: number = 0, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, _alpha: number = 1): void {
    if (!sprite.isLoaded()) {
      console.warn(`⚠️ Sprite ${sprite.name} not loaded yet`)
      return
    }
    
    // Use direct screen coordinates (no grid conversion)
    const screenX = x
    const screenY = y
    
    try {
      // Create texture from the sprite's image
      this.rapid.textures.textureFromSource(sprite.image, true).then(texture => {
        // Calculate draw position with origin offset
        const originOffsetX = sprite.frameWidth * sprite.origin.x * scaleX
        const originOffsetY = sprite.frameHeight * sprite.origin.y * scaleY
        const drawX = screenX - originOffsetX
        const drawY = screenY - originOffsetY
        
        // Render the sprite texture
        this.rapid.renderSprite({
          texture: texture,
          offset: new Vec2(drawX, drawY),
          scale: new Vec2(scaleX, scaleY),
          rotation: rotation * Math.PI / 180
        })
      }).catch(error => {
        console.error(`❌ Failed to create texture for sprite ${sprite.name}:`, error)
        // Fallback: render a colored rectangle
        this.rapid.renderRect({
          offset: new Vec2(screenX, screenY),
          width: sprite.frameWidth * scaleX,
          height: sprite.frameHeight * scaleY,
          color: this.hexToRapidColor(0x00FFFF), // Cyan fallback
          rotation: rotation * Math.PI / 180
        })
      })
    } catch (error) {
      console.error(`❌ Error in drawSpriteFromSprite for ${sprite.name}:`, error)
      // Fallback: render a colored rectangle
      this.rapid.renderRect({
        offset: new Vec2(screenX, screenY),
        width: sprite.frameWidth * scaleX,
        height: sprite.frameHeight * scaleY,
        color: this.hexToRapidColor(0x00FFFF), // Cyan fallback
        rotation: rotation * Math.PI / 180
      })
    }
  }
  
  /**
   * GameMaker-style draw_sprite equivalent (legacy - uses colored rectangle)
   */
  public drawSprite(x: number, y: number, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, color: number = 0xFFFFFF, alpha: number = 1): void {
    // Create a simple colored rectangle as a sprite placeholder
    // In a real implementation, you would load and use actual sprite textures
    const rapidColor = this.hexToRapidColor(color, alpha)
    
    this.rapid.renderRect({
      offset: new Vec2(x, y),
      width: 20 * scaleX,
      height: 20 * scaleY,
      color: rapidColor,
      rotation: rotation * Math.PI / 180
    })
  }
  
  /**
   * GameMaker-style draw_line equivalent
   */
  public drawLine(x1: number, y1: number, x2: number, y2: number, color: number = 0xFFFFFF, width: number = 1): void {
    const rapidColor = this.hexToRapidColor(color)
    
    this.rapid.renderLine({
      points: [new Vec2(x1, y1), new Vec2(x2, y2)],
      color: rapidColor,
      width: width
    })
  }
  
  /**
   * GameMaker-style draw_rectangle equivalent
   */
  public drawRectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean = true, color: number = 0xFFFFFF, alpha: number = 1): void {
    const width = x2 - x1
    const height = y2 - y1
    const rapidColor = this.hexToRapidColor(color, alpha)
    
    if (filled) {
      this.rapid.renderRect({
        offset: new Vec2(x1, y1),
        width: width,
        height: height,
        color: rapidColor
      })
    } else {
      // Draw outline as 4 lines
      const lineWidth = 1
      this.drawLine(x1, y1, x2, y1, color, lineWidth) // Top
      this.drawLine(x2, y1, x2, y2, color, lineWidth) // Right
      this.drawLine(x2, y2, x1, y2, color, lineWidth) // Bottom
      this.drawLine(x1, y2, x1, y1, color, lineWidth) // Left
    }
  }
  
  /**
   * GameMaker-style draw_circle equivalent
   * Note: Rapid.js circles are always filled. For outline circles, use custom graphics.
   */
  public drawCircle(x: number, y: number, radius: number, _filled: boolean = true, color: number = 0xFFFFFF, alpha: number = 1): void {
    const rapidColor = this.hexToRapidColor(color, alpha)
    
    this.rapid.renderCircle({
      offset: new Vec2(x, y),
      radius: radius,
      color: rapidColor
    })
    
    // Note: Rapid.js doesn't have a built-in "filled" parameter
    // For outline circles, we would need to draw using renderLine or renderGraphic
  }
  
  /**
   * GameMaker-style draw_text equivalent
   */
  public drawText(x: number, y: number, text: string, color: number = 0xFFFFFF, fontSize: number = 12, fontFamily: string = 'Arial'): void {
    // Create a text texture using Rapid.js Text system
    const textTexture = this.rapid.textures.createText({
      text: text.toString(),
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: this.hexToColorString(color)
    })
    
    // Render the text texture as a sprite
    this.rapid.renderSprite({
      texture: textTexture,
      offset: new Vec2(x, y)
    })
  }
  
  /**
   * GameMaker-style draw_arrow equivalent
   */
  public drawArrow(x1: number, y1: number, x2: number, y2: number, size: number = 10, color: number = 0xFFFFFF): void {
    // Draw main line
    this.drawLine(x1, y1, x2, y2, color, 2)
    
    // Calculate arrow head
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const arrowLength = size
    const arrowAngle = Math.PI / 6 // 30 degrees
    
    // Arrow head lines
    const headX1 = x2 - arrowLength * Math.cos(angle - arrowAngle)
    const headY1 = y2 - arrowLength * Math.sin(angle - arrowAngle)
    const headX2 = x2 - arrowLength * Math.cos(angle + arrowAngle)
    const headY2 = y2 - arrowLength * Math.sin(angle + arrowAngle)
    
    this.drawLine(x2, y2, headX1, headY1, color, 2)
    this.drawLine(x2, y2, headX2, headY2, color, 2)
  }
  
  /**
   * GameMaker-style draw_healthbar equivalent
   */
  public drawHealthbar(x1: number, y1: number, x2: number, y2: number, amount: number, backColor: number = 0x333333, minColor: number = 0xFF0000, maxColor: number = 0x00FF00): void {
    const width = x2 - x1
    
    // Background
    this.drawRectangle(x1, y1, x2, y2, true, backColor)
    
    // Health bar
    const healthWidth = width * Math.max(0, Math.min(1, amount))
    if (healthWidth > 0) {
      // Interpolate color based on health amount
      const color = amount > 0.5 ? maxColor : minColor
      this.drawRectangle(x1, y1, x1 + healthWidth, y2, true, color)
    }
  }
  
  /**
   * Convert hex color to Rapid.js Color object
   */
  private hexToRapidColor(hex: number, alpha: number = 1): Color {
    const r = (hex >> 16) & 0xFF
    const g = (hex >> 8) & 0xFF
    const b = hex & 0xFF
    
    return new Color(r, g, b, Math.floor(alpha * 255))
  }
  
  /**
   * Convert hex color to CSS color string
   */
  private hexToColorString(hex: number, alpha: number = 1): string {
    const r = (hex >> 16) & 0xFF
    const g = (hex >> 8) & 0xFF
    const b = hex & 0xFF
    
    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    } else {
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  
  /**
   * Get the underlying Rapid.js renderer for advanced operations
   */
  public getRapidRenderer(): Rapid {
    return this.rapid
  }
}
