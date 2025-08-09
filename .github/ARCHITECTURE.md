# DGC Engine Architecture Reference

> **For Copilot**: This document provides comprehensive architectural information about the DGC Engine codebase to assist with code generation, debugging, and maintenance.

## 🏗️ Core Architecture Overview

### **Engine Philosophy**
- **Immediate Mode Rendering**: Uses Rapid.js for frame-by-frame rendering (no retained scene graphs)
- **GameMaker-Inspired Design**: Object-oriented with virtual event methods (onCreate, onStep, onDraw, etc.)
- **Simplified Event System**: Moved away from string-based events to direct virtual method calls for performance
- **TypeScript-First**: Fully typed codebase with proper interfaces and type safety

### **Core Components Hierarchy**
```
DGCEngine (Main Engine)
├── DGCGame (Abstract game base class)
├── DGCRoom (Scene/Level management)
├── GameObject (Base object class)
├── GameObjectManager (Object lifecycle)
├── DGCDrawingSystem (Immediate mode rendering)
├── EventManager (Event queuing system)
├── InputManager (Input handling)
└── SpriteManager (Asset management)
```

## 🎮 DGCEngine - Core Engine Class

**File**: `src/engine/DGCEngine.ts`

### **Key Responsibilities**
- **Game Loop Management**: Fixed timestep game loop with frame accumulation
- **Object Lifecycle**: Manages all game objects through GameObjectManager
- **Rendering Pipeline**: Coordinates immediate mode drawing with Rapid.js
- **Input Processing**: Handles mouse/keyboard events and distributes to objects
- **Performance Optimization**: Object array caching to avoid repeated allocations

### **Game Loop Structure** (Simplified Event System)
```typescript
// Input and Timer Events
processInputEvents(allActiveObjects)
processTimerEvents(targetFrameTime, allActiveObjects)

// Step Phase
invokeVirtualForAll('onStepBegin', allActiveObjects)
invokeVirtualForAll('onStep', allActiveObjects)
// TODO: collisions and physics here
invokeVirtualForAll('onStepEnd', allActiveObjects)

// Draw Phase
startRender()
invokeVirtualForAll('onDrawBegin', allActiveObjects)
invokeVirtualForAll('onDraw', allActiveObjects)
invokeVirtualForAll('onDrawEnd', allActiveObjects)
endRender()
```

### **Key Methods**
- `start()` / `stop()`: Engine lifecycle control
- `addGameObject()` / `removeGameObject()`: Object management
- `getDrawingSystem()`: Access to immediate mode drawing
- `getInputManager()`: Access to input state
- `getObjectManager()`: Access to object management

### **Performance Features**
- **Object Array Caching**: Single `getAllActiveObjects()` call per frame
- **Fixed Timestep**: Consistent game logic regardless of framerate
- **Frame Time Capping**: Prevents "spiral of death" in performance issues

## 🎯 GameObject - Base Object Class

**File**: `src/engine/GameObject.ts`

### **Virtual Event Methods** (Primary Interface)
```typescript
// Lifecycle Events
onCreate(): void           // Called once when created
onDestroy(): void         // Called when destroyed

// Step Events (called every frame in order)
onStepBegin(): void       // Before main logic
onStep(): void           // Main game logic
onStepEnd(): void        // After main logic

// Draw Events (called every frame in order)
onDrawBegin(): void      // Before drawing
onDraw(): void          // Main drawing (default: drawSelf())
onDrawEnd(): void       // After drawing

// Collision Events
onCollision(other: GameObject): void  // When collision detected
```

### **Key Properties**
```typescript
// Position and Transform
x: number, y: number         // World position
imageXScale, imageYScale     // Scaling factors
imageAngle: number           // Rotation in degrees
imageAlpha: number           // Transparency (0-1)

// Rendering
sprite: DGCSprite | null     // Associated sprite
visible: boolean             // Visibility flag
depth: number               // Draw order (lower = background)

// State
active: boolean             // Whether object processes logic
objectType: string          // Type identifier for filtering
```

### **Built-in Methods**
- `drawSelf()`: Renders the object's sprite using current transform
- `updateTimers(deltaTime)`: Updates GameMaker-style alarm timers
- `setSprite(sprite)`: Assigns a sprite to the object
- `moveTowardsPoint(x, y, speed)`: Movement utility

