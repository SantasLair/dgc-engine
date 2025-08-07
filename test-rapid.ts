import { Rapid, Color, Vec2 } from 'rapid-render'

// Simple test to verify Rapid.js is working
const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')

if (canvas) {
  const rapid = new Rapid({
    canvas: canvas,
    backgroundColor: Color.fromHex("E6F0FF")
  })
  
  console.log('Rapid.js initialized successfully!')
  
  // Simple render test
  rapid.render(() => {
    rapid.renderRect({ 
      offset: new Vec2(100, 100), 
      width: 50, 
      height: 50, 
      color: Color.Red 
    })
  })
  
  console.log('Rapid.js test render completed!')
} else {
  console.error('Canvas not found!')
}
