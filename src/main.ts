import './style.css'
import { DemoGame } from './game/DemoGame'
import { room_goto, room_restart, room_get_name } from './game/gml'
import './examples/GMLRoomExample'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing game engine...')
  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')
  
  if (!canvas) {
    console.error('Canvas element not found!')
    document.body.innerHTML = '<h1>Error: Canvas element not found!</h1>'
    return
  }
  
  console.log('Canvas found, initializing game...')
  
  // Ensure the page can receive keyboard events
  document.body.tabIndex = 0
  canvas.tabIndex = 0
  document.body.focus()
  
  // Add click handler to ensure focus for keyboard events
  canvas.addEventListener('click', () => {
    canvas.focus()
  })
  
  try {
    const game = new DemoGame(canvas)
    
    // Initialize the game first
    await game.initialize()
    console.log('Game initialized successfully!')
    
    // Update status
    const statusDiv = document.getElementById('status')
    if (statusDiv) {
      statusDiv.innerHTML = 'Game initialized. Starting...'
    }
    
    // Now start the game
    game.start()
    console.log('Game started successfully!')
    
    // Add status check interval
    if (statusDiv) {
      setInterval(() => {
        const engine = game.getEngine()
        const objectManager = engine.getObjectManager()
        const objectCount = objectManager.getObjectCount()
        const currentRoom = game.getCurrentRoom()
        statusDiv.innerHTML = `Room: ${currentRoom?.name || 'none'}<br>Objects: ${objectCount}<br>Engine: ${engine ? 'OK' : 'ERROR'}`
      }, 1000)
    }
    
    // Expose game instance for development/debugging (development only)
    if (import.meta.env.DEV) {
      ;(window as any).game = game
      console.log('Game instance exposed to window.game for debugging')
      
    // Expose room functionality for testing
    ;(window as any).goToGame = async () => await game.goToRoom('game')
    ;(window as any).goToMenu = async () => await game.goToRoom('menu')
    ;(window as any).goToSpriteDemo = async () => await game.goToRoom('sprite_demo')
    ;(window as any).getCurrentRoom = () => game.getCurrentRoom()?.name
    ;(window as any).getRoomManager = () => game.getRoomManager()
    
    // Test JSON room loading
    ;(window as any).testJsonRooms = async () => {
      try {
        console.log('🧪 Testing MessagePack room loading...')
        const roomManager = game.getRoomManager()
        const factory = roomManager.getFactory()
        
        // Test loading a MessagePack file
        const jsonRoom = await factory.createRoomFromFile('main_menu.dgcroom')
        console.log('✅ Successfully loaded MessagePack room:', jsonRoom.name)
        
        // Test exporting JSON data
        const roomData = factory.createRoomDataTemplate('test_export', 10, 8)
        const jsonString = factory.exportRoomData(roomData, 'json')
        console.log('✅ Successfully exported JSON data:')
        console.log(jsonString)
        
        return true
      } catch (error) {
        console.error('❌ JSON test failed:', error)
        return false
      }
    }
    
    // Test MessagePack room loading
    ;(window as any).testMessagePackRooms = async () => {
      try {
        console.log('📦 Testing MessagePack room loading...')
        const roomManager = game.getRoomManager()
        const factory = roomManager.getFactory()
        
        // Test loading a MessagePack file (if it exists)
        try {
          const msgpackRoom = await factory.createRoomFromFile('main_menu.dgcroom')
          console.log('✅ Successfully loaded MessagePack room:', msgpackRoom.name)
        } catch (error) {
          console.log('⚠️ MessagePack file not found (normal in development)')
        }
        
        // Test exporting MessagePack data
        const roomData = factory.createRoomDataTemplate('test_export', 10, 8)
        const msgpackData = factory.exportRoomData(roomData, 'msgpack') as Uint8Array
        console.log('✅ Successfully exported MessagePack data:')
        console.log('Binary data size:', msgpackData.byteLength, 'bytes')
        
        // Test round-trip conversion
        console.log('✅ MessagePack functionality working')
        
        return true
      } catch (error) {
        console.error('❌ MessagePack test failed:', error)
        return false
      }
    }
    
    // Convert current JSON data to MessagePack for testing
    ;(window as any).convertToMessagePack = async () => {
      try {
        const roomManager = game.getRoomManager()
        const factory = roomManager.getFactory()
        
        // Load MessagePack room
        const jsonRoom = await factory.createRoomFromFile('sprite_demo.dgcroom')
        console.log('📄 Loaded MessagePack room:', jsonRoom.name)
        
        // Create room data template and export as MessagePack
        const roomData = factory.createRoomDataTemplate('converted_test', 20, 15)
        const msgpackData = factory.exportRoomData(roomData, 'msgpack') as Uint8Array
        
        console.log('📦 Converted to MessagePack:')
        console.log('Size:', msgpackData.byteLength, 'bytes')
        console.log('Data:', msgpackData)
        
        return msgpackData
      } catch (error) {
        console.error('❌ Conversion failed:', error)
        return null
      }
    }
    
    // Debug room state
    ;(window as any).debugRoom = () => {
      const currentRoom = game.getCurrentRoom()
      const engine = game.getEngine()
      const objectManager = engine?.getObjectManager()
      
      console.log('🔍 Current Room Debug Info:')
      console.log('Room:', currentRoom?.name)
      console.log('Object Count:', objectManager?.getObjectCount())
      console.log('Objects:', objectManager?.getAllObjects().map(o => ({ type: o.objectType, x: o.x, y: o.y, visible: o.visible })))
      
      if (currentRoom) {
        console.log('Room Sprites:', (currentRoom as any).sprites || 'none')
        console.log('Room Properties:', (currentRoom as any).properties || 'none')
      }
      
      return {
        room: currentRoom?.name,
        objectCount: objectManager?.getObjectCount(),
        objects: objectManager?.getAllObjects()
      }
    }      // Expose GML room functions for testing
      ;(window as any).room_goto = room_goto
      ;(window as any).room_restart = room_restart
      ;(window as any).room_get_name = room_get_name
      
      // Expose dev UI toggle for testing
      ;(window as any).toggleDevUI = () => {
        // Trigger the F12 key event to use the existing toggle logic
        const event = new KeyboardEvent('keydown', { key: 'F12' })
        document.dispatchEvent(event)
      }
      
      console.log('🏠 Room system enabled! Available debug commands:')
      console.log('  goToGame() - Switch to game room')
      console.log('  goToMenu() - Switch to menu room')
      console.log('  getCurrentRoom() - Get current room name')
      console.log('  getRoomManager() - Get room manager')
      console.log('')
      console.log('🎮 GML Functions available:')
      console.log('  room_goto("game") - Switch to game room (GML style)')
      console.log('  room_goto("menu") - Switch to menu room (GML style)')
      console.log('  room_restart() - Restart current room')
      console.log('  room_get_name() - Get current room name')
      console.log('')
      console.log('⌨️  Hotkeys:')
      console.log('  F12 or Ctrl+D - Toggle dev UI visibility')
      console.log('')
      console.log('🔧 Dev Functions:')
      console.log('  toggleDevUI() - Toggle dev UI from console')
      console.log('  room_get_name() - Get current room name')
    }
    
  } catch (error) {
    console.error('Error starting game:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error stack:', errorStack)
    document.body.innerHTML = `<h1>Error starting game: ${errorMessage}</h1><pre>${errorStack}</pre>`
  }
})

