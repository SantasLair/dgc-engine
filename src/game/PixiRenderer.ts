import * as PIXI from 'pixi.js'
import type { Position } from './types'
import { CellType } from './types'
import type { GameBoard } from './GameBoard'
import type { Player } from './Player'
import type { IRenderer, RendererConfig } from '../engine/IRenderer'

/**
 * Pixi.js-based renderer for the game
 */
export class PixiRenderer implements IRenderer {
  private app: PIXI.Application
  private gridContainer!: PIXI.Container
  private playerContainer!: PIXI.Container
  private pathContainer!: PIXI.Container
  private targetContainer!: PIXI.Container
  private cellSize: number = 30
  private gridOffsetX: number = 50
  private gridOffsetY: number = 50
  private playerSprite: PIXI.Graphics | null = null
  private gridCells: PIXI.Graphics[][] = []
  private isInitialized: boolean = false
  private config: RendererConfig | null = null

  constructor(config: RendererConfig) {
    // Initialize Pixi application
    this.app = new PIXI.Application()
    
    // Store config for later initialization
    this.config = config
  }

  /**
   * Initialize the renderer (implements IRenderer interface)
   */
  public async initialize(): Promise<void> {
    if (!this.config) {
      throw new Error('No renderer config provided')
    }
    
    await this.initializeApp(this.config)
    
    if (!this.isInitialized) {
      throw new Error('Renderer not properly initialized')
    }
  }

  private async initializeApp(config: RendererConfig): Promise<void> {
    try {
      await this.app.init({
        canvas: config.canvas,
        width: config.width,
        height: config.height,
        backgroundColor: config.backgroundColor || 0x333333,
        antialias: config.antialias !== false
      })
      
      this.setupContainers()
      this.isInitialized = true
      console.log('Pixi.js initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Pixi.js:', error)
      throw error
    }
  }

