import type { Position } from './types'
import { CellType } from './types'
import type { GameBoard } from './GameBoard'
import type { Player } from './Player'

/**
 * Handles all rendering operations for the game
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D
  private canvasWidth: number
  private canvasHeight: number
  private cellSize: number = 30
  private gridOffsetX: number = 50
  private gridOffsetY: number = 50

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
  }

  /**
   * Clear the canvas
   */
  public clear(): void {
    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  /**
   * Draw the game grid
   */
  public drawGrid(gameBoard: GameBoard): void {
    const width = gameBoard.getWidth()
    const height = gameBoard.getHeight()

    // Draw grid lines
    this.ctx.strokeStyle = '#555'
    this.ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const xPos = this.gridOffsetX + x * this.cellSize
      this.ctx.beginPath()
      this.ctx.moveTo(xPos, this.gridOffsetY)
      this.ctx.lineTo(xPos, this.gridOffsetY + height * this.cellSize)
      this.ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const yPos = this.gridOffsetY + y * this.cellSize
      this.ctx.beginPath()
      this.ctx.moveTo(this.gridOffsetX, yPos)
      this.ctx.lineTo(this.gridOffsetX + width * this.cellSize, yPos)
      this.ctx.stroke()
    }

    // Draw cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellType = gameBoard.getCellType(x, y)
        this.drawCell(x, y, cellType)
      }
    }
  }

  /**
   * Draw a single cell
   */
  private drawCell(x: number, y: number, cellType: CellType): void {
    const xPos = this.gridOffsetX + x * this.cellSize
    const yPos = this.gridOffsetY + y * this.cellSize

    switch (cellType) {
      case CellType.EMPTY:
        // Empty cells are already drawn by the grid background
        break
      case CellType.OBSTACLE:
        this.ctx.fillStyle = '#666'
        this.ctx.fillRect(xPos + 1, yPos + 1, this.cellSize - 2, this.cellSize - 2)
        break
    }
  }

  /**
   * Draw the player
   */
  public drawPlayer(player: Player): void {
    const pos = player.getPosition()
    const xPos = this.gridOffsetX + pos.x * this.cellSize
    const yPos = this.gridOffsetY + pos.y * this.cellSize
    
    // Draw player as a blue circle
    this.ctx.fillStyle = '#4CAF50'
    this.ctx.beginPath()
    this.ctx.arc(
      xPos + this.cellSize / 2,
      yPos + this.cellSize / 2,
      this.cellSize / 3,
      0,
      2 * Math.PI
    )
    this.ctx.fill()
    
    // Add a border
    this.ctx.strokeStyle = '#2E7D32'
    this.ctx.lineWidth = 2
    this.ctx.stroke()
  }

  /**
   * Draw the movement path
   */
  public drawPath(path: Position[]): void {
    if (path.length < 2) return

    this.ctx.strokeStyle = '#FFC107'
    this.ctx.lineWidth = 3
    this.ctx.setLineDash([5, 5])
    
    this.ctx.beginPath()
    
    for (let i = 0; i < path.length; i++) {
      const pos = path[i]
      const xPos = this.gridOffsetX + pos.x * this.cellSize + this.cellSize / 2
      const yPos = this.gridOffsetY + pos.y * this.cellSize + this.cellSize / 2
      
      if (i === 0) {
        this.ctx.moveTo(xPos, yPos)
      } else {
        this.ctx.lineTo(xPos, yPos)
      }
    }
    
    this.ctx.stroke()
    this.ctx.setLineDash([]) // Reset line dash
    
    // Draw path points
    this.ctx.fillStyle = '#FFC107'
    for (let i = 1; i < path.length; i++) { // Skip first point (current player position)
      const pos = path[i]
      const xPos = this.gridOffsetX + pos.x * this.cellSize + this.cellSize / 2
      const yPos = this.gridOffsetY + pos.y * this.cellSize + this.cellSize / 2
      
      this.ctx.beginPath()
      this.ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI)
      this.ctx.fill()
    }
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  public screenToGrid(screenX: number, screenY: number, gameBoard: GameBoard): Position {
    const gridX = Math.floor((screenX - this.gridOffsetX) / this.cellSize)
    const gridY = Math.floor((screenY - this.gridOffsetY) / this.cellSize)
    
    return {
      x: Math.max(0, Math.min(gridX, gameBoard.getWidth() - 1)),
      y: Math.max(0, Math.min(gridY, gameBoard.getHeight() - 1))
    }
  }
}
