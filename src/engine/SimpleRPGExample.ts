import { GameEngine, GameObject, GameEvent } from '../engine'

/**
 * Complete example showing how to build a simple game with the GameMaker-style engine
 * This creates a mini RPG-style game with player, enemies, items, and score system
 */

export class SimpleRPGExample {
  private engine: GameEngine
  private player: GameObject | null = null
  private score: number = 0

  constructor() {
    this.engine = new GameEngine()
    this.setupGlobalEvents()
  }

  /**
   * Setup global game events
   */
  private setupGlobalEvents(): void {
    // Game start event
    this.engine.addEventListener('game_start', () => {
      console.log('🎮 Simple RPG Started!')
      this.createWorld()
    })

    // Custom events
    this.engine.addEventListener('player_scored', (eventData) => {
      this.score += eventData?.points || 0
      console.log(`💰 Score: ${this.score}`)
    })

    this.engine.addEventListener('enemy_defeated', (_eventData) => {
      console.log('⚔️ Enemy defeated!')
      this.score += 50
      this.spawnRandomItem()
    })
  }

  /**
   * Create the game world
   */
  private createWorld(): void {
    // Create player
    this.player = this.createPlayerCharacter(5, 5)

    // Create some enemies
    this.createEnemyGuard(10, 3)
    this.createEnemyGuard(15, 8)
    this.createEnemyGuard(3, 12)

    // Create treasure items
    this.createTreasure(18, 2, 'gold', 25)
    this.createTreasure(2, 8, 'gem', 50)
    this.createTreasure(12, 14, 'coin', 10)

    // Spawn enemies periodically
    this.engine.setGlobalVariable('enemySpawnTimer', 0)
  }

  /**
   * Create player character with full RPG mechanics
   */
  private createPlayerCharacter(x: number, y: number): GameObject {
    const player = this.engine.createObject('Player', x, y)

    // Character stats
    player.solid = true
    player.visible = true
    player.setVariable('health', 100)
    player.setVariable('maxHealth', 100)
    player.setVariable('attackPower', 20)
    player.setVariable('speed', 1)
    player.setVariable('invulnerable', false)
    player.setVariable('invulnerabilityTime', 0)

    // Create event
    player.addEventScript(GameEvent.CREATE, (self) => {
      console.log('🧙‍♂️ Hero created! Ready for adventure!')
      self.setVariable('lastAttackTime', 0)
    })

    // Movement and input handling
    player.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
      if (!self.getVariable('canMove')) return

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
          // Attack nearby enemies
          this.playerAttack(self)
          return
      }

