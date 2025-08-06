/**
 * GameMaker Language (GML) compatibility layer
 * Provides familiar ds_grid functions for GameMaker developers
 * while maintaining full TypeScript support and modern alternatives
 */

import { Grid } from './Grid'

// Type alias for GML-style grids (allows any type like GameMaker)
export type GMLGrid = Grid<any>

/**
 * Creates a new grid with the given dimensions
 * GameMaker equivalent: ds_grid_create(width, height)
 */
export function ds_grid_create(width: number, height: number, defaultValue: any = 0): GMLGrid {
  return new Grid<any>(width, height, defaultValue)
}

/**
 * Gets a value from the grid at the specified position
 * GameMaker equivalent: ds_grid_get(grid, x, y)
 */
export function ds_grid_get(grid: GMLGrid, x: number, y: number): any {
  return grid.get(x, y)
}

/**
 * Sets a value in the grid at the specified position
 * GameMaker equivalent: ds_grid_set(grid, x, y, value)
 */
export function ds_grid_set(grid: GMLGrid, x: number, y: number, value: any): void {
  grid.set(x, y, value)
}

/**
 * Clears the entire grid to the specified value
 * GameMaker equivalent: ds_grid_clear(grid, value)
 */
export function ds_grid_clear(grid: GMLGrid, value: any): void {
  grid.clear(value)
}

/**
 * Gets the width of the grid
 * GameMaker equivalent: ds_grid_width(grid)
 */
export function ds_grid_width(grid: GMLGrid): number {
  return grid.getWidth()
}

/**
 * Gets the height of the grid
 * GameMaker equivalent: ds_grid_height(grid)
 */
export function ds_grid_height(grid: GMLGrid): number {
  return grid.getHeight()
}

/**
 * Sets a rectangular region of the grid to the specified value
 * GameMaker equivalent: ds_grid_set_region(grid, x1, y1, x2, y2, value)
 */
export function ds_grid_set_region(grid: GMLGrid, x1: number, y1: number, x2: number, y2: number, value: any): void {
  grid.setRegion(x1, y1, x2, y2, value)
}

/**
 * Resizes the grid to new dimensions
 * GameMaker equivalent: ds_grid_resize(grid, width, height)
 */
export function ds_grid_resize(grid: GMLGrid, width: number, height: number): void {
  grid.resize(width, height)
}

/**
 * Copies data from one grid to another
 * GameMaker equivalent: ds_grid_copy(destination, source)
 */
export function ds_grid_copy(destination: GMLGrid, source: GMLGrid): void {
  destination.copyFrom(source)
}

/**
 * Destroys the grid (no-op in JavaScript due to garbage collection)
 * GameMaker equivalent: ds_grid_destroy(grid)
 * Note: In GameMaker this frees memory, but JavaScript handles this automatically
 */
export function ds_grid_destroy(_grid: GMLGrid): void {
  // No-op in JavaScript - garbage collector handles memory cleanup
  // This function exists for GameMaker code compatibility
}

/**
 * Checks if coordinates are valid for the grid
 * Custom function (not in GameMaker but useful for validation)
 */
export function ds_grid_valid(grid: GMLGrid, x: number, y: number): boolean {
  return grid.isValid(x, y)
}

/**
 * Gets the sum of all values in the grid
 * GameMaker equivalent: ds_grid_get_sum(grid, x1, y1, x2, y2)
 * If no region specified, sums entire grid
 */
export function ds_grid_get_sum(grid: GMLGrid, x1?: number, y1?: number, x2?: number, y2?: number): number {
  if (x1 === undefined) {
    // Sum entire grid
    return grid.getSum(0, 0, grid.getWidth() - 1, grid.getHeight() - 1)
  } else {
    // Sum specified region
    return grid.getSum(x1!, y1!, x2!, y2!)
  }
}

/**
 * Gets the maximum value in the grid region
 * GameMaker equivalent: ds_grid_get_max(grid, x1, y1, x2, y2)
 * If no region specified, gets max from entire grid
 */
export function ds_grid_get_max(grid: GMLGrid, x1?: number, y1?: number, x2?: number, y2?: number): number {
  const startX = x1 ?? 0
  const startY = y1 ?? 0
  const endX = x2 ?? (grid.getWidth() - 1)
  const endY = y2 ?? (grid.getHeight() - 1)
  
  let max = -Infinity
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      if (grid.isValid(x, y)) {
        const value = grid.get(x, y)
        if (typeof value === 'number' && value > max) {
          max = value
        }
      }
    }
  }
  return max === -Infinity ? 0 : max
}

/**
 * Gets the minimum value in the grid region
 * GameMaker equivalent: ds_grid_get_min(grid, x1, y1, x2, y2)
 * If no region specified, gets min from entire grid
 */
export function ds_grid_get_min(grid: GMLGrid, x1?: number, y1?: number, x2?: number, y2?: number): number {
  const startX = x1 ?? 0
  const startY = y1 ?? 0
  const endX = x2 ?? (grid.getWidth() - 1)
  const endY = y2 ?? (grid.getHeight() - 1)
  
  let min = Infinity
  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      if (grid.isValid(x, y)) {
        const value = grid.get(x, y)
        if (typeof value === 'number' && value < min) {
          min = value
        }
      }
    }
  }
  return min === Infinity ? 0 : min
}

