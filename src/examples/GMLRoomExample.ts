/**
 * Example demonstrating GML (GameMaker Language) room functions
 * 
 * This example shows how to use GameMaker-style room navigation functions
 * in your DGC Engine game for familiar GameMaker developers.
 */

import { 
  room_goto, 
  room_restart, 
  room_get_name, 
  room_goto_next, 
  room_goto_previous 
} from '../game/gml'

/**
 * Example class showing how to use GML room functions
 */
export class GMLRoomExample {
  
  /**
   * Basic room navigation examples
   */
  static async basicNavigation() {
    console.log('=== GML Room Navigation Examples ===')
    
    // Get current room name
    const currentRoom = room_get_name()
    console.log('Current room:', currentRoom)
    
    // Switch to specific rooms
    console.log('Switching to game room...')
    await room_goto('game')
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Switching to menu room...')
    await room_goto('menu')
    
    // Restart current room
    console.log('Restarting current room...')
    await room_restart()
  }
  
  /**
   * Sequential navigation examples
   */
  static async sequentialNavigation() {
    console.log('=== Sequential Navigation Examples ===')
    
    // Go to next room in sequence
    console.log('Going to next room...')
    const nextResult = await room_goto_next()
    if (nextResult) {
      console.log('Successfully moved to next room')
    } else {
      console.log('No next room available')
    }
    
    // Go to previous room in sequence
    console.log('Going to previous room...')
    const prevResult = await room_goto_previous()
    if (prevResult) {
      console.log('Successfully moved to previous room')
    } else {
      console.log('No previous room available')
    }
  }
  
  /**
   * Room index navigation (for GameMaker compatibility)
   */
  static async indexNavigation() {
    console.log('=== Index Navigation Examples ===')
    
    // Use room index (0 = menu, 1 = game)
    console.log('Going to room index 0 (menu)...')
    await room_goto(0)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Going to room index 1 (game)...')
    await room_goto(1)
  }
  
  /**
   * Error handling examples
   */
  static async errorHandling() {
    console.log('=== Error Handling Examples ===')
    
    // Try to go to non-existent room
    console.log('Trying to go to non-existent room...')
    const result = await room_goto('nonexistent_room')
    if (!result) {
      console.log('Failed to switch room (as expected)')
    }
    
    // Safe room checking
    const roomName = room_get_name()
    if (roomName) {
      console.log('Currently in room:', roomName)
    } else {
      console.log('No room active')
    }
  }
}

// Usage examples for console testing
if (import.meta.env.DEV) {
  // Expose examples to window for console testing
  ;(window as any).GMLRoomExample = GMLRoomExample
  
  console.log('🎮 GML Room Examples loaded!')
  console.log('Try these in the console:')
  console.log('  GMLRoomExample.basicNavigation()')
  console.log('  GMLRoomExample.sequentialNavigation()')
  console.log('  GMLRoomExample.indexNavigation()')
  console.log('  GMLRoomExample.errorHandling()')
  console.log('')
  console.log('Or use direct GML functions:')
  console.log('  room_goto("game")')
  console.log('  room_goto("menu")')
  console.log('  room_restart()')
  console.log('  room_get_name()')
}
