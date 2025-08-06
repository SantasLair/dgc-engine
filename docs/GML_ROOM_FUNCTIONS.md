# GML Room Functions

The DGC Engine includes a GameMaker Language (GML) compatibility layer for room management. This allows GameMaker developers to use familiar room navigation functions.

## Available Functions

### room_goto(room)
Switch to a different room by name or index.

```typescript
// Switch by room name
await room_goto('game')
await room_goto('menu')

// Switch by room index (0 = menu, 1 = game, etc.)
await room_goto(0)  // Go to menu
await room_goto(1)  // Go to game
```

### room_restart()
Restart the current room (reload it from scratch).

```typescript
await room_restart()
```

### room_get_name()
Get the name of the current room.

```typescript
const currentRoom = room_get_name()
console.log('Current room:', currentRoom)
```

### room_goto_next()
Switch to the next room in the sequence.

```typescript
const success = await room_goto_next()
if (success) {
    console.log('Moved to next room')
} else {
    console.log('No next room available')
}
```

### room_goto_previous()
Switch to the previous room in the sequence.

```typescript
const success = await room_goto_previous()
if (success) {
    console.log('Moved to previous room')
} else {
    console.log('No previous room available')
}
```

## Setup

The GML functions require the game instance to be set up. This happens automatically when the game initializes:

```typescript
// This is done automatically in Game.ts
import { gml_set_game_instance } from './gml'

// In your game setup
gml_set_game_instance(this)
```

## Error Handling

All room navigation functions return `Promise<boolean>` indicating success:

```typescript
const success = await room_goto('some_room')
if (!success) {
    console.log('Failed to switch to room')
}
```

## Room Sequence Configuration

The room sequence for `room_goto_next()` and `room_goto_previous()` can be customized by modifying the `roomSequence` array in `gml.ts`:

```typescript
// In gml.ts - modify this array to change room order
const roomSequence = ['menu', 'game', 'settings', 'credits']
```

## Integration with Game Engine

These GML functions work seamlessly with the DGC Engine's room system:

- They use the same `goToRoom()` method internally
- They respect room lifecycle events (onCreate, onDestroy, etc.)
- They integrate with the existing RoomManager

## Examples

See `src/examples/GMLRoomExample.ts` for comprehensive usage examples, or try these functions in the browser console when running in development mode.

## GameMaker Compatibility

These functions are designed to match GameMaker Studio's room navigation behavior:

| GameMaker Function | DGC Engine Equivalent |
|-------------------|---------------------|
| `room_goto(room)` | `room_goto(room)` |
| `room_restart()` | `room_restart()` |
| `room` (variable) | `room_get_name()` |
| `room_goto_next()` | `room_goto_next()` |
| `room_goto_previous()` | `room_goto_previous()` |

Note: Some advanced GameMaker room features like `room_speed`, `room_width`, `room_height` are not yet implemented but can be added to the compatibility layer as needed.
