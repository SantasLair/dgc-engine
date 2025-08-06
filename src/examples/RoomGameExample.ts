import { Game } from '../game/Game'

/**
 * Example showing how to use the updated Game class with room system
 */
export class RoomGameExample {
  private game: Game

  constructor(canvas: HTMLCanvasElement) {
    this.game = new Game(canvas)
  }

  /**
   * Start the game with room support
   */
  public async start(): Promise<void> {
    await this.game.start()
    
    // The game now automatically creates and manages rooms
    console.log('Game started with room system!')
    console.log('Current room:', this.game.getCurrentRoom()?.name)
    
    // Expose some room functions for testing
    this.setupTestCommands()
  }

  /**
   * Setup console commands for testing room functionality
   */
  private setupTestCommands(): void {
    if (typeof window !== 'undefined') {
      // Expose room switching functions to the console for testing
      (window as any).switchToGame = async () => await this.game.switchToRoom('game');
      (window as any).switchToMenu = async () => await this.game.switchToRoom('menu');
      (window as any).getCurrentRoom = () => this.game.getCurrentRoom()?.name;
      (window as any).getRoomManager = () => this.game.getRoomManager();
      
      // Add GameBoard testing commands
      (window as any).getGameBoard = () => this.game.getGameBoard();
      (window as any).clearObstacles = () => {
        const board = this.game.getGameBoard();
        if (board) {
          board.clearObstacles();
          return 'Obstacles cleared!';
        }
        return 'No GameBoard available';
      };
      (window as any).resetBoard = () => {
        const board = this.game.getGameBoard();
        if (board) {
          board.resetBoard();
          return 'Board reset!';
        }
        return 'No GameBoard available';
      };
      
      console.log('Room test commands available:')
      console.log('- switchToGame(): Switch to game room')
      console.log('- switchToMenu(): Switch to menu room') 
      console.log('- getCurrentRoom(): Get current room name')
      console.log('- getRoomManager(): Get room manager instance')
      console.log('')
      console.log('GameBoard test commands available:')
      console.log('- getGameBoard(): Get GameBoard instance')
      console.log('- clearObstacles(): Remove all obstacles from board')
      console.log('- resetBoard(): Reset board to initial state')
    }
  }

  /**
   * Get the game instance
   */
  public getGame(): Game {
    return this.game
  }
}

/**
 * Factory function to create and start a room-based game
 */
export async function createRoomGame(canvas: HTMLCanvasElement): Promise<RoomGameExample> {
  const example = new RoomGameExample(canvas)
  await example.start()
  return example
}
