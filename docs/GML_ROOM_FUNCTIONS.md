# Room Navigation Guide

Learn how to move between different areas (rooms) in your game, just like in GameMaker Studio.

## What are Rooms?

Rooms are different areas or screens in your game - like a main menu, game level, or settings screen. The DGC Engine lets you switch between rooms using the same functions you know from GameMaker.

## Moving Between Rooms

### Go to a Specific Room
Switch to any room by using its name:

```typescript
await room_goto('game')    // Go to the game room
await room_goto('menu')    // Go to the menu room
await room_goto('level1')  // Go to level 1
```

You can also use room numbers if you prefer:
```typescript
await room_goto(0)  // Go to the first room (usually menu)
await room_goto(1)  // Go to the second room (usually game)
```

### Restart the Current Room
Need to reset everything in the current room? Use this to start fresh:

```typescript
await room_restart()
```
This is perfect for when the player dies and wants to try the level again.

### Find Out Which Room You're In
Get the name of the current room:

```typescript
const currentRoom = room_get_name()
console.log('Current room:', currentRoom)  // Shows: "game" or "menu" etc.
```

### Navigate Room Sequences
Move through rooms in order:

```typescript
// Go to the next room in sequence
const success = await room_goto_next()
if (success) {
    console.log('Moved to next room')
} else {
    console.log('You're already at the last room')
}
```
```typescript
// Go back to the previous room
const success = await room_goto_previous()
if (success) {
    console.log('Moved to previous room')
} else {
    console.log('You're already at the first room')
}
```

## 💡 Tips for Using Rooms

### Common Use Cases
- **Main Menu → Game**: `room_goto('game')`
- **Game Over → Restart**: `room_restart()`
- **Pause Menu → Resume**: Stay in current room
- **Level Complete → Next Level**: `room_goto_next()`

### Error Handling
All room functions tell you if they worked:

```typescript
const success = await room_goto('some_room')
if (!success) {
    console.log('That room doesn\'t exist!')
}
```

### Setting Up Room Order
You can customize which rooms come next/previous by editing the room sequence in your game settings. The default order is: menu → game → settings → credits.

## 🎮 Examples

Try these in your game:

```typescript
// Create a "Next Level" button
button.onClick = async () => {
    await room_goto_next()
}

// Create a "Restart" button  
restartButton.onClick = async () => {
    await room_restart()
}

// Check if player is in the game room
if (room_get_name() === 'game') {
    // Show game-specific UI
}
```

These functions work similarly to GameMaker Studio.
| `room_goto_next()` | `room_goto_next()` |
| `room_goto_previous()` | `room_goto_previous()` |

Note: Some advanced GameMaker room features like `room_speed`, `room_width`, `room_height` are not yet implemented but can be added to the compatibility layer as needed.