/**
 * Finds the first occurrence of a value in the grid
 * Returns {x: number, y: number} or null if not found
 * Custom function for convenience
 */
export function ds_grid_value_find(grid: GMLGrid, value: any): {x: number, y: number} | null {
  for (let x = 0; x < grid.getWidth(); x++) {
    for (let y = 0; y < grid.getHeight(); y++) {
      if (grid.get(x, y) === value) {
        return {x, y}
      }
    }
  }
  return null
}

// =============================================================================
// ROOM FUNCTIONS (GameMaker room management compatibility)
// =============================================================================

/**
 * Switch to a different room
 * GameMaker equivalent: room_goto(room)
 */
export async function room_goto(roomName: string | number): Promise<boolean> {
  // Get the current game instance from global context
  const game = getGameInstance()
  if (!game) {
    console.warn('room_goto: No game instance available')
    return false
  }
  
  // Convert room index to room name if needed
  const roomNameStr = typeof roomName === 'number' ? getRoomNameFromIndex(roomName) : roomName
  
  return await game.goToRoom(roomNameStr)
}

/**
 * Switch to the next room in the order
 * GameMaker equivalent: room_goto_next()
 */
export async function room_goto_next(): Promise<boolean> {
  const game = getGameInstance()
  if (!game) {
    console.warn('room_goto_next: No game instance available')
    return false
  }
  
  const currentRoom = game.getCurrentRoom()
  if (!currentRoom) {
    console.warn('room_goto_next: No current room')
    return false
  }
  
  // Get next room in sequence (simplified implementation)
  const nextRoomName = getNextRoomName(currentRoom.name)
  if (nextRoomName) {
    return await game.goToRoom(nextRoomName)
  }
  
  console.warn('room_goto_next: No next room available')
  return false
}

/**
 * Switch to the previous room in the order
 * GameMaker equivalent: room_goto_previous()
 */
export async function room_goto_previous(): Promise<boolean> {
  const game = getGameInstance()
  if (!game) {
    console.warn('room_goto_previous: No game instance available')
    return false
  }
  
  const currentRoom = game.getCurrentRoom()
  if (!currentRoom) {
    console.warn('room_goto_previous: No current room')
    return false
  }
  
  // Get previous room in sequence (simplified implementation)
  const prevRoomName = getPreviousRoomName(currentRoom.name)
  if (prevRoomName) {
    return await game.goToRoom(prevRoomName)
  }
  
  console.warn('room_goto_previous: No previous room available')
  return false
}

/**
 * Restart the current room
 * GameMaker equivalent: room_restart()
 */
export async function room_restart(): Promise<boolean> {
  const game = getGameInstance()
  if (!game) {
    console.warn('room_restart: No game instance available')
    return false
  }
  
  const currentRoom = game.getCurrentRoom()
  if (!currentRoom) {
    console.warn('room_restart: No current room')
    return false
  }
  
  // Restart by going to the same room
  return await game.goToRoom(currentRoom.name)
}

/**
 * Get the current room name
 * GameMaker equivalent: room (room variable)
 */
export function room_get_name(): string | null {
  const game = getGameInstance()
  if (!game) {
    console.warn('room_get_name: No game instance available')
    return null
  }
  
  const currentRoom = game.getCurrentRoom()
  return currentRoom ? currentRoom.name : null
}

// =============================================================================
// HELPER FUNCTIONS (Internal)
// =============================================================================

/**
 * Global game instance reference for GML functions
 * This should be set by the game when it initializes
 */
let globalGameInstance: any = null

/**
 * Set the global game instance for GML functions to use
 * Should be called during game initialization
 */
export function gml_set_game_instance(game: any): void {
  globalGameInstance = game
}

/**
 * Get the current game instance
 */
function getGameInstance(): any {
  return globalGameInstance
}

/**
 * Convert room index to room name (simplified mapping)
 */
function getRoomNameFromIndex(index: number): string {
  const roomNames = ['menu', 'game', 'settings', 'credits'] // Can be configured
  return roomNames[index] || `room_${index}`
}

/**
 * Get the next room name in sequence
 */
function getNextRoomName(currentRoomName: string): string | null {
  const roomSequence = ['menu', 'game'] // Simplified sequence
  const currentIndex = roomSequence.indexOf(currentRoomName)
  
  if (currentIndex >= 0 && currentIndex < roomSequence.length - 1) {
    return roomSequence[currentIndex + 1]
  }
  
  return null
}

/**
 * Get the previous room name in sequence
 */
function getPreviousRoomName(currentRoomName: string): string | null {
  const roomSequence = ['menu', 'game'] // Simplified sequence
  const currentIndex = roomSequence.indexOf(currentRoomName)
  
  if (currentIndex > 0) {
    return roomSequence[currentIndex - 1]
  }
  
  return null
}

// Export all functions as a namespace for organized imports
export const gml = {
  // Grid functions
  ds_grid_create,
  ds_grid_get,
  ds_grid_set,
  ds_grid_clear,
  ds_grid_width,
  ds_grid_height,
  ds_grid_set_region,
  ds_grid_resize,
  ds_grid_copy,
  ds_grid_destroy,
  ds_grid_valid,
  ds_grid_get_sum,
  ds_grid_get_max,
  ds_grid_get_min,
  ds_grid_value_find,
  
  // Room functions
  room_goto,
  room_goto_next,
  room_goto_previous,
  room_restart,
  room_get_name,
  gml_set_game_instance
}
