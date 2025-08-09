import { GameObject } from '../../engine/GameObject'

/**
 * Simplified Player class that uses simple update logic
 * instead of complex GameMaker event system
 * 
 * This extends GameObject but overrides the event methods to use
 * simplified logic, testing if this reduces movement jitter
 */
export class SimplePlayer extends GameObject {
  // Movement properties
  private velocityX: number = 0
  private velocityY: number = 0
  private maxSpeed: number = 4
  private acceleration: number = 0.5
  private friction: number = 0.85
  
  // Game properties
  private health: number = 100
  private maxHealth: number = 100
  private score: number = 0
  
  constructor(x: number = 0, y: number = 0) {
    super('SimplePlayer', { x, y })
    
    // Set default properties
    this.solid = true
    this.visible = true
    
    console.log('🎮 SimplePlayer created at position:', x, y)
  }
  
  /**
   * CREATE event - called once when created
   */
  public onCreate(): void {
    console.log('🎮 SimplePlayer onCreate - Player spawned!')
    console.log('🎮 Position:', this.x, this.y)
    console.log('🎮 Sprite:', this.sprite ? 'assigned' : 'null')
  }
  
  /**
   * STEP event - called every frame for game logic
   * This replaces the complex GameMaker event processing with simple logic
   */
  public onStep(): void {
    this.handleMovement()
    this.updateHealth()
    this.keepInBounds()
  }
  
  /**
   * DRAW event - called every frame for rendering
   * Simplified rendering without complex event ordering
   */
  public onDraw(): void {
    if (!this.sprite || !this.visible) return
    
    // Get drawing system from global game instance
    const game = (window as any).game
    if (!game) return
    
    const drawingSystem = game.getDrawingSystem()
    if (!drawingSystem) return
    
    // Draw sprite with pixel-perfect positioning
    const pixelX = Math.round(this.x)
    const pixelY = Math.round(this.y)
    
    drawingSystem.drawSpriteFromSprite(
      this.sprite,
      pixelX - 16, // Center sprite (assuming 32x32)
      pixelY - 16,
      this.imageIndex,
      this.imageXScale,
      this.imageYScale,
      this.imageAngle,
      this.imageAlpha
    )
  }
  
  /**
   * Handle player movement with smooth velocity
   */
  private handleMovement(): void {
    // Get input through global game instance (temporary solution)
    const game = (window as any).game
    if (!game) return
    
    // Input handling
    let inputX = 0
    let inputY = 0
    
    if (game.isKeyPressed('KeyA') || game.isKeyPressed('ArrowLeft')) inputX = -1
    if (game.isKeyPressed('KeyD') || game.isKeyPressed('ArrowRight')) inputX = 1
    if (game.isKeyPressed('KeyW') || game.isKeyPressed('ArrowUp')) inputY = -1
    if (game.isKeyPressed('KeyS') || game.isKeyPressed('ArrowDown')) inputY = 1
    
    // Apply acceleration or friction
    if (inputX !== 0) {
      this.velocityX += inputX * this.acceleration
      this.velocityX = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityX))
    } else {
      this.velocityX *= this.friction
      if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0
    }
    
    if (inputY !== 0) {
      this.velocityY += inputY * this.acceleration
      this.velocityY = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityY))
    } else {
      this.velocityY *= this.friction
      if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0
    }
    
    // Apply movement
    if (this.velocityX !== 0 || this.velocityY !== 0) {
      this.x += this.velocityX
      this.y += this.velocityY
    }
  }
  
  /**
   * Keep player within canvas bounds
   */
  private keepInBounds(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (!canvas) return
    
    const margin = 16 // Half sprite size
    const newX = Math.max(margin, Math.min(canvas.width - margin, this.x))
    const newY = Math.max(margin, Math.min(canvas.height - margin, this.y))
    
    // Stop velocity if hitting boundaries
    if (newX !== this.x) this.velocityX = 0
    if (newY !== this.y) this.velocityY = 0
    
    this.x = newX
    this.y = newY
  }
  
  /**
   * Update health and other game logic
   */
  private updateHealth(): void {
    // Simple health regeneration
    if (this.health < this.maxHealth && Math.random() < 0.001) {
      this.health = Math.min(this.maxHealth, this.health + 1)
    }
  }
  
  // ========================================
  // GAME METHODS
  // ========================================
  
  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
    if (this.health <= 0) {
      this.onDeath()
    }
  }
  
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount)
  }
  
  public addScore(points: number): void {
    this.score += points
  }
  
  private onDeath(): void {
    console.log('💀 Player died!')
    // Handle death logic
  }
  
  // ========================================
  // GETTERS
  // ========================================
  
  public getHealth(): number {
    return this.health
  }
  
  public getMaxHealth(): number {
    return this.maxHealth
  }
  
  public getScore(): number {
    return this.score
  }
  
  public getVelocity(): { x: number, y: number } {
    return { x: this.velocityX, y: this.velocityY }
  }
}
