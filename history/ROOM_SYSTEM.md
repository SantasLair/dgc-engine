# Room System Documentation

The Room system provides GameMaker-style room management for organizing game content into distinct areas, levels, or scenes.

## Overview

The Room system consists of three main components:
- **Room**: Individual game rooms/levels/scenes
- **RoomManager**: Manages multiple rooms and handles transitions
- **RoomExample**: Example implementations and patterns

## Basic Usage

### Creating a Simple Room

```typescript
import { Room, type RoomConfig } from './engine'

const roomConfig: RoomConfig = {
  name: 'level1',
  width: 30,
  height: 20,
  background: '#27ae60',
  onCreate: async (_room) => {
    // Room initialization code
    console.log('Room created!')
  },
  onStep: async (_room) => {
    // Per-frame room logic
  },
  onDraw: async (_room) => {
    // Custom room rendering
  }
}

const room = new Room(roomConfig)
```

### Using Room Manager

```typescript
import { RoomManager, Room } from './engine'

const roomManager = new RoomManager()

// Add rooms
roomManager.addRoom(menuRoom)
roomManager.addRoom(gameRoom)
roomManager.addRoom(settingsRoom)

// Initialize
roomManager.initialize()

// Switch between rooms
await roomManager.switchToRoom('menu')
await roomManager.switchToRoom('game')

// In your game loop
await roomManager.step()  // Update logic
await roomManager.draw()  // Render
```

## Room Events

Rooms support GameMaker-style events:

- **CREATE**: Called when room is first activated
- **STEP**: Called every frame while room is active
- **DRAW**: Called during rendering phase
- **DESTROY**: Called when room is destroyed

## Room Properties

### Core Properties
- `name`: Unique identifier for the room
- `width`/`height`: Room dimensions in grid units
- `background`: Background color or image
- `isRoomActive`: Whether room is currently active
- `isRoomCreated`: Whether room has been created

### Methods
- `activate()`: Make this room active
- `deactivate()`: Deactivate this room
- `destroy()`: Cleanup and destroy room
- `addGameObject(obj)`: Add object to room
- `removeGameObject(obj)`: Remove object from room
- `getGameObjects()`: Get all objects in room
- `getGameObjectsAtPosition(pos)`: Get objects at position
- `getGameObjectsByType(type)`: Get objects of specific type
- `isPositionInBounds(pos)`: Check if position is valid

## Room Manager Methods

### Room Management
- `addRoom(room)`: Add room to manager
- `removeRoom(name)`: Remove and destroy room
- `switchToRoom(name)`: Change active room
- `getCurrentRoom()`: Get active room
- `getRoom(name)`: Get room by name

### Lifecycle
- `initialize()`: Initialize all rooms
- `step()`: Update active room
- `draw()`: Render active room
- `cleanup()`: Destroy all rooms

## Integration with Game Engine

Rooms work seamlessly with the existing GameObject system:

```typescript
// In room onCreate event
const player = engine.createObject('player', 5, 5)
const enemy = engine.createObject('enemy', 10, 10)

// Objects are automatically managed by the room
room.addGameObject(player)
room.addGameObject(enemy)

// When room is destroyed, all objects are cleaned up
```

## Room Transitions with Data

```typescript
class GameWithRooms {
  private gameData = new Map<string, any>()
  
  private setupRooms() {
    const level1Config: RoomConfig = {
      name: 'level1',
      width: 20,
      height: 15,
      onCreate: async (_room) => {
        // Load saved data
        const health = this.gameData.get('playerHealth') || 100
        const score = this.gameData.get('playerScore') || 0
        
        const player = this.engine.createObject('player', 1, 1)
        player.setVariable('health', health)
        player.setVariable('score', score)
        
        // Create exit trigger
        const exit = this.engine.createObject('exit', 18, 14)
        exit.addEventScript(GameEvent.COLLISION, (_self, other) => {
          if (other?.objectType === 'player') {
            // Save progress
            this.gameData.set('playerHealth', other.getVariable('health'))
            this.gameData.set('playerScore', other.getVariable('score') + 100)
            
            // Go to next level
            this.roomManager.switchToRoom('level2')
          }
        })
      }
    }
  }
}
```

## Best Practices

### Room Organization
1. Keep rooms focused on specific game areas/levels
2. Use descriptive names for easy identification
3. Set appropriate dimensions for your game's needs

### Performance
1. Destroy unused objects when switching rooms
2. Use room events efficiently (avoid heavy calculations in onStep)
3. Consider object pooling for frequently created/destroyed objects

### Game Flow
1. Use room transitions for level progression
2. Save important game state before room switches
3. Handle cleanup properly to prevent memory leaks

## Examples

See `RoomExample.ts` for comprehensive examples including:
- Basic room setup with menu/game/settings
- Room transitions with data persistence
- Integration with GameObject system
- Input handling across rooms

## Integration with Existing Games

The main `Game` class has been updated to use the room system! To add room support to an existing game:

1. The Game class now automatically creates rooms during setup
2. Room manager is integrated into the game loop
3. Room switching methods are available on the Game instance

```typescript
// The Game class now has built-in room support
const game = new Game(canvas)
await game.start()

// Switch between rooms
await game.switchToRoom('menu')
await game.switchToRoom('game')

// Get room information
const currentRoom = game.getCurrentRoom()
const roomManager = game.getRoomManager()
```

### Current Game Rooms

The updated Game class creates two rooms by default:

1. **Game Room** (`'game'`): Main gameplay area with player and game objects
2. **Menu Room** (`'menu'`): Simple menu with start button

### Testing Room Functionality

When running in development mode, the following commands are available in the browser console:

- `switchToGame()` - Switch to the game room
- `switchToMenu()` - Switch to the menu room  
- `getCurrentRoom()` - Get the name of the current active room
- `getRoomManager()` - Access the room manager instance

### Custom Room Integration

To add your own rooms to the existing game:

```typescript
class MyGame extends Game {
  protected async setupGame(): Promise<void> {
    await super.setupGame() // Setup default rooms
    
    // Add custom rooms
    const customRoom = new Room({
      name: 'custom',
      width: 25,
      height: 18,
      onCreate: async (_room) => {
        // Custom room setup
      }
    })
    
    this.getRoomManager().addRoom(customRoom)
  }
}
```
