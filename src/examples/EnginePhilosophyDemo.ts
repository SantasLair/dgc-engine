/**
 * DGC Engine Philosophy Demo
 * 
 * This engine embodies a BRIDGE PHILOSOPHY that connects:
 * 1. Classic GameMaker game development traditions
 * 2. Modern TypeScript/JavaScript web technologies
 * 
 * The philosophy enables developers to choose their preferred approach
 * while providing smooth evolution paths between paradigms.
 */

import { DGCEngine } from '../engine/DGCEngine'
import { GameObject } from '../engine/GameObject'
import { GameObjectManager } from '../engine/GameObjectManager'
import { noone, Player, Enemy, PowerUp, type ObjectTypeOrAll } from '../engine/GameObjectTypes'

// ===================================================================
// CLASSIC GAMEMAKER GML-STYLE PROGRAMMING (Function-Based)
// ===================================================================

/**
 * Classic GML-style approach: Use engine as global context
 * Functions work with engine instance directly, just like GML
 */
class ClassicGMLStyle {
  private engine: DGCEngine
  private gameObjectManager: GameObjectManager

  constructor(engine: DGCEngine) {
    this.engine = engine
    this.gameObjectManager = engine.getObjectManager()
  }

  // Classic GML-style functions - procedural approach
  createPlayer(x: number, y: number): void {
    // Just like: instance_create_layer(x, y, "Instances", obj_Player)
    this.gameObjectManager.createObject(Player, x, y)
    
    // Show debug message like GML
    this.show_debug_message("Player created at " + x + ", " + y)
  }

  createEnemy(x: number, y: number): void {
    // Just like GML: instance_create_layer(x, y, "Instances", obj_Enemy)
    this.gameObjectManager.createObject(Enemy, x, y)
    this.show_debug_message("Enemy spawned!")
  }

  // Classic GML function patterns
  show_debug_message(message: string): void {
    console.log(`[DEBUG] ${message}`)
  }

  // GML-style collision checking
  place_meeting(x: number, y: number, objectType: ObjectTypeOrAll): boolean {
    // Simplified collision check - in real GML this would check position collision
    const objects = this.gameObjectManager.getObjectsByType(objectType)
    return objects.some(obj => 
      Math.abs(obj.x - x) < 32 && Math.abs(obj.y - y) < 32
    )
  }

  // GML-style instance finding and manipulation
  findAndDestroyNearestEnemy(playerX: number, playerY: number): void {
    const nearestEnemy = this.gameObjectManager.instance_nearest(playerX, playerY, Enemy)
    
    if (nearestEnemy !== noone) {
      this.show_debug_message("Destroying enemy at " + nearestEnemy.x + ", " + nearestEnemy.y)
      this.gameObjectManager.destroyObject(nearestEnemy.id)
    } else {
      this.show_debug_message("No enemies found")
    }
  }

  // Classic GML game loop style
  gameStep(): void {
    // Check win condition
    if (this.engine.instance_number(Enemy) === 0) {
      this.show_debug_message("All enemies defeated! You win!")
    }

    // Check lose condition  
    if (!this.engine.instance_exists(Player)) {
      this.show_debug_message("Player destroyed! Game over!")
    }

    // Spawn more enemies if needed
    if (this.engine.instance_number(Enemy) < 3) {
      this.createEnemy(
        Math.random() * 800,
        Math.random() * 600
      )
    }
  }
}

// ===================================================================
// MODERN TYPESCRIPT/JAVASCRIPT PROGRAMMING (Object-Oriented)
// ===================================================================

/**
 * Modern TypeScript approach: Use classes, interfaces, and modern patterns
 * Leverages TypeScript's type system and modern JavaScript features
 */

interface GameState {
  player: GameObject | null
  enemies: GameObject[]
  powerups: GameObject[]
  score: number
  level: number
}

interface GameConfig {
  maxEnemies: number
  spawnRate: number
  powerupChance: number
}

class ModernGameManager {
  private gameObjectManager: GameObjectManager
  private state: GameState
  private config: GameConfig
  private spawnTimer: number = 0

  constructor(engine: DGCEngine, config: GameConfig) {
    this.gameObjectManager = engine.getObjectManager()
    this.config = config
    this.state = {
      player: null,
      enemies: [],
      powerups: [],
      score: 0,
      level: 1
    }
  }

  // Modern async/promise-based initialization
  async initialize(): Promise<void> {
    try {
      this.state.player = this.createPlayer({ x: 400, y: 300 })
      this.spawnInitialEnemies()
      console.log('✅ Game initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize game:', error)
      throw error
    }
  }

