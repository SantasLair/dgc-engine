import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { glob } from 'glob'

// Function to copy JSON room data files
function copyRoomDataFiles() {
  const sourceDir = resolve(__dirname, 'src/game/rooms/data')
  const targetDir = resolve(__dirname, 'public/data/rooms')
  
  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  
  // Copy all JSON files directly
  const files = glob.sync('**/*.json', { cwd: sourceDir })
  files.forEach(file => {
    const sourcePath = resolve(sourceDir, file)
    const targetPath = resolve(targetDir, file)
    copyFileSync(sourcePath, targetPath)
    console.log(`� Copied room data: ${file}`)
  })
}

// Function to copy image assets
function copyImageAssets() {
  const sourceDir = resolve(__dirname, 'src/assets/images')
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
    // Plugin to copy room data and assets
    {
      name: 'copy-assets',
      buildStart() {
        // Copy JSON room data files
        copyRoomDataFiles()
        copyImageAssets()
      },
      handleHotUpdate({ file }) {
        // Re-copy room data files when they change during development
        if (file.includes('src/game/rooms/data/')) {
          copyRoomDataFiles()
        }
        // Re-copy images when they change during development
        if (file.includes('src/assets/images/')) {
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