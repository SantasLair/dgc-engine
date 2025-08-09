# DGC Engine (Dream Game Crafter)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Work in Progress](https://img.shields.io/badge/Status-Work%20in%20Progress-orange)](https://github.com/SantasLair/dgc-engine)
[![AI Generated](https://img.shields.io/badge/AI%20Assisted-Professional%20Development-blue)](https://github.com/features/copilot)

**DGC Engine** - the Dream Game Crafter built for flexibility! A work-in-progress GameMaker-style game engine built with **TypeScript**, **rapid-render**, and modern web technologies. This project aims to become a flexible game engine with room management, event-driven GameObjects, and industry-standard architecture while maintaining the familiar feel of a web-first GameMaker-style engine.

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
- **Immediate-Mode Rendering**: Modern rapid-render system with GameMaker-style draw events
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
- **rapid-render** for immediate-mode 2D rendering
- **Vite** for fast development and hot reload
- **EasyStar.js** for pathfinding algorithms
- **MessagePack** for binary data serialization

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
- **Advanced Graphics**: WebGL capabilities through rapid-render
- **Mobile Support**: Touch controls and responsive design
- **Multiplayer Foundation**: Network architecture for multiplayer games
- **Asset Pipeline**: Build tools for asset optimization
- **Editor Interface**: Visual editor for rooms and objects
- **Plugin System**: Extensible architecture for custom functionality

## 🏗️ Project Structure