### **Usage Pattern**
```typescript
export class Player extends GameObject {
  constructor() {
    super()
    this.objectType = 'Player'
  }
  
  public onCreate(): void {
    // Initialization logic
  }
  
  public onStep(): void {
    // Game logic
  }
  
  public onDraw(): void {
    this.drawSelf()  // Default sprite rendering
    // Additional drawing code
  }
}
```

## 🎨 Drawing System - Immediate Mode Rendering

**File**: `src/engine/DGCDrawingSystem.ts`

### **GameMaker-Style Drawing Functions**
```typescript
// Sprite Drawing
drawSpriteFromSprite(sprite, x, y, frame?, scaleX?, scaleY?, rotation?, alpha?)

// Primitive Drawing
drawRectangle(x1, y1, x2, y2, filled?, color?, alpha?)
drawCircle(x, y, radius, filled?, color?, alpha?)
drawLine(x1, y1, x2, y2, color?, width?)
drawText(x, y, text, color?, fontSize?, fontFamily?)

// Advanced Drawing
drawArrow(x1, y1, x2, y2, size?, color?)
drawHealthbar(x1, y1, x2, y2, amount, backColor?, minColor?, maxColor?)
```

### **Color System**
- Uses **hexadecimal colors**: `0xFF0000` (red), `0x00FF00` (green), etc.
- Automatic conversion to Rapid.js Color objects
- Support for alpha transparency

### **Coordinate System**
- **Direct screen coordinates** (no grid conversion)
- Origin typically at top-left (0,0)
- Sprite origins can be customized (0.5, 0.5 = center)

## 🏠 Room System - Scene Management

**File**: `src/engine/DGCRoom.ts`

### **Room Responsibilities**
- **Game Object Container**: Manages objects within a scene
- **Sprite Loading**: Each room declares required sprites
- **Room Events**: CREATE, STEP, DRAW, DESTROY events at room level
- **Scene Transitions**: Proper cleanup and initialization

### **Room Configuration**
```typescript
interface RoomConfig {
  name: string
  width: number
  height: number
  background?: string
  sprites?: SpriteLoadConfig[]    // Required sprites
  onCreate?: (room: any) => Promise<void>
  onStep?: (room: any) => Promise<void>
  onDraw?: (room: any) => Promise<void>
  onDestroy?: (room: any) => Promise<void>
}
```

### **Room Lifecycle**
1. **Create**: `initialize()` → sprite loading → `onCreate()` event
2. **Active**: `step()` and `draw()` called every frame
3. **Destroy**: `destroy()` → sprite unloading → cleanup

### **Sprite Management**
- **Automatic Loading**: Sprites declared in config are loaded on room start
- **Automatic Unloading**: Sprites unloaded when room is destroyed
- **Sprite Resolution**: String sprite names resolved to actual sprite objects

## 🖼️ Sprite System - Asset Management

**Files**: `src/engine/DGCSprite.ts`, `src/engine/SpriteManager.ts`

### **DGCSprite Class**
```typescript
interface DGCSpriteConfig {
  name: string                    // Sprite identifier
  source: string | HTMLImageElement // Image source
  frames?: number                 // Animation frames (default: 1)
  frameWidth?: number            // Frame width (auto-detected)
  frameHeight?: number           // Frame height (auto-detected)
  animationSpeed?: number        // FPS for animation (default: 12)
  origin?: { x: number; y: number } // Transform origin (default: 0.5, 0.5)
}
```

### **Key Features**
- **Async Loading**: Sprites load asynchronously with Promise-based API
- **Animation Support**: Multi-frame sprites with configurable animation speed
- **Origin Points**: Customizable transformation origins
- **Immediate Mode Compatible**: Provides metadata for drawing operations

### **SpriteManager**
- **Per-Room Management**: Each room has its own sprite manager
- **Loading/Unloading**: Automatic sprite lifecycle management
- **Duplicate Prevention**: Prevents loading same sprite multiple times
- **Error Handling**: Graceful fallbacks for missing sprites

## 🎮 Game Management - DGCGame Base Class

**File**: `src/engine/DGCGame.ts`

### **Abstract Game Class Pattern**
```typescript
export abstract class DGCGame {
  protected abstract getEngineConfig(): DGCEngineConfig
  protected abstract setupGame(): Promise<void>
  
  // Room management
  public addRoom(room: DGCRoom): void
  public async goToRoom(roomName: string): Promise<boolean>
  public getCurrentRoom(): DGCRoom | undefined
}
```

