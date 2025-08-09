/**
 * Input manager for handling keyboard and mouse events
 * - Canvas-aware mouse coordinates (accounts for CSS scaling/DPI)
 * - Proper listener cleanup via dispose()
 */
export class InputManager {
  private keysPressed: Set<string> = new Set()
  private keysJustPressed: Set<string> = new Set()
  private keysJustReleased: Set<string> = new Set()
  private mouseX: number = 0
  private mouseY: number = 0
  private mouseButtons: Set<number> = new Set()
  private mouseJustPressed: Set<number> = new Set()
  private mouseJustReleased: Set<number> = new Set()

  private readonly canvas: HTMLCanvasElement

  // Bound listeners for add/remove symmetry
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.preventDefaultKeys.has(e.code)) e.preventDefault()
    if (!this.keysPressed.has(e.code)) this.keysJustPressed.add(e.code)
    this.keysPressed.add(e.code)
  }
  private onKeyUp = (e: KeyboardEvent) => {
    if (this.preventDefaultKeys.has(e.code)) e.preventDefault()
    this.keysPressed.delete(e.code)
    this.keysJustReleased.add(e.code)
  }
  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    this.mouseX = (e.clientX - rect.left) * scaleX
    this.mouseY = (e.clientY - rect.top) * scaleY
  }
  private onMouseDown = (e: MouseEvent) => {
    this.mouseJustPressed.add(e.button)
    this.mouseButtons.add(e.button)
  }
  private onMouseUp = (e: MouseEvent) => {
    this.mouseButtons.delete(e.button)
    this.mouseJustReleased.add(e.button)
  }

  // Keys to prevent default for (configurable later if needed)
  private preventDefaultKeys: Set<string> = new Set([
    'KeyW','KeyA','KeyS','KeyD','KeyR','Space',
    'ArrowUp','ArrowDown','ArrowLeft','ArrowRight'
  ])

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.onKeyDown, { passive: false })
    window.addEventListener('keyup', this.onKeyUp, { passive: false })
    window.addEventListener('mousemove', this.onMouseMove, { passive: true })
    window.addEventListener('mousedown', this.onMouseDown, { passive: true })
    window.addEventListener('mouseup', this.onMouseUp, { passive: true })
  }

  /** Remove all event listeners */
  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown as any)
    window.removeEventListener('keyup', this.onKeyUp as any)
    window.removeEventListener('mousemove', this.onMouseMove as any)
    window.removeEventListener('mousedown', this.onMouseDown as any)
    window.removeEventListener('mouseup', this.onMouseUp as any)
  }

  // Keyboard methods
  public isKeyPressed(key: string): boolean { return this.keysPressed.has(key) }
  public isKeyJustPressed(key: string): boolean { return this.keysJustPressed.has(key) }
  public isKeyJustReleased(key: string): boolean { return this.keysJustReleased.has(key) }

  // Mouse methods (canvas pixel coords)
  public getMouseX(): number { return this.mouseX }
  public getMouseY(): number { return this.mouseY }
  public isMouseButtonPressed(button: number): boolean { return this.mouseButtons.has(button) }
  public isMouseButtonJustPressed(button: number): boolean { return this.mouseJustPressed.has(button) }
  public isMouseButtonJustReleased(button: number): boolean { return this.mouseJustReleased.has(button) }

  /** Clear just-pressed/released states (call at end of frame) */
  public endFrame(): void {
    this.keysJustPressed.clear()
    this.keysJustReleased.clear()
    this.mouseJustPressed.clear()
    this.mouseJustReleased.clear()
  }
}
