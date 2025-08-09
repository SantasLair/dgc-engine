# DGC Engine Philosophy

## Core Philosophy

The DGC Engine is built on a **bridge philosophy** that connects classic game development traditions with modern web technologies. Our approach encompasses:

1. **API Design**: Dual-paradigm support (GameMaker GML + Modern TypeScript)
2. **Architecture**: Flexible, unopinionated foundation
3. **Developer Experience**: Inclusive for all skill levels and backgrounds
4. **Technology**: Modern web standards with familiar game development patterns
5. **Evolution**: Smooth migration paths and progressive enhancement

## Engine Design Principles

### � **Bridge, Don't Replace**
- Honor classic game development patterns (especially GameMaker)
- Embrace modern web development practices
- Create connections, not divisions between paradigms

### 🎯 **Unopinionated Foundation**
- Provide tools, not prescriptions
- Support multiple valid approaches
- Let developers choose their path

### � **Progressive Enhancement**
- Start simple, grow complex
- Natural evolution from prototype to production
- No forced architectural decisions

### 🤝 **Inclusive Design**
- Welcome GameMaker veterans
- Embrace TypeScript/JavaScript developers
- Support mixed-skill teams

### ⚡ **Performance Without Compromise**
- Modern web performance
- Familiar development patterns
- No performance penalty for ease-of-use

## Engine Architecture Philosophy

### 1. Dual API Design

The engine provides **two complete, equivalent APIs** that serve different developer mindsets:

#### GameMaker-Compatible API (Familiar)
```typescript
// Immediate, function-based approach
engine.instance_create(Player, 100, 100)
engine.instance_destroy(Enemy)
engine.show_debug_message("Player spawned!")

// Unquoted keywords like GameMaker
if (engine.instance_exists(Player)) {
  const nearest = engine.instance_nearest(x, y, all)
  if (nearest !== noone) {
    // Handle object
  }
}
```

#### Modern TypeScript API (Powerful)
```typescript
// Object-oriented, type-safe approach
class GameManager {
  private objectManager = this.engine.getObjectManager()
  
  async initialize(): Promise<void> {
    const player = this.objectManager.createObject(Player, 100, 100)
    player.addEventListener('collision', this.handleCollision)
  }
}
```

### 2. Technology Philosophy

#### Modern Web Foundation
- **TypeScript**: Full type safety with optional usage
- **Vite**: Fast development and optimal builds
- **Canvas/WebGL**: Hardware-accelerated graphics
- **ES Modules**: Modern JavaScript architecture

#### GameMaker Compatibility Layer
- **Event System**: Authentic GameMaker event order and timing
- **Object System**: GameObject classes with GameMaker semantics
- **API Functions**: Direct translations of GameMaker functions
- **Keywords**: Unquoted `all`, `noone`, custom object types

### 3. Developer Experience Philosophy

#### For GameMaker Developers
- **Familiar Syntax**: `instance_create()`, `instance_destroy()`, etc.
- **Authentic Keywords**: `all`, `noone` work exactly like GameMaker
- **Event System**: Same event order and lifecycle
- **Migration Path**: Copy-paste compatibility where possible

#### For Modern Developers  
- **Type Safety**: Full TypeScript integration
- **Modern Patterns**: Classes, async/await, modules
- **IDE Support**: IntelliSense, refactoring, debugging
- **Web Standards**: No proprietary lock-in

#### For Mixed Teams
- **Code Compatibility**: Both APIs work together seamlessly
- **Gradual Adoption**: Use what you know, learn what you need
- **Documentation**: Examples for both paradigms
- **No Conflicts**: Choose your style per file or per function

## Programming Paradigms

### 1. Classic GameMaker GML Style (Function-Based)

**When to Use:**
- Rapid prototyping
- Simple game logic
- Direct object manipulation
- Familiar GameMaker patterns

**Characteristics:**
```typescript
// Immediate-action, procedural programming
engine.instance_create(Player, 100, 100)
engine.instance_destroy(Enemy)

if (engine.instance_exists(Player)) {
  const player = engine.instance_find(Player, 0)
  if (player !== noone) {
    player.x += 5
  }
}

// Global function-style approach
show_debug_message("Player moved!")
```

