import { BaseGame, GameObject, GameEvent, type GameEngineConfig, Room, RoomManager } from '../engine'
import { GameBoard, Player, Enemy, Item } from './gameobjects'
import { GameRoom, MenuRoom } from './rooms'
import { Grid } from './Grid'
import { ds_grid_create, ds_grid_get, ds_grid_set, ds_grid_width, ds_grid_height, gml_set_game_instance } from './gml'
import type { Position } from './types'

/**
 * Turn-based movement game that extends the BaseGame class
 * Demonstrates the capabilities of the GameEngine with GameMaker-style objects and rooms
 */
export class Game extends BaseGame {
  private gameBoard: GameBoard | null = null
  private player: Player | null = null
  private roomManager: RoomManager
  private devUIVisible: boolean = false // Track dev UI visibility state

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    
    // Initialize room manager
    this.roomManager = new RoomManager()
  }

  /**
   * Get the engine configuration for this game
   */
  protected getEngineConfig(): GameEngineConfig {
    return {
      canvas: this.canvas,
      gridWidth: 20,
      gridHeight: 15,
      rendererType: 'pixi', // Could be configurable
      targetFPS: 60
    }
  }

  /**
   * Setup game-specific logic after engine creation
   */
  protected async setupGame(): Promise<void> {
    // Setup GML game instance reference for compatibility functions
    gml_set_game_instance(this)
    
    // Setup engine integration
    this.setupEngineIntegration()
    
    // Setup input handlers
    this.setupEventHandlers()
    
    // Initialize room manager
    this.roomManager.initialize()
    
    // Setup rooms
    this.setupRooms()
    
    // Add development UI for debugging
    if (import.meta.env.DEV) {
      // Start with dev UI hidden - use F12 or Ctrl+D to show
      console.log('💡 Dev UI available! Press F12 or Ctrl+D to toggle visibility')
    }
    
    // Start with the menu room
    await this.roomManager.goToRoom('menu')
  }

  /**
   * Setup all game rooms
   */
  private setupRooms(): void {
    // Add room instances to the manager
    this.roomManager.addRoom(new GameRoom(this))
    this.roomManager.addRoom(new MenuRoom(this))
  }

  /**
   * Setup integration between the engine and the renderer
   */
  private setupEngineIntegration(): void {
    // Create a system object to handle room manager updates
    const roomSystemObject = this.createObject('room_system', 0, 0)
    roomSystemObject.visible = false // Hidden system object
    
    roomSystemObject.addEventScript(GameEvent.STEP, async (_self) => {
      // Update room manager every frame
      await this.roomManager.step()
    })
    
    roomSystemObject.addEventScript(GameEvent.DRAW, async (_self) => {
      // Handle room drawing
      await this.roomManager.draw()
    })
    
    // Listen for engine events to trigger rendering updates
    this.addEventListener('object_moved', () => {
      this.updateGameRenderer()
    })
    
    this.addEventListener('object_created', () => {
      this.updateGameRenderer()
    })
    
    this.addEventListener('object_destroyed', () => {
      this.updateGameRenderer()
    })
    
    // Setup global game events
    this.addEventListener('player_moved', (eventData) => {
      const renderer = this.getRenderer()
      if (renderer && eventData?.path) {
        renderer.drawPath(eventData.path)
      }
      if (renderer && eventData?.target) {
        renderer.drawTarget(eventData.target)
      }
    })
    
    this.addEventListener('movement_complete', () => {
      const renderer = this.getRenderer()
      if (renderer) {
        renderer.clearPath()
        renderer.clearTarget()
      }
    })
  }

  /**
   * Setup event handlers for mouse interaction
   */
  private setupEventHandlers(): void {
    const renderer = this.getRenderer()
    if (!renderer) return
    
    // Setup input handlers through the renderer
    renderer.setupInputHandlers((position: Position) => {
      if (!this.gameBoard) return
      
      const gridPos = renderer.screenToGridWithBoard(position.x, position.y, this.gameBoard)
      
      // Emit engine event for rooms to handle
      this.emitEvent('mouse_click', { 
        mousePosition: { x: position.x, y: position.y },
        gridPosition: gridPos
      })
    })
    
    // Setup keyboard handlers for dev UI toggle
    this.setupKeyboardHandlers()
  }

  /**
   * Setup keyboard event handlers
   */
  private setupKeyboardHandlers(): void {
    if (!import.meta.env.DEV) return
    
    document.addEventListener('keydown', (event) => {
      // Toggle dev UI with F12 key
      if (event.key === 'F12') {
        event.preventDefault()
        this.toggleDevUI()
      }
      
      // Alternative: Toggle dev UI with Ctrl+D
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault()
        this.toggleDevUI()
      }
    })
  }

  /**
   * Toggle development UI visibility
   */
  private toggleDevUI(): void {
    if (!import.meta.env.DEV) return
    
    const devUI = document.getElementById('devUI')
    if (!devUI) {
      // Dev UI doesn't exist, create it
      this.addDevUI()
      this.devUIVisible = true
      console.log('Dev UI shown (F12 or Ctrl+D to toggle)')
      return
    }
    
    this.devUIVisible = !this.devUIVisible
    this.setDevUIVisible(this.devUIVisible)
    console.log(`Dev UI ${this.devUIVisible ? 'shown' : 'hidden'} (F12 or Ctrl+D to toggle)`)
  }

  /**
   * Get current dev UI visibility state
   */
  public isDevUIVisible(): boolean {
    return this.devUIVisible
  }

  /**
   * Create an enemy at a specific position
   */
  public createEnemy(x: number, y: number): GameObject {
    const enemy = this.createObject('Enemy', x, y)
    enemy.solid = true
    enemy.visible = true
    enemy.setVariable('health', 50)
    
    // Add simple AI behavior
    enemy.addEventScript(GameEvent.STEP, (self) => {
      // Simple random movement
      if (Math.random() < 0.01) { // 1% chance per frame
        const direction = Math.floor(Math.random() * 4)
        const currentPos = self.getPosition()
        let newX = currentPos.x
        let newY = currentPos.y
        
        switch (direction) {
          case 0: newY--; break // Up
          case 1: newY++; break // Down
          case 2: newX--; break // Left
          case 3: newX++; break // Right
        }
        
        // Check bounds and walkability
        if (this.gameBoard && this.gameBoard.isWalkable(newX, newY)) {
          self.setPosition(newX, newY)
        }
      }
    })
    
    return enemy
  }

  /**
   * Create an item at a specific position
   */
  public createItem(x: number, y: number, itemType: string = 'coin'): GameObject {
    const item = this.createObject('Item', x, y)
    item.solid = false
    item.visible = true
    item.setVariable('itemType', itemType)
    item.setVariable('value', 10)
    
    return item
  }

  /**
   * Get the game board
   */
  public getGameBoard(): GameBoard | null {
    return this.gameBoard
  }

  /**
   * Set the game board (for room-based creation)
   */
  public setGameBoard(gameBoard: GameBoard | null): void {
    this.gameBoard = gameBoard
  }

  /**
   * Set the player (for room-based creation)
   */
  public setPlayer(player: Player | null): void {
    this.player = player
  }

  /**
   * Get the player
   */
  public getPlayer(): Player | null {
    return this.player
  }

  /**
   * Add object to the game engine (exposed for room access)
   */
  public addGameObject(gameObject: GameObject): void {
    this.addObject(gameObject)
  }

  /**
   * Update the game renderer - exposed for room access
   */
  public updateGameRenderer(): void {
    if (!this.isGameInitialized) return
    
    const renderer = this.getRenderer()
    if (!renderer || !this.gameBoard) return
    
    // Clear and redraw the grid (game-specific rendering)
    renderer.clear()
    renderer.drawGrid(this.gameBoard)
    
    // The engine will handle drawing all game objects automatically
    // through its render() method in the game loop
  }

  /**
   * Get the game canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * Get the room manager for advanced room operations
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }

  /**
   * Switch to a different room
   */
  public async goToRoom(roomName: string): Promise<boolean> {
    return await this.roomManager.goToRoom(roomName)
  }

  /**
   * Get the current active room
   */
  public getCurrentRoom(): Room | undefined {
    return this.roomManager.getCurrentRoom()
  }

  /**
   * Setup initial game content and objects
   */
  public setupInitialContent(): void {
    const engine = this.getEngine()
    
    // ===== GRID SYSTEM DEMONSTRATION =====
    console.log('🎮 Grid system supports both coding approaches:')
    
    // Modern TypeScript approach
    console.log('--- Modern TypeScript Approach ---')
    const modernGrid = new Grid<number>(5, 5, 0)
    modernGrid.set(2, 2, 999)
    console.log(`Modern grid value at (2,2): ${modernGrid.get(2, 2)}`)
    console.log(`Modern grid dimensions: ${modernGrid.getWidth()} x ${modernGrid.getHeight()}`)
    
    // GameMaker style approach
    console.log('--- GameMaker (GML) Style Approach ---')
    var gmlGrid = ds_grid_create(5, 5)
    ds_grid_set(gmlGrid, 2, 2, 999)
    console.log(`GML grid value at (2,2): ${ds_grid_get(gmlGrid, 2, 2)}`)
    console.log(`GML grid dimensions: ${ds_grid_width(gmlGrid)} x ${ds_grid_height(gmlGrid)}`)
    
    console.log('✅ Both approaches work! Developers can choose their preferred style.')
    
    // Create initial enemies
    const enemy1 = new Enemy(10, 5, 'guard')
    const enemy2 = new Enemy(15, 8, 'scout')
    const enemy3 = new Enemy(5, 10, 'guard')
    
    // Register enemies with the engine
    engine.getObjectManager().addExistingObject(enemy1)
    engine.getObjectManager().addExistingObject(enemy2)
    engine.getObjectManager().addExistingObject(enemy3)
    
    // Create initial collectible items
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
    
    console.log('Initial game content loaded!')
  }

  /**
   * Add development UI for debugging and testing (development only)
   */
  public addDevUI(): void {
    const engine = this.getEngine()
    
    // Create UI container
    const uiContainer = document.createElement('div')
    uiContainer.id = 'devUI'
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
    
    // Add game info and controls
    uiContainer.innerHTML = `
      <h3>DGC Engine Game</h3>
      <p><strong>Controls:</strong></p>
      <ul>
        <li>Click to move player</li>
        <li>WASD/Arrow keys for direct movement</li>
        <li>Space to cancel movement</li>
      </ul>
      <p><strong>Engine Features:</strong></p>
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
      await this.restart()
      this.setupInitialContent()
      console.log('Game restarted!')
    })
  }

  /**
   * Show/hide development UI based on room
   */
  public setDevUIVisible(visible: boolean): void {
    if (!import.meta.env.DEV) return
    
    const devUI = document.getElementById('devUI')
    if (devUI) {
      devUI.style.display = visible ? 'block' : 'none'
    }
  }

  /**
   * Remove development UI completely
   */
  public removeDevUI(): void {
    if (!import.meta.env.DEV) return
    
    const devUI = document.getElementById('devUI')
    if (devUI && devUI.parentNode) {
      devUI.parentNode.removeChild(devUI)
    }
  }

  /**
   * Restart the game with game-specific logic
   */
  public async restart(): Promise<void> {
    await super.restart()
    // Game-specific restart logic if needed
  }
}
