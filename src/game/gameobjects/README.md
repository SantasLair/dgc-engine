# GameObjects

This folder contains all game object classes that extend the base `GameObject` class from the engine, following GameMaker Studio conventions.

## GameMaker-Style Architecture

In GameMaker, GameObjects are the fundamental building blocks of any game. Each GameObject:

1. **Extends GameObject**: All objects inherit from the base `GameObject` class
2. **Event-Driven**: Use GameMaker-style events (CREATE, STEP, DRAW, DESTROY, etc.)
3. **Self-Contained**: Each object manages its own behavior and state
4. **Reusable**: Can be instantiated multiple times across different rooms

## Current GameObjects

### Player (`Player.ts`)
- **Purpose**: Main player character with movement and interaction
- **Events**: CREATE, STEP, DRAW, DESTROY, collision events
- **Properties**: health, maxHealth, speed, canMove, score
- **Features**: Movement controls, health management, collision detection

### Enemy (`Enemy.ts`)
- **Purpose**: AI-controlled enemies with various behaviors
- **Events**: CREATE, STEP, collision events
- **Properties**: health, damage, speed, aiType, alertRadius
- **Features**: AI pathfinding, combat mechanics, state management

### Item (`Item.ts`)
- **Purpose**: Collectible items with various effects
- **Events**: CREATE, STEP, collision events
- **Properties**: itemType, value, effect, consumable
- **Features**: Collection mechanics, effect application, item stacking

### GameBoard (`GameBoard.ts`)
- **Purpose**: Grid-based game board for turn-based movement
- **Events**: CREATE, DESTROY
- **Properties**: width, height, grid data, obstacles
- **Features**: Pathfinding, grid validation, obstacle management

## Creating New GameObjects

To add a new GameObject:

1. Create a new file in this folder (e.g., `Projectile.ts`)
2. Import the base GameObject class:
   ```typescript
   import { GameObject, GameEvent } from '../../engine'
   ```
3. Extend GameObject and implement GameMaker-style structure:
   ```typescript
   export class Projectile extends GameObject {
     constructor(x: number, y: number) {
       super('Projectile', { x, y, visible: true })
       this.setupProjectileEvents()
     }
     
     private setupProjectileEvents(): void {
       this.addEventScript(GameEvent.CREATE, (self) => {
         // Object creation logic
       })
       
       this.addEventScript(GameEvent.STEP, (self) => {
         // Per-frame update logic
       })
       
       this.addEventScript(GameEvent.DESTROY, (self) => {
         // Cleanup logic
       })
     }
   }
   ```
4. Export the new object in `index.ts`
5. Add the object to rooms using `game.addGameObject(new ObjectName(x, y))`

## GameMaker Event System

### Core Events
- **CREATE**: Called once when object is created
- **STEP**: Called every frame (60 FPS by default)
- **DRAW**: Called during rendering phase
- **DESTROY**: Called when object is destroyed

### Collision Events
- **COLLISION**: When object collides with another object
- **COLLISION_START**: When collision begins
- **COLLISION_END**: When collision ends

### Input Events
- **MOUSE_LEFT_PRESSED**: Left mouse button pressed on object
- **MOUSE_RIGHT_PRESSED**: Right mouse button pressed on object
- **KEY_PRESSED**: Any key pressed (when object has focus)

### Room Events
- **ROOM_START**: When room begins
- **ROOM_END**: When room ends

## Best Practices

1. **Event-Driven Design**: Use events for all object behavior instead of direct method calls
2. **Variable Management**: Use `setVariable()` and `getVariable()` for object properties
3. **Collision Detection**: Set `solid = true` for objects that should block movement
4. **Visual Properties**: Set `visible = true` for objects that should be rendered
5. **Cleanup**: Always implement DESTROY events to clean up resources
6. **Performance**: Use STEP events efficiently - avoid heavy calculations every frame
7. **Modularity**: Keep objects focused on a single responsibility

## Object Lifecycle

```
[Room Creation] 
    ↓
[GameObject Constructor] 
    ↓
[CREATE Event] 
    ↓
[STEP Events (every frame)]
    ↓
[DRAW Events (every frame)]
    ↓
[DESTROY Event]
    ↓
[Object Cleanup]
```

This follows GameMaker Studio's object lifecycle exactly, ensuring familiar patterns for game developers.
