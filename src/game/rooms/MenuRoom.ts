import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Menu room for game navigation and options
 */
export class MenuRoom extends Room {
  private game: Game
  private menuContainer: HTMLElement | null = null

  constructor(game: Game) {
    const config: RoomConfig = {
      name: 'menu',
      width: 20,
      height: 15,
      background: '#34495e',
      onCreate: async (_gameObject) => await this.onCreateRoom(),
      onDestroy: async (_gameObject) => await this.onDestroyRoom()
    }
    
    super(config)
    this.game = game
  }

  /**
   * Called when the menu room is created/activated
   */
  private async onCreateRoom(): Promise<void> {
    console.log('Menu room created!')
    
    // Hide the game canvas
    const canvas = this.game.getCanvas()
    if (canvas) {
      canvas.style.display = 'none'
      console.log('Canvas hidden')
    }
    
    // Remove development UI in menu completely
    console.log('Removing devUI...')
    this.game.removeDevUI()
    
    // Create HTML menu
    this.createMenuHTML()
  }

  /**
   * Called when the menu room is destroyed/deactivated
   */
  private async onDestroyRoom(): Promise<void> {
    console.log('Menu room destroyed!')
    
    // Show the game canvas
    const canvas = this.game.getCanvas()
    if (canvas) {
      canvas.style.display = 'block'
    }
    
    // Re-add development UI when leaving menu
    if (import.meta.env.DEV) {
      this.game.addDevUI()
    }
    
    // Remove HTML menu
    this.removeMenuHTML()
  }

  /**
   * Create the HTML menu interface
   */
  private createMenuHTML(): void {
    // Create menu container
    this.menuContainer = document.createElement('div')
    this.menuContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: Arial, sans-serif !important;
      z-index: 2000 !important;
    `

    // Create title
    const title = document.createElement('h1')
    title.textContent = 'DGC Engine Game'
    title.style.cssText = `
      color: white;
      font-size: 48px;
      margin-bottom: 40px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `

    // Create subtitle
    const subtitle = document.createElement('p')
    subtitle.textContent = 'Turn-Based Movement Adventure'
    subtitle.style.cssText = `
      color: rgba(255,255,255,0.8);
      font-size: 18px;
      margin-bottom: 40px;
      text-align: center;
    `

    // Create start button
    const startButton = document.createElement('button')
    startButton.textContent = 'Start Game'
    startButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 20px;
      border-radius: 8px;
      cursor: pointer;
      margin: 10px;
      transition: background-color 0.3s;
      min-width: 200px;
    `

    startButton.addEventListener('mouseenter', () => {
      startButton.style.backgroundColor = '#45a049'
    })

    startButton.addEventListener('mouseleave', () => {
      startButton.style.backgroundColor = '#4CAF50'
    })

    startButton.addEventListener('click', async () => {
      console.log('Start Game button clicked!')
      const success = await this.game.switchToRoom('game')
      console.log('Room switch result:', success)
    })

    // Create options button (placeholder)
    const optionsButton = document.createElement('button')
    optionsButton.textContent = 'Options'
    optionsButton.style.cssText = `
      background: #2196F3;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 20px;
      border-radius: 8px;
      cursor: pointer;
      margin: 10px;
      transition: background-color 0.3s;
      min-width: 200px;
    `

    optionsButton.addEventListener('mouseenter', () => {
      optionsButton.style.backgroundColor = '#1976D2'
    })

    optionsButton.addEventListener('mouseleave', () => {
      optionsButton.style.backgroundColor = '#2196F3'
    })

    optionsButton.addEventListener('click', () => {
      alert('Options coming soon!')
    })

    // Assemble menu
    this.menuContainer.appendChild(title)
    this.menuContainer.appendChild(subtitle)
    this.menuContainer.appendChild(startButton)
    this.menuContainer.appendChild(optionsButton)

    // Add to page
    document.body.appendChild(this.menuContainer)
  }

  /**
   * Remove the HTML menu interface
   */
  private removeMenuHTML(): void {
    if (this.menuContainer && this.menuContainer.parentNode) {
      this.menuContainer.parentNode.removeChild(this.menuContainer)
      this.menuContainer = null
    }
  }
}
