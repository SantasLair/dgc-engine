# Object Variables

Learn how to create shared variables that affect all objects of the same type, just like in GameMaker Studio.

## What Are Object Variables?

Object variables are shared settings that apply to **all** objects of the same type. Think of them as "rules" or "settings" for an entire object type.

**Examples of when to use object variables:**
- Maximum health that applies to all players
- Movement speed limit for all enemies  
- Damage amount for all bullets
- Game rules that affect all objects of a type

## How Object Variables Work

### Setting Object Variables
Create a shared value that ALL objects of that type will use:

```typescript
// All Player objects will share these values
GameObject.setObjectVariable('Player', 'maxLevel', 50)
GameObject.setObjectVariable('Player', 'baseSpeed', 5)

// All Enemy objects will share these values  
GameObject.setObjectVariable('Enemy', 'attackDamage', 25)
GameObject.setObjectVariable('Enemy', 'detectionRange', 100)
```

### Reading Object Variables
Any object can check the shared values for its type:

```typescript
// Get shared values (works from anywhere in your code)
const playerMax = GameObject.getObjectVariable('Player', 'maxLevel')  // 50
const enemyDamage = GameObject.getObjectVariable('Enemy', 'attackDamage')  // 25
```

### From Inside an Object
Objects can access their own type's shared variables:

```typescript
// Inside a Player object's code
const player = new GameObject('Player')
player.setVariable('level', 25)

// Check against the shared maximum level
const maxLevel = player.getObjectVariable('maxLevel')  // 50
if (player.getVariable('level') > maxLevel) {
    // Player exceeded the shared maximum!
}
```
## Personal Variables Override Object Variables

If an object has both a personal variable and an object variable with the same name, the personal one is used:

```typescript
// Set shared value for all Players
GameObject.setObjectVariable('Player', 'maxLevel', 50)

// Give one specific player a different max level
player.setVariable('maxLevel', 100)  // Personal override

// Now that player uses their personal value
const personalMax = player.getVariable('maxLevel')  // 100 (personal)
const objectMax = player.getObjectVariable('maxLevel')  // 50 (shared)
```

## 💡 Practical Examples

### Game Balance Settings
```typescript
// Set damage values for all weapon types
GameObject.setObjectVariable('Sword', 'baseDamage', 10)
GameObject.setObjectVariable('Bow', 'baseDamage', 8)
GameObject.setObjectVariable('Magic', 'baseDamage', 15)

// Easy to rebalance the entire game
GameObject.setObjectVariable('Sword', 'baseDamage', 12)  // Buff all swords
```

### Enemy AI Settings
```typescript
// All zombies share the same behavior rules
GameObject.setObjectVariable('Zombie', 'detectionRange', 100)
GameObject.setObjectVariable('Zombie', 'moveSpeed', 2)
GameObject.setObjectVariable('Zombie', 'attackDamage', 20)

// Individual zombies can have different health
zombie1.setVariable('health', 50)
zombie2.setVariable('health', 75)
```

### Player Progression System
```typescript
// Shared level progression rules
GameObject.setObjectVariable('Player', 'maxLevel', 100)
GameObject.setObjectVariable('Player', 'xpPerLevel', 1000)

// Each player tracks their own progress
player.setVariable('currentLevel', 5)
player.setVariable('currentXP', 250)

// Check if player can level up
const currentXP = player.getVariable('currentXP')
const xpNeeded = player.getObjectVariable('xpPerLevel')
if (currentXP >= xpNeeded) {
    // Level up!
}
```

## Different Object Types Are Separate

Each object type has its own set of object variables:

```typescript
GameObject.setObjectVariable('Player', 'maxHealth', 100)
GameObject.setObjectVariable('Enemy', 'maxHealth', 50)

// These don't affect each other
const playerHealth = GameObject.getObjectVariable('Player', 'maxHealth')  // 100
const enemyHealth = GameObject.getObjectVariable('Enemy', 'maxHealth')    // 50
```

This works exactly like GameMaker Studio's object variable system!

The behavior is the same, but our syntax is more explicit about the object type since TypeScript doesn't have GameMaker's object naming conventions.
