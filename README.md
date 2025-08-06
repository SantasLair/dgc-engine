# DGC Engine (Dream Game Crafter)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pixi.js](https://img.shields.io/badge/Pixi.js-e91e63?logo=javascript&logoColor=white)](https://pixijs.com/)
[![Work in Progress](https://img.shields.io/badge/Status-Work%20in%20Progress-orange)](https://github.com/SantasLair/dgc-engine)
[![AI Generated](https://img.shields.io/badge/AI%20Assisted-Professional%20Development-blue)](https://github.com/features/copilot)

**DGC Engine** - the Dream Game Crafter built for flexibility! A work-in-progress GameMaker-style game engine built with **TypeScript**, **Pixi.js**, and modern web technologies. This project aims to become a flexible game engine with room management, event-driven GameObjects, and industry-standard architecture while maintaining the familiar feel of a web-first GameMaker-style engine.

## 🤖 AI-Assisted Development Showcase

This project serves as a **showcase for professional software development using AI code generation tools** (GitHub Copilot). **DGC Engine** demonstrates:

- **Flexible Engine Architecture**: Building a game engine that adapts to different development styles
- **Professional AI-Assisted Development**: How AI can assist in crafting complex, well-structured game engines
- **Best Practices**: Modern TypeScript patterns, documentation, and project organization
- **Rapid Prototyping**: Accelerated development from concept to working engine architecture
- **Code Quality**: AI-assisted development while maintaining high standards and readability

> **⚠️ Work in Progress**: DGC Engine is actively being developed and is far from complete. It currently demonstrates core concepts and architecture but lacks many features expected in a production game engine.

> **🎮 Prototype Game Implementation**: The current turn-based movement game is a **prototype/beta implementation** used to test and demonstrate the engine architecture. The game mechanics will be significantly improved and expanded as the engine develops.

## 🎮 Current Features

### Implemented ✅
- **Basic GameObject System**: Event-driven objects with CREATE, STEP, DRAW, DESTROY events
- **Room Management**: Basic level/scene organization and transitions
- **Event System**: Foundation for event handling and script system
- **Renderer Abstraction**: Pluggable rendering backends (currently Pixi.js)
- **Grid-based Movement**: Turn-based movement mechanics with pathfinding

### Game Features (Prototype/Beta)
- **Turn-based movement system** with click-to-move mechanics
- **A* pathfinding** using EasyStar.js library
- **Animated movement** along calculated paths
- **Obstacle avoidance** with randomly generated obstacles
- **Room-based organization** for levels and scenes

> **Note**: Game mechanics are currently in prototype/beta stage and serve as a testing ground for engine features. Significant improvements planned.

### Technology Stack
- **TypeScript** for type safety and modern development
- **Pixi.js** for WebGL-accelerated 2D rendering
- **Vite** for fast development and hot reload
- **EasyStar.js** for pathfinding algorithms

## 🚧 Planned Features

### Engine Goals 🎯
- **Complete GameObject System**: Full GameMaker-style object lifecycle
- **Advanced Room System**: Transitions, persistence, and complex room interactions
- **Asset Management**: Sprite, sound, and resource loading systems
- **Physics Integration**: 2D physics engine integration
- **Audio System**: Sound effects and music management
- **Save/Load System**: Game state persistence
- **Scripting System**: Visual or text-based scripting for game logic
- **Performance Optimization**: Object pooling, efficient rendering
- **Debug Tools**: Inspector, profiler, and debugging utilities

### Additional Features 🔮
- **Multiple Renderer Support**: Canvas 2D, WebGL, potentially WebGPU
- **Mobile Support**: Touch controls and responsive design
- **Multiplayer Foundation**: Network architecture for multiplayer games
- **Asset Pipeline**: Build tools for asset optimization
- **Editor Interface**: Visual editor for rooms and objects
- **Plugin System**: Extensible architecture for custom functionality

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
- **[Game Mechanics](#game-mechanics)** - How to play the current demo

### Development Documentation
- **[📖 Complete Development History](./history/README.md)** - Full project evolution and roadmap
- **[🔥 Development Log](./history/DEV_LOG.md)** - Chronological development journey
- **[🏗️ Engine Architecture](./history/ENGINE.md)** - Core engine documentation (current state)
- **[🏠 Room System](./history/ROOM_SYSTEM.md)** - Room management guide

### Contributing
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to this work-in-progress engine
- **[Development Roadmap](#planned-features)** - Planned features and implementation priorities

## 🎮 Current Demo Mechanics

### Turn-Based Movement (Prototype Implementation)
1. **First click** on any walkable cell shows the calculated path to that position
2. **Second click** on the same target cell executes the movement
3. The game calculates the shortest path using A* algorithm
4. The player moves step-by-step along the calculated path
5. Each movement sequence counts as one turn
6. Obstacles block movement and pathfinding

### Basic Room System
- **Game Room**: Main gameplay area with player and obstacles
- **Menu Room**: Basic navigation (work in progress)
- **Room Transitions**: Basic switching between game areas

> **Note**: The current demo showcases the foundational architecture but many GameMaker features are still in development. The game implementation is a **prototype/beta** used to test engine capabilities and will be significantly enhanced as the engine matures.

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

This work-in-progress engine has ambitious goals. Planned improvements include:

### Core Engine Development
- Complete GameObject event system implementation
- Advanced room management with persistence
- Asset loading and management system
- Physics engine integration
- Audio system implementation

### Game Features
- Multiple players or AI opponents
- Different terrain types with movement costs
- Power-ups and collectible items
- Combat and interaction systems
- Save/load game state
- Sound effects and animations
- Mobile touch support
- Multiplayer functionality
- **Enhanced turn-based mechanics** (current implementation is prototype)
- **Improved user interface** and visual feedback
- **Polished game balance** and progression systems

### Development Tools
- Visual room editor
- GameObject inspector
- Performance profiler
- Asset pipeline tools

> **Status**: This project demonstrates the architectural foundation and core concepts, but significant development is needed to achieve the full vision of a GameMaker-style engine.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Free to use** for personal and commercial projects
- ✅ **Modify and distribute** as you see fit
- ✅ **No attribution required** (but appreciated!)
- ✅ **Perfect for learning** and building upon

## Contributing

**🚧 Current Status**: This project is **not currently accepting public contributions** as it's in early development stages. Once the engine reaches a more mature state, public contributions will be welcomed.

However, this work-in-progress project demonstrates:
- **AI-assisted professional development** patterns and workflows
- Modern TypeScript game development patterns
- GameMaker-style architecture foundation
- Professional game engine design concepts
- Comprehensive documentation practices

This is an excellent project for:
- **Learning AI-assisted development** techniques and best practices
- **Learning game engine development** from architecture to implementation
- **Studying GameMaker-style patterns** in modern web development
- **Building TypeScript/Pixi.js skills** through codebase analysis
- **Educational use** as reference for your own projects

While contributions aren't being accepted yet, you can:
- Report bugs and issues for project improvement
- Suggest features for future consideration
- Use as learning material or foundation for your own projects
- Fork the project for your own development (MIT license)

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details about future contribution plans.

## Acknowledgments

- **GitHub Copilot & AI Tools** for enabling rapid, professional-quality development
- **GameMaker Studio** for the architectural inspiration and design patterns
- **Pixi.js** community for excellent 2D rendering capabilities
- **TypeScript** team for enabling type-safe game development
- **Vite** for lightning-fast development experience

> **Development Note**: This project showcases how AI-assisted development can accelerate complex software creation while maintaining professional standards and architectural quality.

> **Disclaimer**: This is an independent project inspired by GameMaker Studio's architecture but is not affiliated with or endorsed by YoYo Games.
