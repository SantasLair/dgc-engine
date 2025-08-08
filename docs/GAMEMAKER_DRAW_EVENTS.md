# Drawing and Rendering

Learn how to create custom graphics and visual effects in your game, using GameMaker-style draw events.

## What Are Draw Events?

Draw events let you create custom graphics that appear on screen each frame. Unlike sprites (which are images), draw events let you:
- Draw shapes, lines, and text dynamically
- Create health bars, UI elements, and special effects  
- Build complex visuals that change based on game state
- Combine multiple graphics elements into one object

## How Drawing Works

### Step Events: Update Your Data
First, use Step events to calculate what you want to draw (but don't draw anything yet):

```typescript
// Step event - calculate values (NO DRAWING HERE!)
drawDemoObject.addEventScript(GameEvent.STEP, (self) => {
  frameCount++
  self.x = 200 + Math.cos(frameCount * 0.02) * 80  // Calculate new position
  self.y = 250 + Math.sin(frameCount * 0.02) * 50  // Calculate new position
  direction = frameCount * 2                       // Calculate rotation
  health = 0.5 + Math.sin(frameCount * 0.05) * 0.5 // Calculate health
  // This is just math - no graphics yet!
})
```

### Draw Events: Create the Graphics
Then, use Draw events to actually put graphics on screen:

```typescript
// Draw event - create the actual graphics
drawDemoObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Now we draw everything we calculated:
  draw.drawRectangle(self.x - 10, self.y - 10, self.x + 10, self.y + 10, true, 0xFFFFFF)
  draw.drawHealthbar(self.x - 25, self.y - 30, self.x + 25, self.y - 24, health)
  draw.drawArrow(self.x, self.y, lineEndX, lineEndY, 8, 0x00FFFF)
  draw.drawText(self.x - 30, self.y + 25, `Health: ${(health * 100).toFixed(0)}%`, 0xFFFFFF)
  draw.drawCircle(self.x, self.y, radius, false, color)
})
```

## Available Drawing Commands

The DGC Engine provides all the drawing functions you know from GameMaker:

### Basic Shapes
```typescript
const draw = game.getEngine().getDrawingSystem()

// Draw filled rectangle
draw.drawRectangle(x1, y1, x2, y2, true, 0xFF0000)  // Red filled rectangle

// Draw rectangle outline  
draw.drawRectangle(x1, y1, x2, y2, false, 0x00FF00) // Green outline

// Draw filled circle
draw.drawCircle(x, y, 50, true, 0x0000FF)  // Blue filled circle

// Draw circle outline
draw.drawCircle(x, y, 50, false, 0xFFFF00) // Yellow outline

// Draw line
draw.drawLine(x1, y1, x2, y2, 0xFF00FF, 3) // Purple line, 3 pixels thick
```

### Sprites and Images
```typescript
// Draw a sprite at position with rotation and scaling
draw.drawSprite(x, y, 1, 1, rotation, 0xFFFFFF, 1.0)
```

### Text
```typescript
// Draw text at position
draw.drawText(x, y, "Hello World!", 0xFFFFFF, 16, "Arial")
```

### Special Graphics
```typescript
// Draw a health bar
draw.drawHealthbar(x1, y1, x2, y2, healthPercent, 0x808080, 0xFF0000, 0x00FF00)

// Draw an arrow pointing from one position to another
draw.drawArrow(startX, startY, endX, endY, 8, 0x00FFFF)
```

## 💡 Practical Examples

### Simple Health Bar
```typescript
gameObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Get health percentage (0.0 to 1.0)
  const healthPercent = self.getVariable('health') / self.getVariable('maxHealth')
  
  // Draw health bar above the object
  draw.drawHealthbar(
    self.x - 25, self.y - 35,  // Top-left corner
    self.x + 25, self.y - 30,  // Bottom-right corner  
    healthPercent              // How full the bar is
  )
})
```

### Moving Circle with Trail
```typescript
gameObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Draw the main object as a circle
  draw.drawCircle(self.x, self.y, 20, true, 0xFF0000)
  
  // Draw direction indicator
  const endX = self.x + Math.cos(self.getVariable('direction')) * 30
  const endY = self.y + Math.sin(self.getVariable('direction')) * 30
  draw.drawArrow(self.x, self.y, endX, endY, 5, 0xFFFFFF)
})
```

### Custom UI Elements
```typescript
uiObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Draw a custom button
  draw.drawRectangle(100, 100, 200, 140, true, 0x4444FF)   // Button background
  draw.drawRectangle(100, 100, 200, 140, false, 0xFFFFFF)  // Button border
  draw.drawText(125, 115, "Click Me!", 0xFFFFFF, 16)       // Button text
})
```

## How Each Frame Works

The DGC Engine handles drawing just like GameMaker Studio:

1. **Clear Screen** - Previous frame's drawings are erased automatically
2. **Step Events Run** - All objects update their game logic (calculate positions, health, etc.)
3. **Draw Events Run** - All objects draw their graphics based on current values  
4. **Display Frame** - Everything gets shown on screen

This happens 60 times per second, creating smooth animation!

## ⚠️ Important Guidelines

### ✅ Do This: Immediate Drawing Commands
```typescript
// CORRECT - Draw fresh graphics each frame
drawDemoObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  draw.drawSprite(self.x, self.y, 1, 1, direction, color)     // Fresh each frame
  draw.drawHealthbar(self.x - 25, self.y - 30, 50, 6, health) // Fresh each frame
  draw.drawText(self.x, self.y + 20, "Hello World", 0xFFFFFF) // Fresh each frame
})
```

### ❌ Don't Do This: Modifying Persistent Objects
```typescript
// WRONG - Don't modify sprite properties directly
drawDemoObject.addEventScript(GameEvent.DRAW, (self) => {
  pixiSprite.x = self.x           // Don't do this!
  pixiSprite.rotation = direction // Don't do this!
  pixiSprite.tint = color        // Don't do this!
})
```

## 🎮 Why This Approach is Better

- **Just Like GameMaker**: Works exactly how you expect from GameMaker Studio
- **Automatic Cleanup**: No leftover graphics from previous frames
- **Better Performance**: Modern web graphics acceleration  
- **More Flexible**: Can layer multiple graphics effects easily
- **Familiar Functions**: All the GameMaker drawing functions you know

## 🚀 Try It Yourself!

Create a simple draw event to see it in action:

```typescript
myObject.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Draw a simple animated circle
  const time = Date.now() * 0.001
  const color = 0xFF0000 + Math.sin(time) * 0x00FF00
  draw.drawCircle(self.x, self.y, 30, true, color)
  
  // Add some text
  draw.drawText(self.x - 20, self.y + 40, "I'm animated!", 0xFFFFFF)
})
```

This will create a color-changing circle with text that updates every frame - just like magic! ✨
