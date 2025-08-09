/**
 * GameMaker 'noone' Keyword Demo
 * Shows how to use the 'noone' keyword for null object references
 */

import { GameObjectManager } from '../engine/GameObjectManager'
import { EventManager } from '../engine/EventManager'
import { all, noone, Player, Enemy, PowerUp, Boss } from '../engine/GameObjectTypes'

console.log('=== GameMaker "noone" Keyword Demo ===')

// Initialize the managers (this happens automatically in the engine)
const eventManager = new EventManager()
const gameObjectManager = new GameObjectManager(eventManager)

// Create some objects
console.log('\n--- Creating Objects ---')
gameObjectManager.createObject(Player, 100, 50)
gameObjectManager.createObject(Enemy, 200, 100)
gameObjectManager.createObject(Enemy, 300, 150)

console.log('Created: 1 Player, 2 Enemies')

// Demonstrate 'noone' usage
console.log('\n--- Using "noone" Keyword ---')

// Try to find objects that exist
const firstPlayer = gameObjectManager.instance_find(Player, 0)
const firstEnemy = gameObjectManager.instance_find(Enemy, 0)
const secondEnemy = gameObjectManager.instance_find(Enemy, 1)

console.log(`First Player found: ${firstPlayer !== noone}`)
console.log(`First Enemy found: ${firstEnemy !== noone}`)
console.log(`Second Enemy found: ${secondEnemy !== noone}`)

// Try to find objects that don't exist
const firstBoss = gameObjectManager.instance_find(Boss, 0)
const thirdEnemy = gameObjectManager.instance_find(Enemy, 2)

console.log(`First Boss found: ${firstBoss !== noone}`) // false
console.log(`Third Enemy found: ${thirdEnemy !== noone}`) // false

// GameMaker-style null checking
console.log('\n--- GameMaker-Style Null Checking ---')

if (firstPlayer !== noone) {
  console.log(`Player is at position (${firstPlayer.x}, ${firstPlayer.y})`)
} else {
  console.log('No player found')
}

if (firstBoss === noone) {
  console.log('No boss exists - safe to proceed')
} else {
  console.log('Boss found - danger!')
}

// Find nearest objects
console.log('\n--- Finding Nearest Objects ---')

const nearestToOrigin = gameObjectManager.instance_nearest(0, 0, all)
const nearestEnemyToPlayer = gameObjectManager.instance_nearest(100, 50, Enemy)
const nearestBossToPlayer = gameObjectManager.instance_nearest(100, 50, Boss)

if (nearestToOrigin !== noone) {
  console.log(`Nearest object to origin: ${nearestToOrigin.objectType} at (${nearestToOrigin.x}, ${nearestToOrigin.y})`)
}

if (nearestEnemyToPlayer !== noone) {
  console.log(`Nearest enemy to player: at (${nearestEnemyToPlayer.x}, ${nearestEnemyToPlayer.y})`)
} else {
  console.log('No enemies found near player')
}

if (nearestBossToPlayer === noone) {
  console.log('No boss found near player - player is safe')
}

// Demonstrate GameMaker-style patterns
console.log('\n--- GameMaker-Style Patterns ---')

// This is exactly how you'd write it in GameMaker:
const target = gameObjectManager.instance_find(Enemy, 0)
if (target !== noone) {
  console.log(`Targeting enemy at (${target.x}, ${target.y})`)
  
  // In actual GameMaker GML, this would be:
  // var target = instance_find(obj_Enemy, 0);
  // if (target != noone) {
  //   show_debug_message("Targeting enemy at " + string(target.x) + ", " + string(target.y));
  // }
}

// Common GameMaker pattern: find and destroy
const powerup = gameObjectManager.instance_find(PowerUp, 0)
if (powerup === noone) {
  console.log('No powerups available to collect')
} else {
  console.log('Powerup found but none exist in this demo')
}

// Array iteration with noone checking
console.log('\n--- Safe Object Iteration ---')
for (let i = 0; i < 5; i++) {
  const enemy = gameObjectManager.instance_find(Enemy, i)
  if (enemy === noone) {
    console.log(`Enemy ${i}: does not exist`)
    break
  } else {
    console.log(`Enemy ${i}: exists at (${enemy.x}, ${enemy.y})`)
  }
}

console.log('\n✅ GameMaker "noone" keyword demo complete!')
console.log('• Use "noone" for null object references (just like GameMaker)')
console.log('• Check "obj !== noone" before accessing object properties')
console.log('• Use "obj === noone" to check if object doesn\'t exist')

// Show the actual values for reference
console.log('\n--- Behind the Scenes ---')
console.log(`noone = ${noone}`)
console.log(`typeof noone = ${typeof noone}`)
