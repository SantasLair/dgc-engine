import { Room, RoomManager, type RoomConfig } from '../engine/Room'
import { GameEvent } from '../engine/GameObject'
import type { GameEngine } from '../engine/GameEngine'

/**
 * Example demonstrating how to use the Room system
 * This shows GameMaker-style room management with event-driven architecture
 */
export class RoomExample {
  private roomManager: RoomManager
  private engine: GameEngine

  constructor(engine: GameEngine) {
    this.engine = engine
    this.roomManager = new RoomManager()
    this.setupRooms()
  }

  private setupRooms(): void {
    // Create a main menu room
    const menuRoomConfig: RoomConfig = {
      name: 'menu',
      width: 20,
      height: 15,
      background: '#2c3e50',
      onCreate: async (_room) => {
        console.log('Menu room created!')
        
        // Create a simple menu object
        const menuObj = this.engine.createObject('menu_item', 10, 7)
        menuObj.addEventScript(GameEvent.CREATE, (self) => {
          console.log('Menu item created at', self.x, self.y)
        })
        
        menuObj.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (_self) => {
          // Switch to game room when clicked
          this.roomManager.switchToRoom('game')
        })
      },
      onStep: async (_room) => {
        // Menu update logic here
      }
    }

    // Create a game room
    const gameRoomConfig: RoomConfig = {
      name: 'game',
      width: 30,
      height: 20,
      background: '#27ae60',
      onCreate: async (_room) => {
        console.log('Game room created!')
        
        // Create player
        const player = this.engine.createObject('player', 5, 5)
        player.addEventScript(GameEvent.CREATE, (self) => {
          self.setVariable('health', 100)
          self.setVariable('score', 0)
          console.log('Player spawned with health:', self.getVariable('health'))
        })
        
        player.addEventScript(GameEvent.STEP, (self) => {
          // Player movement logic
          if (this.engine.isKeyPressed('ArrowLeft') && self.x > 0) {
            self.x--
          }
          if (this.engine.isKeyPressed('ArrowRight') && self.x < 29) {
            self.x++
          }
          if (this.engine.isKeyPressed('ArrowUp') && self.y > 0) {
            self.y--
          }
          if (this.engine.isKeyPressed('ArrowDown') && self.y < 19) {
            self.y++
          }
        })
        
        // Create some enemies
        for (let i = 0; i < 5; i++) {
          const enemy = this.engine.createObject('enemy', 
            Math.floor(Math.random() * 30), 
            Math.floor(Math.random() * 20)
          )
          
          enemy.addEventScript(GameEvent.CREATE, (self) => {
            self.setVariable('health', 50)
            self.setVariable('direction', Math.random() * Math.PI * 2)
          })
          
          enemy.addEventScript(GameEvent.STEP, (self) => {
            // Simple enemy AI - move randomly
            const direction = self.getVariable('direction')
            const newX = Math.max(0, Math.min(29, self.x + Math.cos(direction) * 0.5))
            const newY = Math.max(0, Math.min(19, self.y + Math.sin(direction) * 0.5))
            
            self.x = newX
            self.y = newY
            
            // Change direction occasionally
            if (Math.random() < 0.02) {
              self.setVariable('direction', Math.random() * Math.PI * 2)
            }
          })
        }
      },
      onStep: async (_room) => {
        // Game room update logic
        // Check for escape key to return to menu
        if (this.engine.isKeyJustPressed('Escape')) {
          this.roomManager.switchToRoom('menu')
        }
      }
    }

    // Create a settings room
    const settingsRoomConfig: RoomConfig = {
      name: 'settings',
      width: 25,
      height: 18,
      background: '#8e44ad',
      onCreate: async (_room) => {
        console.log('Settings room created!')
        
        // Create settings UI objects
        const backButton = this.engine.createObject('back_button', 2, 16)
        backButton.addEventScript(GameEvent.MOUSE_LEFT_PRESSED, (_self) => {
          this.roomManager.switchToRoom('menu')
        })
      }
    }

