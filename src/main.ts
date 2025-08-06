import './style.css'
import { Game } from './game/Game'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing game engine...')
  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')
  
  if (!canvas) {
    console.error('Canvas element not found!')
    document.body.innerHTML = '<h1>Error: Canvas element not found!</h1>'
    return
  }
  
  console.log('Canvas found, initializing game...')
  try {
    const game = new Game(canvas)
    
    // Start the game and wait for initialization
    await game.start()
    console.log('Game started successfully!')
    
    // Expose game instance for development/debugging (development only)
    if (import.meta.env.DEV) {
      ;(window as any).game = game
      console.log('Game instance exposed to window.game for debugging')
      
      // Expose room functionality for testing
      ;(window as any).switchToGame = async () => await game.switchToRoom('game')
      ;(window as any).switchToMenu = async () => await game.switchToRoom('menu')
      ;(window as any).getCurrentRoom = () => game.getCurrentRoom()?.name
      ;(window as any).getRoomManager = () => game.getRoomManager()
      
      console.log('🏠 Room system enabled! Available debug commands:')
      console.log('  switchToGame() - Switch to game room')
      console.log('  switchToMenu() - Switch to menu room')
      console.log('  getCurrentRoom() - Get current room name')
      console.log('  getRoomManager() - Get room manager')
    }
    
  } catch (error) {
    console.error('Error starting game:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error stack:', errorStack)
    document.body.innerHTML = `<h1>Error starting game: ${errorMessage}</h1><pre>${errorStack}</pre>`
  }
})

