import './style.css'
import { Game } from './game/Game'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!
  const game = new Game(canvas)
  game.start()
})
