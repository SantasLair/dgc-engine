import { Rapid, Color, Vec2, Texture } from 'rapid-render'
import { DGCSprite } from './DGCSprite'

/**
 * Improved drawing system with texture caching to eliminate jitter
 * Preloads and caches textures to avoid async calls during rendering
 */
export class ImprovedDrawingSystem {
  private rapid: Rapid
  private textureCache: Map<string, Texture> = new Map()
  private loadingPromises: Map<string, Promise<Texture>> = new Map()
  
  constructor(rapid: Rapid) {
    this.rapid = rapid
  }
  
  /**
   * Preload and cache a sprite's texture
   * Call this when sprites are loaded, not during rendering
   */
  public async preloadSpriteTexture(sprite: DGCSprite): Promise<void> {
    if (!sprite.isLoaded()) {
      console.warn(`⚠️ Cannot preload texture for unloaded sprite: ${sprite.name}`)
      return
    }
    
    const cacheKey = this.getSpriteTextureKey(sprite)
    
    // Skip if already cached
    if (this.textureCache.has(cacheKey)) {
      return
    }
    
    // Skip if already loading
    if (this.loadingPromises.has(cacheKey)) {
      await this.loadingPromises.get(cacheKey)
      return
    }
    
    // Start loading
    const loadingPromise = this.rapid.textures.textureFromSource(sprite.image, true)
    this.loadingPromises.set(cacheKey, loadingPromise)
    
    try {
      const texture = await loadingPromise
      this.textureCache.set(cacheKey, texture)
      console.log(`✅ Cached texture for sprite: ${sprite.name}`)
    } catch (error) {
      console.error(`❌ Failed to cache texture for sprite ${sprite.name}:`, error)
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }
  
  /**
   * Clear all drawings from the previous frame
   */
  public clearFrame(): void {
    // Rapid.js handles frame clearing automatically
  }
  
  /**
   * SYNCHRONOUS sprite drawing using cached textures
   * This eliminates jitter caused by async texture loading
   */
  public drawSpriteFromSprite(sprite: DGCSprite, x: number, y: number, _frame: number = 0, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, _alpha: number = 1): void {
    if (!sprite.isLoaded()) {
      this.drawFallbackRectangle(x, y, 32, 32, 0xFF0000) // Red for unloaded
      return
    }
    
    const cacheKey = this.getSpriteTextureKey(sprite)
    const cachedTexture = this.textureCache.get(cacheKey)
    
    if (!cachedTexture) {
      // Texture not cached - draw fallback and trigger async load
      this.drawFallbackRectangle(x, y, sprite.frameWidth, sprite.frameHeight, 0x00FFFF) // Cyan for loading
      this.preloadSpriteTexture(sprite) // Load for next frame
      return
    }
    
    // SYNCHRONOUS rendering with cached texture - no jitter!
    try {
      const originOffsetX = sprite.frameWidth * sprite.origin.x * scaleX
      const originOffsetY = sprite.frameHeight * sprite.origin.y * scaleY
      const drawX = x - originOffsetX
      const drawY = y - originOffsetY
      
      this.rapid.renderSprite({
        texture: cachedTexture,
        offset: new Vec2(drawX, drawY),
        scale: new Vec2(scaleX, scaleY),
        rotation: rotation * Math.PI / 180
      })
    } catch (error) {
      console.error(`❌ Error rendering cached sprite ${sprite.name}:`, error)
      this.drawFallbackRectangle(x, y, sprite.frameWidth, sprite.frameHeight, 0xFF0000) // Red for error
    }
  }
  
  /**
   * Draw a rectangle (used for fallbacks and debugging)
   */
  public drawRectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean = true, color: number = 0xFFFFFF, alpha: number = 1.0): void {
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    const centerX = Math.min(x1, x2) + width / 2
    const centerY = Math.min(y1, y2) + height / 2
    
    if (filled) {
      this.rapid.renderRect({
        offset: new Vec2(centerX, centerY),
        width: width,
        height: height,
        color: this.hexToRapidColor(color, alpha)
      })
    } else {
      // For outlined rectangles, draw 4 thin rectangles
      const thickness = 2
      // Top
      this.rapid.renderRect({
        offset: new Vec2(centerX, Math.min(y1, y2) + thickness/2),
        width: width,
        height: thickness,
        color: this.hexToRapidColor(color, alpha)
      })
      // Bottom
      this.rapid.renderRect({
        offset: new Vec2(centerX, Math.max(y1, y2) - thickness/2),
        width: width,
        height: thickness,
        color: this.hexToRapidColor(color, alpha)
      })
      // Left
      this.rapid.renderRect({
        offset: new Vec2(Math.min(x1, x2) + thickness/2, centerY),
        width: thickness,
        height: height,
        color: this.hexToRapidColor(color, alpha)
      })
      // Right
      this.rapid.renderRect({
        offset: new Vec2(Math.max(x1, x2) - thickness/2, centerY),
        width: thickness,
        height: height,
        color: this.hexToRapidColor(color, alpha)
      })
    }
  }
  
  /**
   * Get performance statistics
   */
  public getStats(): { cachedTextures: number, loadingTextures: number } {
    return {
      cachedTextures: this.textureCache.size,
      loadingTextures: this.loadingPromises.size
    }
  }
  
  /**
   * Clear texture cache (useful for memory management)
   */
  public clearTextureCache(): void {
    this.textureCache.clear()
    this.loadingPromises.clear()
    console.log('🧹 Texture cache cleared')
  }
  
  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================
  
  private getSpriteTextureKey(sprite: DGCSprite): string {
    return `${sprite.name}_${sprite.source}`
  }
  
  private drawFallbackRectangle(x: number, y: number, width: number, height: number, color: number): void {
    this.rapid.renderRect({
      offset: new Vec2(x, y),
      width: width,
      height: height,
      color: this.hexToRapidColor(color, 1.0)
    })
  }
  
  private hexToRapidColor(hex: number, alpha: number = 1.0): Color {
    const r = ((hex >> 16) & 0xFF) / 255
    const g = ((hex >> 8) & 0xFF) / 255
    const b = (hex & 0xFF) / 255
    return new Color(r, g, b, alpha)
  }
}
