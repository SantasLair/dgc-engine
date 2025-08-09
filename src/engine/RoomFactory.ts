/**
 * DGCRoom Factory System
 * 
 * Creates DGCRoom instances from JSON data files.
 * Supports both pure data-driven rooms and custom DGCRoom classes.
 */

import { DGCRoom, type RoomConfig } from './DGCRoom'
import type { DGCGame } from './DGCGame'
import type { 
  RoomData, 
  RoomDataFile, 
  RoomFactoryConfig, 
  RoomObjectData 
} from './RoomData'
import { GameObject } from './GameObject'

// Export the interfaces for use by other modules
export type { RoomData, RoomDataFile, RoomFactoryConfig, RoomObjectData } from './RoomData'

/**
 * Factory for creating rooms from data definitions
 */
export class RoomFactory {
  private objectTypes: Map<string, new (...args: any[]) => GameObject> = new Map()
  private roomClasses: Map<string, new (...args: any[]) => DGCRoom> = new Map()
  private dataPath: string = '/data/rooms/'
  private gameInstance?: DGCGame

  constructor(config?: RoomFactoryConfig) {
    if (config?.dataPath) {
      this.dataPath = config.dataPath
    }
    if (config?.objectTypes) {
      this.objectTypes = config.objectTypes
    }
    if (config?.roomClasses) {
      this.roomClasses = config.roomClasses
    }
  }

  /**
   * Set the game instance for room creation
   */
  public setGameInstance(game: DGCGame): void {
    this.gameInstance = game
  }

  /**
   * Register an object type that can be created in rooms
   */
  public registerObjectType(name: string, objectClass: new (...args: any[]) => GameObject): void {
    this.objectTypes.set(name, objectClass)
    console.log(`🏭 Registered object type: ${name}`)
  }

  /**
   * Register a custom DGCRoom class
   */
  public registerRoomClass(name: string, roomClass: new (...args: any[]) => DGCRoom): void {
    this.roomClasses.set(name, roomClass)
    console.log(`🏭 Registered DGCRoom class: ${name}`)
  }

  /**
   * Create a DGCRoom from a JSON data file
   */
  public async createRoomFromFile(filename: string): Promise<DGCRoom> {
    try {
      const fullPath = this.dataPath + filename
      console.log(`🏭 Loading DGCRoom data from: ${fullPath}`)
      
      const response = await fetch(fullPath)
      if (!response.ok) {
        throw new Error(`Failed to load DGCRoom file: ${response.statusText}`)
      }
      
      let roomDataFile: RoomDataFile
      
      if (filename.endsWith('.json')) {
        // Load JSON format
        console.log('📄 Parsing JSON data...')
        const fileContent = await response.text()
        roomDataFile = JSON.parse(fileContent) as RoomDataFile
      } else {
        throw new Error(`Unsupported file format. Use .json files only.`)
      }
      
      return this.createRoomFromData(roomDataFile.room)
    } catch (error) {
      console.error(`❌ Error loading DGCRoom from file '${filename}':`, error)
      throw error
    }
  }

  /**
   * Create a DGCRoom from DGCRoom data object
   */
  public createRoomFromData(roomData: RoomData): DGCRoom {
    console.log(`🏭 Creating DGCRoom from data: ${roomData.name}`)
    
    if (!this.gameInstance) {
      throw new Error('Game instance must be set before creating rooms')
    }
    
    // If a custom DGCRoom class is specified, use it
    if (roomData.customClass && this.roomClasses.has(roomData.customClass)) {
      const RoomClass = this.roomClasses.get(roomData.customClass)!
      const room = new RoomClass(this.convertToRoomConfig(roomData), this.gameInstance)
      this.setupRoomObjects(room, roomData.objects || [])
      return room
    }
    
    // Otherwise create a standard data-driven DGCRoom
    const roomConfig = this.convertToRoomConfig(roomData)
    const room = new DGCRoom(roomConfig, this.gameInstance)
    this.setupRoomObjects(room, roomData.objects || [])
    
    return room
  }

