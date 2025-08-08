## Basic Sprite System Usage

Here's how to use the new GameMaker-style sprite system:

### 1. **Create a Room with Sprites**

```typescript
import { Room, SpriteLoadConfig } from './engine'

const playerSprite: SpriteLoadConfig = {
  name: 'player_sprite',
  source: '/sprites/player.png',
  frames: 4,
  frameWidth: 32,
  frameHeight: 32,
  animationSpeed: 12,
  origin: { x: 0.5, y: 0.5 }
}

const gameRoom = new Room({
  name: 'game_room',
  width: 20,
  height: 15,
  background: '#1a1a1a',
  sprites: [playerSprite], // Room loads these sprites automatically
  onCreate: async (roomObj) => {
    console.log('Room created with sprites loaded!')
  }
})
```

### 2. **Create GameObjects with Sprites**

```typescript
import { GameObject, GameEvent } from './engine'

// Get the loaded sprite from the room
const playerSpr = gameRoom.getSprite('player_sprite')

// Create a game object with the sprite
const player = new GameObject('player', {
  x: 100,
  y: 100,
  sprite: playerSpr // Reference to the loaded sprite
})

// Add draw event - MANUALLY call draw_self() when you want to render
player.addEventScript(GameEvent.DRAW, (self) => {
  // GameMaker-style: draw_self() renders the object's sprite
  self.drawSelf()
  
  // You can also do custom drawing before/after
  const draw = game.getEngine().getDrawingSystem()
  draw.drawText(self.x, self.y - 20, 'Player', 0xFFFFFF)
})

// Add animation in step event
player.addEventScript(GameEvent.STEP, (self) => {
  // Animate the sprite
  self.imageIndex += self.imageSpeed * deltaTime
  if (self.imageIndex >= self.sprite.frameCount) {
    self.imageIndex = 0
  }
})
```

### 3. **Key Features**

✅ **No Automatic Rendering**: Objects don't auto-draw their sprites  
✅ **Manual draw_self()**: Call `drawSelf()` in draw events when you want to render  
✅ **Room-Based Loading**: Sprites load when entering room, unload when leaving  
✅ **Memory Efficient**: Only load sprites needed for current room  
✅ **GameMaker-Style**: Exactly like GameMaker's sprite system  

### 4. **Advanced Usage**

```typescript
// Draw event with full control
player.addEventScript(GameEvent.DRAW, (self) => {
  const draw = game.getEngine().getDrawingSystem()
  
  // Draw shadow first
  draw.drawSpriteFromSprite(self.sprite, self.x + 2, self.y + 2, self.imageIndex, 1, 1, 0, 0.3)
  
  // Draw main sprite
  self.drawSelf()
  
  // Draw UI on top
  draw.drawHealthbar(self.x - 16, self.y - 20, self.x + 16, self.y - 16, self.health)
})
```

This system provides the exact GameMaker experience: rooms manage sprite loading, objects hold sprite references, and draw events manually control rendering with `draw_self()`.
