import { Rapid } from 'rapid-render'
import { EventManager } from './EventManager'
import { GameObjectManager } from './GameObjectManager'
import { GameObject } from './GameObject'
import { DGCRapidDrawingSystem } from './DGCRapidDrawingSystem'
import type { DGCRapidEngineConfig } from './DGCRapidEngineConfig'
import { createDGCRapidEngineConfig } from './DGCRapidEngineConfig'

/**
 * Input manager for handling keyboard and mouse events
 */
class InputManager {
  private keysPressed: Set<string> = new Set()
  private keysJustPressed: Set<string> = new Set()
  private keysJustReleased: Set<string> = new Set()
  private mouseX: number = 0
  private mouseY: number = 0
  private mouseButtons: Set<number> = new Set()
  private mouseJustPressed: Set<number> = new Set()
  private mouseJustReleased: Set<number> = new Set()
  
  constructor() {
    this.setupEventListeners()
  }
  
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      // Prevent default behavior for game control keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
      
      if (!this.keysPressed.has(e.code)) {
        this.keysJustPressed.add(e.code)
      }
      this.keysPressed.add(e.code)
    })
    
    window.addEventListener('keyup', (e) => {
      // Prevent default behavior for game control keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
      
      this.keysPressed.delete(e.code)
      this.keysJustReleased.add(e.code)
    })
    
    // Mouse events
    window.addEventListener('mousemove', (e) => {
      const rect = (e.target as HTMLCanvasElement)?.getBoundingClientRect()
      if (rect) {
        this.mouseX = e.clientX - rect.left
        this.mouseY = e.clientY - rect.top
      }
    })
    
    window.addEventListener('mousedown', (e) => {
      this.mouseJustPressed.add(e.button)
      this.mouseButtons.add(e.button)
    })
    
    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button)
      this.mouseJustReleased.add(e.button)
    })
  }
  
  // Keyboard methods
  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key)
  }
  
  public isKeyJustPressed(key: string): boolean {
    return this.keysJustPressed.has(key)
  }
  
  public isKeyJustReleased(key: string): boolean {
    return this.keysJustReleased.has(key)
  }
  
  // Mouse methods - GameMaker style
  public getMouseX(): number {
    return this.mouseX
  }
  
  public getMouseY(): number {
    return this.mouseY
  }
  
  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button)
  }
  
  public isMouseButtonJustPressed(button: number): boolean {
    return this.mouseJustPressed.has(button)
  }
  
  public isMouseButtonJustReleased(button: number): boolean {
    return this.mouseJustReleased.has(button)
  }
  
  // Clear just-pressed/released states (called at end of frame)
  public endFrame(): void {
    this.keysJustPressed.clear()
    this.keysJustReleased.clear()
    this.mouseJustPressed.clear()
    this.mouseJustReleased.clear()
  }
}

/**
 * DGC game engine powered by Rapid.js
 * This engine uses Rapid.js for immediate mode rendering that aligns with GameMaker's draw events
 */
export class DGCRapidEngine {
  private rapid: Rapid
  private config: Required<DGCRapidEngineConfig>
  private eventManager: EventManager
  private gameObjectManager: GameObjectManager
  private inputManager: InputManager
  private drawingSystem: DGCRapidDrawingSystem
  private lastTime: number = 0
  private targetFrameTime: number
  private isRunning: boolean = false
  private isInitialized: boolean = false
  private animationFrameId: number | null = null
  
  constructor(config: DGCRapidEngineConfig) {
    this.config = createDGCRapidEngineConfig(config)
    this.targetFrameTime = 1000 / this.config.targetFPS
    
    // Initialize Rapid.js with guaranteed canvas
    this.rapid = new Rapid({
      ...this.config.rapidConfig,
      canvas: this.config.canvas
    })
    
    // Initialize managers
    this.eventManager = new EventManager()
    this.gameObjectManager = new GameObjectManager(this.eventManager)
    this.inputManager = new InputManager()
    
    // Initialize the GameMaker-style drawing system
    this.drawingSystem = new DGCRapidDrawingSystem(this.rapid)
  }
  
