# GameMaker-Style Variable System

The DGC Engine now implements GameMaker's distinction between **instance variables** and **object variables**.

## Instance Variables vs Object Variables

### Instance Variables
- **Unique to each instance** of an object
- Set with: `instance.setVariable(name, value)`
- Get with: `instance.getVariable(name)`

### Object Variables  
- **Shared across ALL instances** of the same object type
- Set with: `GameObject.setObjectVariable(objectType, name, value)` or `instance.setObjectVariable(name, value)`
- Get with: `instance.getVariable(name)` (falls back to object variable if instance variable doesn't exist)

## Usage Examples

```typescript
// Create instances
const player1 = new GameObject('Player')
const player2 = new GameObject('Player')

// Instance variables (unique to each)
player1.setVariable('name', 'Alice')
player1.setVariable('health', 100)
player2.setVariable('name', 'Bob') 
player2.setVariable('health', 80)

console.log(player1.getVariable('name')) // "Alice"
console.log(player2.getVariable('name')) // "Bob"

// Object variables (shared across all Players)
GameObject.setObjectVariable('Player', 'maxLevel', 50)
// OR: player1.setObjectVariable('maxLevel', 50)

console.log(player1.getVariable('maxLevel')) // 50
console.log(player2.getVariable('maxLevel')) // 50 (same value!)

// Changing object variable affects ALL instances
GameObject.setObjectVariable('Player', 'maxLevel', 60)
console.log(player1.getVariable('maxLevel')) // 60
console.log(player2.getVariable('maxLevel')) // 60
```

## Variable Lookup Order

When using `getVariable(name)`:

1. **Check instance variables first** - if found, return that value
2. **Fall back to object variables** - if not found in instance, check object variables
3. **Return undefined** - if not found in either

This matches GameMaker's behavior exactly!

## Instance Variables Override Object Variables

```typescript
// Set object variable
GameObject.setObjectVariable('Player', 'speed', 5)

// Override with instance variable
player1.setVariable('speed', 10)

console.log(player1.getVariable('speed')) // 10 (instance override)
console.log(player2.getVariable('speed')) // 5  (object variable)
```

## Different Object Types Are Isolated

```typescript
GameObject.setObjectVariable('Player', 'maxLevel', 50)
GameObject.setObjectVariable('Enemy', 'maxLevel', 25)

const player = new GameObject('Player')
const enemy = new GameObject('Enemy')

console.log(player.getVariable('maxLevel')) // 50
console.log(enemy.getVariable('maxLevel'))  // 25
```

This system provides the exact same behavior as GameMaker Studio, making the engine feel completely familiar to GameMaker developers!
