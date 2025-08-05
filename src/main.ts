import './style.css'
import { Game } from './game/Game'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, looking for canvas...')
  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')
  
  if (!canvas) {
    console.error('Canvas element not found!')
    document.body.innerHTML = '<h1>Error: Canvas element not found!</h1>'
    return
  }
  
  console.log('Canvas found, initializing game...')
  try {
    const game = new Game(canvas)
    game.start()
    console.log('Game started successfully!')
  } catch (error) {
    console.error('Error starting game:', error)
    document.body.innerHTML = `<h1>Error starting game: ${error}</h1>`
  }
})
