# GameMaker-Style Game Engine

This project has been enhanced with a GameMaker-style object-oriented game engine that provides event-driven programming for game objects.

## Architecture Overview

The engine consists of several core components:

### Core Engine Classes

- **`GameEngine`** - Main engine coordinator, handles game loop, input, and global events
- **`GameObject`** - Base class for all game entities with event-driven behavior
- **`EventManager`** - Manages global events and event propagation
- **`GameObjectManager`** - Handles object creation, destruction, and lifecycle management

### Event System

The engine uses an event-driven architecture similar to GameMaker Studio:

```typescript
// Available events
export const GameEvent = {
  CREATE: 'create',           // When object is created
  DESTROY: 'destroy',         // When object is destroyed
  STEP: 'step',               // Every frame update
  STEP_BEGIN: 'step_begin',   // Before main step
  STEP_END: 'step_end',       // After main step
  DRAW: 'draw',               // When object should be drawn
  DRAW_GUI: 'draw_gui',       // GUI drawing phase
  COLLISION: 'collision',     // When collision occurs
  MOUSE_LEFT_PRESSED: 'mouse_left_pressed',
  MOUSE_LEFT_RELEASED: 'mouse_left_released',
  MOUSE_RIGHT_PRESSED: 'mouse_right_pressed',
  MOUSE_RIGHT_RELEASED: 'mouse_right_released',
  KEY_PRESSED: 'key_pressed',
  KEY_RELEASED: 'key_released',
  ANIMATION_END: 'animation_end',
  TIMER: 'timer',             // Custom timer events
  CUSTOM: 'custom'            // User-defined events
}
```

## Creating Game Objects

### Basic Object Creation

```typescript
// Create the engine
const engine = new GameEngine()

// Create a basic object
const player = engine.createObject('Player', 100, 100)

// Add event scripts
player.addEventScript(GameEvent.CREATE, (self) => {
  console.log('Player created!')
  self.setVariable('health', 100)
})

player.addEventScript(GameEvent.STEP, (self) => {
  // Update logic runs every frame
  const health = self.getVariable('health')
  if (health <= 0) {
    self.destroy()
  }
})

player.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
  switch (eventData?.key) {
    case 'KeyW':
      self.move(0, -1)
      break
    case 'KeyS':
      self.move(0, 1)
      break
    // ... etc
  }
})
```

### Object Factory Functions

For reusable object types, create factory functions:

```typescript
export function createPlayerObject(engine: GameEngine, x: number, y: number): GameObject {
  const player = engine.createObject('Player', x, y)
  
  // Set properties
  player.solid = true
  player.visible = true
  player.setVariable('speed', 5)
  player.setVariable('health', 100)
  
  // Add behaviors
  player.addEventScript(GameEvent.STEP, (self) => {
    // Player logic
  })
  
  player.addEventScript(GameEvent.COLLISION, (self, eventData) => {
    const other = eventData?.other
    if (other?.objectType === 'Enemy') {
      // Take damage
      const currentHealth = self.getVariable('health')
      self.setVariable('health', currentHealth - 10)
    }
  })
  
  return player
}
```

## GameObject API

### Properties

```typescript
// Core position and state
obj.x, obj.y                 // Current position
obj.xPrevious, obj.yPrevious // Previous position
obj.visible                  // Visibility flag
obj.active                   // Active/paused state
obj.depth                    // Draw order
obj.solid                    // Collision flag

// Visual properties
obj.sprite                   // Sprite name
obj.imageIndex               // Animation frame
obj.imageSpeed               // Animation speed
obj.imageAngle               // Rotation
obj.imageXScale, obj.imageYScale  // Scale
obj.imageAlpha               // Transparency
```

### Methods

```typescript
// Movement
obj.setPosition(x, y)
obj.move(deltaX, deltaY)
obj.getPosition()

// Custom variables
obj.setVariable(name, value)
obj.getVariable(name)
obj.hasVariable(name)

// Timers
obj.setTimer(name, duration, callback)

// Events
obj.addEventScript(event, script)
obj.removeEventScript(event, script)
obj.executeEvent(event, data)

// Collision
obj.collidesWith(otherObject)

// Lifecycle
obj.destroy()
obj.clone()
```

## Global Engine API

```typescript
// Object management
engine.createObject(type, x, y)
engine.getObjects(type)
engine.getObjectsNear(position, radius, type?)
engine.getNearestObject(position, type?)

// Input
engine.isKeyPressed(key)
engine.isKeyJustPressed(key)
engine.getMousePosition()
engine.isMousePressed(button)

// Events
engine.addEventListener(eventType, listener)
engine.emitEvent(eventType, data)

// Global variables
engine.setGlobalVariable(name, value)
engine.getGlobalVariable(name)

// System info
engine.getDeltaTime()
engine.getFPS()

// Control
engine.start()
engine.stop()
engine.restart()
```

## Example Usage

### Simple Player Movement

```typescript
const player = createPlayerObject(engine, 5, 5)

// Add keyboard movement
player.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
  const speed = self.getVariable('speed') || 1
  
  switch (eventData?.key) {
    case 'KeyW': case 'ArrowUp':
      self.move(0, -speed)
      break
    case 'KeyS': case 'ArrowDown':
      self.move(0, speed)
      break
    case 'KeyA': case 'ArrowLeft':
      self.move(-speed, 0)
      break
    case 'KeyD': case 'ArrowRight':
      self.move(speed, 0)
      break
  }
})
```

### Enemy AI

```typescript
const enemy = engine.createObject('Enemy', 10, 10)

enemy.addEventScript(GameEvent.STEP, (self) => {
  // Find nearest player
  const player = engine.getNearestObject(self.getPosition(), 'Player')
  
  if (player) {
    const distance = Math.sqrt(
      Math.pow(player.x - self.x, 2) + Math.pow(player.y - self.y, 2)
    )
    
    // Chase if close
    if (distance < 5) {
      const dx = Math.sign(player.x - self.x)
      const dy = Math.sign(player.y - self.y)
      self.move(dx * 0.5, dy * 0.5)
    }
  }
})
```

### Collectible Items

```typescript
const coin = engine.createObject('Coin', 8, 8)

coin.addEventScript(GameEvent.STEP, (self) => {
  // Check collision with player
  const players = engine.getObjects('Player')
  for (const player of players) {
    if (self.collidesWith(player)) {
      // Add to score
      const score = player.getVariable('score') || 0
      player.setVariable('score', score + 10)
      
      // Destroy coin
      self.destroy()
      break
    }
  }
})
```

## Integration with Existing Code

The new engine is designed to work alongside the existing Pixi.js renderer and turn-based game logic. The `EnhancedGame` class bridges the two systems:

```typescript
// Create enhanced game
const game = new EnhancedGame(canvas)
await game.start()

// Access the engine for object creation
const engine = game.getEngine()
const player = createPlayerObject(engine, 0, 0)

// Objects automatically integrate with Pixi rendering
```

## Running the Demo

To see the engine in action:

1. Copy `main-enhanced.ts` to `main.ts` to use the new engine
2. Run the development server: `npm run dev`
3. Open the browser and interact with the demo
4. Use WASD/arrows to move, click to set targets
5. Create objects with the UI buttons

The demo showcases:
- Event-driven object behavior
- Mouse and keyboard input handling
- Collision detection
- Custom variables and timers
- Dynamic object creation
- Integration with Pixi.js rendering

This architecture provides the flexibility of GameMaker Studio's object system while maintaining the performance and features of the existing codebase.
