# Rooms

This folder contains all game room classes that extend the base `Room` class from the engine.

## Room Architecture

Each room class should:

1. **Extend Room**: Import and extend the `Room` class from `../../engine`
2. **Accept Game Instance**: Take a `Game` instance in the constructor to access game methods
3. **Define Room Config**: Provide room configuration including name, dimensions, background, and event handlers
4. **Handle Room Events**: Implement `onCreate`, `onStep`, `onDraw`, and `onDestroy` event handlers as needed

## Current Rooms

### GameRoom (`GameRoom.ts`)
- **Purpose**: Main gameplay room where turn-based movement happens
- **Dimensions**: 20x15 grid
- **Contains**: GameBoard, Player, game logic, input handling
- **Events**: 
  - `onCreate`: Sets up game board, player, and input handlers
  - `onStep`: Handles escape key for menu navigation

### MenuRoom (`MenuRoom.ts`)
- **Purpose**: Main menu and navigation
- **Dimensions**: 20x15 grid  
- **Contains**: Menu buttons and navigation elements
- **Events**:
  - `onCreate`: Sets up menu buttons and click handlers

## Adding New Rooms

To add a new room:

1. Create a new file in this folder (e.g., `SettingsRoom.ts`)
2. Import required dependencies:
   ```typescript
   import { Room, GameEvent, type RoomConfig } from '../../engine'
   import type { Game } from '../Game'
   ```
3. Extend Room and implement the required structure:
   ```typescript
   export class SettingsRoom extends Room {
     constructor(game: Game) {
       const config: RoomConfig = {
         name: 'settings',
         width: 20,
         height: 15,
         background: '#2c3e50',
         onCreate: async (_gameObject) => await this.onCreateRoom()
       }
       super(config)
       this.game = game
     }
     
     private async onCreateRoom(): Promise<void> {
       // Room setup logic
     }
   }
   ```
4. Export the new room in `index.ts`
5. Add the room instance to `Game.ts` in the `setupRooms()` method

## Best Practices

- **Room Isolation**: Each room should be self-contained and manage its own objects
- **Resource Cleanup**: Use `onDestroy` events to clean up room-specific resources
- **State Management**: Use the Game instance to share data between rooms
- **Object Creation**: Use `this.game.addGameObject()` to add objects to the engine
- **Event Handling**: Set up object-specific event handlers in the room's `onCreate` method
