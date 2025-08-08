import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { glob } from 'glob'

// Function to copy room data files
function copyRoomData() {
  const sourceDir = resolve(__dirname, 'src/game/rooms/data')
  const targetDir = resolve(__dirname, 'public/data/rooms')
  
  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  
  // Copy all room data files
  const files = glob.sync('**/*.{toml,json}', { cwd: sourceDir })
  files.forEach(file => {
    const sourcePath = resolve(sourceDir, file)
    const targetPath = resolve(targetDir, file)
    copyFileSync(sourcePath, targetPath)
    console.log(`📄 Copied room data: ${file}`)
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
    // Plugin to copy room data files from src to public during dev and build
    {
      name: 'copy-room-data',
      buildStart() {
        copyRoomData()
      },
      handleHotUpdate({ file }) {
        // Re-copy room data files when they change during development
        if (file.includes('src/game/rooms/data/')) {
          copyRoomData()
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
