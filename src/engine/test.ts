import { GameEngine, createPlayerObject, createEnemyObject } from '../engine'

/**
 * Simple test to verify the engine works correctly
 */
export function testEngine(): void {
  console.log('Testing GameMaker-style engine...')
  
  // Create engine
  const engine = new GameEngine()
  
  // Test object creation
  const player = createPlayerObject(engine, 5, 5)
  console.log('Player created:', player.getPosition())
  
  const enemy = createEnemyObject(engine, 10, 10)
  console.log('Enemy created:', enemy.getPosition())
  
  // Test custom variables
  player.setVariable('testVar', 'Hello Engine!')
  console.log('Player variable:', player.getVariable('testVar'))
  
  // Test object queries
  console.log('All players:', engine.getObjects('Player').length)
  console.log('All enemies:', engine.getObjects('Enemy').length)
  console.log('Total objects:', engine.getObjectManager().getObjectCount())
  
  // Test movement
  player.move(1, 1)
  console.log('Player moved to:', player.getPosition())
  
  // Test global variables
  engine.setGlobalVariable('gameTitle', 'My GameMaker Game')
  console.log('Game title:', engine.getGlobalVariable('gameTitle'))
  
  console.log('Engine test completed successfully!')
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  testEngine()
}
