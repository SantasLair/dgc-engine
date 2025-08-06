import { BaseGame, GameObject, GameEvent, type GameEngineConfig, Room, RoomManager } from '../engine'
import { GameBoard, Player } from './gameobjects'
import { GameRoom, MenuRoom } from './rooms'
import type { Position } from './types'

/**
 * Turn-based movement game that extends the BaseGame class
 * Demonstrates how to use the GameEngine with GameMaker-style objects
 */
export class Game extends BaseGame {
  private gameBoard: GameBoard | null = null
  private player: Player | null = null
  private roomManager: RoomManager

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
    // Setup engine integration
    this.setupEngineIntegration()
    
    // Setup input handlers
    this.setupEventHandlers()
    
    // Initialize room manager
    this.roomManager.initialize()
    
    // Setup rooms
    this.setupRooms()
    
    // Start with the main game room
    await this.roomManager.switchToRoom('game')
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
  public setGameBoard(gameBoard: GameBoard): void {
    this.gameBoard = gameBoard
  }

  /**
   * Set the player (for room-based creation)
   */
  public setPlayer(player: Player): void {
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
   * Get the room manager for advanced room operations
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }

  /**
   * Switch to a different room
   */
  public async switchToRoom(roomName: string): Promise<boolean> {
    return await this.roomManager.switchToRoom(roomName)
  }

  /**
   * Get the current active room
   */
  public getCurrentRoom(): Room | undefined {
    return this.roomManager.getCurrentRoom()
  }

  /**
   * Restart the game with game-specific logic
   */
  public async restart(): Promise<void> {
    await super.restart()
    // Game-specific restart logic if needed
  }
}
