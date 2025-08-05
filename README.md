# Turn-Based Movement Game Demo

A 2D turn-based movement game demo built with **Vite**, **TypeScript**, and **EasyStar.js** for pathfinding.

## Features

- **Grid-based movement system** with turn-based mechanics
- **A* pathfinding** using EasyStar.js library
- **Animated movement** along calculated paths
- **Obstacle avoidance** with randomly generated obstacles
- **TypeScript** for type safety and better development experience
- **Vite** for fast development and building

## Game Mechanics

1. **Click on any walkable cell** to move the player character
2. The game calculates the shortest path using A* algorithm
3. The player moves step-by-step along the calculated path
4. Each movement sequence counts as one turn
5. Obstacles block movement and pathfinding

## Project Structure

```
src/
├── game/
│   ├── Game.ts          # Main game controller
│   ├── GameBoard.ts     # Grid-based game board
│   ├── Player.ts        # Player character class
│   ├── Renderer.ts      # Canvas rendering system
│   └── types.ts         # TypeScript type definitions
├── main.ts              # Application entry point
└── style.css            # Game styling
```

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
- **HTML5 Canvas** - 2D rendering
- **CSS3** - Styling and layout

## Game Controls

- **Left Click**: Move player to the clicked grid cell
- The game automatically calculates and shows the path
- Wait for the current movement to complete before clicking again

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
