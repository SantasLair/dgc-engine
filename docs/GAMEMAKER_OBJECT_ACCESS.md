# GameMaker Object Variable Access Patterns

In GameMaker, you can access object variables directly from the object type, not just from instances.

## GameMaker GML Examples

```gml
// Set object variable (affects ALL Player instances)
obj_Player.max_level = 50;
obj_Player.base_speed = 5;

// Read object variable directly from object
var player_max = obj_Player.max_level;  // Returns 50
var undefined_var = obj_Player.some_undefined_var;  // Returns undefined/0

// From within an instance, you can still access object variables
// (Inside a Player instance's Step event)
if (level > obj_Player.max_level) {
    // Do something when instance level exceeds object max_level
}
```

## DGC Engine Equivalent

```typescript
// Set object variables (affects ALL Player instances)
GameObject.setObjectVariable('Player', 'maxLevel', 50)
GameObject.setObjectVariable('Player', 'baseSpeed', 5)

// Read object variable directly from object type
const playerMax = GameObject.getObjectVariable('Player', 'maxLevel')  // 50
const undefinedVar = GameObject.getObjectVariable('Player', 'someUndefinedVar')  // undefined

// Check if object variable exists
const hasMaxLevel = GameObject.hasObjectVariable('Player', 'maxLevel')  // true
const hasUndefined = GameObject.hasObjectVariable('Player', 'someUndefinedVar')  // false

// From within an instance, you can access both ways
const player = new GameObject('Player')
player.setVariable('level', 25)

// Access object variable from instance (GameMaker style)
const maxLevelFromInstance = player.getObjectVariable('maxLevel')  // 50

// Or use the fallback behavior (instance first, then object)
const maxLevelFallback = player.getVariable('maxLevel')  // 50 (falls back to object)

// Instance variable overrides object variable
player.setVariable('maxLevel', 100)  // Instance-specific override
const instanceMax = player.getVariable('maxLevel')  // 100 (instance override)
const objectMax = player.getObjectVariable('maxLevel')  // 50 (still the object value)
```

## Key Differences from GameMaker

### GameMaker Syntax:
```gml
obj_Player.max_level = 50;        // Set object variable
var value = obj_Player.max_level; // Get object variable
```

### DGC Engine Syntax:
```typescript
GameObject.setObjectVariable('Player', 'maxLevel', 50)      // Set object variable
const value = GameObject.getObjectVariable('Player', 'maxLevel')  // Get object variable
```

The behavior is the same, but our syntax is more explicit about the object type since TypeScript doesn't have GameMaker's object naming conventions.
