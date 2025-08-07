import { GameObject, GameEvent } from '../../engine'

/**
 * Enemy class that extends GameObject
 * Provides AI behavior and combat mechanics
 */
export class Enemy extends GameObject {
  constructor(x: number, y: number, enemyType: string = 'guard') {
    // Ensure enemies are placed on grid positions
    super('Enemy', { x: Math.floor(x), y: Math.floor(y) })
    
    // Set enemy properties
    this.solid = true
    this.visible = true
    this.setVariable('health', 50)
    this.setVariable('maxHealth', 50)
    this.setVariable('attackPower', 15)
    this.setVariable('detectionRange', 5)
    this.setVariable('moveSpeed', 1) // Grid-based movement
    this.setVariable('enemyType', enemyType)
    this.setVariable('patrolDirection', Math.floor(Math.random() * 4))
    this.setVariable('patrolTimer', 0)
    this.setVariable('chasing', false)
    this.setVariable('lastAttackTime', 0)
    
    this.setupEnemyEvents()
  }

  private setupEnemyEvents(): void {
    // Create event
    this.addEventScript(GameEvent.CREATE, (self) => {
      console.log(`${self.getVariable('enemyType')} enemy created at`, self.getPosition())
      // Set random patrol timer
      self.setTimer('changeDirection', 2000 + Math.random() * 3000)
    })

    // AI behavior in step event - only update AI state, don't move
    this.addEventScript(GameEvent.STEP, (self) => {
      this.updateAI(self)
    })

    // Collision with player
    this.addEventScript(GameEvent.COLLISION, (self, eventData) => {
      if (eventData?.other?.objectType === 'Player') {
        this.attackPlayer(self, eventData.other)
      }
    })

    // Timer events
    this.addEventScript(GameEvent.TIMER, (self, eventData) => {
      if (eventData?.timerName === 'changeDirection') {
        // Change patrol direction
        self.setVariable('patrolDirection', Math.floor(Math.random() * 4))
        self.setTimer('changeDirection', 2000 + Math.random() * 3000)
      }
    })

    // Destroy event
    this.addEventScript(GameEvent.DESTROY, () => {
      console.log('Enemy defeated!')
    })
  }

  private updateAI(self: GameObject): void {
    // Only update AI during enemy turn (turn-based movement)
    // The actual movement will be triggered by the turn manager
    const players = this.getPlayersInRange(self)
    
    if (players.length > 0) {
      self.setVariable('chasing', true)
      self.setVariable('targetX', Math.floor(players[0].x))
      self.setVariable('targetY', Math.floor(players[0].y))
    } else {
      self.setVariable('chasing', false)
    }
  }

  private getPlayersInRange(_self: GameObject): GameObject[] {
    // For now, return empty array - in a turn-based game, 
    // enemy detection will be handled by the turn manager
    // which will provide player positions when needed
    return []
  }

  /**
   * Execute one turn of movement for this enemy
   * Called by the turn manager during enemy turn
   */
  public executeTurn(gameBoard: any): boolean {
    const isChasing = this.getVariable('chasing')
    
    if (isChasing) {
      return this.moveTowardsTarget(gameBoard)
    } else {
      return this.executePatrolMove(gameBoard)
    }
  }

  private moveTowardsTarget(gameBoard: any): boolean {
    const targetX = this.getVariable('targetX')
    const targetY = this.getVariable('targetY')
    
    if (targetX === undefined || targetY === undefined) return false
    
    // Calculate one step towards target (grid-based)
    const currentX = Math.floor(this.x)
    const currentY = Math.floor(this.y)
    
    let newX = currentX
    let newY = currentY
    
    // Move one grid cell towards target
    if (currentX < targetX) newX++
    else if (currentX > targetX) newX--
    else if (currentY < targetY) newY++
    else if (currentY > targetY) newY--
    
    // Check if the move is valid
    if (this.isValidMove(newX, newY, gameBoard)) {
      this.setPosition(newX, newY)
      console.log(`Enemy chasing: moved to (${newX}, ${newY})`)
      return true
    }
    
    return false
  }

  private executePatrolMove(gameBoard: any): boolean {
    const direction = this.getVariable('patrolDirection')
    const currentX = Math.floor(this.x)
    const currentY = Math.floor(this.y)
    
    let newX = currentX
    let newY = currentY
    
    // Move one grid cell in patrol direction
    switch (direction) {
      case 0: newY--; break // Up
      case 1: newX++; break // Right
      case 2: newY++; break // Down
      case 3: newX--; break // Left
    }
    
    // Check if the move is valid
    if (this.isValidMove(newX, newY, gameBoard)) {
      this.setPosition(newX, newY)
      console.log(`Enemy patrolling: moved to (${newX}, ${newY})`)
      return true
    } else {
      // Hit obstacle or boundary, change direction
      this.setVariable('patrolDirection', (direction + 1) % 4)
      return false
    }
  }

  private isValidMove(x: number, y: number, gameBoard: any): boolean {
    // Check bounds
    if (x < 0 || x >= 20 || y < 0 || y >= 15) {
      return false
    }
    
    // Check if position is walkable on the game board
    if (gameBoard && typeof gameBoard.isWalkable === 'function') {
      if (!gameBoard.isWalkable(x, y)) {
        return false
      }
    }

    // TODO: Check if another enemy is already at this position
    // This would require access to the game engine to query other objects
    // For now, enemies can overlap but this could be improved
    
    return true
  }

  private attackPlayer(self: GameObject, player: GameObject): void {
    const currentTime = Date.now()
    const lastAttackTime = self.getVariable('lastAttackTime')
    const attackCooldown = 1000 // 1 second cooldown
    
    // Check if enemies are on the same grid cell as player
    const enemyX = Math.floor(self.x)
    const enemyY = Math.floor(self.y)
    const playerX = Math.floor(player.x)
    const playerY = Math.floor(player.y)
    
    if (enemyX === playerX && enemyY === playerY && currentTime - lastAttackTime >= attackCooldown) {
      const damage = self.getVariable('attackPower')
      console.log(`Enemy attacks player for ${damage} damage!`)
      
      // If player has takeDamage method, call it
      if (typeof (player as any).takeDamage === 'function') {
        (player as any).takeDamage(damage)
      }
      
      self.setVariable('lastAttackTime', currentTime)
    }
  }

  // Public methods for external interaction
  public takeDamage(amount: number): void {
    const currentHealth = this.getVariable('health')
    const newHealth = Math.max(0, currentHealth - amount)
    this.setVariable('health', newHealth)
    
    console.log(`Enemy takes ${amount} damage! Health: ${newHealth}`)
    
    if (newHealth <= 0) {
      this.destroy()
    }
  }

  public getHealth(): number {
    return this.getVariable('health') || 0
  }

  public isChasing(): boolean {
    return this.getVariable('chasing') || false
  }

  public getEnemyType(): string {
    return this.getVariable('enemyType') || 'guard'
  }

  /**
   * Set the target position for this enemy (called by turn manager)
   */
  public setTarget(targetX: number, targetY: number): void {
    this.setVariable('chasing', true)
    this.setVariable('targetX', targetX)
    this.setVariable('targetY', targetY)
  }

  /**
   * Clear the target (no player in range)
   */
  public clearTarget(): void {
    this.setVariable('chasing', false)
    this.setVariable('targetX', undefined)
    this.setVariable('targetY', undefined)
  }
}