  /**
   * Initialize the Rapid.js engine
   */
  public async initialize(): Promise<void> {
    try {
      // Rapid.js initialization is handled in constructor
      this.isInitialized = true
      console.log('🎮 DGCRapidEngine initialized successfully with Rapid.js')
    } catch (error) {
      console.error('Failed to initialize DGC Rapid engine:', error)
      throw error
    }
  }
  
  /**
   * Start the game engine
   */
  public start(): void {
    if (!this.isInitialized) {
      throw new Error('Engine must be initialized before starting')
    }
    
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.gameLoop()
  }
  
  /**
   * Stop the game engine
   */
  public stop(): void {
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
  
  /**
   * Main game loop using requestAnimationFrame
   */
  private gameLoop = async (): Promise<void> => {
    if (!this.isRunning) {
      return
    }
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    // Update at target FPS
    if (deltaTime >= this.targetFrameTime) {
      this.update(deltaTime)
      await this.render()
      this.lastTime = currentTime
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }
  
  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Update all game objects
    this.gameObjectManager.update(deltaTime)
    
    // Clear input state at end of frame
    this.inputManager.endFrame()
  }
  
  /**
   * Render the game using Rapid.js immediate mode rendering
   */
  private async render(): Promise<void> {
    // Start Rapid.js render cycle
    this.rapid.startRender()
    
    // Clear the drawing system (though Rapid.js handles this automatically)
    this.drawingSystem.clearFrame()
    
    // Render all game objects with their draw events
    this.gameObjectManager.draw()
    
    // Process all queued draw events immediately for immediate mode rendering
    await this.eventManager.processObjectEvents()
    
    // End Rapid.js render cycle
    this.rapid.endRender()
  }
  
  /**
   * Add a game object to the engine
   */
  public addGameObject(gameObject: GameObject): void {
    this.gameObjectManager.addExistingObject(gameObject)
  }
  
  /**
   * Remove a game object from the engine
   */
  public removeGameObject(gameObject: GameObject): void {
    this.gameObjectManager.destroyObject(gameObject.id)
  }
  
  /**
   * Get the input manager
   */
  public getInputManager(): InputManager {
    return this.inputManager
  }
  
  /**
   * Get the event manager
   */
  public getEventManager(): EventManager {
    return this.eventManager
  }
  
  /**
   * Get the drawing system for immediate mode drawing
   */
  public getDrawingSystem(): DGCRapidDrawingSystem {
    return this.drawingSystem
  }
  
  /**
   * Get the underlying Rapid.js renderer
   */
  public getRapidRenderer(): Rapid {
    return this.rapid
  }
  
  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.config.canvas
  }
  
  /**
   * Get engine configuration
   */
  public getConfig(): Required<DGCRapidEngineConfig> {
    return this.config
  }

  /**
   * Get the game object manager
   */
  public getObjectManager(): GameObjectManager {
    return this.gameObjectManager
  }

  /**
   * Get current FPS (frames per second)
   */
  public getFPS(): number {
    // Simple FPS calculation based on target frame time
    return Math.round(1000 / this.targetFrameTime)
  }
  
  /**
   * Convert grid X coordinate to screen X coordinate
   */
  public gridToScreenX(gridX: number): number {
    return this.config.gridOffset.x + gridX * this.config.cellSize
  }
  
  /**
   * Convert grid Y coordinate to screen Y coordinate
   */
  public gridToScreenY(gridY: number): number {
    return this.config.gridOffset.y + gridY * this.config.cellSize
  }
  
  /**
   * Convert screen X coordinate to grid X coordinate
   */
  public screenToGridX(screenX: number): number {
    return Math.floor((screenX - this.config.gridOffset.x) / this.config.cellSize)
  }
  
  /**
   * Convert screen Y coordinate to grid Y coordinate
   */
  public screenToGridY(screenY: number): number {
    return Math.floor((screenY - this.config.gridOffset.y) / this.config.cellSize)
  }
}
