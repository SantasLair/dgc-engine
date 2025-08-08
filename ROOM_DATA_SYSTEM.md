# Data-Driven Room System

The DGC Engine now supports data-driven room creation, allowing you to define rooms in TOML files instead of requiring custom TypeScript classes for every room.

## Overview

The room system supports two approaches:

1. **Data-driven rooms** - Pure TOML/JSON definitions with no custom code
2. **Custom room classes** - TypeScript classes for specialized behavior (optional)

## Room Data Structure

Room data files are TOML files with the following structure:

```toml
version = "1.0.0"

[room]
name = "room_name"

[room.dimensions]
width = 20
height = 15

[room.background]
type = "color"
value = "#000000"

[room.view]
width = 800
height = 600

[[room.sprites]]
name = "sprite_name"
source = "/sprites/sprite.png"
frameWidth = 32
frameHeight = 32

[[room.objects]]
objectType = "Player"
instanceName = "player1"

[room.objects.position]
x = 5
y = 7
depth = 0

[room.objects.properties]
health = 100
speed = 1

[room.events]
onCreate = "console.log('Room created')"

[room.properties]
customProperty = "value"

[room.metadata]
description = "Room description"
author = "Author Name"
version = "1.0.0"
tags = ["tag1", "tag2"]
```

## Usage Examples

### 1. Basic Room Creation from TOML Data

```typescript
import { RoomManager, RoomFactory } from './engine'
import { Player, Enemy } from './gameobjects'

// Setup room manager with factory
const roomManager = new RoomManager({
  dataPath: '/data/rooms/'
})

// Register object types that can be created in rooms
const factory = roomManager.getFactory()
factory.registerObjectType('Player', Player)
factory.registerObjectType('Enemy', Enemy)

// Load room from TOML data file
const room = await roomManager.addRoomFromFile('test_level.toml')
await roomManager.goToRoom('test_level')
```

### 2. Creating Rooms from Data Objects

```typescript
import type { RoomData } from './engine'

const roomData: RoomData = {
  name: 'dynamic_room',
  dimensions: { width: 15, height: 10 },
  background: { type: 'color', value: '#2c3e50' },
  objects: [
    {
      objectType: 'Player',
      position: { x: 5, y: 5 },
      properties: { health: 100 }
    }
  ]
}

const room = roomManager.addRoomFromData(roomData)
```

### 3. Custom Room Classes (Optional)

For rooms that need special startup logic, you can still create custom classes:

```typescript
import { Room, type RoomConfig } from './engine'

export class BossRoom extends Room {
  constructor(config: RoomConfig) {
    super(config)
  }

  // Custom room startup logic
  public async onRoomStart(): Promise<void> {
    console.log('Boss room started - initialize boss AI')
    // Custom initialization code here
  }
}

// Register the custom class
factory.registerRoomClass('BossRoom', BossRoom)
```

Then in your room data file:

```toml
[room]
name = "boss_fight"
customClass = "BossRoom"

[room.dimensions]
width = 25
height = 20
```

## Room Data Properties

### Required Properties

- `name`: Unique room identifier
- `dimensions`: Room size in grid units

### Optional Properties

- `background`: Background color or image
- `view`: Camera/viewport settings
- `sprites`: Sprites to load for this room
- `objects`: Game objects to create in the room
- `events`: Room event scripts (onCreate, onStep, onDraw, onDestroy)
- `properties`: Custom room properties
- `customClass`: Custom room class name for specialized behavior
- `metadata`: Room description, author, version, tags

## Object Definition

Objects in the room are defined with:

```toml
[[room.objects]]
objectType = "Player"
instanceName = "player1"

[room.objects.position]
x = 5
y = 7
depth = 0

[room.objects.properties]
health = 100
speed = 1
```

- `objectType`: Must be registered with the factory
- `position`: Grid coordinates and optional depth
- `properties`: Custom properties passed to object constructor
- `instanceName`: Optional unique identifier

## Sprite Loading

Sprites are automatically loaded when the room activates:

```toml
[[room.sprites]]
name = "player_sprite"
source = "/sprites/player.png"
frameWidth = 32
frameHeight = 32
frameCount = 4
```

## Event Scripts

Room events can be defined as JavaScript strings:

```toml
[room.events]
onCreate = "console.log('Room created')"
onStep = "// Update logic here"
onDraw = "// Custom drawing here"
```

## Directory Structure

```
src/game/rooms/data/           # ← Edit room data files here
  main_menu.toml
  test_level.toml
  boss_fight.toml
  ...

public/data/rooms/             # ← Automatically copied during build
  main_menu.toml               # (Generated - don't edit directly)
  test_level.toml              # (Generated - don't edit directly)
  ...
```

**Important**: Always edit room data files in `src/game/rooms/data/`. The build system automatically copies them to `public/data/rooms/` where the engine can load them.

## Development Workflow

1. **Create/edit** room data files in `src/game/rooms/data/`
2. **Save the file** - Vite automatically copies it to public directory
3. **Hot reload** triggers and your changes are immediately available
4. **No manual copying needed** - everything is automatic!

## Benefits of TOML Format

1. **Human Readable**: More readable than JSON, especially for configuration
2. **Comments**: Supports comments for documentation
3. **Type Safety**: Clear data types (strings, numbers, booleans, arrays)
4. **Hierarchical**: Clean nested structure without excessive brackets
5. **Standards Based**: Well-defined specification and tooling support

## Migration from Code-Only Rooms

Existing room classes can be converted to TOML files by:

1. Moving static data (dimensions, background, object positions) to TOML
2. Keeping custom logic in optional room classes
3. Registering object types with the factory
4. Loading rooms via the enhanced RoomManager

## File Format Support

The system supports both TOML and JSON formats:
- `.toml` files - Recommended for better readability and comments
- `.json` files - Legacy support and interoperability

This system maintains backward compatibility while enabling powerful data-driven workflows with the superior readability of TOML format.
