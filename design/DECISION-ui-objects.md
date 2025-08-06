# UI Objects Integration - DOM/GameObject Architecture

## Status
- **Type**: Decision Document
- **Status**: Draft
- **Date**: August 6, 2025
- **Last Updated**: August 6, 2025

## Problem Statement

Currently, UI elements (menus, buttons, HUD) are created using raw HTML/DOM manipulation in rooms like `MenuRoom.ts`. This approach has several limitations:

1. **No GameObject Integration**: UI elements don't benefit from GameObject events, lifecycle, or patterns
2. **Manual Positioning**: Developers must handle CSS positioning manually
3. **Inconsistent Architecture**: UI uses different patterns than game objects
4. **Limited Reusability**: No standardized UI object system
5. **Lifecycle Management**: UI cleanup is manual and error-prone

**Current Implementation Example**:
```typescript
// MenuRoom.ts - Manual DOM manipulation
const startButton = document.createElement('button')
startButton.style.cssText = `position: absolute; left: 100px; top: 200px; ...`
startButton.addEventListener('click', () => { /* handler */ })
document.body.appendChild(startButton)
```

**Desired Developer Experience**:
```typescript
// Proposed GameObject-like UI creation
const startButton = this.createUIObject('button', 100, 200)
startButton.setText('Start Game')
startButton.addEventScript('click', () => this.switchToRoom('game'))
```

## GameMaker Reference

GameMaker handles UI through several mechanisms:

### Draw GUI Event
- Special event that renders on screen coordinates (not room coordinates)
- Always drawn on top of game content
- Uses `display_get_gui_width()` and `display_get_gui_height()` for resolution independence

### Coordinate Systems
- **Room Coordinates**: World space for game objects (camera-relative)
- **GUI Coordinates**: Screen space for UI elements (camera-independent)
- **Example**: `draw_text(10, 10, "Score")` vs `instance_create(player.x, player.y, obj_bullet)`

### UI Objects
- GameMaker doesn't have HTML-like UI objects
- UI is drawn procedurally in Draw GUI events
- Third-party libraries add UI object systems

## Options Considered

### Option 1: Separate UI Layer System ⭐ (Recommended)

**Description**: Create a dedicated UI system that parallels the GameObject system but operates in screen coordinates with DOM elements.

**Architecture**:
```typescript
// New UIObject class extending GameObject
class UIObject extends GameObject {
  coordinateSystem: 'screen' = 'screen'
  domElement: HTMLElement
  
  constructor(elementType: string, x: number, y: number) {
    super('ui_' + elementType, { x, y })
    this.setupDOMElement(elementType)
  }
}

// UIManager handles DOM/GameObject integration
class UIManager {
  createUIObject(elementType: string, x: number, y: number): UIObject
  updateLayout(): void
  cleanupUIObjects(): void
}

// Room usage
class MenuRoom extends Room {
  onCreateRoom() {
    const startButton = this.createUIObject('button', 100, 200)
    startButton.setText('Start Game')
    startButton.addEventScript('click', () => this.switchToRoom('game'))
  }
}
```

**Pros**:
- ✅ **GameMaker-like**: Familiar separation of game vs UI coordinates
- ✅ **GameObject Integration**: Full event system, lifecycle management
- ✅ **Resolution Independence**: Can implement logical coordinate system
- ✅ **Performance**: DOM stays DOM, Canvas stays Canvas
- ✅ **Clean Architecture**: Clear separation of concerns
- ✅ **Type Safety**: Full TypeScript support with proper types

**Cons**:
- ❌ **Implementation Complexity**: Requires new UIObject and UIManager classes
- ❌ **Learning Curve**: Developers need to understand two coordinate systems
- ❌ **Maintenance**: Additional system to maintain alongside GameObject system

**Implementation Details**:
- `UIObject` extends `GameObject` but renders to DOM instead of canvas
- Screen coordinates (0,0 = top-left of viewport)
- UI objects managed by `UIManager` similar to `GameObjectManager`
- Room lifecycle automatically handles UI object creation/destruction

### Option 2: Unified GameObject System with Layers

**Description**: Extend the existing GameObject system to support both canvas and DOM rendering through a layer system.

**Architecture**:
```typescript
// Extended GameObject with rendering layers
class GameObject {
  layer: 'game' | 'ui' = 'game'
  coordinateSystem: 'room' | 'screen' = 'room'
  renderTarget: 'canvas' | 'dom' = 'canvas'
}

// Usage
const button = this.createObject('Button', 100, 200)
button.layer = 'ui'
button.coordinateSystem = 'screen'
button.renderTarget = 'dom'
```

**Pros**:
- ✅ **Unified System**: Single GameObject type for everything
- ✅ **Flexible**: Can mix canvas and DOM objects easily
- ✅ **Minimal Changes**: Extends existing architecture

**Cons**:
- ❌ **Complexity**: GameObject becomes complex with multiple rendering paths
- ❌ **Performance**: DOM/Canvas abstraction overhead
- ❌ **Type Safety**: Hard to type-check DOM vs Canvas properties
- ❌ **Confusion**: Developers may not understand when to use which mode

### Option 3: DOM-GameObject Hybrid

**Description**: Create DOM elements that can participate in GameObject events but remain primarily DOM-focused.

**Architecture**:
```typescript
class DOMGameObject {
  domElement: HTMLElement
  gameObjectProperties: Partial<GameObject>
  
  addEventScript(event: string, script: EventScript): void
  setPosition(x: number, y: number): void
}
```

