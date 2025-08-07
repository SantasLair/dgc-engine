import { Room, GameEvent, type RoomConfig } from '../../engine'
import { GameBoard, Player } from '../gameobjects'
import type { Game } from '../Game'

/**
 * Main game room where the turn-based movement gameplay happens
 */
export class GameRoom extends Room {
  private game: Game
  private gameUI: HTMLElement | null = null
  private resizeHandler: (() => void) | null = null

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
    
    // Enter full-screen game mode (hide HTML elements, scale canvas)
    this.enterFullScreenMode()
    
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
    // Check for escape key to return to menu
    if (this.game.getEngine()?.isKeyJustPressed('Escape')) {
      console.log('Escape pressed - returning to menu')
      await this.game.goToRoom('menu')
    }
  }

  /**
   * Called when the game room is destroyed/deactivated
   */
  private async onDestroyRoom(): Promise<void> {
    console.log('Game room destroyed!')
    
    // Exit full-screen mode (restore HTML elements, reset canvas)
    this.exitFullScreenMode()
    
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
   * Enter full-screen game mode - hide HTML page elements and scale canvas
   */
  private enterFullScreenMode(): void {
    console.log('🖥️ Entering full-screen game mode...')
    
    // Hide all page content except the canvas
    const app = document.getElementById('app')
    if (app) {
      // Hide all children except the game-container
      Array.from(app.children).forEach(child => {
        if (!child.classList.contains('game-container')) {
          (child as HTMLElement).style.display = 'none'
        }
      })
      
      // Hide controls within game-container
      const controls = document.querySelector('.controls')
      if (controls) {
        (controls as HTMLElement).style.display = 'none'
      }
    }
    
    // Get the canvas and apply full-screen styling
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (canvas) {
      // Store original styles for restoration
      if (!canvas.dataset.originalStyles) {
        canvas.dataset.originalStyles = JSON.stringify({
          position: canvas.style.position || '',
          top: canvas.style.top || '',
          left: canvas.style.left || '',
          width: canvas.style.width || '',
          height: canvas.style.height || '',
          zIndex: canvas.style.zIndex || '',
          border: canvas.style.border || '',
          borderRadius: canvas.style.borderRadius || ''
        })
      }
      
      // Apply Phaser-style full-screen scaling
      this.applyFullScreenCanvasStyles(canvas)
    }
    
    // Hide body scrollbars and padding
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    
    // Add resize handler to maintain full-screen scaling
    this.resizeHandler = () => this.handleResize()
    window.addEventListener('resize', this.resizeHandler)
    
    console.log('✅ Full-screen mode activated')
  }

  /**
   * Apply full-screen styles to canvas
   */
  private applyFullScreenCanvasStyles(canvas: HTMLCanvasElement): void {
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.zIndex = '1000'
    canvas.style.border = 'none'
    canvas.style.borderRadius = '0'
    canvas.style.objectFit = 'contain' // Maintain aspect ratio
    canvas.style.backgroundColor = '#000'
  }

  /**
   * Handle window resize in full-screen mode
   */
  private handleResize(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (canvas && canvas.style.position === 'fixed') {
      // Reapply full-screen styles to ensure proper scaling
      this.applyFullScreenCanvasStyles(canvas)
    }
  }

  /**
   * Exit full-screen game mode - restore HTML page elements and canvas
   */
  private exitFullScreenMode(): void {
    console.log('🖥️ Exiting full-screen game mode...')
    
    // Remove resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
    
    // Restore all page content
    const app = document.getElementById('app')
    if (app) {
      // Show all hidden children
      Array.from(app.children).forEach(child => {
        (child as HTMLElement).style.display = ''
      })
      
      // Show controls within game-container
      const controls = document.querySelector('.controls')
      if (controls) {
        (controls as HTMLElement).style.display = ''
      }
    }
    
    // Restore canvas original styling
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (canvas && canvas.dataset.originalStyles) {
      try {
        const originalStyles = JSON.parse(canvas.dataset.originalStyles)
        canvas.style.position = originalStyles.position
        canvas.style.top = originalStyles.top
        canvas.style.left = originalStyles.left
        canvas.style.width = originalStyles.width
        canvas.style.height = originalStyles.height
        canvas.style.zIndex = originalStyles.zIndex
        canvas.style.border = originalStyles.border
        canvas.style.borderRadius = originalStyles.borderRadius
        canvas.style.objectFit = ''
        canvas.style.backgroundColor = ''
        
        // Clear the stored styles
        delete canvas.dataset.originalStyles
      } catch (e) {
        console.warn('Failed to restore canvas original styles:', e)
      }
    }
    
    // Restore body styling
    document.body.style.overflow = ''
    document.body.style.margin = ''
    document.body.style.padding = ''
    
    console.log('✅ Full-screen mode deactivated')
  }

  /**
   * Create the in-game UI elements
   */
  private createGameUI(): void {
    // Create UI container
    this.gameUI = document.createElement('div')
    this.gameUI.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      z-index: 1001;
      min-width: 200px;
      border: 2px solid #646cff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    `
    
    // Add turn information
    const turnInfo = document.createElement('div')
    turnInfo.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #646cff;">Turn-Based Game</h3>
      <p style="margin: 5px 0;"><span id="turnStatus">Your Turn</span></p>
      <p style="margin: 5px 0;">Turn: <span id="currentTurn">1</span></p>
      <p style="margin: 5px 0; font-size: 12px; color: #ccc;">Press ESC to exit</p>
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