**Benefits:**
- ✅ Familiar to GameMaker developers
- ✅ Quick to write and understand
- ✅ Perfect for prototyping
- ✅ Direct and explicit

### 2. Modern TypeScript Style (Object-Oriented)

**When to Use:**
- Complex game systems
- State management
- Team development
- Production applications

**Characteristics:**
```typescript
// Object-oriented, type-safe programming
class GameManager {
  private state: GameState
  
  async initialize(): Promise<void> {
    this.state.player = this.createPlayer({ x: 100, y: 100 })
  }
  
  private createPlayer(position: Position): Player {
    const player = this.objectManager.createObject(PlayerType, position.x, position.y)
    player.addEventListener('collision', this.handleCollision.bind(this))
    return player
  }
}

// Modern patterns with type safety
const gameManager = new GameManager(engine)
await gameManager.initialize()
```

**Benefits:**
- ✅ Type safety and IntelliSense
- ✅ Scalable architecture
- ✅ Modern development practices
- ✅ Team collaboration features

### 3. Hybrid Approach (Best of Both Worlds)

**When to Use:**
- Most real-world projects
- Teams with mixed experience
- Gradual modernization
- Flexible requirements

**Characteristics:**
```typescript
class HybridGame {
  // Use modern patterns for complex logic
  private async initializeGame(): Promise<void> {
    this.gameState = await this.loadGameState()
  }
  
  // Use GML-style for immediate actions
  private gameStep(): void {
    if (this.engine.instance_number(Enemy) < 3) {
      this.engine.instance_create(Enemy, Math.random() * 800, Math.random() * 600)
    }
    
    // Modern approach for complex collision handling
    this.handleCollisions()
    
    // GML-style for simple checks
    if (!this.engine.instance_exists(Player)) {
      this.show_debug_message("Game Over!")
    }
  }
}
```

**Benefits:**
- ✅ Use the best tool for each task
- ✅ Gradual learning curve
- ✅ Maximum flexibility
- ✅ Future-proof architecture

## API Design Philosophy

### Dual API Surface

The engine provides **two complete API surfaces**:

#### 1. GameMaker-Compatible API
```typescript
// Global-style functions
engine.instance_number(all)
engine.instance_exists(Player)
engine.instance_find(Enemy, 0)
engine.instance_destroy(PowerUp)
engine.instance_nearest(x, y, Bullet)

// Direct object manipulation
player.x = 100
player.y = 200
player.setVariable('health', 50)
```

#### 2. Modern TypeScript API
```typescript
// Object-oriented approach
const objectManager = engine.getObjectManager()
const players = objectManager.getObjectsByType(Player)
const enemies = objectManager.getAllActiveObjects().filter(obj => obj.objectType === Enemy)

// Event-driven architecture
player.addEventListener('collision', this.handleCollision)
eventManager.emitEvent('game_start', { level: 1 })

// Promise-based operations
await gameManager.initialize()
const result = await player.moveToAsync(targetX, targetY)
```

### Consistent Behavior

Both APIs provide:
- ✅ Identical functionality
- ✅ Same performance characteristics
- ✅ Full TypeScript type safety
- ✅ Complete documentation

## Engine Evolution Philosophy

### Natural Growth Path

The engine is designed to grow with projects and teams:

1. **Prototype Phase**: Use simple, direct patterns
2. **Development Phase**: Add structure and organization  
3. **Production Phase**: Adopt scalable architectures
4. **Maintenance Phase**: Leverage type safety and tooling

### Technology Adoption

**Current Foundation:**
- TypeScript/JavaScript
- Canvas 2D rendering via rapid-render
- Vite build system
- GameMaker-compatible APIs

**Future Considerations:**
- WebGL/WebGPU rendering
- Web Audio API integration
- Web Workers for performance
- Progressive Web App features

### Backwards Compatibility