### **Implementation Pattern**
```typescript
export class MyGame extends DGCGame {
  protected getEngineConfig(): DGCEngineConfig {
    return {
      canvas: this.canvas,
      targetFPS: 60,
      rapidConfig: { /* Rapid.js config */ }
    }
  }
  
  protected async setupGame(): Promise<void> {
    // Create rooms, objects, setup game logic
  }
}
```

## 🎯 Input Management - InputManager

**File**: `src/engine/InputManager.ts`

### **Input State Methods**
```typescript
// Mouse
isMouseButtonPressed(button: number): boolean      // Currently held
isMouseButtonJustPressed(button: number): boolean  // Just pressed this frame
isMouseButtonJustReleased(button: number): boolean // Just released this frame
getMouseX(): number, getMouseY(): number          // Mouse coordinates

// Keyboard
isKeyPressed(key: string): boolean                 // Currently held
isKeyJustPressed(key: string): boolean            // Just pressed this frame
isKeyJustReleased(key: string): boolean           // Just released this frame
```

### **Frame Management**
- **State Tracking**: Maintains current, previous, and just-pressed states
- **Frame Cleanup**: `endFrame()` called automatically to reset just-pressed states
- **Event Distribution**: Engine automatically distributes input events to all objects

## 🔧 Technical Implementation Notes

### **Performance Optimizations**
1. **Single Object Array Cache**: Objects retrieved once per frame and reused
2. **Direct Virtual Method Calls**: No string-based event lookup overhead
3. **Fixed Timestep**: Consistent logic updates regardless of framerate
4. **Immediate Mode Rendering**: No retained scene graph overhead

### **Memory Management**
- **Object Pooling**: Not implemented yet (TODO for performance)
- **Sprite Caching**: Sprites cached and reused across objects
- **Automatic Cleanup**: Rooms automatically clean up resources

### **Error Handling**
- **Graceful Fallbacks**: Missing sprites render as colored rectangles
- **Comprehensive Logging**: Debug information for troubleshooting
- **Try-Catch Blocks**: Virtual method calls wrapped in error handling

### **Future Architecture Plans**
- **Physics Integration**: Collision detection and response system
- **Advanced Animation**: Sprite animation system with frame timing
- **Audio System**: Sound effects and music management
- **Scripting System**: Visual or text-based scripting for game logic

## 🔍 Debugging and Development

### **Debug Methods**
- **Object Counting**: `engine.getObjectCount(type)` for object tracking
- **Performance Monitoring**: FPS tracking and frame time monitoring
- **Visual Debugging**: Fallback rendering for troubleshooting positioning

### **Common Patterns**
```typescript
// Object Creation
const player = new Player()
player.x = 100
player.y = 100
engine.addGameObject(player)

// Drawing in GameObject
public onDraw(): void {
  this.drawSelf()  // Draw sprite
  // Additional custom drawing
  const drawingSystem = this.drawingSystem
  drawingSystem.drawRectangle(this.x-5, this.y-5, this.x+5, this.y+5, false, 0xFF0000)
}

// Room Transition
game.goToRoom('nextLevel')
```

### **Project Structure**
```
src/
├── engine/           # Core engine components
│   ├── DGCEngine.ts     # Main engine class
│   ├── GameObject.ts    # Base object class
│   ├── DGCRoom.ts      # Room/scene management
│   ├── DGCDrawingSystem.ts # Immediate mode drawing
│   ├── SpriteManager.ts    # Asset management
│   └── ...
├── game/            # Game-specific implementation
│   ├── Game.ts         # Main game class
│   ├── gameobjects/    # Game object implementations
│   └── rooms/          # Room implementations
└── main.ts          # Entry point
```

## 🎯 Key Architecture Decisions

1. **Immediate Mode Rendering**: Chosen for simplicity and GameMaker compatibility
2. **Virtual Methods Over Events**: Better performance and type safety
3. **Fixed Timestep Game Loop**: Consistent behavior across different framerates
4. **Per-Room Sprite Management**: Better memory management and loading performance
5. **TypeScript Throughout**: Type safety and better development experience

---

*This architecture is designed for clarity, performance, and ease of use while maintaining GameMaker-style patterns that are familiar to game developers.*
