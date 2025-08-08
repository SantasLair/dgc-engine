/**
 * JSON Room Data System Example
 * 
 * This example demonstrates how to use the JSON-based room data system
 * to create rooms without writing custom TypeScript classes.
 */

import { RoomManager, type RoomData } from '../engine'
import { Player, Enemy } from '../game/gameobjects'

export class JsonRoomExample {
  private roomManager: RoomManager

  constructor() {
    // Initialize room manager with JSON support
    this.roomManager = new RoomManager({
      dataPath: '/data/rooms/'
    })
    
    this.setupObjectTypes()
  }

  /**
   * Register game object types that can be created from JSON data
   */
  private setupObjectTypes(): void {
    const factory = this.roomManager.getFactory()
    
    // Register object types that appear in JSON files
    factory.registerObjectType('Player', Player)
    factory.registerObjectType('Enemy', Enemy)
    
    console.log('📝 Registered object types for JSON room creation')
  }

  /**
   * Load and switch to a JSON-defined room
   */
  public async loadJsonRoom(filename: string): Promise<void> {
    try {
      console.log(`📄 Loading JSON room: ${filename}`)
      
      // Load room from JSON file
      const room = await this.roomManager.addRoomFromFile(filename)
      
      // Switch to the room
      await this.roomManager.goToRoom(room.name)
      
      console.log(`✅ Successfully loaded and activated room: ${room.name}`)
    } catch (error) {
      console.error(`❌ Failed to load JSON room '${filename}':`, error)
      throw error
    }
  }

  /**
   * Create a new room data template
   */
  public createRoomTemplate(name: string, width: number, height: number): RoomData {
    const factory = this.roomManager.getFactory()
    return factory.createRoomDataTemplate(name, width, height)
  }

  /**
   * Export room data to JSON format
   */
  public exportRoomAsJson(roomData: RoomData): string {
    const factory = this.roomManager.getFactory()
    return factory.exportRoomData(roomData)
  }

  /**
   * Demo: Create a simple room programmatically and export it
   */
  public async createDemoRoom(): Promise<string> {
    console.log('🏭 Creating demo room data...')
    
    // Create a basic room template
    const roomData = this.createRoomTemplate('demo_room', 20, 15)
    
    // Add a sprite definition
    roomData.sprites = [{
      name: 'player_sprite',
      source: '/sprites/player.png',
      frameWidth: 32,
      frameHeight: 32,
      frames: 1
    }]
    
    // Add some objects
    roomData.objects = [
      {
        objectType: 'Player',
        position: { x: 10, y: 7, depth: 0 },
        properties: { sprite: 'player_sprite', health: 100 },
        instanceName: 'main_player'
      },
      {
        objectType: 'Enemy',
        position: { x: 15, y: 5, depth: 0 },
        properties: { sprite: 'player_sprite', health: 50 },
        instanceName: 'guard_1'
      }
    ]
    
    // Set room properties
    roomData.properties = {
      difficulty: 'easy',
      timeLimit: 300
    }
    
    // Export to JSON
    const jsonString = this.exportRoomAsJson(roomData)
    
    console.log('✅ Created demo room JSON:')
    console.log(jsonString)
    
    return jsonString
  }

  /**
   * Demo: Load all available JSON rooms
   */
  public async loadAllJsonRooms(): Promise<void> {
    const jsonFiles = [
      'main_menu.json',
      'test_level.json', 
      'sprite_demo.json'
    ]
    
    console.log('📚 Loading all JSON rooms...')
    
    for (const filename of jsonFiles) {
      try {
        await this.roomManager.addRoomFromFile(filename)
        console.log(`✅ Loaded: ${filename}`)
      } catch (error) {
        console.warn(`⚠️ Failed to load ${filename}:`, error)
      }
    }
    
    console.log('📚 Finished loading JSON rooms')
  }

  /**
   * Demo: Show room navigation capabilities
   */
  public async demonstrateRoomNavigation(): Promise<void> {
    console.log('🎮 Demonstrating room navigation...')
    
    // Load all rooms first
    await this.loadAllJsonRooms()
    
    // Navigate through rooms
    const rooms = ['main_menu', 'test_level', 'sprite_demo']
    
    for (const roomName of rooms) {
      try {
        console.log(`➡️ Navigating to: ${roomName}`)
        await this.roomManager.goToRoom(roomName)
        
        // Wait a moment before switching to next room
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Failed to navigate to ${roomName}:`, error)
      }
    }
    
    console.log('🎮 Room navigation demo complete')
  }

  /**
   * Get the room manager instance for advanced usage
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * const example = new JsonRoomExample()
 * 
 * // Load a specific room
 * await example.loadJsonRoom('sprite_demo.json')
 * 
 * // Create and export room data
 * const json = await example.createDemoRoom()
 * console.log(json)
 * 
 * // Navigate through rooms
 * await example.demonstrateRoomNavigation()
 * ```
 */