      // Boundary checking (assuming 20x15 grid)
      if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15) {
        self.setPosition(newX, newY)
      }
    })

    // Update loop
    player.addEventScript(GameEvent.STEP, (self) => {
      // Handle invulnerability frames
      if (self.getVariable('invulnerable')) {
        const invulTime = self.getVariable('invulnerabilityTime') - this.engine.getDeltaTime()
        self.setVariable('invulnerabilityTime', invulTime)
        
        if (invulTime <= 0) {
          self.setVariable('invulnerable', false)
        }
      }

      // Health regeneration
      const health = self.getVariable('health')
      const maxHealth = self.getVariable('maxHealth')
      if (health < maxHealth && Math.random() < 0.001) { // 0.1% chance per frame
        self.setVariable('health', Math.min(maxHealth, health + 1))
      }
    })

    // Collision handling
    player.addEventScript(GameEvent.COLLISION, (self, eventData) => {
      const other = eventData?.other
      if (!other) return

      switch (other.objectType) {
        case 'Enemy':
          if (!self.getVariable('invulnerable')) {
            this.playerTakeDamage(self, 15)
          }
          break
        case 'Treasure':
          this.collectTreasure(self, other)
          break
      }
    })

    return player
  }

  /**
   * Player attack mechanics
   */
  private playerAttack(player: GameObject): void {
    const attackRange = 2
    const currentPos = player.getPosition()
    
    // Find enemies in range
    const nearbyEnemies = this.engine.getObjectsNear(currentPos, attackRange, 'Enemy')
    
    if (nearbyEnemies.length > 0) {
      const target = nearbyEnemies[0]
      const damage = player.getVariable('attackPower')
      
      console.log('⚔️ Player attacks enemy!')
      this.damageEnemy(target, damage)
    } else {
      console.log('💨 Attack missed - no enemies in range')
    }
  }

  /**
   * Player takes damage
   */
  private playerTakeDamage(player: GameObject, damage: number): void {
    const currentHealth = player.getVariable('health')
    const newHealth = Math.max(0, currentHealth - damage)
    player.setVariable('health', newHealth)
    
    // Set invulnerability frames
    player.setVariable('invulnerable', true)
    player.setVariable('invulnerabilityTime', 1) // 1 second
    
    console.log(`💔 Player takes ${damage} damage! Health: ${newHealth}`)
    
    if (newHealth <= 0) {
      console.log('💀 Game Over!')
      this.engine.emitEvent('game_over', { finalScore: this.score })
    }
  }

  /**
   * Create enemy guard with AI
   */
  private createEnemyGuard(x: number, y: number): GameObject {
    const enemy = this.engine.createObject('Enemy', x, y)

    enemy.solid = true
    enemy.visible = true
    enemy.setVariable('health', 40)
    enemy.setVariable('attackPower', 15)
    enemy.setVariable('detectionRange', 5)
    enemy.setVariable('moveSpeed', 0.5)
    enemy.setVariable('patrolDirection', Math.floor(Math.random() * 4))
    enemy.setVariable('patrolTimer', 0)
    enemy.setVariable('chasing', false)

    // AI behavior
    enemy.addEventScript(GameEvent.STEP, (self) => {
      const player = this.engine.getNearestObject(self.getPosition(), 'Player')
      if (!player) return

      const distance = Math.sqrt(
        Math.pow(player.x - self.x, 2) + Math.pow(player.y - self.y, 2)
      )

      const detectionRange = self.getVariable('detectionRange')
      
      if (distance <= detectionRange) {
        // Chase player
        self.setVariable('chasing', true)
        const dx = Math.sign(player.x - self.x)
        const dy = Math.sign(player.y - self.y)
        const speed = self.getVariable('moveSpeed')
        
        self.move(dx * speed, dy * speed)
      } else {
        // Patrol behavior
        self.setVariable('chasing', false)
        this.enemyPatrol(self)
      }
    })

    // Collision with player
    enemy.addEventScript(GameEvent.COLLISION, (_self, eventData) => {
      if (eventData?.other?.objectType === 'Player') {
        console.log('👹 Enemy attacks player!')
      }
    })

    return enemy
  }

  /**
   * Enemy patrol AI
   */
  private enemyPatrol(enemy: GameObject): void {
    let patrolTimer = enemy.getVariable('patrolTimer')
    patrolTimer += this.engine.getDeltaTime()
    
    if (patrolTimer >= 2) { // Change direction every 2 seconds
      enemy.setVariable('patrolDirection', Math.floor(Math.random() * 4))
      patrolTimer = 0
    }
    
    enemy.setVariable('patrolTimer', patrolTimer)
    
    const direction = enemy.getVariable('patrolDirection')
    const speed = 0.3
    
    switch (direction) {
      case 0: enemy.move(0, -speed); break // Up
      case 1: enemy.move(speed, 0); break  // Right
      case 2: enemy.move(0, speed); break  // Down
      case 3: enemy.move(-speed, 0); break // Left
    }
  }

  /**
   * Damage an enemy
   */
  private damageEnemy(enemy: GameObject, damage: number): void {
    const currentHealth = enemy.getVariable('health')
    const newHealth = Math.max(0, currentHealth - damage)
    enemy.setVariable('health', newHealth)
    
    console.log(`Enemy takes ${damage} damage! Health: ${newHealth}`)
    
    if (newHealth <= 0) {
      enemy.destroy()
      this.engine.emitEvent('enemy_defeated', { enemy })
    }
  }

  /**
   * Create treasure item
   */
  private createTreasure(x: number, y: number, type: string, value: number): GameObject {
    const treasure = this.engine.createObject('Treasure', x, y)

    treasure.solid = false
    treasure.visible = true
    treasure.setVariable('treasureType', type)
    treasure.setVariable('value', value)
    treasure.setVariable('bobTime', Math.random() * Math.PI * 2)

    // Bobbing animation
    treasure.addEventScript(GameEvent.STEP, (self) => {
      let bobTime = self.getVariable('bobTime')
      bobTime += this.engine.getDeltaTime() * 3
      self.setVariable('bobTime', bobTime)
    })

    return treasure
  }

  /**
   * Collect treasure
   */
  private collectTreasure(_player: GameObject, treasure: GameObject): void {
    const value = treasure.getVariable('value')
    const type = treasure.getVariable('treasureType')
    
    console.log(`✨ Collected ${type} worth ${value} points!`)
    
    treasure.destroy()
    this.engine.emitEvent('player_scored', { points: value })
  }

  /**
   * Spawn random item
   */
  private spawnRandomItem(): void {
    const x = Math.floor(Math.random() * 20)
    const y = Math.floor(Math.random() * 15)
    const treasureTypes = [
      { type: 'coin', value: 10 },
      { type: 'gem', value: 25 },
      { type: 'gold', value: 50 }
    ]
    const treasure = treasureTypes[Math.floor(Math.random() * treasureTypes.length)]
    
    this.createTreasure(x, y, treasure.type, treasure.value)
  }

  /**
   * Start the game
   */
  public async start(): Promise<void> {
    console.log('🚀 Starting Simple RPG Example...')
    await this.engine.start()
  }

  /**
   * Get the engine for external access
   */
  public getEngine(): GameEngine {
    return this.engine
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.score
  }

  /**
   * Get player health
   */
  public getPlayerHealth(): number {
    return this.player?.getVariable('health') || 0
  }
}

// Usage example:
// const game = new SimpleRPGExample()
// await game.start()
