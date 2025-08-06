import { Room, GameEvent, GameObject, type RoomConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Menu room for game navigation and options
 */
export class MenuRoom extends Room {
  private game: Game

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'menu',
      width: 20,
      height: 15,
      background: '#34495e',
      onCreate: async (_gameObject) => await this.onCreateRoom()
    }
    
    super(config)
    this.game = game
  }

  /**
   * Called when the menu room is created/activated
   */
  private async onCreateRoom(): Promise<void> {
    console.log('Menu room created!')
    
    // Create menu items (simple approach for now)
    const startButton = new GameObject('menu_button', { x: 10, y: 7, visible: true })
    this.game.addGameObject(startButton)
    
    startButton.addEventScript(GameEvent.CREATE, (self) => {
      self.setVariable('text', 'Start Game')
      console.log('Start button created')
    })
    
    startButton.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (_self) => {
      this.game.switchToRoom('game')
    })
  }
}
