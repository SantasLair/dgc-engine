import { GameObject, GameEvent } from '../../engine'

/**
 * Simplified Player class for real-time movement and interaction
 */
export class Player extends GameObject {
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
    this.setVariable('health', config.health || 100)
    this.setVariable('maxHealth', config.maxHealth || 100)
    this.setVariable('speed', config.speed || 5)
    
    this.setupPlayerEvents()
    console.log('🎮 Player setup complete')
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
      
      self.setVariable('isAlive', true)
      self.setVariable('score', 0)
    })

    // STEP event - called every frame for game logic
    this.addEventScript(GameEvent.STEP, (self) => {
      // Handle movement input through global game instance
      const game = (window as any).game
      if (game) {
        const speed = self.getVariable('speed') || 5
        
        // WASD movement
        if (game.isKeyPressed('KeyW') || game.isKeyPressed('ArrowUp')) {
          self.y -= speed
        }
        if (game.isKeyPressed('KeyS') || game.isKeyPressed('ArrowDown')) {
          self.y += speed
        }
        if (game.isKeyPressed('KeyA') || game.isKeyPressed('ArrowLeft')) {
          self.x -= speed
        }
        if (game.isKeyPressed('KeyD') || game.isKeyPressed('ArrowRight')) {
          self.x += speed
        }
        
        // Keep player within canvas bounds
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
        if (canvas) {
          const spriteSize = 32 // Assume 32x32 sprite
          self.x = Math.max(spriteSize / 2, Math.min(canvas.width - spriteSize / 2, self.x))
          self.y = Math.max(spriteSize / 2, Math.min(canvas.height - spriteSize / 2, self.y))
        }
      }
      
      // Health regeneration
      const health = self.getVariable('health')
      const maxHealth = self.getVariable('maxHealth')
      if (health < maxHealth && Math.random() < 0.001) {
        self.setVariable('health', Math.min(maxHealth, health + 1))
      }
    })

    // DRAW event - called every frame for rendering
    this.addEventScript(GameEvent.DRAW, (self) => {
      // Only log occasionally to avoid spam
      const shouldLog = Math.random() < 0.01 // Log ~1% of frames
      
      if (shouldLog) {
        console.log('🎨 Player DRAW event called at position:', self.x, self.y)
        console.log('🎨 Player visible:', self.visible, 'sprite:', self.sprite)
      }
      
      // Draw the player sprite if we have one, otherwise draw a rectangle
      if (self.sprite) {
        if (shouldLog) console.log('🎨 Drawing sprite:', self.sprite.name || 'unnamed')
        self.drawSelf()
      } else {
        if (shouldLog) console.log('🎨 Drawing rectangle fallback...')
        // Fallback rectangle if no sprite - make it larger and more visible
        const drawing = self.getDrawingSystem()
        if (drawing) {
          if (shouldLog) {
            console.log('🎨 Drawing rectangle from', self.x - 25, self.y - 25, 'to', self.x + 25, self.y + 25)
          }
          drawing.drawRectangle(
            self.x - 25, self.y - 25,
            self.x + 25, self.y + 25,
            true, 0x00FF00, 1.0  // Green, fully opaque
          )
        } else {
          if (shouldLog) console.log('❌ No drawing system available!')
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
    return this.getVariable('health') || 100
  }

  /**
   * Get player max health
   */
  public getMaxHealth(): number {
    return this.getVariable('maxHealth') || 100
  }

  /**
   * Set player health
   */
  public setHealth(health: number): void {
    this.setVariable('health', Math.max(0, health))
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
      this.setVariable('isAlive', false)
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
    return this.getVariable('score') || 0
  }

  /**
   * Add to player score
   */
  public addScore(points: number): void {
    const currentScore = this.getScore()
    this.setVariable('score', currentScore + points)
    console.log(`⭐ Player scored ${points} points! Total: ${this.getScore()}`)
  }

  /**
   * Check if player is alive
   */
  public isAlive(): boolean {
    return this.getVariable('isAlive') === true && this.getHealth() > 0
  }

  /**
   * Get player speed
   */
  public getSpeed(): number {
    return this.getVariable('speed') || 5
  }

  /**
   * Set player speed
   */
  public setSpeed(speed: number): void {
    this.setVariable('speed', Math.max(1, speed))
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
