import './style.css'
import { Game } from './game/Game'
import { Player } from './game/gameobjects/Player'

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
    
    // Initialize the game first
    await game.initialize()
    console.log('Game initialized successfully!')
    
    // Update status
    const statusDiv = document.getElementById('status')
    if (statusDiv) {
      statusDiv.innerHTML = 'Game initialized. Starting...'
    }
    
    // Now start the game
    game.start()
    console.log('Game started successfully!')
    
    // Add status check interval
    if (statusDiv) {
      setInterval(() => {
        const engine = game.getEngine()
        // Basic status update for simplified game
        statusDiv.innerHTML = `
          <div>Game Status: Running</div>
          <div>Engine: ${engine ? 'Active' : 'Inactive'}</div>
          <div>Use WASD to move (when player is added)</div>
        `
      }, 1000)
    }
    
    // Expose game instance for development/debugging (development only)
    if (import.meta.env.DEV) {
      ;(window as any).game = game
      console.log('Game instance exposed to window.game for debugging')
      
      // Expose room functionality for testing
      ;(window as any).goToMenu = async () => await game.goToRoom('main_menu')
      ;(window as any).getCurrentRoom = () => game.getRoomManager().getCurrentRoom()?.name
      ;(window as any).getRoomManager = () => game.getRoomManager()
      
      // Debug functions for player visibility
      ;(window as any).createTestPlayer = () => {
        const testPlayer = new Player(300, 300)
        game.addGameObject(testPlayer)
        console.log('Created test player at (300, 300)')
        return testPlayer
      }
      
      ;(window as any).debugEngine = () => {
        const engine = game.getEngine()
        const canvas = game.getCanvas()
        const drawing = engine.getDrawingSystem()
        console.log('Engine state:', {
          isRunning: engine ? 'Yes' : 'No',
          objectCount: engine ? (engine as any).gameObjectManager?.getObjectCount() : 'N/A',
          canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
          drawingSystem: drawing ? 'Available' : 'Missing'
        })
        return { engine, canvas, drawing }
      }
      
      ;(window as any).debugCanvas = () => {
        const canvas = game.getCanvas()
        const rect = canvas.getBoundingClientRect()
        console.log('Canvas debug:', {
          actualSize: `${canvas.width}x${canvas.height}`,
          displaySize: `${rect.width}x${rect.height}`,
          position: `top: ${rect.top}, left: ${rect.left}`,
          visible: canvas.style.display !== 'none'
        })
        return canvas
      }
      
      ;(window as any).testDraw = (x = 50, y = 50) => {
        const engine = game.getEngine()
        const drawingSystem = engine.getDrawingSystem()
        if (drawingSystem) {
          console.log(`🎨 Testing manual rectangle draw at ${x}, ${y}`)
          drawingSystem.drawRectangle(x, y, x + 50, y + 50, true, 0xFF0000)  // Red rectangle
          console.log('🎨 Manual draw command sent')
        } else {
          console.log('❌ Drawing system not available')
        }
      }
      
      ;(window as any).testSprites = () => {
        const roomManager = game.getRoomManager()
        const currentRoom = roomManager.getCurrentRoom()
        console.log('🔍 Sprite Debug:')
        console.log('  - Current room:', currentRoom?.name)
        if (currentRoom) {
          const logoSprite = currentRoom.getSprite('logo_sprite')
          console.log('  - logo_sprite lookup:', logoSprite)
          const buttonSprite = currentRoom.getSprite('button_sprite')
          console.log('  - button_sprite lookup:', buttonSprite)
          
          // Test if sprites are loaded
          if (logoSprite) {
            console.log('  - logo_sprite loaded:', logoSprite.isLoaded ? logoSprite.isLoaded() : 'no isLoaded method')
          }
        }
      }
      
      console.log('🎮 Simplified Game Debug Commands:')
      console.log('  goToMenu() - Go to main menu')
      console.log('  goToSpriteDemo() - Go to sprite demo')
      console.log('  goToTestLevel() - Go to test level')
      console.log('  getCurrentRoom() - Get current room name')
      console.log('  getRoomManager() - Get room manager')
      console.log('  createTestPlayer() - Create a test player')
      console.log('  debugEngine() - Check engine state')
      console.log('  debugCanvas() - Check canvas dimensions')
      console.log('  testDraw(x, y) - Draw a test rectangle at position')
      console.log('  testSprites() - Debug sprite availability')
    }
    
  } catch (error) {
    console.error('Game initialization failed:', error)
    const statusDiv = document.getElementById('status')
    if (statusDiv) {
      statusDiv.innerHTML = `<div style="color: red;">Game failed to start: ${error}</div>`
    }
  }
})
