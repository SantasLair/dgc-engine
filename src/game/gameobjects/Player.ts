import { GameObject, GameEvent } from '../../engine'

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
    
    this.setupPlayerEvents()
    console.log('🎮 Player setup complete with sub-pixel precision and real class properties')
  }

  /**
   * Setup player event handlers
   */
  private setupPlayerEvents(): void {
    // CREATE event - called when player is first created
    this.addEventScript(GameEvent.CREATE, (self) => {
      console.log('🎮 Player CREATE event - Player spawned!')
      console.log('🎮 Player position:', self.x, self.y)
      console.log('🎮 Player visible:', self.visible)
      console.log('🎮 Player sprite at CREATE:', self.sprite ? 'assigned' : 'null')
      
      // Force visibility
      self.visible = true
      
      // Initialize using class properties (no more GameMaker variables)
      const player = self as Player
      player.alive = true
      player.score = 0
    })

    // STEP event - called every frame for game logic
    this.addEventScript(GameEvent.STEP, (self) => {
      // Sub-pixel precision movement for buttery smoothness
      const game = (window as any).game
      if (game) {
        const player = self as Player
        
        // Get high-precision logical position from class properties
        let realX = player.realX
        let realY = player.realY
        
        // Direct movement based on input (affects logical position)
        let moveX = 0
        let moveY = 0
        
        if (game.isKeyPressed('KeyA') || game.isKeyPressed('ArrowLeft')) moveX = -player.speed
        if (game.isKeyPressed('KeyD') || game.isKeyPressed('ArrowRight')) moveX = player.speed
        if (game.isKeyPressed('KeyW') || game.isKeyPressed('ArrowUp')) moveY = -player.speed
        if (game.isKeyPressed('KeyS') || game.isKeyPressed('ArrowDown')) moveY = player.speed
        
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
          player.realX = realX
          player.realY = realY
          
          // Update visual position for rendering (will be rounded during draw)
          self.x = realX
          self.y = realY
        }
      }
      
      // Health regeneration using class properties
      const player = self as Player
      if (player.health < player.maxHealth && Math.random() < 0.001) {
        player.health = Math.min(player.maxHealth, player.health + 1)
      }
    })

    // DRAW event - called every frame for rendering
    this.addEventScript(GameEvent.DRAW, (self) => {
      // Draw the player sprite if we have one, otherwise draw a rectangle
      if (self.sprite) {
        // Ensure sprite is drawn at integer pixel positions to avoid jitter
        const drawX = Math.round(self.x)
        const drawY = Math.round(self.y)
        
        // Temporarily set rounded position for drawing
        const originalX = self.x
        const originalY = self.y
        self.x = drawX
        self.y = drawY
        
        self.drawSelf()
        
        // Restore original position
        self.x = originalX
        self.y = originalY
      } else {
        // Fallback rectangle if no sprite
        const drawing = self.getDrawingSystem()
        if (drawing) {
          const drawX = Math.round(self.x)
          const drawY = Math.round(self.y)
          drawing.drawRectangle(
            drawX - 25, drawY - 25,
            drawX + 25, drawY + 25,
            true, 0x00FF00, 1.0  // Green, fully opaque
          )
        }
      }
    })

    // COLLISION event - handle collisions with other objects
    this.addEventScript(GameEvent.COLLISION, (_self, eventData) => {
      const other = eventData?.other
      if (!other) return

      switch (other.objectType) {
        case 'Enemy':
          this.takeDamage(15)
          break
        case 'Item':
          this.collectItem(other)
          break
      }
    })

    // DESTROY event - cleanup when player is destroyed
    this.addEventScript(GameEvent.DESTROY, () => {
      console.log('🎮 Player DESTROY event - Player removed!')
    })
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