**Pros**:
- ✅ **DOM-Native**: Leverages HTML/CSS strengths
- ✅ **Event Integration**: Can participate in GameObject events
- ✅ **Styling**: Full CSS support

**Cons**:
- ❌ **Limited Integration**: Not full GameObjects
- ❌ **Inconsistent**: Different API than GameObject system
- ❌ **Maintenance**: Another object type to maintain

### Option 4: Pure Canvas UI System

**Description**: Implement UI entirely within the canvas system, similar to immediate mode GUIs.

**Architecture**:
```typescript
// UI drawn on canvas in Draw GUI event
class CanvasUI {
  drawButton(x: number, y: number, text: string): void
  handleClick(x: number, y: number): boolean
}
```

**Pros**:
- ✅ **Consistent**: All rendering through canvas
- ✅ **Performance**: Single rendering context
- ✅ **GameMaker-like**: Similar to Draw GUI approach

**Cons**:
- ❌ **Complexity**: Must implement all UI from scratch
- ❌ **Accessibility**: Poor screen reader support
- ❌ **Styling**: Limited compared to CSS
- ❌ **Text Handling**: Complex text input/selection

## Recommendation: Option 1 - Separate UI Layer System

**Rationale**:
1. **Most GameMaker-like**: Follows the established pattern of separate coordinate systems
2. **Best Developer Experience**: Clean API that feels natural to GameObject developers
3. **Future-Proof**: Can evolve independently of the core GameObject system
4. **Performance**: Leverages DOM for what it's good at, Canvas for what it's good at
5. **Type Safety**: Can provide proper TypeScript types for UI-specific features

## Implementation Plan

### Phase 1: Core UI System
1. Create `UIObject` class extending `GameObject`
2. Create `UIManager` class for lifecycle management
3. Implement basic HTML element types (div, button, input, span)
4. Add screen coordinate positioning system

### Phase 2: GameObject Integration
1. Add UI event scripts (click, hover, focus, etc.)
2. Integrate with Room lifecycle (onCreate, onDestroy)
3. Add UI object collision detection (mouse interaction)
4. Implement UI object variables and properties

### Phase 3: Advanced Features
1. Layout system (flexbox-like positioning)
2. Styling system (CSS-in-JS or template-based)
3. Animation support (CSS transitions/animations)
4. Resolution independence (logical coordinates)

### Phase 4: Developer Experience
1. Helper methods for common UI patterns
2. TypeScript types for UI-specific properties
3. Documentation and examples
4. Integration with existing GameObject patterns

## API Design Preview

```typescript
// Room creation
class MenuRoom extends Room {
  async onCreateRoom() {
    // Create UI container
    const container = this.createUIObject('div', 0, 0)
    container.setStyle('width', '100vw')
    container.setStyle('height', '100vh')
    container.setStyle('background', 'linear-gradient(...)')
    
    // Create title
    const title = this.createUIObject('h1', 100, 50)
    title.setText('DGC Engine Game')
    title.setParent(container)
    
    // Create button with events
    const startButton = this.createUIObject('button', 100, 200)
    startButton.setText('Start Game')
    startButton.setParent(container)
    startButton.addEventScript('click', () => {
      this.game.switchToRoom('game')
    })
    startButton.addEventScript(GameEvent.STEP, (self) => {
      // Button can have step events like any GameObject
      if (self.isHovered()) {
        self.setStyle('background-color', '#45a049')
      }
    })
  }
}

// Game usage
class GameRoom extends Room {
  async onCreateRoom() {
    // In-game UI
    const healthBar = this.createUIObject('div', 10, 10)
    healthBar.addEventScript(GameEvent.STEP, (self) => {
      const player = this.game.getPlayer()
      if (player) {
        const healthPercent = player.getVariable('health') / 100
        self.setStyle('width', `${healthPercent * 200}px`)
      }
    })
  }
}
```

## Coordinate System Design

### Screen Coordinates
- **Origin**: Top-left of viewport (0, 0)
- **Units**: CSS pixels
- **Scaling**: Automatic with viewport resize
- **Range**: 0 to viewport width/height

### Logical Coordinates (Future)
- **Origin**: Configurable (center or corner)
- **Units**: Abstract units (e.g., 0-1000)
- **Scaling**: Resolution-independent
- **Range**: Configurable coordinate space

## Future Considerations

### Responsive Design
- Automatic layout adjustment for different screen sizes
- Percentage-based positioning options
- Flexible/grid layout systems

### Accessibility
- Screen reader support through proper HTML semantics
- Keyboard navigation for UI objects
- Focus management system

### Performance
- UI object pooling for dynamic UIs
- Efficient DOM updates (batch changes)
- Memory management for UI object lifecycle

### Advanced Features
- CSS-in-JS styling system
- Animation and transition support
- Form handling and validation
- Drag and drop functionality

## Implementation Notes

### Technical Considerations
1. **Event Bubbling**: How UI events interact with GameObject events
2. **Z-Index Management**: Layering UI objects properly
3. **Memory Management**: Cleaning up DOM elements and event listeners
4. **Performance**: Minimizing DOM operations and reflows

### Breaking Changes
- This would be a new feature, no breaking changes to existing code
- Current manual DOM manipulation would continue to work
- Migration path: gradually replace manual DOM with UIObjects

### Testing Strategy
- Unit tests for UIObject class
- Integration tests for Room/UIObject lifecycle
- Visual tests for positioning and styling
- Cross-browser compatibility testing

---

**Next Steps**: 
1. Review and discuss this proposal
2. Create proof-of-concept implementation
3. Test with current MenuRoom refactoring
4. Develop full specification based on feedback
