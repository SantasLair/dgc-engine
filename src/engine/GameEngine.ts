import { EventManager } from './EventManager'
import { GameObjectManager } from './GameObjectManager'
import { GameObject, GameEvent } from './GameObject'
import type { IRenderer } from './IRenderer'
import type { Position } from '../game/types'

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
      if (!this.keysPressed.has(e.code)) {
        this.keysJustPressed.add(e.code)
      }
      this.keysPressed.add(e.code)
    })
    
    window.addEventListener('keyup', (e) => {
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
  
  public update(): void {
    // Clear "just pressed/released" states
    this.keysJustPressed.clear()
    this.keysJustReleased.clear()
    this.mouseJustPressed.clear()
    this.mouseJustReleased.clear()
  }
}

/**
 * Main GameEngine class - coordinates all engine systems
 * Provides a GameMaker-like API for game development
 */
export class GameEngine {
  private eventManager: EventManager
  private gameObjectManager: GameObjectManager
  private inputManager: InputManager
  private renderer: IRenderer | null = null
  private isRunning: boolean = false
  private lastTime: number = 0
  private targetFPS: number = 60
  private deltaTime: number = 0
  
  // Global engine variables (similar to GameMaker's global variables)
  private globalVariables: Map<string, any> = new Map()
  
  constructor(renderer?: IRenderer) {
    this.eventManager = new EventManager()
    this.gameObjectManager = new GameObjectManager(this.eventManager)
    this.inputManager = new InputManager()
    
    if (renderer) {
      this.setRenderer(renderer)
    }
    
    // Setup default global variables
    this.setGlobalVariable('fps', this.targetFPS)
    this.setGlobalVariable('room_speed', this.targetFPS)
  }
  
  /**
   * Start the game engine
   */
  public async start(): Promise<void> {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = performance.now()
    
    // Emit game start event
    await this.eventManager.emitGlobalEvent('game_start')
    
    // Start the main loop
    this.gameLoop()
  }
  
  /**
   * Stop the game engine
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return
    
    this.isRunning = false
    
    // Emit game end event
    await this.eventManager.emitGlobalEvent('game_end')
  }

  /**
   * Set the renderer for the engine
   */
  public setRenderer(renderer: IRenderer): void {
    this.renderer = renderer
    
    // Don't setup input handling here - wait until renderer is initialized
    // Input handling will be set up after renderer.initialize() is called
  }

  /**
   * Get the current renderer
   */
  public getRenderer(): IRenderer | null {
    return this.renderer
  }

  /**
   * Setup input handlers after renderer is initialized
   */
  public setupInputHandlers(): void {
    if (this.renderer && this.renderer.isReady()) {
      this.renderer.setupInputHandlers((gridPosition: Position) => {
        // Emit engine events for mouse clicks
        this.emitEvent('mouse_click', { 
          gridPosition,
          mousePosition: { x: 0, y: 0 } // This could be enhanced
        })
      })
    }
  }

  /**
   * Render the current frame using the attached renderer
   */
  public render(): void {
    if (!this.renderer) return
    
    // Clear the renderer
    this.renderer.clear()
    
    // Draw all visible game objects
    const allObjects = this.gameObjectManager.getAllObjects()
    for (const obj of allObjects) {
      if (obj.visible) {
        this.renderer.drawObject(obj)
      }
    }
    
    // Trigger renderer update
    this.renderer.render()
  }
  
  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (!this.isRunning) return
    
    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.lastTime) / 1000 // Convert to seconds
    this.lastTime = currentTime
    
    // Update systems
    this.update()
    
    // Schedule next frame
    requestAnimationFrame(() => this.gameLoop())
  }
  
  /**
   * Update all engine systems
   */
  private async update(): Promise<void> {
    // Update input
    this.inputManager.update()
    
    // Process input events
    this.processInputEvents()
    
    // Update game objects
    this.gameObjectManager.update(this.deltaTime)
    
    // Process all queued events
    await this.eventManager.processObjectEvents()
    
    // Draw all objects
    this.gameObjectManager.draw()
    this.gameObjectManager.drawGUI()
    
    // Process draw events
    await this.eventManager.processObjectEvents()
    
    // Render using the attached renderer
    this.render()
  }
  
  /**
   * Process input events and send them to relevant objects
   */
  private processInputEvents(): void {
    // Check for key events
    for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      if (this.inputManager.isKeyJustPressed(key)) {
        this.eventManager.emitGlobalEvent('key_pressed', { key })
        
        // Send to all objects with key event handlers
        for (const obj of this.gameObjectManager.getAllObjects()) {
          this.eventManager.queueObjectEvent(obj, GameEvent.KEY_PRESSED, { key })
        }
      }
      
      if (this.inputManager.isKeyJustReleased(key)) {
        this.eventManager.emitGlobalEvent('key_released', { key })
        
        for (const obj of this.gameObjectManager.getAllObjects()) {
          this.eventManager.queueObjectEvent(obj, GameEvent.KEY_RELEASED, { key })
        }
      }
    }
    
    // Check for mouse events
    if (this.inputManager.isMouseButtonJustPressed(0)) { // Left button
      const mousePos = this.inputManager.getMousePosition()
      
      for (const obj of this.gameObjectManager.getAllObjects()) {
        this.eventManager.queueObjectEvent(obj, GameEvent.MOUSE_LEFT_PRESSED, { mousePosition: mousePos })
      }
    }
    
    if (this.inputManager.isMouseButtonJustReleased(0)) {
      const mousePos = this.inputManager.getMousePosition()
      
      for (const obj of this.gameObjectManager.getAllObjects()) {
        this.eventManager.queueObjectEvent(obj, GameEvent.MOUSE_LEFT_RELEASED, { mousePosition: mousePos })
      }
    }
    
    if (this.inputManager.isMouseButtonJustPressed(2)) { // Right button
      const mousePos = this.inputManager.getMousePosition()
      
      for (const obj of this.gameObjectManager.getAllObjects()) {
        this.eventManager.queueObjectEvent(obj, GameEvent.MOUSE_RIGHT_PRESSED, { mousePosition: mousePos })
      }
    }
    
    if (this.inputManager.isMouseButtonJustReleased(2)) {
      const mousePos = this.inputManager.getMousePosition()
      
      for (const obj of this.gameObjectManager.getAllObjects()) {
        this.eventManager.queueObjectEvent(obj, GameEvent.MOUSE_RIGHT_RELEASED, { mousePosition: mousePos })
      }
    }
  }
  
  // Public API methods for game development
  
  /**
   * Create a new game object
   */
  public createObject(objectType: string, x: number = 0, y: number = 0): GameObject {
    return this.gameObjectManager.createObject(objectType, x, y)
  }
  
  /**
   * Create an object template (factory function)
   */
  public defineObject(objectType: string, setupFunction: (obj: GameObject) => void): (x: number, y: number) => GameObject {
    return (x: number, y: number) => {
      const obj = this.createObject(objectType, x, y)
      setupFunction(obj)
      return obj
    }
  }
  
  /**
   * Get all objects of a type
   */
  public getObjects(objectType: string): GameObject[] {
    return this.gameObjectManager.getObjectsByType(objectType)
  }
  
  /**
   * Get objects near a position
   */
  public getObjectsNear(position: Position, radius: number, objectType?: string): GameObject[] {
    return this.gameObjectManager.getObjectsNear(position, radius, objectType)
  }
  
  /**
   * Get nearest object
   */
  public getNearestObject(position: Position, objectType?: string): GameObject | null {
    return this.gameObjectManager.getNearestObject(position, objectType)
  }
  
  /**
   * Set a global variable
   */
  public setGlobalVariable(name: string, value: any): void {
    this.globalVariables.set(name, value)
  }
  
  /**
   * Get a global variable
   */
  public getGlobalVariable(name: string): any {
    return this.globalVariables.get(name)
  }
  
  /**
   * Check if key is pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.inputManager.isKeyPressed(key)
  }
  
  /**
   * Check if key was just pressed this frame
   */
  public isKeyJustPressed(key: string): boolean {
    return this.inputManager.isKeyJustPressed(key)
  }
  
  /**
   * Get mouse position
   */
  public getMousePosition(): Position {
    return this.inputManager.getMousePosition()
  }
  
  /**
   * Check if mouse button is pressed
   */
  public isMousePressed(button: number = 0): boolean {
    return this.inputManager.isMouseButtonPressed(button)
  }
  
  /**
   * Add a global event listener
   */
  public addEventListener(eventType: string, listener: (eventData?: any) => void): void {
    this.eventManager.addEventListener(eventType, listener)
  }
  
  /**
   * Emit a global event
   */
  public emitEvent(eventType: string, eventData?: any): void {
    this.eventManager.emitGlobalEvent(eventType, eventData)
  }
  
  /**
   * Get current delta time
   */
  public getDeltaTime(): number {
    return this.deltaTime
  }
  
  /**
   * Get current FPS
   */
  public getFPS(): number {
    return this.deltaTime > 0 ? 1 / this.deltaTime : 0
  }
  
  /**
   * Clear all objects and reset engine state
   */
  public restart(): void {
    this.gameObjectManager.clear()
    this.eventManager.clear()
    this.globalVariables.clear()
    this.setGlobalVariable('fps', this.targetFPS)
    this.setGlobalVariable('room_speed', this.targetFPS)
  }
  
  /**
   * Get the game object manager (for advanced usage)
   */
  public getObjectManager(): GameObjectManager {
    return this.gameObjectManager
  }
  
  /**
   * Get the event manager (for advanced usage)
   */
  public getEventManager(): EventManager {
    return this.eventManager
  }
}
