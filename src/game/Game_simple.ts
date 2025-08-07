import { DGCRapidGame, type DGCRapidEngineConfig } from '../engine'

/**
 * Simplified Game class for basic functionality
 */
export class Game extends DGCRapidGame {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  public getEngineConfig(): DGCRapidEngineConfig {
    return {
      gridWidth: 20,
      gridHeight: 15,
      targetFPS: 60,
      cellSize: 30,
      gridOffset: { x: 50, y: 50 }
    }
  }

  public async setupGame(): Promise<void> {
    console.log('🎮 Game setup complete')
  }
}
