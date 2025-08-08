# Accessing Object Instances

Learn how to find and modify specific objects in your game, using the same syntax as GameMaker Studio.

## What This Lets You Do

Sometimes you need to check or change properties of objects from other parts of your game. For example:
- Check where the player is from an enemy's code
- Move all enemies when the player does something special  
- Get the health of the boss enemy from the UI

DGC Engine lets you do this exactly like GameMaker Studio.

## Basic Usage

### Get an Object's Property
Find out information about any object in your game:

```typescript
// GameMaker style: obj_menu.x
const menuX = GameObject.getInstanceProperty('Menu', 'x')
const playerHealth = GameObject.getInstanceProperty('Player', 'health')
const bossPosition = GameObject.getInstanceProperty('Boss', 'y')
```

### Change an Object's Property  
Modify any object from anywhere in your code:

```typescript
// GameMaker style: obj_menu.y = 100
GameObject.setInstanceProperty('Menu', 'y', 100)
GameObject.setInstanceProperty('Player', 'health', 50)
GameObject.setInstanceProperty('Enemy', 'speed', 0) // Stop all enemies
```

## How It Works with Multiple Objects

### One Object = Simple
If there's only one Player object, you get that player's health:
```typescript
const health = GameObject.getInstanceProperty('Player', 'health') // Gets THE player's health
```

### Multiple Objects = Gets the First One
If there are multiple Enemy objects, you get the first enemy's position:
```typescript
const enemyX = GameObject.getInstanceProperty('Enemy', 'x') // Gets the FIRST enemy's x
```

This matches GameMaker's behavior exactly!

## What Properties You Can Access

### Built-in Object Properties
These are the basic properties every object has:
- **Position**: `x`, `y` - Where the object is located
- **Visibility**: `visible` - Whether you can see the object  
- **Activity**: `active` - Whether the object is doing anything
- **Rendering**: `depth` - Which objects appear in front/behind
- **Collision**: `solid` - Whether other objects can move through this one
- **Persistence**: `persistent` - Whether object survives room changes
- **Sprite Info**: `sprite`, `imageIndex`, `imageSpeed`, `imageAngle` - How it looks
- **Scaling**: `imageXScale`, `imageYScale`, `imageAlpha` - Size and transparency

### Your Custom Variables
Any variables you created with `setVariable()` can also be accessed this way!

## 💡 Practical Examples

### Checking Player Status from Enemy Code
```typescript
// Enemy wants to know where the player is
const playerX = GameObject.getInstanceProperty('Player', 'x')
const playerY = GameObject.getInstanceProperty('Player', 'y')
const playerHealth = GameObject.getInstanceProperty('Player', 'health')

// Now enemy can react to player's condition
if (playerHealth < 25) {
    // Player is weak - attack more aggressively!
}
```

### UI Reading Game State
```typescript
// Health bar needs to show current player health
const currentHealth = GameObject.getInstanceProperty('Player', 'health')
const maxHealth = GameObject.getInstanceProperty('Player', 'maxHealth')

// Update health bar display
updateHealthBar(currentHealth, maxHealth)
```

### Boss Fight Controller
```typescript
// Check if boss still exists
try {
    const bossHealth = GameObject.getInstanceProperty('Boss', 'health')
    if (bossHealth <= 0) {
        // Boss defeated - start victory sequence!
        room_goto('victory')
    }
} catch (error) {
    // No boss exists - maybe already defeated
    console.log('Boss not found')
}
```

## ⚠️ Important Notes

### No Objects = Error (Just Like GameMaker!)
If you try to access an object that doesn't exist, you'll get an error:

```typescript
// If no Menu objects exist in the room
try {
    const x = GameObject.getInstanceProperty('Menu', 'x')
} catch (error) {
    console.log('No Menu found!') // "Unable to find instance for object type 'Menu'"
}
```

### Multiple Objects = First One Wins
This is exactly how GameMaker works - if you have 5 enemies, you'll always get the first enemy's properties.

This system gives you **100% GameMaker-compatible** object access!
