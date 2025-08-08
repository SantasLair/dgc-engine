# Room Data Files

This directory contains room data files that define room properties, objects, and sprites using the data-driven room system.

## File Organization

```
src/game/rooms/data/
├── main_menu.json       # Main menu room configuration
├── test_level.json      # Test level with game objects
├── sprite_demo.json     # Sprite system demonstration
└── README.md           # This file
```

## Development Workflow

1. **Edit room data files here** in `src/game/rooms/data/`
2. **Files are automatically copied** to `public/data/rooms/` during development
3. **Hot reload works** - changes trigger automatic copying and page refresh
4. **Build process** includes these files in the final build

## File Format

Room data files use **JSON format** for universal compatibility and easy parsing.

## Example JSON Structure

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
        "source": "/sprites/player.png",
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

## Benefits of This Structure

✅ **Developer Friendly** - Edit room data alongside room code  
✅ **Version Control** - Room data is tracked with source code  
✅ **Hot Reload** - Changes automatically propagate during development  
✅ **Build Integration** - Automatically included in production builds  
✅ **Team Collaboration** - Designers can edit room files in familiar location  
✅ **Universal Format** - JSON is supported everywhere  

## Usage in Code

```typescript
// Load room from data file (automatically copied to public)
const room = await roomManager.addRoomFromFile('main_menu.json')
await roomManager.goToRoom('main_menu')
```

The build system handles the copying automatically - you just edit the files here and they work in the browser!
