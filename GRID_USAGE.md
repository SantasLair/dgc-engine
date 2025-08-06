# Grid System - Modern TypeScript vs GameMaker Style

The DGC Engine provides **two ways** to work with grids, allowing developers to choose their preferred approach:

## 🔧 Modern TypeScript Approach (Recommended for new projects)

```typescript
import { Grid } from './game/Grid'
import { CellType } from './game/types'

// Type-safe grid creation
const gameGrid = new Grid<CellType>(10, 8, CellType.EMPTY)

// Clean API with intellisense support
gameGrid.set(5, 3, CellType.OBSTACLE)
const cellType = gameGrid.get(5, 3)

// Modern iteration
for (const [x, y, value] of gameGrid) {
  console.log(`Cell (${x}, ${y}): ${value}`)
}
```

**Benefits:**
- Full TypeScript type safety
- IntelliSense and autocomplete
- Modern ES6+ features
- Better error catching during development

## 🎮 GameMaker Style (GML) Approach (For GameMaker veterans)

```typescript
import { ds_grid_create, ds_grid_get, ds_grid_set, ds_grid_clear } from './game/gml'

// Familiar GameMaker syntax
var grid = ds_grid_create(10, 8)
ds_grid_clear(grid, 0)

// Exact same function names as GameMaker
ds_grid_set(grid, 5, 3, 1)
var cellValue = ds_grid_get(grid, 5, 3)

// Classic GML-style loops
for (var i = 0; i < ds_grid_width(grid); i++) {
  for (var j = 0; j < ds_grid_height(grid); j++) {
    var value = ds_grid_get(grid, i, j)
    console.log(`Cell (${i}, ${j}): ${value}`)
  }
}
```

**Benefits:**
- **Copy-paste compatibility** with existing GameMaker code
- Familiar function names for GameMaker developers
- Easy migration from GameMaker Studio projects
- Zero learning curve for GML developers

## 🔀 Mixed Approach (Best of both worlds)

You can use both approaches in the same project:

```typescript
// Start with familiar GML style
var levelGrid = ds_grid_create(32, 24)
ds_grid_clear(levelGrid, 0)

// Use modern TypeScript for complex operations
const obstacles = [
  { x: 5, y: 3 },
  { x: 10, y: 8 }
]

obstacles.forEach(pos => {
  ds_grid_set(levelGrid, pos.x, pos.y, 1)
})

// Back to GML for game logic
if (ds_grid_get(levelGrid, playerX + 1, playerY) == 0) {
  // Move player
}
```

## 📋 Available GML Functions

All major GameMaker ds_grid functions are supported:

| GML Function | Purpose |
|--------------|---------|
| `ds_grid_create(w, h)` | Create new grid |
| `ds_grid_get(grid, x, y)` | Get value at position |
| `ds_grid_set(grid, x, y, val)` | Set value at position |
| `ds_grid_clear(grid, val)` | Clear entire grid |
| `ds_grid_width(grid)` | Get grid width |
| `ds_grid_height(grid)` | Get grid height |
| `ds_grid_set_region(grid, x1, y1, x2, y2, val)` | Set rectangular region |
| `ds_grid_resize(grid, w, h)` | Resize grid |
| `ds_grid_copy(dest, src)` | Copy grid data |
| `ds_grid_get_sum(grid, x1, y1, x2, y2)` | Sum values in region |
| `ds_grid_get_max(grid, x1, y1, x2, y2)` | Get maximum value |
| `ds_grid_get_min(grid, x1, y1, x2, y2)` | Get minimum value |
| `ds_grid_destroy(grid)` | No-op (JS handles memory) |

## 🎯 Copy-Paste Example

This GameMaker code works almost unchanged:

```gml
// Original GameMaker Studio code:
var collision_grid = ds_grid_create(32, 24);
ds_grid_clear(collision_grid, 0);

for (var i = 0; i < ds_grid_width(collision_grid); i++) {
    ds_grid_set(collision_grid, i, 0, 1); // Top wall
}

if (ds_grid_get(collision_grid, player_x + 1, player_y) == 0) {
    player_x += 1; // Move right
}
```

**The same code in DGC Engine (just add import):**

```typescript
import { ds_grid_create, ds_grid_get, ds_grid_set, ds_grid_clear, ds_grid_width } from './game/gml'

var collision_grid = ds_grid_create(32, 24);
ds_grid_clear(collision_grid, 0);

for (var i = 0; i < ds_grid_width(collision_grid); i++) {
    ds_grid_set(collision_grid, i, 0, 1); // Top wall
}

if (ds_grid_get(collision_grid, player_x + 1, player_y) == 0) {
    player_x += 1; // Move right
}
```

## 🚀 Getting Started

Choose your preferred approach:

```typescript
// Option 1: Modern TypeScript
import { Grid } from './game/Grid'

// Option 2: GameMaker Style  
import { ds_grid_create, ds_grid_get, ds_grid_set } from './game/gml'

// Option 3: Both (mixed approach)
import { Grid } from './game/Grid'
import * as gml from './game/gml'
```

See `src/examples/GridExamples.ts` for complete working examples of all three approaches.
