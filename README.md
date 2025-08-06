# Turn-Based Movement Game Engine

A professional GameMaker-style game engine built with **TypeScript**, **Pixi.js**, and modern web technologies. What started as a simple turn-based movement demo evolved into a comprehensive game engine with room management, event-driven GameObjects, and industry-standard architecture.

## 🎮 Engine Features

### GameMaker-Style Architecture
- **GameObject System**: Event-driven objects with CREATE, STEP, DRAW, DESTROY events
- **Room Management**: Professional level/scene organization and transitions
- **Event System**: Comprehensive event handling and script system
- **Renderer Abstraction**: Pluggable rendering backends (currently Pixi.js)

### Game Features
- **Grid-based movement system** with turn-based mechanics
- **A* pathfinding** using EasyStar.js library
- **Animated movement** along calculated paths
- **Obstacle avoidance** with randomly generated obstacles
- **Room-based organization** for levels and scenes

### Technology Stack
- **TypeScript** for type safety and modern development
- **Pixi.js** for WebGL-accelerated 2D rendering
- **Vite** for fast development and hot reload
- **EasyStar.js** for pathfinding algorithms

## 🏗️ Project Structure

```
src/
├── engine/                    # Core game engine
│   ├── GameObject.ts          # Base GameObject class with events
│   ├── GameEngine.ts          # Main engine core
│   ├── Room.ts                # Room management system
│   ├── EventManager.ts        # Event system
│   └── renderers/             # Rendering backends
│       └── PixiRenderer.ts    # Pixi.js renderer
├── game/                      # Game implementation
│   ├── gameobjects/           # GameMaker-style GameObjects
│   │   ├── Player.ts          # Player character
│   │   ├── Enemy.ts           # AI enemies
│   │   ├── Item.ts            # Collectible items
│   │   └── GameBoard.ts       # Grid-based board
│   ├── rooms/                 # GameMaker-style Rooms
│   │   ├── GameRoom.ts        # Main gameplay room
│   │   └── MenuRoom.ts        # Menu/navigation room
│   ├── Game.ts                # Main game class
│   └── types.ts               # Type definitions
└── main.ts                    # Application entry point
```

## 📚 Documentation

### Quick Start
- **[Getting Started](#getting-started)** - Setup and installation
- **[Game Mechanics](#game-mechanics)** - How to play

### Engine Documentation
- **[📖 Complete Development History](./history/README.md)** - Full project evolution
- **[🔥 Development Log](./history/DEV_LOG.md)** - Chronological development journey
- **[🏗️ Engine Architecture](./history/ENGINE.md)** - Core engine documentation
- **[🏠 Room System](./history/ROOM_SYSTEM.md)** - Room management guide

## 🎮 Game Mechanics

### Turn-Based Movement
1. **First click** on any walkable cell shows the calculated path to that position
2. **Second click** on the same target cell executes the movement
3. The game calculates the shortest path using A* algorithm
4. The player moves step-by-step along the calculated path
5. Each movement sequence counts as one turn
6. Obstacles block movement and pathfinding

### Room System
- **Game Room**: Main gameplay area with player and obstacles
- **Menu Room**: Navigation and game options
- **Room Transitions**: Seamless switching between game areas

## Getting Started

### Prerequisites

- Node.js (16+ recommended)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Technologies Used

- **[Vite](https://vite.dev/)** - Fast build tool and development server
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[EasyStar.js](https://github.com/prettymuchbryce/easystarjs)** - A* pathfinding library
- **[Pixi.js](https://pixijs.com/)** - WebGL-accelerated 2D rendering engine
- **CSS3** - Styling and layout

## Game Controls

- **First Click**: Show path to the clicked grid cell (displays yellow dashed line and red target indicator)
- **Second Click**: On the same target to execute the movement
- Click on a different cell to show a new path instead
- Wait for the current movement to complete before making new moves

## Customization

You can easily customize the game by modifying:

- **Grid size**: Change `GameBoard` constructor parameters in `Game.ts`
- **Obstacle density**: Modify the density parameter in `GameBoard.ts`
- **Movement speed**: Adjust the timeout in `animatePlayerMovement()` method
- **Visual appearance**: Update colors and sizes in `Renderer.ts`
- **Cell size**: Change `cellSize` property in `Renderer.ts`

## Architecture

The game follows a modular architecture:

1. **Game**: Main controller that coordinates all components
2. **GameBoard**: Manages the grid state and obstacle placement
3. **Player**: Handles player position and movement
4. **Renderer**: Handles all canvas drawing operations
5. **Types**: Shared TypeScript interfaces and types

## Future Enhancements

Possible improvements for this demo:

- Multiple players or AI opponents
- Different terrain types with movement costs
- Power-ups and collectible items
- Save/load game state
- Sound effects and animations
- Mobile touch support
- Multiplayer functionality

## License

This project is open source and available under the MIT License.
