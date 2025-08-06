/**
 * Example demonstrating both modern TypeScript and GML-style approaches
 * This shows how developers can choose their preferred coding style
 */

import { Grid } from '../game/Grid'
import { ds_grid_create, ds_grid_get, ds_grid_set, ds_grid_clear, ds_grid_width, ds_grid_height } from '../game/gml'
import { CellType } from '../game/types'

/**
 * Example using modern TypeScript approach
 */
export function modernApproachExample(): void {
  console.log('=== Modern TypeScript Approach ===')
  
  // Type-safe grid creation
  const gameGrid = new Grid<CellType>(8, 6, CellType.EMPTY)
  
  // Clean method calls with intellisense
  gameGrid.set(2, 3, CellType.OBSTACLE)
  gameGrid.set(4, 1, CellType.OBSTACLE)
  
  // Type checking helps catch errors
  const cellType: CellType = gameGrid.get(2, 3)
  console.log(`Cell at (2,3): ${cellType}`)
  
  // Modern iteration
  for (const [x, y, value] of gameGrid) {
    if (value === CellType.OBSTACLE) {
      console.log(`Obstacle found at (${x}, ${y})`)
    }
  }
  
  console.log(`Grid dimensions: ${gameGrid.getWidth()} x ${gameGrid.getHeight()}`)
}

/**
 * Example using GameMaker Language (GML) style approach
 * This code would be nearly identical to GameMaker Studio code
 */
export function gmlApproachExample(): void {
  console.log('=== GameMaker Language (GML) Style Approach ===')
  
  // GameMaker-style grid creation (familiar to GML developers)
  var grid = ds_grid_create(8, 6)
  ds_grid_clear(grid, 0) // 0 = empty, 1 = obstacle
  
  // GameMaker-style function calls
  ds_grid_set(grid, 2, 3, 1)
  ds_grid_set(grid, 4, 1, 1)
  
  // Familiar GML syntax
  var cellValue = ds_grid_get(grid, 2, 3)
  console.log(`Cell at (2,3): ${cellValue}`)
  
  // GameMaker-style loops (could use var i, j like GML)
  for (var i = 0; i < ds_grid_width(grid); i++) {
    for (var j = 0; j < ds_grid_height(grid); j++) {
      if (ds_grid_get(grid, i, j) == 1) {
        console.log(`Obstacle found at (${i}, ${j})`)
      }
    }
  }
  
  console.log(`Grid dimensions: ${ds_grid_width(grid)} x ${ds_grid_height(grid)}`)
}

/**
 * Example showing mixed approach - using both styles in the same code
 * Developers can gradually transition or use what feels most appropriate
 */
export function mixedApproachExample(): void {
  console.log('=== Mixed Approach (Best of Both Worlds) ===')
  
  // Start with GML-style creation (familiar)
  var levelGrid = ds_grid_create(10, 8)
  ds_grid_clear(levelGrid, 0)
  
  // Use modern TypeScript for complex logic
  const obstacles = [
    { x: 2, y: 3 },
    { x: 5, y: 1 },
    { x: 7, y: 6 }
  ]
  
  obstacles.forEach(obstacle => {
    ds_grid_set(levelGrid, obstacle.x, obstacle.y, 1)
  })
  
  // GML-style access for game logic
  var playerX = 0
  var playerY = 0
  
  if (ds_grid_get(levelGrid, playerX + 1, playerY) == 0) {
    console.log('Player can move right')
  }
  
  // Modern approach for advanced operations
  console.log(`Total obstacles: ${levelGrid.getSum(0, 0, levelGrid.getWidth() - 1, levelGrid.getHeight() - 1)}`)
}

/**
 * Copy-paste example from theoretical GameMaker code
 * This shows how existing GML code could work with minimal changes
 */
export function gamemaker_copypaste_example(): void {
  console.log('=== GameMaker Copy-Paste Example ===')
  
  // This could be copied almost directly from GameMaker Studio:
  
  var collision_grid = ds_grid_create(32, 24)
  ds_grid_clear(collision_grid, 0)
  
  // Setup some walls around the border (typical GameMaker pattern)
  for (var i = 0; i < ds_grid_width(collision_grid); i++) {
    ds_grid_set(collision_grid, i, 0, 1) // Top wall
    ds_grid_set(collision_grid, i, ds_grid_height(collision_grid) - 1, 1) // Bottom wall
  }
  
  for (var j = 0; j < ds_grid_height(collision_grid); j++) {
    ds_grid_set(collision_grid, 0, j, 1) // Left wall
    ds_grid_set(collision_grid, ds_grid_width(collision_grid) - 1, j, 1) // Right wall
  }
  
  // Check collision (typical GameMaker collision detection)
  var player_x = 5
  var player_y = 5
  var new_x = player_x + 1
  var new_y = player_y
  
  if (ds_grid_get(collision_grid, new_x, new_y) == 0) {
    console.log('Movement allowed')
    player_x = new_x
    player_y = new_y
  } else {
    console.log('Collision detected!')
  }
  
  console.log(`Player position: (${player_x}, ${player_y})`)
}

// Export all examples
export const GridExamples = {
  modern: modernApproachExample,
  gml: gmlApproachExample,
  mixed: mixedApproachExample,
  copyPaste: gamemaker_copypaste_example
}
