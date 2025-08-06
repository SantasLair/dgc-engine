import './style.css'
import { Game } from './game/Game'
import { Enemy, Item } from './game/gameobjects'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing GameMaker-style engine...')
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
    
    // Expose game instance for testing (development only)
    if (import.meta.env.DEV) {
      ;(window as any).game = game
      console.log('Game instance exposed to window.game for testing')
      
      // Expose room functionality for testing
      ;(window as any).switchToGame = async () => await game.switchToRoom('game')
      ;(window as any).switchToMenu = async () => await game.switchToRoom('menu')
      ;(window as any).getCurrentRoom = () => game.getCurrentRoom()?.name
      ;(window as any).getRoomManager = () => game.getRoomManager()
      
      console.log('🏠 Room system enabled! Available commands:')
      console.log('  switchToGame() - Switch to game room')
      console.log('  switchToMenu() - Switch to menu room')
      console.log('  getCurrentRoom() - Get current room name')
      console.log('  getRoomManager() - Get room manager')
    }
    
    // Demo: Create some game objects to show the engine in action
    setupDemo(game)
    
    // Add some UI for demonstration
    addDemoUI(game)
    
  } catch (error) {
    console.error('Error starting game:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error stack:', errorStack)
    document.body.innerHTML = `<h1>Error starting game: ${errorMessage}</h1><pre>${errorStack}</pre>`
  }
})

/**
 * Setup demo objects to showcase the engine
 */
function setupDemo(game: Game): void {
  const engine = game.getEngine()
  
  // Create some enemies using the new Enemy class
  const enemy1 = new Enemy(10, 5, 'guard')
  const enemy2 = new Enemy(15, 8, 'scout')
  const enemy3 = new Enemy(5, 10, 'guard')
  
  // Register enemies with the engine
  engine.getObjectManager().addExistingObject(enemy1)
  engine.getObjectManager().addExistingObject(enemy2)
  engine.getObjectManager().addExistingObject(enemy3)
  
  // Create some collectible items using the new Item class
  const coin1 = Item.createCoin(3, 3, 15)
  const gem1 = Item.createGem(7, 7, 50)
  const coin2 = Item.createCoin(12, 4, 10)
  const healthPotion = Item.createHealthPotion(18, 12, 30)
  const key = Item.createKey(1, 1)
  
  // Register items with the engine
  engine.getObjectManager().addExistingObject(coin1)
  engine.getObjectManager().addExistingObject(gem1)
  engine.getObjectManager().addExistingObject(coin2)
  engine.getObjectManager().addExistingObject(healthPotion)
  engine.getObjectManager().addExistingObject(key)
  
  console.log('Demo objects created using class-based approach!')
}

/**
 * Add demo UI to showcase engine features
 */
function addDemoUI(game: Game): void {
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
    const enemy = new Enemy(x, y, 'random')
    engine.getObjectManager().addExistingObject(enemy)
    console.log('Enemy created at', { x, y })
  })
  
  document.getElementById('createItemBtn')?.addEventListener('click', () => {
    const x = Math.floor(Math.random() * 20)
    const y = Math.floor(Math.random() * 15)
    const itemTypes = ['coin', 'gem', 'health_potion', 'key']
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
    
    let item: Item
    switch (itemType) {
      case 'coin': item = Item.createCoin(x, y); break
      case 'gem': item = Item.createGem(x, y); break
      case 'health_potion': item = Item.createHealthPotion(x, y); break
      case 'key': item = Item.createKey(x, y); break
      default: item = Item.createCoin(x, y)
    }
    
    engine.getObjectManager().addExistingObject(item)
    console.log('Item created at', { x, y })
  })
  
  document.getElementById('restartBtn')?.addEventListener('click', async () => {
    await game.restart()
    setupDemo(game)
    console.log('Game restarted!')
  })
}
