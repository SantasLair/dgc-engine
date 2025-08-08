# Room Data Files

This directory contains room data files that define room properties, objects, and sprites using the data-driven room system.

## File Organization

```
src/game/rooms/data/
├── main_menu.toml       # Main menu room configuration
├── test_level.toml      # Test level with game objects
├── sprite_demo.toml     # Sprite system demonstration
└── README.md           # This file
```

## Development Workflow

1. **Edit room data files here** in `src/game/rooms/data/`
2. **Files are automatically copied** to `public/data/rooms/` during development
3. **Hot reload works** - changes trigger automatic copying and page refresh
4. **Build process** includes these files in the final build

## File Formats

- **`.toml` files** - Recommended for better readability and comments
- **`.json` files** - Alternative format for compatibility

## Example TOML Structure

```toml
version = "1.0.0"

[room]
name = "example_room"

[room.dimensions]
width = 20
height = 15

[room.background]
type = "color"
value = "#2c3e50"

[[room.objects]]
objectType = "Player"
instanceName = "player1"

[room.objects.position]
x = 10
y = 7

[room.objects.properties]
health = 100
```

## Benefits of This Structure

✅ **Developer Friendly** - Edit room data alongside room code  
✅ **Version Control** - Room data is tracked with source code  
✅ **Hot Reload** - Changes automatically propagate during development  
✅ **Build Integration** - Automatically included in production builds  
✅ **Team Collaboration** - Designers can edit room files in familiar location  

## Usage in Code

```typescript
// Load room from data file (automatically copied to public)
const room = await roomManager.addRoomFromFile('main_menu.toml')
await roomManager.goToRoom('main_menu')
```

The build system handles the copying automatically - you just edit the files here and they work in the browser!
