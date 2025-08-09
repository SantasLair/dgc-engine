import { GameObject } from '../../engine'

/**
 * Simplified Player class for real-time movement and interaction
 */
export class Player extends GameObject {
  // Player stats as real class properties (no more GameMaker variables)
  public health: number = 100
  public maxHealth: number = 100
  public score: number = 0
  public speed: number = 2.5
  public alive: boolean = true
  
  // High-precision logical position for sub-pixel movement
  public realX: number = 0
  public realY: number = 0
  
  constructor(xOrConfig: number | { x: number; y: number; [key: string]: any }, y?: number) {
    // Handle both constructor signatures: Player(x, y) and Player({x, y, ...props})
    let x: number, yPos: number, config: any = {}
    
    if (typeof xOrConfig === 'number') {
      // Traditional constructor: Player(x, y)
      x = xOrConfig
      yPos = y!
    } else {
      // Data-driven constructor: Player({x, y, ...props})
      x = xOrConfig.x
      yPos = xOrConfig.y
      config = xOrConfig
    }
    
    super('Player', { x, y: yPos, ...config })
    
    console.log('🎮 Player created at position:', x, yPos)
    
    // Set player-specific properties
    this.solid = true
    this.visible = true
    
    // Initialize class properties (no more GameMaker-style variables)
    this.health = config.health || 100
    this.maxHealth = config.maxHealth || 100
    this.speed = config.speed || 2.5 // Sub-pixel speed for smooth movement
    this.score = 0
    this.alive = true
    
    // Initialize high-precision logical position (separate from visual position)
    this.realX = this.x // Floating-point logical position
    this.realY = this.y // Floating-point logical position
    
    console.log('🎮 Player setup complete with sub-pixel precision and real class properties')
  }

  // Virtual event methods (replacing GameMaker event scripts)

  /**
   * CREATE event - called when player is first created
   */
  public onCreate(): void {
    console.log('🎮 Player CREATE event - Player spawned!')
    console.log('🎮 Player position:', this.x, this.y)
    console.log('🎮 Player visible:', this.visible)
    console.log('🎮 Player sprite at CREATE:', this.sprite ? 'assigned' : 'null')
    
    // Force visibility
    this.visible = true
    
    // Initialize using class properties (no more GameMaker variables)
    this.alive = true
    this.score = 0
  }

  /**
   * STEP event - called every frame for game logic
   */
  public onStep(): void {
    // Sub-pixel precision movement for buttery smoothness
    const game = (window as any).game
    if (game) {
      // Get high-precision logical position from class properties
      let realX = this.realX
      let realY = this.realY
      
      // Direct movement based on input (affects logical position)
      let moveX = 0
      let moveY = 0
      
      if (game.isKeyPressed('KeyA') || game.isKeyPressed('ArrowLeft')) moveX = -this.speed
      if (game.isKeyPressed('KeyD') || game.isKeyPressed('ArrowRight')) moveX = this.speed
      if (game.isKeyPressed('KeyW') || game.isKeyPressed('ArrowUp')) moveY = -this.speed
      if (game.isKeyPressed('KeyS') || game.isKeyPressed('ArrowDown')) moveY = this.speed
      
      // Apply movement to high-precision logical coordinates
      if (moveX !== 0 || moveY !== 0) {
        realX += moveX
        realY += moveY
        
        // Keep player within canvas bounds (logical position)
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
        if (canvas) {
          const spriteSize = 32
          const halfSprite = spriteSize / 2
          realX = Math.max(halfSprite, Math.min(canvas.width - halfSprite, realX))
          realY = Math.max(halfSprite, Math.min(canvas.height - halfSprite, realY))
        }
        
        // Store updated logical position in class properties
        this.realX = realX
        this.realY = realY
        
        // Update visual position for rendering (will be rounded during draw)
        this.x = realX
        this.y = realY
      }
    }
    
    // Health regeneration using class properties
    if (this.health < this.maxHealth && Math.random() < 0.001) {
      this.health = Math.min(this.maxHealth, this.health + 1)
    }
  }

