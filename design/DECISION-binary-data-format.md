# Design Decision: Binary Data Format Migration

**Decision Date**: August 8, 2025  
**Status**: Approved  
**Deciders**: DGC Engine Team  

## Context

The DGC Engine currently uses JSON files for room data configuration. While JSON is human-readable and easy to edit during development, it has several limitations for production game deployment:

1. **Performance**: JSON parsing is slower than binary formats
2. **File Size**: JSON is verbose with unnecessary whitespace and repetitive keys
3. **Security**: Plain text files are easily modified by end users
4. **Professional Feel**: Shipping loose JSON files doesn't feel like a "compiled" game

## Decision

We will implement **MessagePack** as the primary binary data format for production builds, while maintaining JSON for development workflow.

## Rationale

### Why MessagePack?

1. **Minimal Migration Risk**
   - Drop-in replacement for JSON.parse/stringify
   - No schema definitions required
   - Existing JSON structure works unchanged

2. **Immediate Performance Benefits**
   - 30-50% smaller file sizes
   - 2-3x faster parsing than JSON
   - Binary format provides natural obfuscation

3. **Development Workflow Compatibility**
   - Continue editing JSON during development
   - Build process automatically converts to MessagePack
   - Easy debugging (can convert back to JSON)

4. **GameMaker-Style Feel**
   - Binary data files feel more "compiled"
   - Professional game distribution format
   - Harder for casual user modification

### Alternative Options Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Protocol Buffers** | Very compact, schema validation | Requires schema definitions, complex setup | ❌ Too complex |
| **Custom Binary** | Maximum control | High maintenance, development overhead | ❌ Not worth effort |
| **SQLite WASM** | Queryable data, excellent compression | Overkill for simple room data | ❌ Too complex |
| **ZIP Archives** | Asset bundling, compression | More complex, harder to debug | 🔄 Future consideration |
| **Webpack Bundling** | Build-time optimization | Loses data-driven flexibility | ❌ Against design goals |

## Implementation Plan

### Phase 1: MessagePack Integration (Current)

1. **Add MessagePack Dependency**
   ```bash
   npm install @msgpack/msgpack
   ```

2. **Dual Format Support**
   - RoomFactory supports both JSON and MessagePack files
   - Development: continue using JSON files
   - Production: build process generates `.msgpack` files

3. **Build Process Enhancement**
   - Vite plugin converts JSON → MessagePack during build
   - Source JSON files remain in `src/game/rooms/data/`
   - Generated `.msgpack` files in `public/data/rooms/`

4. **File Extension Strategy**
   - Development: `.json` files (human-editable)
   - Production: `.dgcroom` files (MessagePack binary)
   - Clear distinction between formats

### Phase 2: Asset Bundling (Future)

Consider upgrading to ZIP-based archive system:
- Bundle room data + sprites + audio into single `.dgc` files
- Game packages become self-contained
- Better for distribution and version management

## Technical Design

### File Format Detection

```typescript
// RoomFactory will detect format by file extension
public async createRoomFromFile(filename: string): Promise<Room> {
  if (filename.endsWith('.dgcroom')) {
    // Load MessagePack binary format
    return this.loadMessagePackRoom(filename)
  } else if (filename.endsWith('.json')) {
    // Load JSON format (development)
    return this.loadJsonRoom(filename)
  }
  throw new Error(`Unsupported file format: ${filename}`)
}
```

### Build Process

```typescript
// Vite plugin to convert JSON → MessagePack
function convertRoomDataPlugin() {
  return {
    name: 'convert-room-data',
    buildStart() {
      // Convert all JSON room files to .dgcroom files
      convertJsonToMessagePack()
    }
  }
}
```

### Development Experience

- **Development**: Edit JSON files as usual
- **Testing**: Option to test with MessagePack builds
- **Production**: Ship only `.dgcroom` files
- **Debugging**: Utilities to convert back to JSON

## Benefits

### Immediate (Phase 1)
- ✅ 30-50% smaller file sizes
- ✅ 2-3x faster loading
- ✅ Binary format obscures game data
- ✅ Professional distribution format
- ✅ Maintains development workflow

### Future (Phase 2)
- 🔄 Single-file game packages
- 🔄 Asset bundling capability
- 🔄 Version control for game builds
- 🔄 Advanced compression options

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MessagePack parsing errors | High | Fallback to JSON, extensive testing |
| Binary debugging difficulty | Medium | Dev tools to convert back to JSON |
| Build process complexity | Low | Gradual rollout, maintain JSON support |
| Third-party dependency | Low | MessagePack is stable, widely used |

## Success Metrics

- File size reduction: Target 30%+ smaller
- Loading performance: Target 2x faster parsing
- Development workflow: No disruption to JSON editing
- Build time: Minimal impact (<10% increase)

## Decision Outcome

**Approved**: Implement MessagePack with dual-format support.

**Next Steps**:
1. Install MessagePack dependency
2. Extend RoomFactory for binary format support
3. Create build process for JSON → MessagePack conversion
4. Add development tools for binary ↔ JSON conversion
5. Update documentation

---

*This decision supports the DGC Engine's goal of providing a professional game development experience while maintaining the ease of data-driven development.*
