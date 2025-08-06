# Dev UI Hotkey Controls

The DGC Engine now includes hotkey controls for toggling the development UI visibility.

## Available Hotkeys

### F12
- **Function**: Toggle dev UI visibility
- **Behavior**: Shows/hides the development debugging panel
- **Scope**: Works globally in development mode

### Ctrl+D  
- **Function**: Toggle dev UI visibility (alternative)
- **Behavior**: Same as F12, alternative key combination
- **Scope**: Works globally in development mode

## Features

- **Persistent State**: Dev UI visibility state is preserved across room transitions
- **Console Feedback**: Each toggle prints the current state to console
- **Development Only**: Hotkeys only work in development builds
- **Console Access**: `toggleDevUI()` function available in browser console

## Implementation Details

- **Initial State**: Dev UI starts hidden by default
- **Room Transitions**: MenuRoom hides dev UI, GameRoom respects current visibility state
- **State Tracking**: Game class maintains `devUIVisible` boolean property
- **Event Handling**: Global keyboard event listeners handle hotkey detection

## Usage

1. **Start Game**: Dev UI is hidden by default
2. **Press F12 or Ctrl+D**: Shows dev UI with debugging controls
3. **Press Again**: Hides dev UI
4. **Room Navigation**: Visibility state preserved when switching between menu and game

## Console Commands

In addition to hotkeys, you can control dev UI from browser console:

```javascript
// Toggle dev UI programmatically
toggleDevUI()

// Check if dev UI is visible
game.isDevUIVisible()
```

This provides both quick keyboard access and programmatic control for development workflows.
