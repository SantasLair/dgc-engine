/**
 * Room Factory System
 * 
 * Creates room instances from TOML data files or data objects.
 * Supports both pure data-driven rooms and custom room classes.
 */

import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { Room, type RoomConfig } from './Room'
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
  private roomClasses: Map<string, new (...args: any[]) => Room> = new Map()
  private dataPath: string = '/data/rooms/'

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
   * Register an object type that can be created in rooms
   */
  public registerObjectType(name: string, objectClass: new (...args: any[]) => GameObject): void {
    this.objectTypes.set(name, objectClass)
    console.log(`🏭 Registered object type: ${name}`)
  }

  /**
   * Register a custom room class
   */
  public registerRoomClass(name: string, roomClass: new (...args: any[]) => Room): void {
    this.roomClasses.set(name, roomClass)
    console.log(`🏭 Registered room class: ${name}`)
  }

  /**
   * Create a room from a data file (supports both TOML and JSON)
   */
  public async createRoomFromFile(filename: string): Promise<Room> {
    try {
      const fullPath = this.dataPath + filename
      console.log(`🏭 Loading room data from: ${fullPath}`)
      
      const response = await fetch(fullPath)
      if (!response.ok) {
        throw new Error(`Failed to load room file: ${response.statusText}`)
      }
      
      const fileContent = await response.text()
      
      // Determine file format and parse accordingly
      let roomDataFile: RoomDataFile
      if (filename.endsWith('.toml')) {
        roomDataFile = parseToml(fileContent) as unknown as RoomDataFile
      } else if (filename.endsWith('.json')) {
        roomDataFile = JSON.parse(fileContent) as RoomDataFile
      } else {
        throw new Error(`Unsupported file format. Use .toml or .json files.`)
      }
      
      return this.createRoomFromData(roomDataFile.room)
    } catch (error) {
      console.error(`❌ Error loading room from file '${filename}':`, error)
      throw error
    }
  }

  /**
   * Create a room from room data object
   */
  public createRoomFromData(roomData: RoomData): Room {
    console.log(`🏭 Creating room from data: ${roomData.name}`)
    
    // If a custom room class is specified, use it
    if (roomData.customClass && this.roomClasses.has(roomData.customClass)) {
      const RoomClass = this.roomClasses.get(roomData.customClass)!
      const room = new RoomClass(this.convertToRoomConfig(roomData))
      this.setupRoomObjects(room, roomData.objects || [])
      return room
    }
    
    // Otherwise create a standard data-driven room
    const roomConfig = this.convertToRoomConfig(roomData)
    const room = new Room(roomConfig)
    this.setupRoomObjects(room, roomData.objects || [])
    
    return room
  }

  /**
   * Convert RoomData to RoomConfig for the Room constructor
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

    // Handle room events
    if (roomData.events) {
      config.onCreate = roomData.events.onCreate
      config.onStep = roomData.events.onStep
      config.onDraw = roomData.events.onDraw
      config.onDestroy = roomData.events.onDestroy
    }

    return config
  }

  /**
   * Create and add objects to a room based on object data
   */
  private setupRoomObjects(room: Room, objectsData: RoomObjectData[]): void {
    for (const objectData of objectsData) {
      try {
        const gameObject = this.createObject(objectData)
        if (gameObject) {
          room.addGameObject(gameObject)
          console.log(`🏭 Added ${objectData.objectType} to room at (${objectData.position.x}, ${objectData.position.y})`)
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
    const ObjectClass = this.objectTypes.get(objectData.objectType)
    if (!ObjectClass) {
      console.error(`❌ Unknown object type: ${objectData.objectType}`)
      return null
    }

    // Create the object with position and properties
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
    }

    return gameObject
  }

  /**
   * Create a room data template for easy authoring
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
        description: `Room: ${name}`,
        author: 'DGC Engine',
        version: '1.0.0',
        tags: []
      }
    }
  }

  /**
   * Export room data to JSON string for saving
   */
  public exportRoomDataAsJson(roomData: RoomData): string {
    const roomDataFile: RoomDataFile = {
      version: '1.0.0',
      room: roomData
    }
    return JSON.stringify(roomDataFile, null, 2)
  }

  /**
   * Export room data to TOML string for saving
   */
  public exportRoomDataAsToml(roomData: RoomData): string {
    const roomDataFile: RoomDataFile = {
      version: '1.0.0',
      room: roomData
    }
    return stringifyToml(roomDataFile as any)
  }

  /**
   * Export room data (defaults to TOML format)
   */
  public exportRoomData(roomData: RoomData, format: 'toml' | 'json' = 'toml'): string {
    return format === 'toml' 
      ? this.exportRoomDataAsToml(roomData)
      : this.exportRoomDataAsJson(roomData)
  }
}
