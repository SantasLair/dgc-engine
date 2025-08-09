# Room Data System Documentation

This documentation covers the data-driven room system in the DGC Engine, which allows rooms to be defined using JSON files that are automatically converted to compressed MessagePack format for production.

## File Organization

Room data files are stored in your game's data directory:

```
src/game/rooms/data/
├── main_menu.json       # Example: Main menu room configuration
├── test_level.json      # Example: Test level with game objects
├── sprite_demo.json     # Example: Sprite system demonstration
└── [your_rooms].json    # Your custom room files
```

## Build Process

The engine automatically processes room data files:

1. **Development**: JSON files are converted to binary MessagePack (.dgcroom) format
2. **Production**: Only compressed .dgcroom files are included (no JSON)
3. **Hot Reload**: Changes to source JSON files trigger automatic conversion
4. **Compression**: MessagePack provides ~50% file size reduction
5. **Obfuscation**: Binary format makes room data harder to read/modify

## File Format

Room data files use **JSON format** in development for easy editing, then get compiled to **MessagePack binary format** for production.

### JSON Structure

```json
{
  "version": "1.0.0",
  "room": {
    "name": "example_room",
    "dimensions": {
      "width": 20,
      "height": 15
    },
    "background": {
      "type": "color",
      "value": "#2c3e50"
    },
    "sprites": [
      {
        "name": "player_sprite",
        "source": "/images/player.png",
        "frameWidth": 32,
        "frameHeight": 32,
        "frames": 1
      }
    ],
    "objects": [
      {
        "objectType": "Player",
        "instanceName": "player1",
        "position": {
          "x": 10,
          "y": 7,
          "depth": 0
        },
        "properties": {
          "health": 100,
          "speed": 1
        }
      }
    ],
    "properties": {},
    "metadata": {
      "description": "Example room",
      "author": "DGC Engine",
      "version": "1.0.0",
      "tags": ["example"]
    }
  }
}
```

## Engine API Usage

### Loading Room Data Files

```typescript
// Load room from data file (engine handles format detection)
const room = await roomManager.addRoomFromFile('main_menu.dgcroom')
await roomManager.goToRoom('main_menu')

// Create room from template
const factory = roomManager.getFactory()
const roomData = factory.createRoomDataTemplate('new_room', 20, 15)
```

### Dual Format Support

The engine supports both JSON (development) and MessagePack (production):

```typescript
// Engine automatically detects file format
if (filename.endsWith('.dgcroom')) {
  // Load MessagePack binary format
  const arrayBuffer = await response.arrayBuffer()
  roomDataFile = decode(new Uint8Array(arrayBuffer))
} else if (filename.endsWith('.json')) {
  // Load JSON format (development)
  const fileContent = await response.text()
  roomDataFile = JSON.parse(fileContent)
}
```

### Exporting Room Data

```typescript
// Export as JSON for editing
const jsonString = factory.exportRoomDataAsJson(roomData)

// Export as MessagePack for production
const binaryData = factory.exportRoomDataAsMessagePack(roomData)
```

## Benefits of This System

✅ **Compression** - MessagePack reduces file sizes by ~50%  
✅ **Obfuscation** - Binary format prevents easy modification  
✅ **Developer Friendly** - JSON editing in development  
✅ **Hot Reload** - Automatic conversion and refresh  
✅ **Version Control** - Human-readable diffs in git  
✅ **Universal Format** - JSON tooling compatibility  
✅ **Build Integration** - Seamless production deployment  

## Implementation Details

- **MessagePack Library**: `@msgpack/msgpack` for binary serialization
- **Build System**: Vite plugin automatically converts files
- **File Extension**: `.dgcroom` for MessagePack room files
- **Source Files**: JSON files remain in `src/` for development
- **Public Files**: Only binary files are served to browsers
