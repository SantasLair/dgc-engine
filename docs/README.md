# DGC Engine Documentation

## Overview

DGC Engine is a modern TypeScript game engine that follows GameMaker-style paradigms with contemporary web development practices.

## Architecture

- **GameObject System**: Event-driven game objects with CREATE, STEP, DRAW, DESTROY lifecycle
- **Room Management**: Scene-based game organization with data-driven room definitions
- **Sprite System**: Efficient sprite loading and rendering with rapid-render
- **Event System**: Clean TypeScript event handling for game logic

## Getting Started

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Build for production**: `npm run build`

## Key Features

- ✅ Modern TypeScript with strict typing
- ✅ GameMaker-style event paradigm
- ✅ Immediate-mode rendering via rapid-render
- ✅ Data-driven room system with JSON/MessagePack support
- ✅ Hot reload development workflow

## Project Structure

```
src/
├── engine/          # Core engine components
├── game/           # Game-specific logic and assets
└── main.ts         # Application entry point
```

---

*For detailed API documentation, see the source code comments and TypeScript definitions.*

## Future Documentation

This folder will contain comprehensive documentation as the engine evolves:

- **API Reference** - Detailed class and method documentation
- **Tutorials** - Step-by-step guides for common tasks
- **Examples** - Code samples and best practices
- **Architecture Guides** - In-depth system explanations

*Documentation will be added incrementally as features are finalized.*
