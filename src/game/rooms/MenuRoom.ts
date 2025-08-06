import { Room, type RoomConfig } from '../../engine'
import type { Game } from '../Game'

/**
 * Menu room for game navigation and options
 */
export class MenuRoom extends Room {
  private game: Game
  private menuContainer: HTMLElement | null = null
  
  // Options button style configuration
  // 'popup' - Shows interactive options popup with placeholder settings
  // 'grayed' - Shows grayed-out disabled button
  private optionsStyle: 'popup' | 'grayed' = 'popup'

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
      const success = await this.game.goToRoom('game')
      console.log('Room switch result:', success)
    })

    // Create options button (placeholder)
    const optionsButton = document.createElement('button')
    optionsButton.textContent = 'Options'
    
    if (this.optionsStyle === 'grayed') {
      // Grayed out style
      optionsButton.style.cssText = `
        background: #95a5a6;
        color: #7f8c8d;
        border: none;
        padding: 15px 30px;
        font-size: 20px;
        border-radius: 8px;
        cursor: not-allowed;
        margin: 10px;
        min-width: 200px;
        opacity: 0.6;
      `
      
      optionsButton.disabled = true
      optionsButton.title = 'Options are not available yet'
      
      optionsButton.addEventListener('click', (e) => {
        e.preventDefault()
        // Optional: show a subtle tooltip or do nothing
      })
    } else {
      // Interactive popup style
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
        this.showOptionsPopup()
      })
    }

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

  /**
   * Show the options popup with placeholder settings
   */
  private showOptionsPopup(): void {
    // Create overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.7) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 3000 !important;
    `

    // Create popup container
    const popup = document.createElement('div')
    popup.style.cssText = `
      background: white !important;
      border-radius: 12px !important;
      padding: 30px !important;
      max-width: 500px !important;
      width: 90% !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
      font-family: Arial, sans-serif !important;
    `

    // Create title
    const title = document.createElement('h2')
    title.textContent = 'Game Options'
    title.style.cssText = `
      margin: 0 0 20px 0 !important;
      color: #333 !important;
      text-align: center !important;
    `

    // Create options sections
    const optionsContent = document.createElement('div')

    // Audio section
    const audioSection = this.createOptionSection('Audio', [
      { label: 'Master Volume', type: 'range', value: 75, disabled: true },
      { label: 'Sound Effects', type: 'range', value: 100, disabled: true },
      { label: 'Music', type: 'range', value: 80, disabled: true }
    ])

    // Graphics section
    const graphicsSection = this.createOptionSection('Graphics', [
      { label: 'Resolution', type: 'select', options: ['1920x1080', '1366x768', '1280x720'], disabled: true },
      { label: 'Fullscreen', type: 'checkbox', checked: false, disabled: true },
      { label: 'VSync', type: 'checkbox', checked: true, disabled: true }
    ])

    // Controls section
    const controlsSection = this.createOptionSection('Controls', [
      { label: 'Mouse Sensitivity', type: 'range', value: 50, disabled: true },
      { label: 'Invert Y-Axis', type: 'checkbox', checked: false, disabled: true }
    ])

    // Coming soon notice
    const notice = document.createElement('div')
    notice.style.cssText = `
      background: #fff3cd !important;
      border: 1px solid #ffeaa7 !important;
      border-radius: 6px !important;
      padding: 15px !important;
      margin: 20px 0 !important;
      text-align: center !important;
      color: #856404 !important;
    `
    notice.innerHTML = `
      <strong>🚧 Coming Soon!</strong><br>
      These options will be implemented in a future version.
    `

    // Create close button
    const closeButton = document.createElement('button')
    closeButton.textContent = 'Close'
    closeButton.style.cssText = `
      background: #6c757d !important;
      color: white !important;
      border: none !important;
      padding: 12px 24px !important;
      font-size: 16px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      display: block !important;
      margin: 20px auto 0 auto !important;
      transition: background-color 0.3s !important;
    `

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#5a6268'
    })

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = '#6c757d'
    })

    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay)
    })

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay)
      }
    })

    // Assemble popup
    popup.appendChild(title)
    popup.appendChild(optionsContent)
    optionsContent.appendChild(audioSection)
    optionsContent.appendChild(graphicsSection)
    optionsContent.appendChild(controlsSection)
    popup.appendChild(notice)
    popup.appendChild(closeButton)
    overlay.appendChild(popup)

    // Add to page
    document.body.appendChild(overlay)
  }

  /**
   * Create an option section with controls
   */
  private createOptionSection(title: string, options: Array<{
    label: string;
    type: 'range' | 'select' | 'checkbox';
    value?: number;
    options?: string[];
    checked?: boolean;
    disabled?: boolean;
  }>): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      margin-bottom: 25px !important;
    `

    const sectionTitle = document.createElement('h3')
    sectionTitle.textContent = title
    sectionTitle.style.cssText = `
      margin: 0 0 15px 0 !important;
      color: #495057 !important;
      font-size: 18px !important;
      border-bottom: 2px solid #e9ecef !important;
      padding-bottom: 8px !important;
    `

    section.appendChild(sectionTitle)

    options.forEach(option => {
      const optionRow = document.createElement('div')
      optionRow.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-bottom: 12px !important;
        padding: 8px 0 !important;
      `

      const label = document.createElement('label')
      label.textContent = option.label
      label.style.cssText = `
        color: ${option.disabled ? '#6c757d' : '#333'} !important;
        font-weight: 500 !important;
        flex: 1 !important;
      `

      let control: HTMLElement

      if (option.type === 'range') {
        control = document.createElement('input')
        const rangeInput = control as HTMLInputElement
        rangeInput.type = 'range'
        rangeInput.min = '0'
        rangeInput.max = '100'
        rangeInput.value = option.value?.toString() || '50'
        rangeInput.disabled = option.disabled || false
        rangeInput.style.cssText = `
          width: 120px !important;
          margin-left: 10px !important;
        `

        // Add value display
        const valueDisplay = document.createElement('span')
        valueDisplay.textContent = option.value?.toString() || '50'
        valueDisplay.style.cssText = `
          margin-left: 8px !important;
          min-width: 30px !important;
          color: ${option.disabled ? '#6c757d' : '#333'} !important;
          font-family: monospace !important;
        `

        optionRow.appendChild(label)
        optionRow.appendChild(control)
        optionRow.appendChild(valueDisplay)
      } else if (option.type === 'select') {
        control = document.createElement('select')
        const selectInput = control as HTMLSelectElement
        selectInput.disabled = option.disabled || false
        selectInput.style.cssText = `
          padding: 4px 8px !important;
          border-radius: 4px !important;
          border: 1px solid #ced4da !important;
          margin-left: 10px !important;
        `

        option.options?.forEach((optionText, index) => {
          const optionElement = document.createElement('option')
          optionElement.value = optionText
          optionElement.textContent = optionText
          if (index === 0) optionElement.selected = true
          selectInput.appendChild(optionElement)
        })

        optionRow.appendChild(label)
        optionRow.appendChild(control)
      } else if (option.type === 'checkbox') {
        control = document.createElement('input')
        const checkboxInput = control as HTMLInputElement
        checkboxInput.type = 'checkbox'
        checkboxInput.checked = option.checked || false
        checkboxInput.disabled = option.disabled || false
        checkboxInput.style.cssText = `
          margin-left: 10px !important;
          transform: scale(1.2) !important;
        `

        optionRow.appendChild(label)
        optionRow.appendChild(control)
      }

      section.appendChild(optionRow)
    })

    return section
  }
}
