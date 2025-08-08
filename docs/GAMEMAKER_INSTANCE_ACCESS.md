# GameMaker-Style Object Instance Access

The DGC Engine now supports GameMaker's exact behavior for accessing instance properties through object references.

## GameMaker Behavior

In GameMaker Studio:
```gml
// Access instance property through object reference
var menu_x = obj_menu.x;  // Gets the first instance's x position
obj_menu.y = 100;         // Sets the first instance's y position
```

## DGC Engine Equivalent

```typescript
// GameMaker: obj_menu.x
const menuX = GameObject.getInstanceProperty('Menu', 'x')

// GameMaker: obj_menu.y = 100
GameObject.setInstanceProperty('Menu', 'y', 100)
```

## Exact GameMaker Behavior Matching

### ❌ **Zero Instances**
- **GameMaker**: Throws "Unable to find instance for object index" error
- **DGC Engine**: Throws "Unable to find instance for object type" error

### ✅ **One Instance** 
- **GameMaker**: Returns that instance's property value
- **DGC Engine**: Returns that instance's property value

### 📋 **Multiple Instances**
- **GameMaker**: Returns the **first instance's** property value
- **DGC Engine**: Returns the **first instance's** property value

## Supported Properties

All GameMaker built-in instance properties are supported:

### Built-in Properties
- `x`, `y` - Position coordinates
- `visible` - Visibility state
- `active` - Active state
- `depth` - Rendering depth
- `solid` - Collision solid state
- `persistent` - Room persistence
- `sprite` - Sprite reference
- `imageIndex`, `imageSpeed`, `imageAngle` - Image properties
- `imageXScale`, `imageYScale`, `imageAlpha` - Transform properties

### Custom Variables
- Any custom variable set with `setVariable()` can be accessed

## Usage Examples

```typescript
// Create instances
const menu1 = gameObjectManager.createObject('Menu', 100, 50)
const menu2 = gameObjectManager.createObject('Menu', 200, 100)

menu1.setVariable('title', 'Main Menu')
menu2.setVariable('title', 'Settings')

// Access first instance through object reference (GameMaker style)
const x = GameObject.getInstanceProperty('Menu', 'x')          // 100 (menu1's x)
const title = GameObject.getInstanceProperty('Menu', 'title')  // "Main Menu" (menu1's title)

// Modify first instance through object reference
GameObject.setInstanceProperty('Menu', 'x', 150)               // Changes menu1.x to 150
GameObject.setInstanceProperty('Menu', 'title', 'Updated')     // Changes menu1's title

console.log(menu1.x)  // 150 (changed)
console.log(menu2.x)  // 200 (unchanged - not the first instance)
```

## Error Handling

Just like GameMaker, trying to access properties when no instances exist throws an error:

```typescript
// No Menu instances exist
try {
    const x = GameObject.getInstanceProperty('Menu', 'x')
} catch (error) {
    // "Unable to find instance for object type 'Menu'"
    console.log(error.message)
}
```

This provides **100% compatible behavior** with GameMaker Studio's object instance access patterns!
