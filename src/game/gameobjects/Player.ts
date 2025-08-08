import { GameObject, GameEvent } from '../../engine'

/**
 * Player class that extends GameObject
 * Provides a more traditional class-based approach while leveraging the engine
 */
export class Player extends GameObject {
  private gameInstance: any // Reference to Game instance for turn management
  
  constructor(x: number, y: number) {
    super('Player', { x, y })
    
    console.log('🎮 Player constructor called at position:', x, y)
    
    // Set player-specific properties
    this.solid = true
    this.visible = true
    this.setVariable('health', 100)
    this.setVariable('maxHealth', 100)
    this.setVariable('speed', 1)
    this.setVariable('canMove', true)
    this.setVariable('isMoving', false) // Explicitly set this to false initially
    
    this.setupPlayerEvents()
    console.log('🎮 Player setup complete')
  }

  /**
   * Set reference to the game instance for turn management
   */
  public setGameInstance(game: any): void {
    this.gameInstance = game
    this.resetPlayerState()
  }

  /**
   * Reset player to a known good state
   */
  public resetPlayerState(): void {
    this.setVariable('isMoving', false)
    this.setVariable('canMove', true)
    console.log('✅ Player state reset: Ready for movement')
  }

  /**
   * Setup player-specific event handlers
   */
  private setupPlayerEvents(): void {
    // Create event
    this.addEventScript(GameEvent.CREATE, (self) => {
      console.log('Player created at', self.x, self.y)
      self.setVariable('score', 0)
      self.setVariable('isMoving', false)
      self.setVariable('canMove', true)
    })

    // Movement input handling - turn-based single-step movement
    this.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
      if (!self.getVariable('canMove')) {
        console.log('❌ Player cannot move (canMove = false) - Press R to reset')
        return
      }
      if (self.getVariable('isMoving')) {
        console.log('❌ Player is already moving - Press R to reset')
        return // Don't interrupt pathfinding movement
      }
      
      // Check if we have game instance and if it's player's turn
      if (!this.gameInstance) {
        console.log('❌ No game instance set for player')
        return
      }
      const turnManager = this.gameInstance.getTurnManager()
      const gameBoard = this.gameInstance.getGameBoard()
      
      if (!turnManager || !gameBoard) {
        console.log('❌ Missing turnManager or gameBoard')
        return
      }
      if (!turnManager.isPlayersTurn()) {
        console.log('❌ Not your turn! Wait for enemies to finish moving.')
        return
      }

      const speed = self.getVariable('speed')
      let newX = self.x
      let newY = self.y

      console.log('Processing key movement for key:', eventData?.key) // Debug

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
        case 'KeyR':
          // Force reset player state (debug/fix key)
          console.log('🔧 Force resetting player state...')
          this.resetPlayerState()
          return
        default:
          console.log('Key not handled:', eventData?.key)
          return // Ignore other keys
      }

      // Round to ensure grid alignment
      newX = Math.floor(newX)
      newY = Math.floor(newY)

      console.log(`Attempting to move from (${self.x}, ${self.y}) to (${newX}, ${newY})`) // Debug

      // Check if the new position is valid and walkable
      if (gameBoard.isValidPosition(newX, newY) && gameBoard.isWalkable(newX, newY)) {
        // Execute single-step movement with enemy response
        console.log('Executing movement to:', newX, newY) // Debug
        this.executeSingleStepMovement(newX, newY)
      } else {
        console.log(`Cannot move to (${newX}, ${newY}) - blocked or out of bounds!`)
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

  /**
   * Execute single-step movement with turn-based enemy response
   */
  private executeSingleStepMovement(newX: number, newY: number): void {
    if (!this.gameInstance) return
    
    // Move player to new position
    this.setPosition(newX, newY)
    console.log(`Player moved to (${newX}, ${newY}) via keyboard`)
    
    // Execute player's turn
    const turnManager = this.gameInstance.getTurnManager()
    turnManager.executePlayerMove()
    
    // Execute one enemy step in response
    setTimeout(() => {
      this.gameInstance.executeEnemyStep()
      
      // Complete the turn
      setTimeout(() => {
        turnManager.completeEnemyTurn()
        this.gameInstance.updateGameRenderer()
      }, 100)
    }, 150) // Small delay for visual feedback
  }

  /**
   * Animate movement along a path
   */
  public animateAlongPath(
    path: { x: number, y: number }[], 
    onStepComplete?: (stepIndex: number) => void,
    onComplete?: () => void
  ): void {
    if (path.length === 0) {
      onComplete?.()
      return
    }

    // Mark player as moving to prevent interruption
    this.setVariable('isMoving', true)
    this.setVariable('canMove', false)

    let currentIndex = 0
    const moveInterval = setInterval(() => {
      if (currentIndex >= path.length) {
        clearInterval(moveInterval)
        this.setVariable('isMoving', false)
        this.setVariable('canMove', true)
        onComplete?.()
        return
      }

      const targetPos = path[currentIndex]
      this.setPosition(targetPos.x, targetPos.y)
      console.log(`Player moved to (${targetPos.x}, ${targetPos.y}) - step ${currentIndex + 1}/${path.length}`)
      
      // Call step completion callback
      onStepComplete?.(currentIndex)
      
      currentIndex++
    }, 300) // 300ms between moves for smooth animation

    // Safety timeout to prevent getting stuck
    setTimeout(() => {
      clearInterval(moveInterval)
      if (this.getVariable('isMoving')) {
        console.log('⚠️ Animation timeout - force resetting player state')
        this.resetPlayerState()
      }
    }, path.length * 300 + 5000) // Give extra time beyond expected animation duration
  }

  public getX(): number {
    return this.x
  }

  public getY(): number {
    return this.y
  }
}
