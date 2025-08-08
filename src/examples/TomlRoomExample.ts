/**
 * TOML Room Data System Example
 * 
 * This example demonstrates how to use the new TOML-based room data system
 * to create rooms without writing custom TypeScript classes.
 */

import { RoomManager, type RoomData } from '../engine'
import { Player, Enemy } from '../game/gameobjects'

export class TomlRoomExample {
  private roomManager: RoomManager

  constructor() {
    // Initialize room manager with TOML support
    this.roomManager = new RoomManager({
      dataPath: '/data/rooms/'
    })
    
    this.setupObjectTypes()
  }

  /**
   * Register game object types that can be created from TOML data
   */
  private setupObjectTypes(): void {
    const factory = this.roomManager.getFactory()
    
    // Register object types that appear in TOML files
    factory.registerObjectType('Player', Player)
    factory.registerObjectType('Enemy', Enemy)
    
    console.log('📝 Registered object types for TOML room creation')
  }

  /**
   * Load and switch to a TOML-defined room
   */
  public async loadTomlRoom(filename: string): Promise<void> {
    try {
      console.log(`📄 Loading TOML room: ${filename}`)
      
      // Load room from TOML file
      const room = await this.roomManager.addRoomFromFile(filename)
      
      // Switch to the room
      await this.roomManager.goToRoom(room.name)
      
      console.log(`✅ Successfully loaded and activated room: ${room.name}`)
    } catch (error) {
      console.error(`❌ Failed to load TOML room '${filename}':`, error)
    }
  }

  /**
   * Create a room from TOML data programmatically
   */
  public createRoomFromTomlData(): void {
    const roomData: RoomData = {
      name: 'programmatic_room',
      dimensions: { width: 15, height: 12 },
      background: { type: 'color', value: '#2ecc71' },
      view: { width: 800, height: 600 },
      sprites: [
        {
          name: 'dynamic_sprite',
          source: '/sprites/dynamic.png',
          frameWidth: 32,
          frameHeight: 32
        }
      ],
      objects: [
        {
          objectType: 'Player',
          position: { x: 7, y: 6 },
          properties: { health: 150, name: 'Dynamic Player' },
          instanceName: 'dynamic_player'
        }
      ],
      properties: {
        createdAt: new Date().toISOString(),
        type: 'programmatic'
      },
      metadata: {
        description: 'Room created programmatically from TOML data structure',
        author: 'TOML Example System',
        version: '1.0.0',
        tags: ['dynamic', 'example']
      }
    }

    const room = this.roomManager.addRoomFromData(roomData)
    console.log(`🏗️ Created programmatic room: ${room.name}`)
  }

  /**
   * Export current room data as TOML string
   */
  public exportCurrentRoomAsToml(): string | null {
    const currentRoom = this.roomManager.getCurrentRoom()
    if (!currentRoom) {
      console.warn('No current room to export')
      return null
    }

    const factory = this.roomManager.getFactory()
    
    // Create room data template (in real app, you'd populate from current room state)
    const roomData = factory.createRoomDataTemplate(
      currentRoom.name,
      currentRoom.width,
      currentRoom.height
    )

    // Export as TOML
    const tomlString = factory.exportRoomData(roomData, 'toml')
    console.log('📄 Exported room data as TOML:')
    console.log(tomlString)
    
    return tomlString
  }

  /**
   * Example: Load different room types
   */
  public async demonstrateRoomTypes(): Promise<void> {
    console.log('🎭 Demonstrating different room types...')

    // Load main menu (pure TOML, no custom class)
    await this.loadTomlRoom('main_menu.toml')
    await this.wait(2000)

    // Load test level with game objects
    await this.loadTomlRoom('test_level.toml')
    await this.wait(2000)

    // Load sprite demo (TOML + custom class)
    await this.loadTomlRoom('sprite_demo.toml')
    await this.wait(2000)

    console.log('✅ Room demonstration complete')
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get room manager for external use
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }
}

// Usage example:
export async function runTomlRoomExample(): Promise<void> {
  const example = new TomlRoomExample()
  
  // Create a room programmatically
  example.createRoomFromTomlData()
  
  // Load TOML-defined rooms
  await example.loadTomlRoom('main_menu.toml')
  
  // Export room data
  example.exportCurrentRoomAsToml()
  
  // Demonstrate different room types
  await example.demonstrateRoomTypes()
}