    // Add rooms to manager
    const menuRoom = new Room(menuRoomConfig)
    const gameRoom = new Room(gameRoomConfig)
    const settingsRoom = new Room(settingsRoomConfig)

    this.roomManager.addRoom(menuRoom)
    this.roomManager.addRoom(gameRoom)
    this.roomManager.addRoom(settingsRoom)

    // Initialize the room manager
    this.roomManager.initialize()

    // Start with menu room
    this.roomManager.switchToRoom('menu')
  }

  /**
   * Update the room system (call this in your main game loop)
   */
  public async update(): Promise<void> {
    await this.roomManager.step()
  }

  /**
   * Render the room system (call this in your render loop)
   */
  public async render(): Promise<void> {
    await this.roomManager.draw()
  }

  /**
   * Switch to a specific room
   */
  public switchToRoom(roomName: string): Promise<boolean> {
    return this.roomManager.switchToRoom(roomName)
  }

  /**
   * Get the current active room
   */
  public getCurrentRoom(): Room | undefined {
    return this.roomManager.getCurrentRoom()
  }

  /**
   * Get the room manager for advanced operations
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }

  /**
   * Cleanup when the game ends
   */
  public async cleanup(): Promise<void> {
    await this.roomManager.cleanup()
  }
}

/**
 * Factory function to create a room example integrated with a game engine
 */
export function createRoomExample(engine: GameEngine): RoomExample {
  return new RoomExample(engine)
}

/**
 * Helper function to create a simple room configuration
 */
export function createSimpleRoom(
  name: string, 
  width: number, 
  height: number, 
  background?: string
): RoomConfig {
  return {
    name,
    width,
    height,
    background: background || '#34495e'
  }
}

/**
 * Example of room-to-room transitions with data passing
 */
export class RoomTransitionExample {
  private roomManager: RoomManager
  private gameData: Map<string, any> = new Map()

  constructor(engine: GameEngine) {
    this.roomManager = new RoomManager()
    this.setupTransitionRooms(engine)
  }

  private setupTransitionRooms(engine: GameEngine): void {
    // Level 1
    const level1Config: RoomConfig = {
      name: 'level1',
      width: 20,
      height: 15,
      onCreate: async (_room) => {
        // Get data from previous room
        const playerHealth = this.gameData.get('playerHealth') || 100
        const playerScore = this.gameData.get('playerScore') || 0
        
        const player = engine.createObject('player', 1, 7)
        player.setVariable('health', playerHealth)
        player.setVariable('score', playerScore)
        
        // Create exit door
        const door = engine.createObject('door', 18, 7)
        door.addEventScript(GameEvent.COLLISION, (_self, other) => {
          if (other && other.objectType === 'player') {
            // Save player data before transition
            this.gameData.set('playerHealth', other.getVariable('health'))
            this.gameData.set('playerScore', other.getVariable('score') + 100)
            
            // Go to next level
            this.roomManager.switchToRoom('level2')
          }
        })
      }
    }

    // Level 2
    const level2Config: RoomConfig = {
      name: 'level2',
      width: 25,
      height: 18,
      onCreate: async (_room) => {
        // Continue with saved data
        const playerHealth = this.gameData.get('playerHealth') || 100
        const playerScore = this.gameData.get('playerScore') || 0
        
        const player = engine.createObject('player', 1, 9)
        player.setVariable('health', playerHealth)
        player.setVariable('score', playerScore)
        
        console.log('Level 2 started with score:', playerScore)
      }
    }

    this.roomManager.addRoom(new Room(level1Config))
    this.roomManager.addRoom(new Room(level2Config))
    this.roomManager.initialize()
  }

  public getRoomManager(): RoomManager {
    return this.roomManager
  }

  public getGameData(): ReadonlyMap<string, any> {
    return this.gameData
  }
}
