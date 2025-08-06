import { GameObject, GameEvent } from '../engine'

/**
 * Player class that extends GameObject
 * Provides a more traditional class-based approach while leveraging the engine
 */
export class Player extends GameObject {
  constructor(x: number, y: number) {
    super('Player', { x, y })
    
    // Set player-specific properties
    this.solid = true
    this.visible = true
    this.setVariable('health', 100)
    this.setVariable('maxHealth', 100)
    this.setVariable('speed', 1)
    this.setVariable('canMove', true)
    
    this.setupPlayerEvents()
  }

  /**
   * Setup player-specific event handlers
   */
  private setupPlayerEvents(): void {
    // Create event
    this.addEventScript(GameEvent.CREATE, (self) => {
      console.log('Player created at', self.getPosition())
      self.setVariable('score', 0)
    })

    // Movement input handling - use for immediate movement only
    this.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
      if (!self.getVariable('canMove')) return
      if (self.getVariable('isMoving')) return // Don't interrupt pathfinding movement

      const speed = self.getVariable('speed')
      const currentPos = self.getPosition()
      let newX = currentPos.x
      let newY = currentPos.y

      switch (eventData?.key) {
        case 'KeyW': case 'ArrowUp':
          newY -= speed
          break
        case 'KeyS': case 'ArrowDown':
          newY += speed
          break
        case 'KeyA': case 'ArrowLeft':
          newX -= speed
          break
        case 'KeyD': case 'ArrowRight':
          newX += speed
          break
        case 'Space':
          // Cancel current movement or perform action
          if (self.getVariable('isMoving')) {
            self.setVariable('isMoving', false)
            console.log('Movement cancelled')
          } else {
            this.performAction()
          }
          return
      }

      // Boundary checking (assuming 20x15 grid)
      if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15) {
        self.setPosition(newX, newY)
        console.log('Player moved to', { x: newX, y: newY })
      }
    })

    // Collision handling
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

    // Step event for continuous updates
    this.addEventScript(GameEvent.STEP, (self) => {
      // Health regeneration
      const health = self.getVariable('health')
      const maxHealth = self.getVariable('maxHealth')
      if (health < maxHealth && Math.random() < 0.001) {
        self.setVariable('health', Math.min(maxHealth, health + 1))
      }
    })
  }

  /**
   * Player-specific methods
   */

  public getHealth(): number {
    return this.getVariable('health') || 0
  }

  public getMaxHealth(): number {
    return this.getVariable('maxHealth') || 100
  }

  public getScore(): number {
    return this.getVariable('score') || 0
  }

  public takeDamage(amount: number): void {
    const currentHealth = this.getVariable('health')
    const newHealth = Math.max(0, currentHealth - amount)
    this.setVariable('health', newHealth)
    
    console.log(`Player takes ${amount} damage! Health: ${newHealth}`)
    
    if (newHealth <= 0) {
      console.log('Player defeated!')
      // Could emit game over event
    }
  }

  public heal(amount: number): void {
    const currentHealth = this.getVariable('health')
    const maxHealth = this.getVariable('maxHealth')
    const newHealth = Math.min(maxHealth, currentHealth + amount)
    this.setVariable('health', newHealth)
    
    console.log(`Player healed ${amount}! Health: ${newHealth}`)
  }

  public addScore(points: number): void {
    const currentScore = this.getVariable('score')
    this.setVariable('score', currentScore + points)
    console.log(`Score +${points}! Total: ${this.getVariable('score')}`)
  }

  private performAction(): void {
    console.log('Player performs special action!')
    // Could implement attack, magic, etc.
  }

  private collectItem(item: GameObject): void {
    const itemType = item.getVariable('itemType')
    const value = item.getVariable('value') || 10
    
    this.addScore(value)
    console.log(`Collected ${itemType} worth ${value} points!`)
    
    item.destroy()
  }

  // Maintain compatibility with old API
  public move(deltaX: number, deltaY: number): void {
    super.move(deltaX, deltaY)
  }

  public getX(): number {
    return this.x
  }

  public getY(): number {
    return this.y
  }
}