  // Modern object creation with configuration objects
  private createPlayer(position: { x: number, y: number }): GameObject {
    const player = this.gameObjectManager.createObject(Player, position.x, position.y)
    
    // Modern approach: use GameObject's variable system
    player.setVariable('health', 100)
    player.setVariable('maxSpeed', 5)
    player.setVariable('score', 0)
    
    return player
  }

  // Type-safe enemy management
  private spawnInitialEnemies(): void {
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ]

    this.state.enemies = enemyPositions.map(pos => 
      this.createEnemy(pos)
    )
  }

  private createEnemy(position: { x: number, y: number }): GameObject {
    const enemy = this.gameObjectManager.createObject(Enemy, position.x, position.y)
    
    // Modern approach: configure enemy properties
    enemy.setVariable('health', 50)
    enemy.setVariable('speed', 2)
    enemy.setVariable('attackDamage', 10)

    return enemy
  }

  // Modern event-driven programming
  public handleCollision(player: GameObject, other: GameObject): void {
    switch (other.objectType) {
      case Enemy:
        this.handlePlayerEnemyCollision(player, other)
        break
      case PowerUp:
        this.handlePlayerPowerupCollision(player, other)
        break
    }
  }

  private handlePlayerEnemyCollision(player: GameObject, enemy: GameObject): void {
    console.log('💥 Player hit enemy!')
    
    // Modern approach: update player health
    const currentHealth = player.getVariable('health') || 100
    const damage = enemy.getVariable('attackDamage') || 10
    player.setVariable('health', currentHealth - damage)
    
    if (currentHealth - damage <= 0) {
      this.handlePlayerDestroy(player)
    }
  }

  private handlePlayerPowerupCollision(player: GameObject, powerup: GameObject): void {
    console.log('⭐ Player collected powerup!')
    this.state.score += 50
    
    // Boost player stats
    const currentHealth = player.getVariable('health') || 100
    player.setVariable('health', Math.min(currentHealth + 25, 100))
    
    this.gameObjectManager.destroyObject(powerup.id)
  }

  private handlePlayerDestroy(player: GameObject): void {
    console.log('💀 Player destroyed!')
    this.state.player = null
    this.gameObjectManager.destroyObject(player.id)
    this.triggerGameOver()
  }

  // Modern state management with immutable updates
  public updateGameState(deltaTime: number): void {
    this.spawnTimer += deltaTime

    // Spawn new enemies with rate limiting
    if (this.spawnTimer >= this.config.spawnRate && 
        this.state.enemies.length < this.config.maxEnemies) {
      
      this.spawnRandomEnemy()
      this.spawnTimer = 0

      // Random powerup spawning
      if (Math.random() < this.config.powerupChance) {
        this.spawnRandomPowerup()
      }
    }

    // Update state arrays (modern functional approach)
    this.state.enemies = this.getActiveEnemies()
    this.state.powerups = this.getActivePowerups()
  }

  // Modern functional programming patterns
  private getActiveEnemies(): GameObject[] {
    return this.gameObjectManager
      .getObjectsByType(Enemy)
      .filter(enemy => enemy.active)
  }

  private getActivePowerups(): GameObject[] {
    return this.gameObjectManager
      .getObjectsByType(PowerUp)
      .filter(powerup => powerup.active)
  }

  private spawnRandomEnemy(): void {
    const position = this.generateRandomSpawnPosition()
    this.state.enemies.push(this.createEnemy(position))
  }

  private spawnRandomPowerup(): void {
    const position = this.generateRandomSpawnPosition()
    const powerup = this.gameObjectManager.createObject(PowerUp, position.x, position.y)
    this.state.powerups.push(powerup)
  }

  private generateRandomSpawnPosition(): { x: number, y: number } {
    return {
      x: Math.random() * 800,
      y: Math.random() * 600
    }
  }

  // Modern Promise-based game flow - check win condition manually
  public checkWinCondition(): void {
    if (this.state.enemies.length === 0) {
      this.levelComplete()
    }
  }

  private async levelComplete(): Promise<void> {
    this.state.level++
    this.config.maxEnemies += 2
    this.config.spawnRate *= 0.9 // Faster spawning

    console.log(`🎉 Level ${this.state.level} complete!`)
    console.log(`📊 Score: ${this.state.score}`)
    
    // Modern async delay
    await this.delay(2000)
    this.spawnInitialEnemies()
  }

  private async triggerGameOver(): Promise<void> {
    console.log('💀 Game Over!')
    console.log(`Final Score: ${this.state.score}`)
    console.log(`Level Reached: ${this.state.level}`)
    
    // Modern cleanup
    this.cleanup()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private cleanup(): void {
    this.state.enemies.length = 0
    this.state.powerups.length = 0
    this.state.player = null
  }

  // Modern getter for immutable state access
  public getGameState(): Readonly<GameState> {
    return Object.freeze({ ...this.state })
  }
}

