/**
 * DGC Engine Sprite class for immediate mode rendering
 * Provides GameMaker-style sprite functionality using Rapid.js backend
 */

/**
 * Sprite configuration interface for DGC sprites
 */
export interface DGCSpriteConfig {
  /** Sprite name/identifier */
  name: string
  /** Image source (URL, base64, or HTMLImageElement) */
  source: string | HTMLImageElement
  /** Number of frames for animation (default: 1) */
  frames?: number
  /** Frame width in pixels (auto-detected if not specified) */
  frameWidth?: number
  /** Frame height in pixels (auto-detected if not specified) */
  frameHeight?: number
  /** Animation speed in frames per second (default: 12) */
  animationSpeed?: number
  /** Origin point for transformations (0-1 normalized coordinates) */
  origin?: { x: number; y: number }
}

/**
 * Lightweight sprite class for DGC Engine immediate mode rendering
 * Unlike retained mode systems, this sprite doesn't maintain display objects
 * Instead, it provides metadata for immediate drawing operations
 */
export class DGCSprite {
  public readonly name: string
  public readonly image: HTMLImageElement
  public readonly frameCount: number
  public frameWidth: number
  public frameHeight: number
  public readonly animationSpeed: number
  public readonly origin: { x: number; y: number }
  
  private loaded: boolean = false
  private loadPromise: Promise<void>

  constructor(config: DGCSpriteConfig) {
    this.name = config.name
    this.frameCount = config.frames ?? 1
    this.animationSpeed = config.animationSpeed ?? 12
    this.origin = config.origin ?? { x: 0.5, y: 0.5 }
    
    // Initialize frame dimensions with defaults
    this.frameWidth = config.frameWidth ?? 0
    this.frameHeight = config.frameHeight ?? 0
    
    // Create image element
    this.image = config.source instanceof HTMLImageElement 
      ? config.source 
      : new Image()
    
    // Set up loading promise
    if (typeof config.source === 'string') {
      this.loadPromise = new Promise((resolve, reject) => {
        this.image.onload = () => {
          this.loaded = true
          
          // Auto-detect frame dimensions if not provided
          if (!config.frameWidth || !config.frameHeight) {
            this.frameWidth = config.frameWidth ?? Math.floor(this.image.width / this.frameCount)
            this.frameHeight = config.frameHeight ?? this.image.height
          }
          
          resolve()
        }
        this.image.onerror = reject
        this.image.src = config.source as string
      })
    } else {
      // Image already loaded
      this.loaded = true
      if (!config.frameWidth || !config.frameHeight) {
        this.frameWidth = config.frameWidth ?? Math.floor(this.image.width / this.frameCount)
        this.frameHeight = config.frameHeight ?? this.image.height
      }
      this.loadPromise = Promise.resolve()
    }
  }

  /**
   * Check if the sprite is loaded and ready to draw
   */
  public isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Wait for the sprite to finish loading
   */
  public async waitForLoad(): Promise<void> {
    return this.loadPromise
  }

  /**
   * Get the source rectangle for a specific frame
   * Used for sprite sheet animations
   */
  public getFrameRect(frame: number = 0): { x: number; y: number; width: number; height: number } {
    const clampedFrame = Math.max(0, Math.min(frame, this.frameCount - 1))
    return {
      x: clampedFrame * this.frameWidth,
      y: 0,
      width: this.frameWidth,
      height: this.frameHeight
    }
  }

  /**
   * Get the current frame based on animation time
   */
  public getCurrentFrame(time: number): number {
    if (this.frameCount <= 1) return 0
    const frameTime = 1000 / this.animationSpeed // milliseconds per frame
    return Math.floor(time / frameTime) % this.frameCount
  }
}

/**
 * Sprite manager for DGC Engine sprites
 * Manages sprite loading and provides access to sprites by name
 */
export class DGCSpriteManager {
  private sprites: Map<string, DGCSprite> = new Map()

  /**
   * Add a sprite to the manager
   */
  public addSprite(config: DGCSpriteConfig): DGCSprite {
    const sprite = new DGCSprite(config)
    this.sprites.set(config.name, sprite)
    return sprite
  }

  /**
   * Get a sprite by name
   */
  public getSprite(name: string): DGCSprite | undefined {
    return this.sprites.get(name)
  }

  /**
   * Check if a sprite exists
   */
  public hasSprite(name: string): boolean {
    return this.sprites.has(name)
  }

  /**
   * Remove a sprite
   */
  public removeSprite(name: string): boolean {
    return this.sprites.delete(name)
  }

  /**
   * Get all sprite names
   */
  public getSpriteNames(): string[] {
    return Array.from(this.sprites.keys())
  }

  /**
   * Wait for all sprites to finish loading
   */
  public async waitForAllSprites(): Promise<void> {
    const loadPromises = Array.from(this.sprites.values()).map(sprite => sprite.waitForLoad())
    await Promise.all(loadPromises)
  }

  /**
   * Clear all sprites
   */
  public clear(): void {
    this.sprites.clear()
  }
}
