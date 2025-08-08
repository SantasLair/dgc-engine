/**
 * Example demonstrating GameMaker-style instance vs object variables
 */

import { GameObject } from '../engine/GameObject'

// Create some Player instances
const player1 = new GameObject('Player')
const player2 = new GameObject('Player')
const player3 = new GameObject('Player')

console.log('=== GameMaker-Style Variable System Demo ===')

// Set instance variables (unique to each instance)
player1.setVariable('name', 'Alice')
player1.setVariable('health', 100)

player2.setVariable('name', 'Bob')
player2.setVariable('health', 80)

player3.setVariable('name', 'Charlie')
player3.setVariable('health', 95)

console.log('\n--- Instance Variables (unique to each instance) ---')
console.log('Player1 name:', player1.getVariable('name')) // Alice
console.log('Player2 name:', player2.getVariable('name')) // Bob
console.log('Player3 name:', player3.getVariable('name')) // Charlie

// Set object variables (shared across ALL Player instances)
console.log('\n--- Setting Object Variables (affects ALL Player instances) ---')
GameObject.setObjectVariable('Player', 'maxLevel', 50)
GameObject.setObjectVariable('Player', 'gameVersion', '1.2.3')

// OR set from an instance (same effect)
player1.setObjectVariable('baseSpeed', 5)

console.log('\n--- Object Variables (shared across all instances) ---')
console.log('Player1 maxLevel:', player1.getVariable('maxLevel')) // 50
console.log('Player2 maxLevel:', player2.getVariable('maxLevel')) // 50 
console.log('Player3 maxLevel:', player3.getVariable('maxLevel')) // 50

console.log('Player1 baseSpeed:', player1.getVariable('baseSpeed')) // 5
console.log('Player2 baseSpeed:', player2.getVariable('baseSpeed')) // 5
console.log('Player3 baseSpeed:', player3.getVariable('baseSpeed')) // 5

// Change object variable - affects ALL instances
console.log('\n--- Changing Object Variable (affects ALL instances) ---')
GameObject.setObjectVariable('Player', 'maxLevel', 60)

console.log('Player1 maxLevel after change:', player1.getVariable('maxLevel')) // 60
console.log('Player2 maxLevel after change:', player2.getVariable('maxLevel')) // 60
console.log('Player3 maxLevel after change:', player3.getVariable('maxLevel')) // 60

// Instance variables override object variables when they have the same name
console.log('\n--- Instance Variables Override Object Variables ---')
GameObject.setObjectVariable('Player', 'speed', 5) // Object variable
player1.setVariable('speed', 10) // Instance variable with same name

console.log('Player1 speed (has instance override):', player1.getVariable('speed')) // 10
console.log('Player2 speed (uses object variable):', player2.getVariable('speed')) // 5
console.log('Player3 speed (uses object variable):', player3.getVariable('speed')) // 5

// Create different object type to show isolation
const enemy1 = new GameObject('Enemy')
console.log('\n--- Different Object Types Have Separate Variables ---')
console.log('Enemy1 maxLevel (should be undefined):', enemy1.getVariable('maxLevel')) // undefined

GameObject.setObjectVariable('Enemy', 'maxLevel', 25)
console.log('Enemy1 maxLevel after setting Enemy object variable:', enemy1.getVariable('maxLevel')) // 25
console.log('Player1 maxLevel (unchanged):', player1.getVariable('maxLevel')) // 60

export { }
