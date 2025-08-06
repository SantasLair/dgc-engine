import { Room, GameEvent, type RoomConfig } from '../../engine'
import { GameBoard, Player } from '../gameobjects'
import type { Game } from '../Game'

/**
 * Main game room where the turn-based movement gameplay happens
 */
export class GameRoom extends Room {
  private game: Game

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'game',
      width: 20,
      height: 15,
      background: '#2c3e50',
      onCreate: async (_gameObject) => await this.onCreateRoom(),
      onStep: async (_gameObject) => await this.onStepRoom()
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
}
