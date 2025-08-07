import { GameObject } from '../engine'

/**
 * Turn Manager - Handles turn-based gameplay mechanics
 * Ensures only one entity moves per turn
 */
export class TurnManager {
  private isPlayerTurn: boolean = true
  private turnNumber: number = 1
  private movingObjects: Set<GameObject> = new Set()
  private waitingForPlayerInput: boolean = true

  /**
   * Check if it's currently the player's turn
   */
  public isPlayersTurn(): boolean {
    return this.isPlayerTurn && !this.isAnyObjectMoving()
  }

  /**
   * Check if any object is currently moving
   */
  public isAnyObjectMoving(): boolean {
    return this.movingObjects.size > 0
  }

  /**
   * Start player turn - player can now make a move
   */
  public startPlayerTurn(): void {
    this.isPlayerTurn = true
    this.waitingForPlayerInput = true
    console.log(`Turn ${this.turnNumber} - Player's turn`)
  }

  /**
   * Execute player move and switch to enemy turn
   */
  public executePlayerMove(): void {
    if (!this.isPlayerTurn) return
    
    this.waitingForPlayerInput = false
    this.isPlayerTurn = false
    console.log(`Turn ${this.turnNumber} - Player moved, enemies' turn`)
  }

  /**
   * Start enemy turn - enemies can now move
   */
  public startEnemyTurn(): void {
    if (this.isPlayerTurn) return
    
    console.log(`Turn ${this.turnNumber} - Enemies moving...`)
    // Enemy movements will be handled by each enemy's AI
  }

  /**
   * Complete enemy turn and switch back to player
   */
  public completeEnemyTurn(): void {
    if (this.isPlayerTurn) return
    
    this.turnNumber++
    this.isPlayerTurn = true
    this.waitingForPlayerInput = true
    console.log(`Turn ${this.turnNumber} - Enemy turn complete, player's turn`)
  }

  /**
   * Register an object as currently moving
   */
  public addMovingObject(object: GameObject): void {
    this.movingObjects.add(object)
  }

  /**
   * Unregister an object as moving
   */
  public removeMovingObject(object: GameObject): void {
    this.movingObjects.delete(object)
  }

  /**
   * Get current turn number
   */
  public getTurnNumber(): number {
    return this.turnNumber
  }

  /**
   * Check if waiting for player input
   */
  public isWaitingForPlayerInput(): boolean {
    return this.waitingForPlayerInput
  }

  /**
   * Reset turn manager to initial state
   */
  public reset(): void {
    this.isPlayerTurn = true
    this.turnNumber = 1
    this.movingObjects.clear()
    this.waitingForPlayerInput = true
  }
}