  /**
   * DRAW event - called every frame for rendering
   */
  public onDraw(): void {
    // Draw the player sprite if we have one, otherwise draw a rectangle
    if (this.sprite) {
      const drawX = this.x
      const drawY = this.y
      
      // Temporarily set rounded position for drawing
      const originalX = this.x
      const originalY = this.y
      this.x = drawX
      this.y = drawY
      
      this.drawSelf()
      
      // Restore original position
      this.x = originalX
      this.y = originalY
    } else {
      // Fallback rectangle if no sprite
      const drawing = this.getDrawingSystem()
      if (drawing) {
        const drawX = Math.round(this.x)
        const drawY = Math.round(this.y)
        drawing.drawRectangle(
          drawX - 25, drawY - 25,
          drawX + 25, drawY + 25,
          true, 0x00FF00, 1.0  // Green, fully opaque
        )
      }
    }
  }

  /**
   * COLLISION event - handle collisions with other objects
   */
  public onCollision(other: GameObject): void {
    if (!other) return

    switch (other.objectType) {
      case 'Enemy':
        this.takeDamage(15)
        break
      case 'Item':
        this.collectItem(other)
        break
    }
  }

  /**
   * DESTROY event - cleanup when player is destroyed
   */
  public onDestroy(): void {
    console.log('🎮 Player DESTROY event - Player removed!')
  }

  /**
   * Move player by delta amounts with bounds checking
   */
  public movePlayer(deltaX: number, deltaY: number): void {
    const newX = this.x + deltaX
    const newY = this.y + deltaY
    
    // Basic bounds checking (adjust these limits as needed)
    const minX = 50, maxX = 750
    const minY = 50, maxY = 550
    
    if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
      this.setPosition(newX, newY)
    }
  }

  /**
   * Set player position directly
   */
  public setPlayerPosition(x: number, y: number): void {
    this.setPosition(x, y)
    console.log(`🎮 Player positioned at: (${this.x}, ${this.y})`)
  }

  /**
   * Get player health
   */
  public getHealth(): number {
    return this.health
  }

  /**
   * Get player max health
   */
  public getMaxHealth(): number {
    return this.maxHealth
  }

  /**
   * Set player health
   */
  public setHealth(health: number): void {
    this.health = Math.max(0, health)
    console.log(`❤️ Player health: ${this.getHealth()}/${this.getMaxHealth()}`)
  }

  /**
   * Take damage
   */
  public takeDamage(amount: number): void {
    const currentHealth = this.getHealth()
    const newHealth = Math.max(0, currentHealth - amount)
    this.setHealth(newHealth)
    
    console.log(`💥 Player took ${amount} damage!`)
    
    if (newHealth <= 0) {
      console.log('💀 Player has died!')
      this.alive = false
    }
  }

  /**
   * Heal player
   */
  public heal(amount: number): void {
    const currentHealth = this.getHealth()
    const maxHealth = this.getMaxHealth()
    const newHealth = Math.min(maxHealth, currentHealth + amount)
    this.setHealth(newHealth)
    
    console.log(`💚 Player healed ${amount} health!`)
  }

  /**
   * Get player score
   */
  public getScore(): number {
    return this.score
  }

  /**
   * Add to player score
   */
  public addScore(points: number): void {
    const currentScore = this.getScore()
    this.score = currentScore + points
    console.log(`⭐ Player scored ${points} points! Total: ${this.getScore()}`)
  }

  /**
   * Check if player is alive
   */
  public isAlive(): boolean {
    return this.alive === true && this.getHealth() > 0
  }

  /**
   * Get player speed
   */
  public getSpeed(): number {
    return this.speed
  }

  /**
   * Set player speed
   */
  public setSpeed(speed: number): void {
    this.speed = Math.max(1, speed)
    console.log(`🏃 Player speed: ${this.getSpeed()}`)
  }

  /**
   * Collect an item
   */
  private collectItem(item: GameObject): void {
    const itemType = item.getVariable('itemType') || 'item'
    const value = item.getVariable('value') || 10
    
    this.addScore(value)
    console.log(`📦 Collected ${itemType} worth ${value} points!`)
    
    item.destroy()
  }

  /**
   * Get player X position
   */
  public getX(): number {
    return this.x
  }

  /**
   * Get player Y position
   */
  public getY(): number {
    return this.y
  }
}
