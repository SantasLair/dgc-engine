import { GameObject, GameEvent } from '../engine'

/**
 * Enemy class that extends GameObject
 * Provides AI behavior and combat mechanics
 */
export class Enemy extends GameObject {
  constructor(x: number, y: number, enemyType: string = 'guard') {
    super('Enemy', { x, y })
    
    // Set enemy properties
    this.solid = true
    this.visible = true
    this.setVariable('health', 50)
    this.setVariable('maxHealth', 50)
    this.setVariable('attackPower', 15)
    this.setVariable('detectionRange', 5)
    this.setVariable('moveSpeed', 0.5)
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

    // AI behavior in step event
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
    // Simple AI: patrol or chase player
    const players = this.getPlayersInRange(self)
    
    if (players.length > 0) {
      this.chasePlayer(self, players[0])
    } else {
      this.patrol(self)
    }
  }

  private getPlayersInRange(_self: GameObject): GameObject[] {
    // This would normally use the engine's object query system
    // For now, we'll simulate it - in a full implementation,
    // you'd query the engine for nearby players
    return []
  }

  private chasePlayer(self: GameObject, player: GameObject): void {
    self.setVariable('chasing', true)
    
    const dx = Math.sign(player.x - self.x)
    const dy = Math.sign(player.y - self.y)
    const speed = self.getVariable('moveSpeed')
    
    const newX = self.x + dx * speed
    const newY = self.y + dy * speed
    
    // Boundary checking
    if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15) {
      self.setPosition(newX, newY)
    }
  }

  private patrol(self: GameObject): void {
    self.setVariable('chasing', false)
    
    const direction = self.getVariable('patrolDirection')
    const speed = 0.3
    let dx = 0, dy = 0
    
    switch (direction) {
      case 0: dy = -speed; break // Up
      case 1: dx = speed; break  // Right
      case 2: dy = speed; break  // Down
      case 3: dx = -speed; break // Left
    }
    
    const newX = self.x + dx
    const newY = self.y + dy
    
    // Boundary checking and direction change on collision
    if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15) {
      self.setPosition(newX, newY)
    } else {
      // Hit boundary, change direction
      self.setVariable('patrolDirection', (direction + 1) % 4)
    }
  }

  private attackPlayer(self: GameObject, player: GameObject): void {
    const currentTime = Date.now()
    const lastAttackTime = self.getVariable('lastAttackTime')
    const attackCooldown = 1000 // 1 second cooldown
    
    if (currentTime - lastAttackTime >= attackCooldown) {
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
}
