/**
 * GameMaker-Style Object Property Access Demo
 * Shows how to access instance properties through object references, just like GameMaker
 */

import { GameObject } from '../engine/GameObject'
import { GameObjectManager } from '../engine/GameObjectManager'
import { EventManager } from '../engine/EventManager'

console.log('=== GameMaker-Style Object Property Access Demo ===')

// Initialize the managers (this happens automatically in the engine)
const eventManager = new EventManager()
const gameObjectManager = new GameObjectManager(eventManager)

try {
  console.log('\n--- Test 1: Zero instances (should throw error) ---')
  const menuX = GameObject.getInstanceProperty('Menu', 'x')
  console.log('Menu x:', menuX)
} catch (error: any) {
  console.log('✅ Error (as expected):', error.message)
}

console.log('\n--- Test 2: One instance ---')
const menu1 = gameObjectManager.createObject('Menu', 100, 50)
menu1.setVariable('title', 'Main Menu')

try {
  // GameMaker equivalent: obj_Menu.x
  const menuX = GameObject.getInstanceProperty('Menu', 'x')
  const menuY = GameObject.getInstanceProperty('Menu', 'y')
  const menuTitle = GameObject.getInstanceProperty('Menu', 'title')
  
  console.log('Menu x:', menuX)  // 100
  console.log('Menu y:', menuY)  // 50
  console.log('Menu title:', menuTitle)  // "Main Menu"
} catch (error: any) {
  console.log('Error:', error.message)
}

console.log('\n--- Test 3: Multiple instances (returns first instance) ---')
const menu2 = gameObjectManager.createObject('Menu', 200, 150)
menu2.setVariable('title', 'Settings Menu')

try {
  // GameMaker equivalent: obj_Menu.x (with multiple instances)
  const menuX = GameObject.getInstanceProperty('Menu', 'x')
  const menuY = GameObject.getInstanceProperty('Menu', 'y')
  const menuTitle = GameObject.getInstanceProperty('Menu', 'title')
  
  console.log('Menu x (first instance):', menuX)  // 100 (not 200!)
  console.log('Menu y (first instance):', menuY)  // 50 (not 150!)
  console.log('Menu title (first instance):', menuTitle)  // "Main Menu" (not "Settings Menu!")
} catch (error: any) {
  console.log('Error:', error.message)
}

console.log('\n--- Test 4: Setting properties through object reference ---')
try {
  // GameMaker equivalent: obj_Menu.x = 300
  GameObject.setInstanceProperty('Menu', 'x', 300)
  GameObject.setInstanceProperty('Menu', 'title', 'Updated Main Menu')
  
  const menuX = GameObject.getInstanceProperty('Menu', 'x')
  const menuTitle = GameObject.getInstanceProperty('Menu', 'title')
  
  console.log('Updated menu x:', menuX)  // 300
  console.log('Updated menu title:', menuTitle)  // "Updated Main Menu"
  
  // Verify the actual instance was updated
  console.log('Actual menu1.x:', menu1.x)  // 300
  console.log('Actual menu1 title:', menu1.getVariable('title'))  // "Updated Main Menu"
} catch (error: any) {
  console.log('Error:', error.message)
}

console.log('\n--- Test 5: Different object types are isolated ---')
gameObjectManager.createObject('Player', 10, 20)

try {
  const playerX = GameObject.getInstanceProperty('Player', 'x')
  const menuX = GameObject.getInstanceProperty('Menu', 'x')
  
  console.log('Player x:', playerX)  // 10
  console.log('Menu x:', menuX)     // 300 (unchanged)
} catch (error: any) {
  console.log('Error:', error.message)
}

export { }
