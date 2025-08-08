import { DGCSprite } from './DGCSprite'

/**
 * Configuration for loading a sprite
 */
export interface SpriteLoadConfig {
  name: string
  source: string | HTMLImageElement
  frames?: number
  frameWidth?: number
  frameHeight?: number
  animationSpeed?: number
  origin?: { x: number; y: number }
}

/**
 * Manages sprite loading, unloading, and access for rooms
 * Each room can declare what sprites it needs, and they're loaded/unloaded automatically
 */
export class SpriteManager {
  private loadedSprites: Map<string, DGCSprite> = new Map()
  private loadingPromises: Map<string, Promise<DGCSprite>> = new Map()
  
  /**
   * Load a single sprite
   */
  public async loadSprite(config: SpriteLoadConfig): Promise<DGCSprite> {
    // Check if already loaded
    if (this.loadedSprites.has(config.name)) {
      return this.loadedSprites.get(config.name)!
    }
    
    // Check if currently loading
    if (this.loadingPromises.has(config.name)) {
      return this.loadingPromises.get(config.name)!
    }
    
    // Start loading
    const loadPromise = this.createSprite(config)
    this.loadingPromises.set(config.name, loadPromise)
    
    try {
      const sprite = await loadPromise
      this.loadedSprites.set(config.name, sprite)
      this.loadingPromises.delete(config.name)
      
      console.log(`🖼️ Sprite loaded: ${config.name}`)
      return sprite
    } catch (error) {
      this.loadingPromises.delete(config.name)
      console.error(`❌ Failed to load sprite: ${config.name}`, error)
      throw error
    }
  }
  
  /**
   * Load multiple sprites for a room
   */
  public async loadSprites(configs: SpriteLoadConfig[]): Promise<void> {
    console.log(`🎯 Loading ${configs.length} sprites...`)
    
    const loadPromises = configs.map(config => this.loadSprite(config))
    await Promise.all(loadPromises)
    
    console.log(`✅ All sprites loaded successfully`)
  }
  
  /**
   * Get a loaded sprite by name
   */
  public getSprite(name: string): DGCSprite | null {
    return this.loadedSprites.get(name) || null
  }
  
  /**
   * Check if a sprite is loaded
   */
  public hasSprite(name: string): boolean {
    return this.loadedSprites.has(name)
  }
  
  /**
   * Unload a specific sprite
   */
  public unloadSprite(name: string): void {
    if (this.loadedSprites.has(name)) {
      this.loadedSprites.delete(name)
      console.log(`🗑️ Sprite unloaded: ${name}`)
    }
  }
  
  /**
   * Unload multiple sprites (typically when leaving a room)
   */
  public unloadSprites(names: string[]): void {
    console.log(`🧹 Unloading ${names.length} sprites...`)
    
    for (const name of names) {
      this.unloadSprite(name)
    }
    
    console.log(`✅ Sprites unloaded successfully`)
  }
  
  /**
   * Unload all sprites (room cleanup)
   */
  public unloadAllSprites(): void {
    const count = this.loadedSprites.size
    this.loadedSprites.clear()
    console.log(`🧹 All ${count} sprites unloaded`)
  }
  
  /**
   * Get list of loaded sprite names
   */
  public getLoadedSpriteNames(): string[] {
    return Array.from(this.loadedSprites.keys())
  }
  
  /**
   * Create a DGCSprite from config
   */
  private async createSprite(config: SpriteLoadConfig): Promise<DGCSprite> {
    const sprite = new DGCSprite({
      name: config.name,
      source: config.source,
      frames: config.frames,
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      animationSpeed: config.animationSpeed,
      origin: config.origin
    })
    
    // Wait for the sprite to load
    await sprite.waitForLoad()
    
    return sprite
  }
}
