import * as PIXI from 'pixi.js'
import { EventManager } from './EventManager'
import { GameObjectManager } from './GameObjectManager'
import { GameObject } from './GameObject'
import type { Position } from '../game/types'
import type { DGCEngineConfig } from './DGCEngineConfig'
import { createDGCEngineConfig } from './DGCEngineConfig'

/**
 * Input manager for handling keyboard and mouse events
 */
class InputManager {
  private keysPressed: Set<string> = new Set()
  private keysJustPressed: Set<string> = new Set()
  private keysJustReleased: Set<string> = new Set()
  private mousePosition: Position = { x: 0, y: 0 }
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
      this.mousePosition.x = e.clientX
      this.mousePosition.y = e.clientY
    })
    
    window.addEventListener('mousedown', (e) => {
      if (!this.mouseButtons.has(e.button)) {
        this.mouseJustPressed.add(e.button)
      }
      this.mouseButtons.add(e.button)
    })
    
    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button)
      this.mouseJustReleased.add(e.button)
    })
  }
  
  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key)
  }
  
  public isKeyJustPressed(key: string): boolean {
    return this.keysJustPressed.has(key)
  }
  
  public isKeyJustReleased(key: string): boolean {
    return this.keysJustReleased.has(key)
  }
  
  public getMousePosition(): Position {
    return { ...this.mousePosition }
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
  
  /**
   * Called at the end of each frame to clear "just pressed/released" states
   */
  public endFrame(): void {
    this.keysJustPressed.clear()
    this.keysJustReleased.clear()
    this.mouseJustPressed.clear()
    this.mouseJustReleased.clear()
  }
}

/**
 * DGC game engine powered by PIXI.js
 * This engine treats PIXI as a core foundation rather than an abstracted renderer
 */
export class DGCEngine {
  private pixiApp: PIXI.Application
  private config: Required<DGCEngineConfig>
  private eventManager: EventManager
  private gameObjectManager: GameObjectManager
  private inputManager: InputManager
  private lastTime: number = 0
  private targetFrameTime: number
  private isRunning: boolean = false
  private isInitialized: boolean = false
  
  // Core PIXI containers for different rendering layers
  private backgroundLayer: PIXI.Container
  private gameLayer: PIXI.Container
  private uiLayer: PIXI.Container
  
  constructor(config: DGCEngineConfig) {
    this.config = createDGCEngineConfig(config)
    this.targetFrameTime = 1000 / this.config.targetFPS
    
    // Initialize PIXI Application
    this.pixiApp = new PIXI.Application()
    
    // Initialize managers
    this.eventManager = new EventManager()
    this.gameObjectManager = new GameObjectManager(this.eventManager)
    this.inputManager = new InputManager()
    
    // Create rendering layers
    this.backgroundLayer = new PIXI.Container()
    this.gameLayer = new PIXI.Container()
    this.uiLayer = new PIXI.Container()
  }
  
  /**
   * Initialize the PIXI engine
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize PIXI Application with merged config
      await this.pixiApp.init({
        canvas: this.config.canvas,
        width: this.config.canvas.width,
        height: this.config.canvas.height,
        ...this.config.pixiConfig
      })
      
      // Setup rendering layers
      this.setupRenderingLayers()
      
      // Setup responsive resizing
      this.setupResponsiveResize()
      
      this.isInitialized = true
      console.log('🎮 DGCEngine initialized successfully')
    } catch (error) {
      console.error('Failed to initialize DGC engine:', error)
      throw error
    }
  }
  
  /**
   * Setup the core rendering layer structure
   */
  private setupRenderingLayers(): void {
    // Add layers to stage in proper order
    this.pixiApp.stage.addChild(this.backgroundLayer)
    this.pixiApp.stage.addChild(this.gameLayer)
    this.pixiApp.stage.addChild(this.uiLayer)
    
    // Name layers for debugging
    this.backgroundLayer.name = 'backgroundLayer'
    this.gameLayer.name = 'gameLayer'
    this.uiLayer.name = 'uiLayer'
  }
  
  /**
   * Setup responsive canvas resizing for letterbox scaling
   */
  private setupResponsiveResize(): void {
    // Get the original canvas dimensions
    const baseWidth = this.config.canvas.width
    const baseHeight = this.config.canvas.height
    
    const resizeHandler = () => {
      // Keep PIXI renderer at base resolution - CSS will handle scaling
      this.pixiApp.renderer.resize(baseWidth, baseHeight)
      
      // Keep stage at 1.0 scale
      this.pixiApp.stage.scale.set(1.0)
      
      // Remove any JavaScript positioning - let CSS handle everything
      const canvas = this.config.canvas
      canvas.style.position = ''
      canvas.style.left = ''
      canvas.style.top = ''
      canvas.style.width = ''
      canvas.style.height = ''
      canvas.style.margin = ''
      canvas.style.padding = ''
      
      console.log(`📐 CSS-only letterbox scaling at base ${baseWidth}x${baseHeight}`)
    }
    
    // Initial resize
    resizeHandler()
    
    // Listen for window resize events (though CSS handles it, we keep this for logging)
    window.addEventListener('resize', resizeHandler)
    
    console.log('📐 CSS-only letterbox scaling setup complete')
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
  }
  
  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (!this.isRunning) return
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    if (deltaTime >= this.targetFrameTime) {
      this.update(deltaTime / 1000) // Convert to seconds
      this.render()
      this.lastTime = currentTime
    }
    
    requestAnimationFrame(() => this.gameLoop())
  }
  
  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Update game objects
    this.gameObjectManager.update(deltaTime)
    
    // End input frame
    this.inputManager.endFrame()
  }
  
  /**
   * Render the current frame
   */
  private render(): void {
    // PIXI handles rendering automatically via its ticker
    // Additional custom rendering logic can be added here
  }
  
  /**
   * Get the PIXI Application instance
   * This allows direct access to all PIXI functionality
   */
  public getPixiApp(): PIXI.Application {
    return this.pixiApp
  }
  
  /**
   * Get access to rendering layers
   */
  public getLayers() {
    return {
      background: this.backgroundLayer,
      game: this.gameLayer,
      ui: this.uiLayer
    }
  }
  
  /**
   * Convert screen coordinates to grid coordinates
   */
  public screenToGrid(screenX: number, screenY: number): Position {
    const gridX = Math.floor((screenX - this.config.gridOffset.x) / this.config.cellSize)
    const gridY = Math.floor((screenY - this.config.gridOffset.y) / this.config.cellSize)
    return { x: gridX, y: gridY }
  }
  
  /**
   * Convert grid coordinates to screen coordinates
   */
  public gridToScreen(gridX: number, gridY: number): Position {
    const screenX = gridX * this.config.cellSize + this.config.gridOffset.x
    const screenY = gridY * this.config.cellSize + this.config.gridOffset.y
    return { x: screenX, y: screenY }
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
   * Get the game object manager
   */
  public getGameObjectManager(): GameObjectManager {
    return this.gameObjectManager
  }
  
  /**
   * Get engine configuration
   */
  public getConfig(): Required<DGCEngineConfig> {
    return this.config
  }
  
  /**
   * Create a game object and add it to the engine
   */
  public createGameObject(name: string, x: number, y: number): GameObject {
    return this.gameObjectManager.createObject(name, x, y)
  }
  
  /**
   * Remove a game object from the engine
   */
  public removeGameObject(gameObject: GameObject): void {
    this.gameObjectManager.destroyObject(gameObject.id)
  }
  
  /**
   * Get all game objects
   */
  public getGameObjects(): GameObject[] {
    return this.gameObjectManager.getAllObjects()
  }
}
