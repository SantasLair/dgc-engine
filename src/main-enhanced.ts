import './style.css'
import { EnhancedGame } from './game/EnhancedGame'
import { createEnemyObject, createItemObject } from './engine'

// Initialize the enhanced game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing GameMaker-style engine...')
  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')
  
  if (!canvas) {
    console.error('Canvas element not found!')
    document.body.innerHTML = '<h1>Error: Canvas element not found!</h1>'
    return
  }
  
  console.log('Canvas found, initializing enhanced game...')
  try {
    const game = new EnhancedGame(canvas)
    
    // Start the game and wait for initialization
    await game.start()
    console.log('Enhanced game started successfully!')
    
    // Demo: Create some game objects to show the engine in action
    setupDemo(game)
    
    // Add some UI for demonstration
    addDemoUI(game)
    
  } catch (error) {
    console.error('Error starting enhanced game:', error)
    document.body.innerHTML = `<h1>Error starting game: ${error}</h1>`
  }
})

/**
 * Setup demo objects to showcase the engine
 */
function setupDemo(game: EnhancedGame): void {
  const engine = game.getEngine()
  
  // Create some enemies
  createEnemyObject(engine, 10, 5)
  createEnemyObject(engine, 15, 8)
  createEnemyObject(engine, 5, 10)
  
  // Create some collectible items
  createItemObject(engine, 3, 3, 'coin')
  createItemObject(engine, 7, 7, 'gem')
  createItemObject(engine, 12, 4, 'coin')
  createItemObject(engine, 18, 12, 'gem')
  
  console.log('Demo objects created!')
}

/**
 * Add demo UI to showcase engine features
 */
function addDemoUI(game: EnhancedGame): void {
  const engine = game.getEngine()
  
  // Create UI container
  const uiContainer = document.createElement('div')
  uiContainer.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
  `
  
  // Add controls info
  uiContainer.innerHTML = `
    <h3>GameMaker-Style Engine Demo</h3>
    <p><strong>Controls:</strong></p>
    <ul>
      <li>Click to move player</li>
      <li>WASD/Arrow keys for direct movement</li>
      <li>Space to cancel movement</li>
    </ul>
    <p><strong>Features:</strong></p>
    <ul>
      <li>Event-driven object system</li>
      <li>Collision detection</li>
      <li>Pathfinding and movement</li>
      <li>Custom variables and timers</li>
    </ul>
    <div id="gameStats">
      <p>Objects: <span id="objectCount">0</span></p>
      <p>FPS: <span id="fpsCounter">0</span></p>
    </div>
    <button id="createEnemyBtn">Create Enemy</button>
    <button id="createItemBtn">Create Item</button>
    <button id="restartBtn">Restart Game</button>
  `
  
  document.body.appendChild(uiContainer)
  
  // Update stats periodically
  setInterval(() => {
    const objectCount = engine.getObjectManager().getObjectCount()
    const fps = Math.round(engine.getFPS())
    
    const objectCountEl = document.getElementById('objectCount')
    const fpsCounterEl = document.getElementById('fpsCounter')
    
    if (objectCountEl) objectCountEl.textContent = objectCount.toString()
    if (fpsCounterEl) fpsCounterEl.textContent = fps.toString()
  }, 100)
  
  // Add button event listeners
  document.getElementById('createEnemyBtn')?.addEventListener('click', () => {
    const x = Math.floor(Math.random() * 20)
    const y = Math.floor(Math.random() * 15)
    createEnemyObject(engine, x, y)
    console.log('Enemy created at', { x, y })
  })
  
  document.getElementById('createItemBtn')?.addEventListener('click', () => {
    const x = Math.floor(Math.random() * 20)
    const y = Math.floor(Math.random() * 15)
    const itemType = Math.random() > 0.5 ? 'coin' : 'gem'
    createItemObject(engine, x, y, itemType)
    console.log('Item created at', { x, y })
  })
  
  document.getElementById('restartBtn')?.addEventListener('click', async () => {
    await game.restart()
    setupDemo(game)
    console.log('Game restarted!')
  })
}
