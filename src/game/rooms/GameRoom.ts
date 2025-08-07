import { Room, GameEvent, type RoomConfig } from '../../engine'
import { GameBoard, Player } from '../gameobjects'
import type { Game } from '../Game'

/**
 * Main game room where the turn-based movement gameplay happens
 */
export class GameRoom extends Room {
  private game: Game
  private gameUI: HTMLElement | null = null

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'game',
      width: 20,
      height: 15,
      background: '#2c3e50',
      onCreate: async (_gameObject) => await this.onCreateRoom(),
      onStep: async (_gameObject) => await this.onStepRoom(),
      onDestroy: async (_gameObject) => await this.onDestroyRoom()
    }
    
    super(config)
    this.game = game
  }

  /**
   * Called when the room is created/activated
   */
  private async onCreateRoom(): Promise<void> {
    console.log('🏠 GameRoom: onCreateRoom() called')
    
    // Create the game board as a GameObject within this room
    console.log('🏠 GameRoom: Creating GameBoard...')
    const gameBoard = new GameBoard(20, 15)
    this.game.addGameObject(gameBoard)
    this.game.setGameBoard(gameBoard)
    console.log('🏠 GameRoom: GameBoard created and set')
    
    // Create the player at starting position
    console.log('🏠 GameRoom: Creating Player at (0, 0)...')
    const player = new Player(0, 0)
    console.log('🏠 GameRoom: Player instance created, adding to game...')
    this.game.addGameObject(player)
    this.game.setPlayer(player)
    console.log('🏠 GameRoom: Player added and set successfully')
    
    // Set up player for turn-based movement (no keyboard controls)
    player.addEventScript(GameEvent.STEP, (_self) => {
      // Player logic here (if needed)
      // No movement controls - movement is handled by mouse clicks in turn-based system
    })
    
    // Add custom draw event to trigger renderer updates
    player.addEventScript(GameEvent.DRAW, () => {
      this.game.updateGameRenderer()
    })
    
    // Setup initial game content (enemies, items, etc.)
    this.game.setupInitialContent()

    // Initialize turn manager for turn-based gameplay
    this.game.resetTurnManager()
    
    // Create game UI
    this.createGameUI()
    
    // Initial render
    this.game.updateGameRenderer()
    
    console.log('Turn-based system initialized! Click to move player.')
  }

  /**
   * Called every frame when the room is active
   */
  private async onStepRoom(): Promise<void> {
    // Game room update logic
    // Check for escape key to show menu (future feature)
    if (this.game.getEngine()?.isKeyJustPressed('Escape')) {
      console.log('Escape pressed - could show menu here')
    }
  }

  /**
   * Called when the game room is destroyed/deactivated
   */
  private async onDestroyRoom(): Promise<void> {
    console.log('Game room destroyed!')
    
    // Remove game UI
    this.removeGameUI()
    
    // Clear all game objects from the engine
    const engine = this.game.getEngine()
    if (engine) {
      console.log('Clearing all game objects from engine...')
      engine.getObjectManager().clear()
    }
    
    // Clear the game board reference
    this.game.setGameBoard(null)
    this.game.setPlayer(null)
  }

  /**
   * Create the in-game UI elements
   */
  private createGameUI(): void {
    // Create UI container
    this.gameUI = document.createElement('div')
    this.gameUI.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      z-index: 100;
      min-width: 200px;
    `
    
    // Add turn information
    const turnInfo = document.createElement('div')
    turnInfo.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #4CAF50;">Turn-Based Game</h3>
      <p style="margin: 5px 0;"><span id="turnStatus">Your Turn</span></p>
      <p style="margin: 5px 0;">Turn: <span id="currentTurn">1</span></p>
      <hr style="margin: 10px 0; border: 1px solid #555;">
    `
    this.gameUI.appendChild(turnInfo)
    
    // Create back to menu button
    const backButton = document.createElement('button')
    backButton.textContent = 'Back to Menu'
    backButton.style.cssText = `
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 15px;
      font-size: 14px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      width: 100%;
    `

    backButton.addEventListener('mouseenter', () => {
      backButton.style.backgroundColor = '#c0392b'
    })

    backButton.addEventListener('mouseleave', () => {
      backButton.style.backgroundColor = '#e74c3c'
    })

    backButton.addEventListener('click', async () => {
      console.log('Returning to menu...')
      const success = await this.game.goToRoom('menu')
      console.log('Menu switch result:', success)
    })

    // Add button to UI
    this.gameUI.appendChild(backButton)
    
    // Add to page
    document.body.appendChild(this.gameUI)
    
    // Update turn info periodically
    setInterval(() => {
      this.updateTurnDisplay()
    }, 100)
  }

  /**
   * Update the turn display in the UI
   */
  private updateTurnDisplay(): void {
    const turnManager = this.game.getTurnManager()
    const player = this.game.getPlayer()
    const turnStatus = document.getElementById('turnStatus')
    const currentTurn = document.getElementById('currentTurn')
    
    if (turnStatus) {
      // Check if player is currently moving
      if (player && player.getVariable('isMoving')) {
        turnStatus.textContent = 'Player Moving...'
        turnStatus.style.color = '#2196F3' // Blue color for player movement
      } else if (turnManager.isPlayersTurn()) {
        turnStatus.textContent = 'Your Turn'
        turnStatus.style.color = '#4CAF50'
      } else {
        turnStatus.textContent = 'Enemies Moving...'
        turnStatus.style.color = '#ff9800'
      }
    }
    
    if (currentTurn) {
      currentTurn.textContent = turnManager.getTurnNumber().toString()
    }
  }

  /**
   * Remove the in-game UI elements
   */
  private removeGameUI(): void {
    if (this.gameUI && this.gameUI.parentNode) {
      this.gameUI.parentNode.removeChild(this.gameUI)
      this.gameUI = null
    }
  }
}
