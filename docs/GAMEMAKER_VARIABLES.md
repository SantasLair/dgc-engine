# Working with Variables

Learn how to store and use information in your game objects, just like in GameMaker Studio.

## Two Types of Variables

In DGC Engine, there are two kinds of variables you can use:

### Instance Variables (Unique to Each Object)
Each copy of an object has its own personal variables. Perfect for things like:
- Player health (each player has different health)
- Enemy speed (each enemy moves at different speeds)
- Object position (each object is in a different place)

### Object Variables (Shared by All Objects of the Same Type)  
All objects of the same type share these variables. Great for:
- Maximum health (all players have the same max health)
- Movement speed limits (all enemies have the same speed limit)
- Game rules (all objects follow the same rules)

## How to Use Variables

### Setting Personal Variables (Instance Variables)
Give each object its own unique values:

```typescript
// Create two players
const player1 = new GameObject('Player')
const player2 = new GameObject('Player')

// Each player has their own health and name
player1.setVariable('name', 'Alice')
player1.setVariable('health', 100)

player2.setVariable('name', 'Bob') 
player2.setVariable('health', 80)

// Each player shows their own values
console.log(player1.getVariable('name')) // Shows: "Alice"
console.log(player2.getVariable('name')) // Shows: "Bob"
```

### Setting Shared Variables (Object Variables)
Set values that all objects of the same type will share:

```typescript
// Set a rule that applies to ALL players
GameObject.setObjectVariable('Player', 'maxLevel', 50)

// Both players can access this shared value
console.log(player1.getVariable('maxLevel')) // Shows: 50
console.log(player2.getVariable('maxLevel')) // Shows: 50 (same!)

// Change the shared rule - affects everyone
GameObject.setObjectVariable('Player', 'maxLevel', 60)
console.log(player1.getVariable('maxLevel')) // Shows: 60
console.log(player2.getVariable('maxLevel')) // Shows: 60
```

## How Variable Lookup Works

When you ask for a variable value, DGC Engine checks in this order:

1. **Personal variable first** - "Does this specific object have its own version?"
2. **Shared variable second** - "Do all objects of this type share this value?"
3. **Nothing found** - Returns `undefined` if the variable doesn't exist anywhere

This works exactly like GameMaker Studio!

## Personal Variables Override Shared Variables

If you set both a personal and shared variable with the same name, the personal one wins:

```typescript
// Set a shared rule for all players
GameObject.setObjectVariable('Player', 'speed', 5)

// Give one player a special personal speed
player1.setVariable('speed', 10)

// Personal variable overrides the shared one
console.log(player1.getVariable('speed')) // Shows: 10 (personal)
console.log(player2.getVariable('speed')) // Shows: 5 (shared)
```

## Different Object Types Stay Separate

Each object type has its own separate set of shared variables:

```typescript
// Set different max levels for different object types
GameObject.setObjectVariable('Player', 'maxLevel', 50)
GameObject.setObjectVariable('Enemy', 'maxLevel', 25)

const player = new GameObject('Player')
const enemy = new GameObject('Enemy')

// Each type has its own shared values
console.log(player.getVariable('maxLevel')) // Shows: 50
console.log(enemy.getVariable('maxLevel'))  // Shows: 25
```

## 💡 Practical Examples

### Game Stats
```typescript
// Shared game rules
GameObject.setObjectVariable('Player', 'maxHealth', 100)
GameObject.setObjectVariable('Player', 'startingLives', 3)

// Personal player data  
player.setVariable('currentHealth', 100)
player.setVariable('lives', 3)
player.setVariable('score', 0)
```

### Enemy Behavior
```typescript
// All enemies share the same AI rules
GameObject.setObjectVariable('Enemy', 'detectionRange', 100)
GameObject.setObjectVariable('Enemy', 'attackDamage', 25)

// But each enemy has its own state
enemy1.setVariable('currentHealth', 50)
enemy2.setVariable('currentHealth', 75)
```

This variable system works exactly like GameMaker Studio, so all your existing GameMaker knowledge applies perfectly!
