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
    console.log('Game room created!')
    
    // Create the game board as a GameObject within this room
    const gameBoard = new GameBoard(20, 15)
    this.game.addGameObject(gameBoard)
    this.game.setGameBoard(gameBoard)
    
    // Create the player at starting position
    const player = new Player(0, 0)
    this.game.addGameObject(player)
    this.game.setPlayer(player)
    
    // Set up player input handling
    player.addEventScript(GameEvent.STEP, (self) => {
      const engine = this.game.getEngine()
      if (!engine) return

      const playerObj = self as Player
      
      if (engine.isKeyJustPressed('ArrowUp') || engine.isKeyJustPressed('w')) {
        playerObj.move(0, -1)
      } else if (engine.isKeyJustPressed('ArrowDown') || engine.isKeyJustPressed('s')) {
        playerObj.move(0, 1)
      } else if (engine.isKeyJustPressed('ArrowLeft') || engine.isKeyJustPressed('a')) {
        playerObj.move(-1, 0)
      } else if (engine.isKeyJustPressed('ArrowRight') || engine.isKeyJustPressed('d')) {
        playerObj.move(1, 0)
      }
    })
    
    // Add custom draw event to trigger renderer updates
    player.addEventScript(GameEvent.DRAW, () => {
      this.game.updateGameRenderer()
    })
    
    // Setup initial game content (enemies, items, etc.)
    this.game.setupInitialContent()
    
    // Create game UI
    this.createGameUI()
    
    // Initial render
    this.game.updateGameRenderer()
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
    `
    
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
