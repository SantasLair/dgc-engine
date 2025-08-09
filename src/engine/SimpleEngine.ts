import type { IDrawingSystem } from './GameObject'
import { SimpleGameObject } from './SimpleGameObject'

/**
 * Simplified game engine that uses update/render paradigm
 * instead of complex GameMaker event system
 */
export class SimpleEngine {
  private isRunning: boolean = false
  private lastTime: number = 0
  private drawingSystem: IDrawingSystem
  private gameObjects: SimpleGameObject[] = []
  
  // Performance tracking
  private frameCount: number = 0
  private lastFpsTime: number = 0
  private currentFps: number = 0
  
  constructor(_canvas: HTMLCanvasElement, drawingSystem: IDrawingSystem) {
    this.drawingSystem = drawingSystem
    
    console.log('🚀 SimpleEngine initialized')
  }
  
  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.lastFpsTime = this.lastTime
    
    console.log('▶️ SimpleEngine started')
    this.gameLoop()
  }
  
  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false
    console.log('⏹️ SimpleEngine stopped')
  }
  
  /**
   * Add a game object to the engine
   */
  public addGameObject(gameObject: SimpleGameObject): void {
    this.gameObjects.push(gameObject)
    gameObject.onCreate()
    console.log(`➕ Added GameObject: ${gameObject.objectType}`)
  }
  
  /**
   * Remove a game object from the engine
   */
  public removeGameObject(gameObject: SimpleGameObject): void {
    const index = this.gameObjects.indexOf(gameObject)
    if (index !== -1) {
      this.gameObjects.splice(index, 1)
      gameObject.onDestroy()
      console.log(`➖ Removed GameObject: ${gameObject.objectType}`)
    }
  }
  
  /**
   * Get all game objects of a specific type
   */
  public getGameObjects<T extends SimpleGameObject>(type: new (...args: any[]) => T): T[] {
    return this.gameObjects.filter(obj => obj instanceof type) as T[]
  }
  
  /**
   * Main game loop - much simpler than GameMaker event system
   */
  private gameLoop(): void {
    if (!this.isRunning) return
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime
    
    // Update FPS counter
    this.updateFpsCounter(currentTime)
    
    // Clear the canvas (rapid-render handles this automatically)
    // Note: We don't need to call clearFrame as rapid-render clears automatically
    
    // Update all game objects
    for (const gameObject of this.gameObjects) {
      if (gameObject.active) {
        gameObject.update(deltaTime)
      }
    }
    
    // Render all visible game objects
    for (const gameObject of this.gameObjects) {
      if (gameObject.active && gameObject.visible) {
        gameObject.render()
      }
    }
    
    // Continue the loop
    requestAnimationFrame(() => this.gameLoop())
  }
  
  /**
   * Update FPS counter for performance monitoring
   */
  private updateFpsCounter(currentTime: number): void {
    this.frameCount++
    
    if (currentTime - this.lastFpsTime >= 1000) {
      this.currentFps = this.frameCount
      this.frameCount = 0
      this.lastFpsTime = currentTime
      
      // Optional: Display FPS in console (remove for production)
      // console.log(`FPS: ${this.currentFps}`)
    }
  }
  
  /**
   * Get current FPS
   */
  public getFps(): number {
    return this.currentFps
  }
  
  /**
   * Get total number of active game objects
   */
  public getGameObjectCount(): number {
    return this.gameObjects.filter(obj => obj.active).length
  }
  
  /**
   * Cleanup - destroy all game objects
   */
  public cleanup(): void {
    console.log('🧹 SimpleEngine cleanup started')
    
    for (const gameObject of this.gameObjects) {
      gameObject.onDestroy()
    }
    
    this.gameObjects.length = 0
    this.stop()
    
    console.log('✅ SimpleEngine cleanup completed')
  }
}
