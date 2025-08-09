/**
 * GameMaker Unquoted Object Types Demo
 * Shows how to use both 'all' and custom object types without quotes
 */

import { GameObjectManager } from '../engine/GameObjectManager'
import { EventManager } from '../engine/EventManager'
import { all, Player, Enemy, PowerUp, Boss } from '../engine/GameObjectTypes'

console.log('=== GameMaker Unquoted Object Types Demo ===')

// Initialize the managers (this happens automatically in the engine)
const eventManager = new EventManager()
const gameObjectManager = new GameObjectManager(eventManager)

// Create various objects using unquoted types
console.log('\n--- Creating Objects (Unquoted Types) ---')
gameObjectManager.createObject(Player, 100, 50)
gameObjectManager.createObject(Enemy, 200, 100)
gameObjectManager.createObject(Enemy, 300, 150)
gameObjectManager.createObject(PowerUp, 150, 75)
gameObjectManager.createObject(PowerUp, 250, 125)

console.log('Created: 1 Player, 2 Enemies, 2 PowerUps')

// Use authentic GameMaker syntax with unquoted object types
console.log('\n--- Authentic GameMaker Syntax (No Quotes!) ---')

// Count all objects (unquoted 'all')
const totalObjects = gameObjectManager.instance_number(all)
console.log(`Total objects: ${totalObjects}`) // Should be 5

// Count specific types (unquoted object types!)
const enemyCount = gameObjectManager.instance_number(Enemy)
const powerupCount = gameObjectManager.instance_number(PowerUp)
const playerCount = gameObjectManager.instance_number(Player)
console.log(`Players: ${playerCount}, Enemies: ${enemyCount}, PowerUps: ${powerupCount}`)

// Check if objects exist (all unquoted)
console.log(`All objects exist: ${gameObjectManager.instance_exists(all)}`) // true
console.log(`Enemies exist: ${gameObjectManager.instance_exists(Enemy)}`) // true
console.log(`Bosses exist: ${gameObjectManager.instance_exists(Boss)}`) // false

// Get objects near position (unquoted types)
console.log('\n--- Finding Objects Near Position (200, 100) ---')
const nearbyAll = gameObjectManager.getObjectsNear(200, 100, 50, all)
const nearbyEnemies = gameObjectManager.getObjectsNear(200, 100, 50, Enemy)
const nearbyPowerUps = gameObjectManager.getObjectsNear(200, 100, 50, PowerUp)
console.log(`Near (200,100): ${nearbyAll.length} total, ${nearbyEnemies.length} enemies, ${nearbyPowerUps.length} powerups`)

// Get nearest object (unquoted types)
const nearestAny = gameObjectManager.getNearestObject(200, 100, all)
const nearestEnemy = gameObjectManager.getNearestObject(200, 100, Enemy)
console.log(`Nearest object: ${nearestAny?.objectType} at (${nearestAny?.x}, ${nearestAny?.y})`)
console.log(`Nearest enemy: ${nearestEnemy?.objectType} at (${nearestEnemy?.x}, ${nearestEnemy?.y})`)

// Demonstrate GameMaker-style patterns (no quotes anywhere!)
console.log('\n--- GameMaker-Style Patterns (No Quotes!) ---')

// This looks exactly like GameMaker now:
if (gameObjectManager.instance_exists(Enemy)) {
  console.log(`There are ${gameObjectManager.instance_number(Enemy)} enemies in the game`)
  
  // In actual GameMaker GML, this would be:
  // if (instance_exists(obj_Enemy)) {
  //   show_debug_message("There are " + string(instance_number(obj_Enemy)) + " enemies");
  // }
}

// Mass destruction (authentic GameMaker style, no quotes!)
console.log('\n--- Mass Destruction (No Quotes!) ---')
console.log(`Objects before destroying PowerUps: ${gameObjectManager.instance_number(all)}`)

// Destroy all PowerUps (unquoted!)
gameObjectManager.instance_destroy(PowerUp)
console.log(`Objects after destroying PowerUps: ${gameObjectManager.instance_number(all)}`)
console.log(`PowerUps remaining: ${gameObjectManager.instance_number(PowerUp)}`)

// More GameMaker-style operations
console.log('\n--- More GameMaker Operations ---')
console.log(`Players still alive: ${gameObjectManager.instance_exists(Player)}`)
console.log(`Enemy count: ${gameObjectManager.instance_number(Enemy)}`)

// This would destroy everything (commented out for safety)
// gameObjectManager.instance_destroy(all)  // ← Pure GameMaker syntax!

console.log('\n✅ Unquoted object types demo complete!')
console.log('• Use unquoted "all" for the special keyword')
console.log('• Use unquoted constants for custom object types (Player, Enemy, etc.)')
console.log('• No quotes needed anywhere - just like GameMaker!')

// Show the actual values for reference
console.log('\n--- Behind the Scenes ---')
console.log(`all = ${all}`)
console.log(`Player = ${Player}`)
console.log(`Enemy = ${Enemy}`)
console.log(`PowerUp = ${PowerUp}`)
