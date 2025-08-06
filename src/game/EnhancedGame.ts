import { GameEngine, GameObject, GameEvent, createPlayerObject } from '../engine'
import { PixiRenderer } from './PixiRenderer'
import { GameBoard } from './GameBoard'
import type { Position } from './types'

/**
 * Enhanced Game class that integrates the new GameEngine with the existing renderer
 * This bridges the old turn-based system with the new object-oriented engine
 */
export class EnhancedGame {
  private canvas: HTMLCanvasElement
  private gameBoard: GameBoard
  private renderer: PixiRenderer
  private engine: GameEngine
  private player: GameObject | null = null
  private isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Initialize game components
    this.gameBoard = new GameBoard(20, 15) // 20x15 grid
    this.renderer = new PixiRenderer(this.canvas, this.canvas.width, this.canvas.height)
    this.engine = new GameEngine()
    
    this.setupEngineIntegration()
  }

  /**
   * Setup integration between the engine and the renderer
   */
  private setupEngineIntegration(): void {
    // Listen for draw events to update the renderer
    this.engine.addEventListener('object_draw', (_eventData) => {
      this.updateRenderer()
    })
    
    // Setup mouse click handling for grid-based movement
    this.engine.addEventListener('mouse_click', (eventData) => {
      if (eventData?.mousePosition && this.player) {
        const gridPos = this.renderer.screenToGrid(
          eventData.mousePosition.x, 
          eventData.mousePosition.y, 
          this.gameBoard
        )
        
        // Show path preview
        this.showMovementPath(this.player.getPosition(), gridPos)
      }
    })
  }

  /**
   * Start the enhanced game
   */
  public async start(): Promise<void> {
    console.log('Starting enhanced game with new engine...')
    
    // Wait for Pixi to initialize
    await this.renderer.waitForReady()
    
    // Setup mouse event handling for Pixi
    this.setupPixiEventHandlers()
    
    // Create the player object using the new engine
    this.player = createPlayerObject(this.engine, 0, 0)
    
    // Add custom draw event to the player for Pixi rendering
    this.player.addEventScript(GameEvent.DRAW, (_self) => {
      // This will trigger our renderer update
      this.updateRenderer()
    })
    
    // Start the engine
    await this.engine.start()
    
    // Initial render
    this.updateRenderer()
    this.isInitialized = true
    
    console.log('Enhanced game started successfully!')
  }

  /**
   * Setup Pixi event handlers for mouse interaction
   */
  private setupPixiEventHandlers(): void {
    const app = this.renderer.getApp()
    
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    
    app.stage.on('pointerdown', (event) => {
      const globalPos = event.global
      const gridPos = this.renderer.screenToGrid(globalPos.x, globalPos.y, this.gameBoard)
      
      // Emit engine event
      this.engine.emitEvent('mouse_click', { 
        mousePosition: { x: globalPos.x, y: globalPos.y },
        gridPosition: gridPos
      })
      
      // Move player if we have one
      if (this.player) {
        this.movePlayerTo(gridPos)
      }
    })
  }

  /**
   * Move player to a grid position with pathfinding
   */
  private movePlayerTo(targetPos: Position): void {
    if (!this.player) return
    
    const currentPos = this.player.getPosition()
    
    // Simple pathfinding (can be enhanced with EasyStar later)
    const path = this.calculatePath(currentPos, targetPos)
    
    if (path.length > 0) {
      this.player.setVariable('targetPath', path)
      this.player.setVariable('pathIndex', 0)
      this.player.setVariable('isMoving', true)
      
      // Show path preview
      this.renderer.drawPath(path)
      this.renderer.drawTarget(targetPos)
      
      // Start moving along the path
      this.startMovementAnimation()
    }
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
   * Start animated movement along the path
   */
  private startMovementAnimation(): void {
    if (!this.player) return
    
    const animateMovement = () => {
      const targetPath = this.player!.getVariable('targetPath')
      const pathIndex = this.player!.getVariable('pathIndex') || 0
      const isMoving = this.player!.getVariable('isMoving')
      
      if (!isMoving || !targetPath || pathIndex >= targetPath.length) {
        // Movement complete
        this.player!.setVariable('isMoving', false)
        this.renderer.clearPath()
        this.renderer.clearTarget()
        return
      }
      
      // Move to next position in path
      const nextPos = targetPath[pathIndex]
      this.player!.setPosition(nextPos.x, nextPos.y)
      this.player!.setVariable('pathIndex', pathIndex + 1)
      
      // Update renderer
      this.updateRenderer()
      
      // Continue animation
      setTimeout(animateMovement, 200) // 200ms per step
    }
    
    animateMovement()
  }

  /**
   * Show movement path preview
   */
  private showMovementPath(start: Position, end: Position): void {
    const path = this.calculatePath(start, end)
    if (path.length > 0) {
      this.renderer.drawPath([start, ...path])
      this.renderer.drawTarget(end)
    }
  }

  /**
   * Update the renderer with current game state
   */
  private updateRenderer(): void {
    if (!this.isInitialized) return
    
    // Clear and redraw
    this.renderer.clear()
    this.renderer.drawGrid(this.gameBoard)
    
    // Draw all game objects
    const allObjects = this.engine.getObjectManager().getAllObjects()
    
    for (const obj of allObjects) {
      if (!obj.visible) continue
      
      switch (obj.objectType) {
        case 'Player':
          // Use existing player drawing logic
          this.renderer.drawPlayer({
            getPosition: () => obj.getPosition()
          } as any)
          break
          
        case 'Enemy':
          // Draw enemies as red circles
          this.drawEnemy(obj)
          break
          
        case 'Item':
          // Draw items as yellow squares
          this.drawItem(obj)
          break
      }
    }
  }

  /**
   * Draw an enemy object
   */
  private drawEnemy(enemy: GameObject): void {
    // For now, we'll extend the renderer or draw manually
    // This is a placeholder - you'd extend PixiRenderer with drawEnemy method
    console.log('Drawing enemy at', enemy.getPosition())
  }

  /**
   * Draw an item object
   */
  private drawItem(item: GameObject): void {
    // Placeholder for item drawing
    console.log('Drawing item at', item.getPosition())
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
  public getRenderer(): PixiRenderer {
    return this.renderer
  }

  /**
   * Get the game board
   */
  public getGameBoard(): GameBoard {
    return this.gameBoard
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
    this.player = createPlayerObject(this.engine, 0, 0)
    this.updateRenderer()
  }
}