  /**
   * Check if the renderer is ready to use
   */
  public isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Wait for the renderer to be ready
   */
  public async waitForReady(): Promise<void> {
    if (this.isInitialized) return
    
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isInitialized) {
          resolve()
        } else {
          setTimeout(checkReady, 50)
        }
      }
      checkReady()
    })
  }

  private setupContainers(): void {
    // Create containers for different layers
    this.gridContainer = new PIXI.Container()
    this.playerContainer = new PIXI.Container()
    this.pathContainer = new PIXI.Container()
    this.targetContainer = new PIXI.Container()
    
    // Add containers to stage in proper order
    this.app.stage.addChild(this.gridContainer)
    this.app.stage.addChild(this.pathContainer)
    this.app.stage.addChild(this.targetContainer)
    this.app.stage.addChild(this.playerContainer)
  }

  /**
   * Get the Pixi application for event handling
   */
  public getApp(): PIXI.Application {
    return this.app
  }

  /**
   * Clear is not needed with Pixi as it handles this automatically
   */
  public clear(): void {
    // Pixi automatically clears the screen each frame
  }

  /**
   * Draw the game grid
   */
  public drawGrid(gameBoard: GameBoard): void {
    if (!this.isInitialized) return
    
    // Clear previous grid
    this.gridContainer.removeChildren()
    this.gridCells = []

    const width = gameBoard.getWidth()
    const height = gameBoard.getHeight()

    // Create grid cells
    for (let y = 0; y < height; y++) {
      this.gridCells[y] = []
      for (let x = 0; x < width; x++) {
        const cellGraphics = new PIXI.Graphics()
        const cellType = gameBoard.getCellType(x, y)
        
        this.drawCell(cellGraphics, x, y, cellType)
        this.gridContainer.addChild(cellGraphics)
        this.gridCells[y][x] = cellGraphics
      }
    }

    // Draw grid lines
    this.drawGridLines(width, height)
  }

  /**
   * Draw a single cell
   */
  private drawCell(graphics: PIXI.Graphics, x: number, y: number, cellType: CellType): void {
    const xPos = this.gridOffsetX + x * this.cellSize
    const yPos = this.gridOffsetY + y * this.cellSize

    graphics.clear()
    graphics.position.set(xPos, yPos)

    switch (cellType) {
      case CellType.EMPTY:
        // Empty cells - just border
        graphics.rect(1, 1, this.cellSize - 2, this.cellSize - 2)
        graphics.fill({ color: 0x333333, alpha: 0 }) // Transparent fill
        break
      case CellType.OBSTACLE:
        // Obstacle cells
        graphics.rect(1, 1, this.cellSize - 2, this.cellSize - 2)
        graphics.fill({ color: 0x666666 })
        break
    }
  }

  /**
   * Draw grid lines
   */
  private drawGridLines(width: number, height: number): void {
    const gridLines = new PIXI.Graphics()
    
    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const xPos = this.gridOffsetX + x * this.cellSize
      gridLines.moveTo(xPos, this.gridOffsetY)
      gridLines.lineTo(xPos, this.gridOffsetY + height * this.cellSize)
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const yPos = this.gridOffsetY + y * this.cellSize
      gridLines.moveTo(this.gridOffsetX, yPos)
      gridLines.lineTo(this.gridOffsetX + width * this.cellSize, yPos)
    }

    gridLines.stroke({ color: 0x555555, width: 1 })
    this.gridContainer.addChild(gridLines)
  }

  /**
   * Draw the player
   */
  public drawPlayer(player: Player): void {
    if (!this.isInitialized) return
    
    // Clear previous player sprite
    this.playerContainer.removeChildren()

    const pos = player.getPosition()
    const xPos = this.gridOffsetX + pos.x * this.cellSize + this.cellSize / 2
    const yPos = this.gridOffsetY + pos.y * this.cellSize + this.cellSize / 2

    // Create player graphics
    this.playerSprite = new PIXI.Graphics()
    
    // Draw player as a green circle
    this.playerSprite.circle(0, 0, this.cellSize / 3)
    this.playerSprite.fill({ color: 0x4CAF50 })
    
    // Add border
    this.playerSprite.circle(0, 0, this.cellSize / 3)
    this.playerSprite.stroke({ color: 0x2E7D32, width: 2 })
    
    this.playerSprite.position.set(xPos, yPos)
    this.playerContainer.addChild(this.playerSprite)
  }

  /**
   * Draw the movement path
   */
  public drawPath(path: Position[]): void {
    if (!this.isInitialized) return
    
    // Clear previous path
    this.pathContainer.removeChildren()

    if (path.length < 2) return

    const pathGraphics = new PIXI.Graphics()

    // Draw path line
    pathGraphics.moveTo(
      this.gridOffsetX + path[0].x * this.cellSize + this.cellSize / 2,
      this.gridOffsetY + path[0].y * this.cellSize + this.cellSize / 2
    )

    for (let i = 1; i < path.length; i++) {
      const pos = path[i]
      const xPos = this.gridOffsetX + pos.x * this.cellSize + this.cellSize / 2
      const yPos = this.gridOffsetY + pos.y * this.cellSize + this.cellSize / 2
      pathGraphics.lineTo(xPos, yPos)
    }

    // Style the path
    pathGraphics.stroke({ 
      color: 0xFFC107, 
      width: 3
    })

    this.pathContainer.addChild(pathGraphics)

    // Draw path points
    for (let i = 1; i < path.length; i++) { // Skip first point
      const pos = path[i]
      const xPos = this.gridOffsetX + pos.x * this.cellSize + this.cellSize / 2
      const yPos = this.gridOffsetY + pos.y * this.cellSize + this.cellSize / 2

      const pointGraphics = new PIXI.Graphics()
      pointGraphics.circle(0, 0, 3)
      pointGraphics.fill({ color: 0xFFC107 })
      pointGraphics.position.set(xPos, yPos)
      
      this.pathContainer.addChild(pointGraphics)
    }
  }

  /**
   * Clear the path display
   */
  public clearPath(): void {
    if (!this.isInitialized) return
    this.pathContainer.removeChildren()
  }

  /**
   * Draw the target position with visual emphasis
   */
  public drawTarget(target: Position): void {
    if (!this.isInitialized) return
    
    // Clear previous target
    this.targetContainer.removeChildren()

    const xPos = this.gridOffsetX + target.x * this.cellSize
    const yPos = this.gridOffsetY + target.y * this.cellSize
    
    const targetGraphics = new PIXI.Graphics()
    
    // Draw target square border
    targetGraphics.rect(2, 2, this.cellSize - 4, this.cellSize - 4)
    targetGraphics.stroke({ color: 0xFF5722, width: 3 })
    
    // Draw crosshair
    const centerX = this.cellSize / 2
    const centerY = this.cellSize / 2
    const crossSize = 8
    
    targetGraphics.moveTo(centerX - crossSize, centerY)
    targetGraphics.lineTo(centerX + crossSize, centerY)
    targetGraphics.moveTo(centerX, centerY - crossSize)
    targetGraphics.lineTo(centerX, centerY + crossSize)
    targetGraphics.stroke({ color: 0xFF5722, width: 3 })
    
    targetGraphics.position.set(xPos, yPos)
    this.targetContainer.addChild(targetGraphics)
  }

  /**
   * Clear the target display
   */
  public clearTarget(): void {
    if (!this.isInitialized) return
    this.targetContainer.removeChildren()
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  public screenToGrid(screenX: number, screenY: number): Position {
    // Use default game board if one isn't stored
    const defaultGridWidth = 20
    const defaultGridHeight = 15
    
    const gridX = Math.floor((screenX - this.gridOffsetX) / this.cellSize)
    const gridY = Math.floor((screenY - this.gridOffsetY) / this.cellSize)
    
    return {
      x: Math.max(0, Math.min(gridX, defaultGridWidth - 1)),
      y: Math.max(0, Math.min(gridY, defaultGridHeight - 1))
    }
  }

  /**
   * Convert screen coordinates to grid coordinates with explicit game board
   */
  public screenToGridWithBoard(screenX: number, screenY: number, gameBoard: GameBoard): Position {
    const gridX = Math.floor((screenX - this.gridOffsetX) / this.cellSize)
    const gridY = Math.floor((screenY - this.gridOffsetY) / this.cellSize)
    
    return {
      x: Math.max(0, Math.min(gridX, gameBoard.getWidth() - 1)),
      y: Math.max(0, Math.min(gridY, gameBoard.getHeight() - 1))
    }
  }

  /**
   * Convert grid coordinates to screen coordinates
   */
  public gridToScreen(gridX: number, gridY: number): Position {
    return {
      x: gridX * this.cellSize + this.gridOffsetX + this.cellSize / 2,
      y: gridY * this.cellSize + this.gridOffsetY + this.cellSize / 2
    }
  }

  /**
   * Set up input handlers for mouse/pointer events
   */
  public setupInputHandlers(onPointerDown: (position: Position) => void): void {
    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = this.app.screen
    
    this.app.stage.on('pointerdown', (event: any) => {
      const globalPos = event.global
      const gridPos = this.screenToGrid(globalPos.x, globalPos.y)
      onPointerDown(gridPos)
    })
  }

  /**
   * Draw a game object (implements IRenderer interface)
   */
  public drawObject(object: any): void {
    const pos = object.getPosition()
    
    switch (object.objectType) {
      case 'Player':
        this.drawPlayer({ getPosition: () => pos } as any)
        break
      case 'Enemy':
        this.drawEnemyObject(object)
        break
      case 'Item':
        this.drawItemObject(object)
        break
    }
  }

  /**
   * Render/update the current frame
   */
  public render(): void {
    // Pixi automatically renders, but we can trigger additional updates here
    if (this.app.renderer) {
      this.app.renderer.render(this.app.stage)
    }
  }

  /**
   * Resize the renderer
   */
  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height)
  }

  /**
   * Draw an enemy object
   */
  private drawEnemyObject(enemy: any): void {
    const pos = enemy.getPosition()
    const screenPos = this.gridToScreen(pos.x, pos.y)
    
    const enemyGraphics = new PIXI.Graphics()
    enemyGraphics.circle(0, 0, this.cellSize * 0.3)
    enemyGraphics.fill(0xff0000) // Red color
    enemyGraphics.x = screenPos.x
    enemyGraphics.y = screenPos.y
    
    this.playerContainer.addChild(enemyGraphics)
  }

  /**
   * Draw an item object
   */
  private drawItemObject(item: any): void {
    const pos = item.getPosition()
    const screenPos = this.gridToScreen(pos.x, pos.y)
    
    const itemGraphics = new PIXI.Graphics()
    itemGraphics.rect(-this.cellSize * 0.2, -this.cellSize * 0.2, this.cellSize * 0.4, this.cellSize * 0.4)
    itemGraphics.fill(0xffff00) // Yellow color
    itemGraphics.x = screenPos.x
    itemGraphics.y = screenPos.y
    
    this.playerContainer.addChild(itemGraphics)
  }

  /**
   * Destroy the Pixi application
   */
  public destroy(): void {
    this.app.destroy(true, { children: true, texture: true })
  }
}
