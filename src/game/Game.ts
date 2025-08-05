import * as EasyStar from 'easystarjs'
import { GameBoard } from './GameBoard'
import { Player } from './Player'
import { Renderer } from './Renderer'
import type { Position } from './types'

/**
 * Main game class that manages the turn-based movement game
 */
export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private gameBoard: GameBoard
  private player: Player
  private renderer: Renderer
  private easystar: EasyStar.js
  private currentTurn: number = 1
  private isPlayerTurn: boolean = true
  private path: Position[] = []
  private targetPosition: Position | null = null
  private isPathShown: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    
    // Initialize game components
    this.gameBoard = new GameBoard(20, 15) // 20x15 grid
    this.player = new Player(0, 0)
    this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height)
    
    // Initialize EasyStar pathfinding
    this.easystar = new EasyStar.js()
    this.setupPathfinding()
    
    // Bind event handlers
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this))
  }

  /**
   * Start the game
   */
  public start(): void {
    this.updateUI()
    this.gameLoop()
  }

  /**
   * Main game loop
   */
  private gameLoop(): void {
    this.renderer.clear()
    this.renderer.drawGrid(this.gameBoard)
    this.renderer.drawPlayer(this.player)
    
    if (this.path.length > 0) {
      this.renderer.drawPath(this.path)
    }
    
    if (this.targetPosition && this.isPathShown) {
      this.renderer.drawTarget(this.targetPosition)
    }
    
    requestAnimationFrame(() => this.gameLoop())
  }

  /**
   * Setup pathfinding configuration
   */
  private setupPathfinding(): void {
    this.easystar.setGrid(this.gameBoard.getGrid())
    this.easystar.setAcceptableTiles([0]) // 0 = walkable, 1 = obstacle
    this.easystar.enableDiagonals()
    this.easystar.enableCornerCutting()
  }

  /**
   * Handle canvas click events for player movement
   * First click: Show path, Second click on same position: Execute movement
   */
  private handleCanvasClick(event: MouseEvent): void {
    if (!this.isPlayerTurn) return

    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const gridPos = this.renderer.screenToGrid(x, y, this.gameBoard)
    
    if (this.gameBoard.isValidPosition(gridPos.x, gridPos.y) && 
        this.gameBoard.isWalkable(gridPos.x, gridPos.y)) {
      
      // Check if this is the same position as the current target
      if (this.targetPosition && 
          this.targetPosition.x === gridPos.x && 
          this.targetPosition.y === gridPos.y && 
          this.isPathShown) {
        // Second click on same position - execute movement
        this.executeMovement()
      } else {
        // First click or different position - show path
        this.showPath(gridPos)
      }
    }
  }

  /**
   * Show the path to the target position (first click)
   */
  private showPath(target: Position): void {
    const playerPos = this.player.getPosition()
    
    this.easystar.findPath(playerPos.x, playerPos.y, target.x, target.y, (path) => {
      if (path) {
        this.path = path.map(p => ({ x: p.x, y: p.y }))
        this.targetPosition = target
        this.isPathShown = true
      }
    })
    
    this.easystar.calculate()
  }

  /**
   * Execute the movement along the shown path (second click)
   */
  private executeMovement(): void {
    if (this.path.length > 0) {
      this.animatePlayerMovement()
    }
  }

  /**
   * Animate player movement along the calculated path
   */
  private animatePlayerMovement(): void {
    if (this.path.length <= 1) return

    this.isPlayerTurn = false
    let currentStep = 1 // Skip first position (current player position)
    
    const moveStep = () => {
      if (currentStep < this.path.length) {
        const nextPos = this.path[currentStep]
        this.player.setPosition(nextPos.x, nextPos.y)
        currentStep++
        
        setTimeout(moveStep, 300) // 300ms between moves
      } else {
        // Movement complete
        this.path = []
        this.targetPosition = null
        this.isPathShown = false
        this.nextTurn()
      }
    }
    
    moveStep()
  }

  /**
   * Advance to the next turn
   */
  private nextTurn(): void {
    this.currentTurn++
    this.isPlayerTurn = true
    this.updateUI()
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    const turnInfo = document.getElementById('turnInfo')
    const positionInfo = document.getElementById('positionInfo')
    
    if (turnInfo) {
      turnInfo.textContent = `Turn: ${this.currentTurn}`
    }
    
    if (positionInfo) {
      const pos = this.player.getPosition()
      positionInfo.textContent = `Position: (${pos.x}, ${pos.y})`
    }
  }
}
