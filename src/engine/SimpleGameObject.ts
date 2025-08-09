import type { IDrawingSystem } from './GameObject'

/**
 * Simplified GameObject base class with update/render paradigm
 * Replaces the complex GameMaker event system with simple methods
 */
export abstract class SimpleGameObject {
  public id: number
  public objectType: string
  public x: number = 0
  public y: number = 0
  public xPrevious: number = 0
  public yPrevious: number = 0
  
  // Visual properties
  public visible: boolean = true
  public sprite: any = null
  public imageIndex: number = 0
  public imageSpeed: number = 1
  public imageAngle: number = 0
  public imageXScale: number = 1
  public imageYScale: number = 1
  public imageAlpha: number = 1
  
  // Physics properties
  public solid: boolean = false
  public persistent: boolean = false
  public active: boolean = true
  public depth: number = 0
  
  // Systems
  private drawingSystem: IDrawingSystem | null = null
  private variables: Map<string, any> = new Map()
  
  // Static ID counter
  private static nextId: number = 0
  
  constructor(objectType: string, properties?: { [key: string]: any }) {
    this.id = SimpleGameObject.nextId++
    this.objectType = objectType
    
    // Apply properties if provided
    if (properties) {
      Object.assign(this, properties)
    }
  }
  
  // ========================================
  // SIMPLIFIED LIFECYCLE METHODS
  // ========================================
  
  /**
   * Called once when the object is created
   */
  public onCreate(): void {
    // Override in subclasses
  }
  
  /**
   * Called every frame for game logic
   */
  public update(deltaTime: number): void {
    // Store previous position
    this.xPrevious = this.x
    this.yPrevious = this.y
    
    // Override in subclasses for game logic
  }
  
  /**
   * Called every frame for rendering
   */
  public render(): void {
    if (!this.visible || !this.drawingSystem) {
      return
    }
    
    // Draw sprite if available
    if (this.sprite) {
      this.drawSprite()
    }
  }
  
  /**
   * Called when the object is destroyed
   */
  public onDestroy(): void {
    // Override in subclasses
  }
  
  // ========================================
  // DRAWING METHODS
  // ========================================
  
  /**
   * Draw the object's sprite
   */
  private drawSprite(): void {
    if (!this.sprite || !this.drawingSystem) return
    
    // Ensure integer pixel positions to avoid jitter
    const drawX = Math.round(this.x)
    const drawY = Math.round(this.y)
    
    this.drawingSystem.drawSpriteFromSprite(
      this.sprite,
      drawX,
      drawY,
      Math.floor(this.imageIndex),
      this.imageXScale,
      this.imageYScale,
      this.imageAngle,
      this.imageAlpha
    )
  }
  
  /**
   * Draw a rectangle (for debugging or simple graphics)
   */
  protected drawRectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean = true, color: number = 0xFFFFFF): void {
    if (this.drawingSystem) {
      this.drawingSystem.drawRectangle(x1, y1, x2, y2, filled, color)
    }
  }
  
  // ========================================
  // SYSTEM ACCESS
  // ========================================
  
  public setDrawingSystem(drawingSystem: IDrawingSystem): void {
    this.drawingSystem = drawingSystem
  }
  
  public getDrawingSystem(): IDrawingSystem | null {
    return this.drawingSystem
  }
  
  // ========================================
  // VARIABLE SYSTEM (for compatibility)
  // ========================================
  
  public setVariable(name: string, value: any): void {
    this.variables.set(name, value)
  }
  
  public getVariable(name: string): any {
    return this.variables.get(name)
  }
  
  public hasVariable(name: string): boolean {
    return this.variables.has(name)
  }
  
  // ========================================
  // UTILITY METHODS
  // ========================================
  
  /**
   * Check if this object overlaps with another
   */
  public overlaps(other: SimpleGameObject, spriteSize: number = 32): boolean {
    const halfSize = spriteSize / 2
    return !(
      this.x + halfSize < other.x - halfSize ||
      this.x - halfSize > other.x + halfSize ||
      this.y + halfSize < other.y - halfSize ||
      this.y - halfSize > other.y + halfSize
    )
  }
  
  /**
   * Get distance to another object
   */
  public distanceTo(other: SimpleGameObject): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  /**
   * Keep object within bounds
   */
  public clampToBounds(minX: number, minY: number, maxX: number, maxY: number, margin: number = 16): void {
    this.x = Math.max(minX + margin, Math.min(maxX - margin, this.x))
    this.y = Math.max(minY + margin, Math.min(maxY - margin, this.y))
  }
}
