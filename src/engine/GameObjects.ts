import { GameEngine } from './GameEngine'
import { GameObject, GameEvent } from './GameObject'

/**
 * Example implementation showing how to create game objects with the new engine
 * This replaces the old Player class with a more flexible object-oriented approach
 */

/**
 * Creates a player object with movement capabilities
 */
export function createPlayerObject(engine: GameEngine, startX: number, startY: number): GameObject {
  const player = engine.createObject('Player', startX, startY)
  
  // Set player properties
  player.solid = true
  player.visible = true
  player.setVariable('speed', 1)
  player.setVariable('canMove', true)
  player.setVariable('targetPosition', null)
  player.setVariable('path', [])
  
  // Create event - runs when object is created
  player.addEventScript(GameEvent.CREATE, (self) => {
    console.log('Player created at', self.getPosition())
    self.setVariable('health', 100)
    self.setVariable('maxHealth', 100)
  })
  
  // Step event - runs every frame
  player.addEventScript(GameEvent.STEP, (self) => {
    const path = self.getVariable('path')
    if (path && path.length > 0) {
      // Move along path
      const target = path[0]
      const currentPos = self.getPosition()
      
      if (currentPos.x === target.x && currentPos.y === target.y) {
        // Reached target, remove from path
        path.shift()
        self.setVariable('path', path)
        
        if (path.length === 0) {
          self.setVariable('targetPosition', null)
          console.log('Player reached destination')
        }
      } else {
        // Move towards target
        const dx = Math.sign(target.x - currentPos.x)
        const dy = Math.sign(target.y - currentPos.y)
        self.setPosition(currentPos.x + dx, currentPos.y + dy)
      }
    }
  })
  
  // Mouse click event - handle movement
  player.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (self, eventData) => {
    if (eventData?.mousePosition) {
      const mousePos = eventData.mousePosition
      // Convert screen coordinates to grid coordinates (simplified)
      const gridPos = {
        x: Math.floor(mousePos.x / 30),
        y: Math.floor(mousePos.y / 30)
      }
      
      console.log('Player moving to', gridPos)
      self.setVariable('targetPosition', gridPos)
      
      // For now, just move in a straight line (we can add pathfinding later)
      const currentPos = self.getPosition()
      const path = []
      
      let x = currentPos.x
      let y = currentPos.y
      
      while (x !== gridPos.x || y !== gridPos.y) {
        if (x < gridPos.x) x++
        else if (x > gridPos.x) x--
        
        if (y < gridPos.y) y++
        else if (y > gridPos.y) y--
        
        path.push({ x, y })
      }
      
      self.setVariable('path', path)
    }
  })
  
  // Key event - handle WASD movement
  player.addEventScript(GameEvent.KEY_PRESSED, (self, eventData) => {
    if (!self.getVariable('canMove')) return
    
    const currentPos = self.getPosition()
    let newX = currentPos.x
    let newY = currentPos.y
    
    switch (eventData?.key) {
      case 'KeyW':
      case 'ArrowUp':
        newY--
        break
      case 'KeyS':
      case 'ArrowDown':
        newY++
        break
      case 'KeyA':
      case 'ArrowLeft':
        newX--
        break
      case 'KeyD':
      case 'ArrowRight':
        newX++
        break
      case 'Space':
        // Cancel current movement
        self.setVariable('path', [])
        self.setVariable('targetPosition', null)
        console.log('Movement cancelled')
        return
    }
    
    // Only move if position changed
    if (newX !== currentPos.x || newY !== currentPos.y) {
      // Cancel any existing path
      self.setVariable('path', [])
      self.setVariable('targetPosition', null)
      
      // Move immediately
      self.setPosition(newX, newY)
      console.log('Player moved to', { x: newX, y: newY })
    }
  })
  
  // Collision event
  player.addEventScript(GameEvent.COLLISION, (self, eventData) => {
    if (eventData?.other) {
      const other = eventData.other
      console.log('Player collided with', other.objectType)
      
      if (other.objectType === 'Enemy') {
        // Take damage
        const currentHealth = self.getVariable('health')
        self.setVariable('health', Math.max(0, currentHealth - 10))
        console.log('Player health:', self.getVariable('health'))
      }
    }
  })
  
  // Destroy event
  player.addEventScript(GameEvent.DESTROY, (_self) => {
    console.log('Player destroyed')
  })
  
  return player
}

