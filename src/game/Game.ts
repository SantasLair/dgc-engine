import { BaseGame, GameObject, GameEvent, type GameEngineConfig } from '../engine'
import { GameBoard } from './GameBoard'
import { Player } from './Player'
import type { Position } from './types'

/**
 * Turn-based movement game that extends the BaseGame class
 * Demonstrates how to use the GameEngine with GameMaker-style objects
 */
export class Game extends BaseGame {
  private gameBoard: GameBoard
  private player: Player | null = null

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    
    // Initialize game-specific components
    this.gameBoard = new GameBoard(20, 15) // 20x15 grid
  }

  /**
   * Get the engine configuration for this game
   */
  protected getEngineConfig(): GameEngineConfig {
    return {
      canvas: this.canvas,
      gridWidth: 20,
      gridHeight: 15,
      rendererType: 'pixi', // Could be configurable
      targetFPS: 60
    }
  }

  /**
   * Setup game-specific logic after engine creation
   */
  protected async setupGame(): Promise<void> {
    // Setup engine integration
    this.setupEngineIntegration()
    
    // Setup input handlers
    this.setupEventHandlers()
    
    // Create the player object
    this.player = new Player(0, 0)
    
    // Add player to the engine
    this.addObject(this.player)
    
    // Setup player-specific events
    this.setupPlayerMovementIntegration()
    
    // Add custom draw event to trigger renderer updates
    this.player.addEventScript(GameEvent.DRAW, () => {
      this.updateGameRenderer()
    })
    
    // Initial render
    this.updateGameRenderer()
  }

  /**
   * Update the game renderer with game-specific content
   */
  private updateGameRenderer(): void {
    if (!this.isGameInitialized) return
    
    const renderer = this.getRenderer()
    if (!renderer) return
    
    // Clear and redraw the grid (game-specific rendering)
    renderer.clear()
    renderer.drawGrid(this.gameBoard)
    
    // The engine will handle drawing all game objects automatically
    // through its render() method in the game loop
  }

  /**
   * Setup integration between the engine and the renderer
   */
  private setupEngineIntegration(): void {
    // Listen for engine events to trigger rendering updates
    this.addEventListener('object_moved', () => {
      this.updateGameRenderer()
    })
    
    this.addEventListener('object_created', () => {
      this.updateGameRenderer()
    })
    
    this.addEventListener('object_destroyed', () => {
      this.updateGameRenderer()
    })
    
    // Setup global game events
    this.addEventListener('player_moved', (eventData) => {
      const renderer = this.getRenderer()
      if (renderer && eventData?.path) {
        renderer.drawPath(eventData.path)
      }
      if (renderer && eventData?.target) {
        renderer.drawTarget(eventData.target)
      }
    })
    
    this.addEventListener('movement_complete', () => {
      const renderer = this.getRenderer()
      if (renderer) {
        renderer.clearPath()
        renderer.clearTarget()
      }
    })
  }

  /**
   * Setup player movement integration with the engine
   */
  private setupPlayerMovementIntegration(): void {
    if (!this.player) return
    
    // Add click-to-move functionality
    this.player.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (self, eventData) => {
      if (eventData?.mousePosition) {
        const renderer = this.getRenderer()
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
      this.emitEvent('player_moved', { 
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
        this.emitEvent('movement_complete')
        return
      }
      
      // Move to next position
      const nextPos = targetPath[pathIndex]
      player.setPosition(nextPos.x, nextPos.y)
      player.setVariable('pathIndex', pathIndex + 1)
      
      // Emit movement event
      this.emitEvent('object_moved')
      
      // Schedule next step
      setTimeout(moveStep, movementSpeed)
    }
    
    moveStep()
  }

  /**
   * Setup event handlers for mouse interaction
   */
  private setupEventHandlers(): void {
    const renderer = this.getRenderer()
    if (!renderer) return
    
    // Setup input handlers through the renderer
    renderer.setupInputHandlers((position: Position) => {
      const gridPos = renderer.screenToGridWithBoard(position.x, position.y, this.gameBoard)
      
      // Emit engine event
      this.emitEvent('mouse_click', { 
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
   * Create an enemy at a specific position
   */
  public createEnemy(x: number, y: number): GameObject {
    const enemy = this.createObject('Enemy', x, y)
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
    const item = this.createObject('Item', x, y)
    item.solid = false
    item.visible = true
    item.setVariable('itemType', itemType)
    item.setVariable('value', 10)
    
    return item
  }

  /**
   * Get the game board
   */
  public getGameBoard(): GameBoard {
    return this.gameBoard
  }

  /**
   * Restart the game with game-specific logic
   */
  public async restart(): Promise<void> {
    await super.restart()
    // Game-specific restart logic if needed
  }
}