// ===================================================================
// HYBRID APPROACH - BEST OF BOTH WORLDS
// ===================================================================

/**
 * Hybrid approach: Use both styles where each makes sense
 * Classic GML for simple operations, modern patterns for complex logic
 */
class HybridGameManager {
  private classicGML: ClassicGMLStyle
  private modernManager: ModernGameManager

  constructor(engine: DGCEngine) {
    this.classicGML = new ClassicGMLStyle(engine)
    this.modernManager = new ModernGameManager(engine, {
      maxEnemies: 5,
      spawnRate: 3000,
      powerupChance: 0.2
    })
  }

  // Use classic GML for simple, immediate operations
  quickSpawnEnemy(): void {
    this.classicGML.createEnemy(
      Math.random() * 800,
      Math.random() * 600
    )
  }

  // Use modern patterns for complex state management
  async initializeGame(): Promise<void> {
    await this.modernManager.initialize()
    
    // But use classic GML for debug output
    this.classicGML.show_debug_message("Game initialized with hybrid approach!")
  }

  // Combine both approaches in game loop
  gameUpdate(deltaTime: number): void {
    // Use modern manager for complex state updates
    this.modernManager.updateGameState(deltaTime)
    
    // Use classic GML for simple checks and actions
    this.classicGML.gameStep()
    
    // Example: Modern approach for finding, classic for action
    const gameState = this.modernManager.getGameState()
    if (gameState.player && gameState.enemies.length > 0) {
      // Classic GML-style immediate action
      this.classicGML.findAndDestroyNearestEnemy(
        gameState.player.x,
        gameState.player.y
      )
    }
  }
}

// ===================================================================
// DEMO USAGE - SHOWING BOTH PARADIGMS
// ===================================================================

export function demonstrateEnginePhilosophy(): void {
  console.log('� DGC Engine Philosophy Demo')
  console.log('============================')
  console.log('')
  
  console.log('DGC Engine embodies a BRIDGE PHILOSOPHY that connects:')
  console.log('')
  
  console.log('🎮 CLASSIC GAME DEVELOPMENT (GameMaker Tradition):')
  console.log('   • instance_create(), instance_destroy(), show_debug_message()')
  console.log('   • Unquoted keywords: all, noone, Player, Enemy')
  console.log('   • Procedural, immediate-action programming')
  console.log('   • Perfect for rapid prototyping and familiar workflows')
  console.log('')
  
  console.log('💻 MODERN WEB DEVELOPMENT (TypeScript/JavaScript):')
  console.log('   • Classes, interfaces, async/await, modules')
  console.log('   • Type safety and modern IDE support')
  console.log('   • Event-driven architecture and functional patterns')
  console.log('   • Scalable, maintainable code organization')
  console.log('')
  
  console.log('🌉 BRIDGE APPROACH (Best of Both Worlds):')
  console.log('   • Choose the right tool for each task')
  console.log('   • Natural evolution from prototype to production')
  console.log('   • Team members can use their preferred style')
  console.log('   • No forced paradigms or artificial limitations')
  console.log('')
  
  console.log('🎯 ENGINE PHILOSOPHY BENEFITS:')
  console.log('   ✅ GameMaker developers feel immediately at home')
  console.log('   ✅ Web developers get modern tools and patterns')
  console.log('   ✅ Projects can evolve naturally over time')
  console.log('   ✅ Teams with mixed backgrounds can collaborate')
  console.log('   ✅ Full TypeScript benefits without complexity overhead')
  console.log('')
  
  console.log('� RECOMMENDED APPROACH:')
  console.log('   • Start with familiar patterns (GameMaker or modern)')
  console.log('   • Use the bridge philosophy to explore other approaches')
  console.log('   • Adopt what works for your team and project')
  console.log('   • Evolve your architecture as requirements grow')
  console.log('')
  
  console.log('💡 CORE INSIGHT:')
  console.log('   This is not about choosing GameMaker OR modern web development.')
  console.log('   It\'s about creating a bridge that honors both traditions')
  console.log('   while enabling developers to work in their comfort zone')
  console.log('   and grow into new paradigms when ready.')
}

// Run demo if this file is executed directly
if (typeof window === 'undefined') {
  demonstrateEnginePhilosophy()
}

// Export for easy access
export { ClassicGMLStyle, ModernGameManager, HybridGameManager }
