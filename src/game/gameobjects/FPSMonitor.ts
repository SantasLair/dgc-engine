import { GameObject } from '../../engine'

/**
 * FPS Monitor GameObject
 * Displays a real-time frame rate graph similar to GameMaker's fps_real monitoring
 */
export class FPSMonitor extends GameObject {
  // Configuration
  private sampleCount: number = 120  // Number of frames to track
  private frameSamples: number[] = []  // Array to store fps values
  private graphWidth: number = 240
  private graphHeight: number = 60
  private graphX: number = 20
  private graphY: number = 20
  
  // FPS tracking
  private lastTime: number = 0
  private frameCount: number = 0
  private fps: number = 0
  private fpsUpdateInterval: number = 100  // Update FPS display every 100ms

  constructor(x: number = 20, y: number = 20) {
    super('FPSMonitor', { x, y })
    this.persistent = true  // Keep across room changes
    this.depth = -1000  // Draw on top of everything
    this.lastTime = performance.now()
    console.log('📊 FPS Monitor created')
  }

  /**
   * Create event - Initialize the monitor
   */
  public onCreate(): void {
    console.log('📊 FPS Monitor initialized')
  }

  /**
   * Step event - Track frame rate and update samples
   */
  public onStep(): void {
    const currentTime = performance.now()
    this.frameCount++
    
    // Update FPS calculation every interval
    if (currentTime - this.lastTime >= this.fpsUpdateInterval) {
      // Calculate actual FPS
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime)
      
      // Add current fps to the sample buffer
      this.frameSamples.push(this.fps)
      
      // Trim buffer to sample_count (similar to GameMaker's array_delete)
      if (this.frameSamples.length > this.sampleCount) {
        this.frameSamples.shift()  // Remove first element
      }
      
      // Reset for next measurement
      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  /**
   * Draw event - Render the FPS graph using DGC drawing system
   */
  public onDraw(): void {
    // Use the DGC drawing system via getDrawingSystem
    const drawingSystem = this.getDrawingSystem()
    if (!drawingSystem) return
    
    // Background box (black rectangle)
    drawingSystem.drawRectangle(
      this.graphX - 1, 
      this.graphY - 1, 
      this.graphX + this.graphWidth + 1, 
      this.graphY + this.graphHeight + 1, 
      true, // filled
      0x000000, // black
      1.0 // alpha
    )
    
    // Draw FPS bars using line drawing
    const maxFps = 120
    const scale = this.graphHeight / maxFps
    
    // Draw FPS bars - we'll simulate lines using thin rectangles
    for (let i = 0; i < this.frameSamples.length; i++) {
      const fpsVal = this.frameSamples[i]
      const barHeight = Math.min(Math.max(fpsVal * scale, 0), this.graphHeight)
      
      if (barHeight > 0) {
        // Draw vertical line as a thin rectangle (lime green)
        drawingSystem.drawRectangle(
          this.graphX + i * 2, 
          this.graphY + this.graphHeight - barHeight,
          this.graphX + i * 2 + 1, 
          this.graphY + this.graphHeight,
          true, // filled
          0x00FF00, // lime green
          1.0 // alpha
        )
      }
    }
    
    // Draw target FPS line (60 FPS reference) - horizontal yellow line
    const targetFps = 60
    const targetY = this.graphY + this.graphHeight - (targetFps * scale)
    drawingSystem.drawRectangle(
      this.graphX, 
      targetY - 1,
      this.graphX + this.graphWidth, 
      targetY,
      true, // filled
      0xFFFF00, // yellow
      0.7 // alpha
    )
    
    // Draw graph border (white rectangle outline)
    drawingSystem.drawRectangle(
      this.graphX, 
      this.graphY, 
      this.graphX + this.graphWidth, 
      this.graphY + this.graphHeight,
      false, // not filled (outline only)
      0xFFFFFF, // white
      1.0 // alpha
    )
    
    // Note: Text drawing would need to be implemented in the drawing system
    // For now, we'll log the FPS to console occasionally
    if (this.frameCount === 0 && this.frameSamples.length > 0) { // Only log when FPS updates
      const avgFps = this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length
      console.log(`📊 FPS: ${this.fps.toFixed(1)} | Avg: ${avgFps.toFixed(1)} | Samples: ${this.frameSamples.length}`)
    }
  }

  /**
   * Get current FPS value
   */
  public getCurrentFPS(): number {
    return this.fps
  }

  /**
   * Get average FPS over the sample period
   */
  public getAverageFPS(): number {
    if (this.frameSamples.length === 0) return 0
    return this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length
  }

  /**
   * Reset the FPS monitoring data
   */
  public reset(): void {
    this.frameSamples = []
    this.frameCount = 0
    this.lastTime = performance.now()
    console.log('📊 FPS Monitor reset')
  }
}
