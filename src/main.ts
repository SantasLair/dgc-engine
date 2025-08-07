import './style.css'
import { Game } from './game/Game'
import { room_goto, room_restart, room_get_name } from './game/gml'
import './examples/GMLRoomExample'

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
  
  // Ensure the page can receive keyboard events
  document.body.tabIndex = 0
  canvas.tabIndex = 0
  document.body.focus()
  
  // Add click handler to ensure focus for keyboard events
  canvas.addEventListener('click', () => {
    canvas.focus()
  })
  
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
      ;(window as any).goToGame = async () => await game.goToRoom('game')
      ;(window as any).goToMenu = async () => await game.goToRoom('menu')
      ;(window as any).getCurrentRoom = () => game.getCurrentRoom()?.name
      ;(window as any).getRoomManager = () => game.getRoomManager()
      
      // Expose GML room functions for testing
      ;(window as any).room_goto = room_goto
      ;(window as any).room_restart = room_restart
      ;(window as any).room_get_name = room_get_name
      
      // Expose dev UI toggle for testing
      ;(window as any).toggleDevUI = () => {
        // Trigger the F12 key event to use the existing toggle logic
        const event = new KeyboardEvent('keydown', { key: 'F12' })
        document.dispatchEvent(event)
      }
      
      console.log('🏠 Room system enabled! Available debug commands:')
      console.log('  goToGame() - Switch to game room')
      console.log('  goToMenu() - Switch to menu room')
      console.log('  getCurrentRoom() - Get current room name')
      console.log('  getRoomManager() - Get room manager')
      console.log('')
      console.log('🎮 GML Functions available:')
      console.log('  room_goto("game") - Switch to game room (GML style)')
      console.log('  room_goto("menu") - Switch to menu room (GML style)')
      console.log('  room_restart() - Restart current room')
      console.log('  room_get_name() - Get current room name')
      console.log('')
      console.log('⌨️  Hotkeys:')
      console.log('  F12 or Ctrl+D - Toggle dev UI visibility')
      console.log('')
      console.log('🔧 Dev Functions:')
      console.log('  toggleDevUI() - Toggle dev UI from console')
      console.log('  room_get_name() - Get current room name')
    }
    
  } catch (error) {
    console.error('Error starting game:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error stack:', errorStack)
    document.body.innerHTML = `<h1>Error starting game: ${errorMessage}</h1><pre>${errorStack}</pre>`
  }
})