The engine commits to:
- ✅ **API Stability**: Core functions won't break
- ✅ **Migration Tools**: Automated upgrades where possible
- ✅ **Documentation**: Clear upgrade paths
- ✅ **Legacy Support**: Old patterns continue working

## Practical Implementation

### Project Structure Philosophy

### From GameMaker to Modern TypeScript

**Stage 1: Direct Translation**
```typescript
// GameMaker GML
instance_create_layer(100, 100, "Instances", obj_Player)

// Direct DGC Engine equivalent
engine.instance_create(Player, 100, 100)
```

**Stage 2: Add Type Safety**
```typescript
// Add interfaces and types
interface PlayerStats {
  health: number
  speed: number
}

const player = engine.instance_create(Player, 100, 100)
player.setVariable('stats', { health: 100, speed: 5 } as PlayerStats)
```

**Stage 3: Modern Patterns**
```typescript
// Use classes and modern architecture
class PlayerManager {
  createPlayer(position: Position): Player {
    const player = this.objectManager.createObject(Player, position.x, position.y)
    this.configurePlayer(player)
    return player
  }
}
```

### From Modern JavaScript to GameMaker Style

**Stage 1: Use Modern APIs**
```typescript
// Start with familiar modern patterns
class Game {
  constructor(private engine: DGCEngine) {}
  
  initialize() {
    this.engine.getObjectManager().createObject(Player, 100, 100)
  }
}
```

**Stage 2: Introduce GML Functions**
```typescript
// Mix in GameMaker-style calls
class Game {
  update() {
    if (this.engine.instance_number(Enemy) < 3) {
      this.spawnEnemy() // Modern method
    }
    
    this.engine.instance_destroy(PowerUp) // GML-style
  }
}
```

**Stage 3: Full GML Style**
```typescript
// Adopt procedural GameMaker patterns where appropriate
function gameLoop(engine: DGCEngine) {
  if (!engine.instance_exists(Player)) {
    engine.instance_create(Player, 400, 300)
  }
  
  const nearestEnemy = engine.instance_nearest(player.x, player.y, Enemy)
  if (nearestEnemy !== noone) {
    // Handle combat
  }
}
```

## Best Practices

### Choose the Right Paradigm

| Task | Recommended Approach | Reason |
|------|---------------------|---------|
| Prototyping | GML-style | Fast and direct |
| Object creation | Either | Personal preference |
| State management | Modern | Better organization |
| Event handling | Modern | Cleaner architecture |
| Simple checks | GML-style | More readable |
| Complex logic | Modern | Better maintainability |
| Team projects | Hybrid | Accommodates all skill levels |

### Code Organization

**Recommended Structure:**
```
src/
├── game/
│   ├── managers/           # Modern TypeScript classes
│   ├── objects/           # GameObject definitions
│   └── scripts/           # GML-style functions
├── engine/                # Engine core (both APIs)
└── utils/                 # Shared utilities
```

### Documentation Standards

- **GML-style functions**: Document like GameMaker functions
- **Modern classes**: Use JSDoc with TypeScript types
- **Hybrid code**: Clearly comment which paradigm is being used

## Evolution Path

The engine's philosophy supports natural evolution:

1. **Start Simple**: Use familiar patterns
2. **Add Complexity**: Introduce modern concepts gradually
3. **Refine Architecture**: Adopt best practices over time
4. **Scale Up**: Move to production-ready patterns

This approach ensures that:
- ✅ New developers can contribute immediately
- ✅ Code quality improves over time
- ✅ Projects can scale from prototypes to production
- ✅ Teams can work with mixed skill levels

## Conclusion

The DGC Engine's dual-paradigm philosophy creates an inclusive development environment where:

- **GameMaker veterans** feel at home with familiar patterns
- **Modern developers** get the tools and practices they expect
- **Teams** can work together regardless of background
- **Projects** can evolve naturally from simple to complex

This philosophy ensures the engine serves as a bridge between the classic game development world of GameMaker and the modern JavaScript/TypeScript ecosystem, providing the best of both worlds without compromise.