/**
 * Creates an enemy object
 */
export function createEnemyObject(engine: GameEngine, startX: number, startY: number): GameObject {
  const enemy = engine.createObject('Enemy', startX, startY)
  
  enemy.solid = true
  enemy.visible = true
  enemy.setVariable('health', 50)
  enemy.setVariable('speed', 0.5)
  enemy.setVariable('direction', Math.random() * 360)
  enemy.setVariable('targetPlayer', null)
  
  // Create event
  enemy.addEventScript(GameEvent.CREATE, (self) => {
    console.log('Enemy created at', self.getPosition())
    // Set a timer to change direction every 2 seconds
    self.setTimer('changeDirection', 2000)
  })
  
  // Step event - AI behavior
  enemy.addEventScript(GameEvent.STEP, (self) => {
    const players = engine.getObjects('Player')
    if (players.length > 0) {
      const nearestPlayer = engine.getNearestObject(self.getPosition(), 'Player')
      if (nearestPlayer) {
        const distance = Math.sqrt(
          Math.pow(nearestPlayer.x - self.x, 2) + Math.pow(nearestPlayer.y - self.y, 2)
        )
        
        // Chase player if within range
        if (distance < 5) {
          const dx = Math.sign(nearestPlayer.x - self.x)
          const dy = Math.sign(nearestPlayer.y - self.y)
          self.move(dx * 0.5, dy * 0.5)
        }
      }
    }
  })
  
  // Timer event - change direction
  enemy.addEventScript(GameEvent.TIMER, (self, eventData) => {
    if (eventData?.timerName === 'changeDirection') {
      self.setVariable('direction', Math.random() * 360)
      self.setTimer('changeDirection', 2000) // Reset timer
    }
  })
  
  // Collision event
  enemy.addEventScript(GameEvent.COLLISION, (_self, eventData) => {
    if (eventData?.other?.objectType === 'Player') {
      console.log('Enemy hit player!')
    }
  })
  
  return enemy
}

/**
 * Creates a collectible item object
 */
export function createItemObject(engine: GameEngine, startX: number, startY: number, itemType: string = 'coin'): GameObject {
  const item = engine.createObject('Item', startX, startY)
  
  item.solid = false
  item.visible = true
  item.setVariable('itemType', itemType)
  item.setVariable('value', itemType === 'coin' ? 10 : 1)
  item.setVariable('bobOffset', Math.random() * Math.PI * 2)
  
  // Create event
  item.addEventScript(GameEvent.CREATE, (self) => {
    console.log(`${itemType} created at`, self.getPosition())
  })
  
  // Step event - bobbing animation
  item.addEventScript(GameEvent.STEP, (self) => {
    const bobOffset = self.getVariable('bobOffset')
    self.setVariable('bobOffset', bobOffset + 0.1)
    
    // Check for collision with player
    const players = engine.getObjects('Player')
    for (const player of players) {
      const distance = Math.sqrt(
        Math.pow(player.x - self.x, 2) + Math.pow(player.y - self.y, 2)
      )
      
      if (distance < 1) {
        // Collected!
        const value = self.getVariable('value')
        console.log(`Player collected ${self.getVariable('itemType')} worth ${value}`)
        
        // Add to player's score
        const currentScore = player.getVariable('score') || 0
        player.setVariable('score', currentScore + value)
        
        // Destroy item
        self.destroy()
        break
      }
    }
  })
  
  return item
}