  /**
   * Convert RoomData to RoomConfig for the DGCRoom constructor
   */
  private convertToRoomConfig(roomData: RoomData): RoomConfig {
    const config: RoomConfig = {
      name: roomData.name,
      width: roomData.dimensions.width,
      height: roomData.dimensions.height,
      sprites: roomData.sprites || []
    }

    // Handle background
    if (roomData.background) {
      if (roomData.background.type === 'color') {
        config.background = roomData.background.value
      }
      // TODO: Handle image backgrounds when needed
    }

    // Handle DGCRoom events - JSON files should not contain scripts
    // Scripts should be handled by companion TypeScript files
    if (roomData.events) {
      // Skip script compilation for now - use companion TS files for scripts
      console.log('⚠️ DGCRoom events found in JSON - consider using companion TypeScript files for scripts')
    }

    return config
  }

  /**
   * Create and add objects to a DGCRoom based on object data
   */
  private setupRoomObjects(DGCRoom: DGCRoom, objectsData: RoomObjectData[]): void {
    console.log(`🎯 Setting up ${objectsData.length} objects in DGCRoom: ${DGCRoom.name}`)
    
    for (const objectData of objectsData) {
      try {
        const gameObject = this.createObject(objectData)
        if (gameObject) {
          DGCRoom.addGameObject(gameObject)
          console.log(`🏭 Added ${objectData.objectType} to DGCRoom at (${objectData.position.x}, ${objectData.position.y})`)
        }
      } catch (error) {
        console.error(`❌ Failed to create object ${objectData.objectType}:`, error)
      }
    }
  }

  /**
   * Create a game object from object data
   */
  private createObject(objectData: RoomObjectData): GameObject | null {
    console.log(`🏭 Creating object: ${objectData.objectType} at (${objectData.position.x}, ${objectData.position.y})`)
    
    const ObjectClass = this.objectTypes.get(objectData.objectType)
    if (!ObjectClass) {
      console.error(`❌ Unknown object type: ${objectData.objectType}`)
      console.log(`📝 Available object types:`, Array.from(this.objectTypes.keys()))
      return null
    }

    // Create the object with position and properties
    console.log(`✅ Creating ${objectData.objectType} with data:`, {
      x: objectData.position.x,
      y: objectData.position.y,
      depth: objectData.position.depth || 0,
      ...objectData.properties
    })
    
    const gameObject = new ObjectClass({
      x: objectData.position.x,
      y: objectData.position.y,
      depth: objectData.position.depth || 0,
      ...objectData.properties
    })

    // Set instance name if provided
    if (objectData.instanceName) {
      // Add instance name property if GameObject supports it
      (gameObject as any).instanceName = objectData.instanceName
      console.log(`🏷️ Set instance name: ${objectData.instanceName}`)
    }

    return gameObject
  }

  /**
   * Create a DGCRoom data template for easy authoring
   */
  public createRoomDataTemplate(name: string, width: number, height: number): RoomData {
    return {
      name,
      dimensions: { width, height },
      background: {
        type: 'color',
        value: '#000000'
      },
      view: {
        width: 800,
        height: 600,
        x: 0,
        y: 0
      },
      sprites: [],
      objects: [],
      events: {},
      properties: {},
      metadata: {
        description: `DGCRoom: ${name}`,
        author: 'DGC Engine',
        version: '1.0.0',
        tags: []
      }
    }
  }

  /**
   * Export DGCRoom data to JSON string for saving
   */
  public exportRoomDataAsJson(roomData: RoomData): string {
    const roomDataFile: RoomDataFile = {
      version: '1.0.0',
      room: roomData
    }
    return JSON.stringify(roomDataFile, null, 2)
  }

  /**
   * Export DGCRoom data as JSON
   */
  public exportRoomData(roomData: RoomData): string {
    return this.exportRoomDataAsJson(roomData)
  }
}
