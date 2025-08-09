import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { encode } from '@msgpack/msgpack'

// Function to convert JSON room data to MessagePack binary format
function convertRoomDataToMessagePack() {
  const sourceDir = resolve(__dirname, 'src/game/rooms/data')
  const targetDir = resolve(__dirname, 'public/data/rooms')
  
  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  
  // Convert all JSON files to .dgcroom MessagePack files
  const files = glob.sync('**/*.json', { cwd: sourceDir })
  files.forEach(file => {
    const sourcePath = resolve(sourceDir, file)
    const jsonContent = readFileSync(sourcePath, 'utf8')
    const roomData = JSON.parse(jsonContent)
    
    // Convert to MessagePack binary
    const binaryData = encode(roomData)
    
    // Save as .dgcroom file
    const outputFile = file.replace('.json', '.dgcroom')
    const targetPath = resolve(targetDir, outputFile)
    writeFileSync(targetPath, binaryData)
    
    console.log(`📦 Converted to MessagePack: ${file} → ${outputFile}`)
  })
}

// Function to copy image assets
function copyImageAssets() {
  const sourceDir = resolve(__dirname, 'src/game/artifacts/images')
  const targetDir = resolve(__dirname, 'public/images')
  
  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  
  // Copy all image files
  const files = glob.sync('**/*.{png,jpg,jpeg,gif,svg}', { cwd: sourceDir })
  files.forEach(file => {
    const sourcePath = resolve(sourceDir, file)
    const targetPath = resolve(targetDir, file)
    copyFileSync(sourcePath, targetPath)
    console.log(`🖼️ Copied image asset: ${file}`)
  })
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [
    // Plugin to convert room data to MessagePack and copy assets
    {
      name: 'copy-assets',
      buildStart() {
        // Only convert to MessagePack (no JSON copying for compression and obfuscation)
        convertRoomDataToMessagePack()
        copyImageAssets()
      },
      handleHotUpdate({ file }) {
        // Re-convert room data files when they change during development
        if (file.includes('src/game/rooms/data/')) {
          convertRoomDataToMessagePack()
        }
        // Re-copy images when they change during development
        if (file.includes('src/game/artifacts/images/')) {
          copyImageAssets()
        }
      }
    }
  ],
  server: {
    fs: {
      // Allow serving files from project root
      allow: ['..']
    }
  }
})