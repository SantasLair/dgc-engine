import type { Position } from './types'

/**
 * Represents the player character in the game
 */
export class Player {
  private position: Position

  constructor(x: number, y: number) {
    this.position = { x, y }
  }

  /**
   * Get the current position of the player
   */
  public getPosition(): Position {
    return { ...this.position }
  }

  /**
   * Set the player's position
   */
  public setPosition(x: number, y: number): void {
    this.position.x = x
    this.position.y = y
  }

  /**
   * Move the player by a relative offset
   */
  public move(deltaX: number, deltaY: number): void {
    this.position.x += deltaX
    this.position.y += deltaY
  }

  /**
   * Get the X coordinate
   */
  public getX(): number {
    return this.position.x
  }

  /**
   * Get the Y coordinate
   */
  public getY(): number {
    return this.position.y
  }
}
