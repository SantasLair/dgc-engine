import { GameEngine, GameObject, GameEvent, type GameEngineConfig, type IRenderer } from '../engine'
import { GameBoard } from './GameBoard'
import { Player } from './Player'
import type { Position } from './types'

/**
 * Game class that uses the GameEngine with abstracted renderer
 * Main orchestrator for the turn-based movement game with GameMaker-style objects
 */
export class Game {
  private canvas: HTMLCanvasElement
  private gameBoard: GameBoard
  private engine: GameEngine
  private player: Player | null = null
  private isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Initialize game components
    this.gameBoard = new GameBoard(20, 15) // 20x15 grid
    
    // Engine will be created in the start() method using the factory
    this.engine = new GameEngine() // Temporary, will be replaced
    
    this.setupEngineIntegration()
  }

  /**
   * Create and configure the game engine
   */
  private async createEngine(): Promise<GameEngine> {
    const config: GameEngineConfig = {
      canvas: this.canvas,
      gridWidth: 20,
      gridHeight: 15,
      rendererType: 'pixi', // Could be configurable
      targetFPS: 60
    }
    
    return await GameEngine.create(config)
  }

  /**
   * Setup integration between the engine and the renderer
   */
  private setupEngineIntegration(): void {
    // Listen for engine events to trigger rendering updates
    this.engine.addEventListener('object_moved', () => {
      this.updateRenderer()
    })
    
    this.engine.addEventListener('object_created', () => {
      this.updateRenderer()
    })
    
    this.engine.addEventListener('object_destroyed', () => {
      this.updateRenderer()
    })
    
    // Setup global game events
    this.engine.addEventListener('player_moved', (eventData) => {
      const renderer = this.engine.getRenderer()
      if (renderer && eventData?.path) {
        renderer.drawPath(eventData.path)
      }
      if (renderer && eventData?.target) {
        renderer.drawTarget(eventData.target)
      }
    })
    
    this.engine.addEventListener('movement_complete', () => {
      const renderer = this.engine.getRenderer()
      if (renderer) {
        renderer.clearPath()
        renderer.clearTarget()
      }
    })
  }

  /**
   * Start the game
   */
  public async start(): Promise<void> {
    // Create and configure the engine with renderer
    this.engine = await this.createEngine()
    
    // Re-setup integration after engine creation
    this.setupEngineIntegration()
    
    // Setup input handlers through the engine (already done in createEngine)
    // No need to call setupInputHandlers again
    
    // Setup mouse event handling for compatibility
    this.setupEventHandlers()
    
    // Create the player object using the new Player class
    this.player = new Player(0, 0)
    
    // Register the player with the engine
    this.engine.getObjectManager().addExistingObject(this.player)
    
    // Setup player-specific events for movement
    this.setupPlayerMovementIntegration()
    
    // Add custom draw event to trigger renderer updates
    this.player.addEventScript(GameEvent.DRAW, () => {
      this.updateRenderer()
    })
    
    // Start the engine
    await this.engine.start()
    
    // Initial render
    this.updateRenderer()
    this.isInitialized = true
  }

  /**
   * Setup player movement integration with the engine
   */
  private setupPlayerMovementIntegration(): void {
    if (!this.player) return
    
    // Add click-to-move functionality
    this.player.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (self, eventData) => {
      if (eventData?.mousePosition) {
        const renderer = this.engine.getRenderer()
        if (renderer) {
          const gridPos = renderer.screenToGridWithBoard(
            eventData.mousePosition.x,
            eventData.mousePosition.y,
            this.gameBoard
          )
          
          // Calculate path and start movement
          this.handlePlayerMovement(self as Player, gridPos)
        }
      }
    })
  }

  /**
   * Handle player movement through the engine
   */
  private handlePlayerMovement(player: Player, targetPos: Position): void {
    const currentPos = player.getPosition()
    const path = this.calculatePath(currentPos, targetPos)
    
    if (path.length > 0) {
      // Store movement data in player
      player.setVariable('targetPath', path)
      player.setVariable('pathIndex', 0)
      player.setVariable('isMoving', true)
      player.setVariable('movementSpeed', 200) // ms per step
      
      // Emit engine event for UI updates
      this.engine.emitEvent('player_moved', { 
        path: [currentPos, ...path], 
        target: targetPos 
      })
      
      // Start engine-driven movement
      this.startEngineMovement(player)
    }
  }

  /**
   * Engine-driven movement animation
   */
  private startEngineMovement(player: Player): void {
    const moveStep = () => {
      const targetPath = player.getVariable('targetPath')
      const pathIndex = player.getVariable('pathIndex') || 0
      const isMoving = player.getVariable('isMoving')
      const movementSpeed = player.getVariable('movementSpeed') || 200
      
      if (!isMoving || !targetPath || pathIndex >= targetPath.length) {
        // Movement complete
        player.setVariable('isMoving', false)
        this.engine.emitEvent('movement_complete')
        return
      }
      
      // Move to next position
      const nextPos = targetPath[pathIndex]
      player.setPosition(nextPos.x, nextPos.y)
      player.setVariable('pathIndex', pathIndex + 1)
      
      // Emit movement event
      this.engine.emitEvent('object_moved')
      
      // Schedule next step
      setTimeout(moveStep, movementSpeed)
    }
    
    moveStep()
  }

  /**
   * Setup event handlers for mouse interaction
   */
  private setupEventHandlers(): void {
    const renderer = this.engine.getRenderer()
    if (!renderer) return
    
    // Setup input handlers through the renderer
    renderer.setupInputHandlers((position: Position) => {
      const gridPos = renderer.screenToGridWithBoard(position.x, position.y, this.gameBoard)
      
      // Emit engine event
      this.engine.emitEvent('mouse_click', { 
        mousePosition: { x: position.x, y: position.y },
        gridPosition: gridPos
      })
      
      // Move player if we have one
      if (this.player) {
        this.handlePlayerMovement(this.player, gridPos)
      }
    })
  }

  /**
   * Calculate a simple path between two points
   */
  private calculatePath(start: Position, end: Position): Position[] {
    const path: Position[] = []
    let current = { ...start }
    
    while (current.x !== end.x || current.y !== end.y) {
      // Move one step closer to target
      if (current.x < end.x) current.x++
      else if (current.x > end.x) current.x--
      
      if (current.y < end.y) current.y++
      else if (current.y > end.y) current.y--
      
      // Check if the cell is walkable
      if (this.gameBoard.isWalkable(current.x, current.y)) {
        path.push({ ...current })
      } else {
        // Simple obstacle avoidance - try alternative paths
        break
      }
    }
    
    return path
  }

  /**
   * Update the renderer with current game state
   * The engine now handles most rendering automatically
   */
  private updateRenderer(): void {
    if (!this.isInitialized) return
    
    const renderer = this.engine.getRenderer()
    if (!renderer) return
    
    // Clear and redraw the grid (game-specific rendering)
    renderer.clear()
    renderer.drawGrid(this.gameBoard)
    
    // The engine will handle drawing all game objects automatically
    // through its render() method in the game loop
  }

  /**
   * Create an enemy at a specific position
   */
  public createEnemy(x: number, y: number): GameObject {
    const enemy = this.engine.createObject('Enemy', x, y)
    enemy.solid = true
    enemy.visible = true
    enemy.setVariable('health', 50)
    
    // Add simple AI behavior
    enemy.addEventScript(GameEvent.STEP, (self) => {
      // Simple random movement
      if (Math.random() < 0.01) { // 1% chance per frame
        const direction = Math.floor(Math.random() * 4)
        const currentPos = self.getPosition()
        let newX = currentPos.x
        let newY = currentPos.y
        
        switch (direction) {
          case 0: newY--; break // Up
          case 1: newY++; break // Down
          case 2: newX--; break // Left
          case 3: newX++; break // Right
        }
        
        // Check bounds and walkability
        if (this.gameBoard.isWalkable(newX, newY)) {
          self.setPosition(newX, newY)
        }
      }
    })
    
    return enemy
  }

  /**
   * Create an item at a specific position
   */
  public createItem(x: number, y: number, itemType: string = 'coin'): GameObject {
    const item = this.engine.createObject('Item', x, y)
    item.solid = false
    item.visible = true
    item.setVariable('itemType', itemType)
    item.setVariable('value', 10)
    
    return item
  }

  /**
   * Get the game engine for advanced usage
   */
  public getEngine(): GameEngine {
    return this.engine
  }

  /**
   * Get the renderer
   */
  public getRenderer(): IRenderer | null {
    return this.engine.getRenderer()
  }

  /**
   * Get the game board
   */
  public getGameBoard(): GameBoard {
    return this.gameBoard
  }

  /**
   * Check if the game is initialized
   */
  public get isGameInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Stop the game
   */
  public async stop(): Promise<void> {
    await this.engine.stop()
  }

  /**
   * Restart the game
   */
  public async restart(): Promise<void> {
    this.engine.restart()
    this.player = new Player(0, 0)
    this.engine.getObjectManager().addExistingObject(this.player)
    this.updateRenderer()
  }
}
