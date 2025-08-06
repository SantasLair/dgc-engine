# GameMaker Clickables Analysis

## Overview
GameMaker doesn't have a built-in "clickable" system like modern web frameworks, but developers create clickable objects through various patterns and techniques.

## Common GameMaker Clickable Patterns

### 1. Object-Based Clickables
```gml
// obj_button Create Event
button_text = "Click Me"
button_width = 120
button_height = 40
clicked = false

// obj_button Step Event
if (mouse_check_button_pressed(mb_left)) {
    if (point_in_rectangle(mouse_x, mouse_y, x, y, x + button_width, y + button_height)) {
        clicked = true
        // Button action here
        room_goto(rm_game)
    }
}

// obj_button Draw Event
draw_rectangle(x, y, x + button_width, y + button_height, false)
draw_text(x + 10, y + 10, button_text)
```

### 2. GUI-Based Clickables (Screen Space)
```gml
// obj_gui_manager Draw GUI Event
var gui_width = display_get_gui_width()
var gui_height = display_get_gui_height()

// Button in screen coordinates
var button_x = gui_width / 2 - 60
var button_y = gui_height / 2 - 20
var button_w = 120
var button_h = 40

// Check for clicks in GUI coordinates
if (mouse_check_button_pressed(mb_left)) {
    var gui_mouse_x = device_mouse_x_to_gui(0)
    var gui_mouse_y = device_mouse_y_to_gui(0)
    
    if (point_in_rectangle(gui_mouse_x, gui_mouse_y, 
                          button_x, button_y, 
                          button_x + button_w, button_y + button_h)) {
        // Button clicked
        room_goto(rm_menu)
    }
}

draw_rectangle(button_x, button_y, button_x + button_w, button_y + button_h, false)
draw_text(button_x + 10, button_y + 10, "Back to Menu")
```

### 3. Collision-Based Clickables
```gml
// obj_clickable_area (invisible collision object)
// Create Event
image_alpha = 0  // Make invisible
solid = false

// Mouse Enter Event
cursor_sprite = spr_cursor_hover

// Mouse Leave Event  
cursor_sprite = spr_cursor_normal

// Left Button Event
// Action when clicked
show_message("Area clicked!")
```

## Key GameMaker Concepts

### Coordinate Systems
- **Room Coordinates**: `mouse_x`, `mouse_y` - relative to room/camera
- **GUI Coordinates**: `device_mouse_x_to_gui()`, `device_mouse_y_to_gui()` - screen space
- **Device Coordinates**: Raw input coordinates

### Mouse Functions
- `mouse_check_button_pressed(button)` - Single click detection
- `mouse_check_button(button)` - Continuous press detection
- `mouse_check_button_released(button)` - Release detection
- `point_in_rectangle()` - Collision detection helper

### Events Used for Clickables
- **Step Event**: Continuous input checking
- **Draw GUI Event**: Screen-space UI rendering
- **Mouse Events**: Built-in collision detection (Left Button, Mouse Enter/Leave)
- **Draw Event**: World-space rendering

## Third-Party Solutions

### Popular GameMaker UI Libraries
1. **GUI Framework** - Object-oriented UI system
2. **UI Elements** - Pre-built clickable components
3. **Easy UI** - Simplified UI creation
4. **Scribble + Clickables** - Text-based clickable elements

### Common Patterns in Libraries
```gml
// Pseudo-code from typical UI library
var button = ui_button_create(x, y, width, height, "Click Me")
ui_button_set_callback(button, function() {
    room_goto(rm_next)
})
ui_button_set_style(button, "hover", c_yellow)
```

## DGC Engine Implications

### What GameMaker Lacks (Opportunities for DGC)
1. **Built-in UI Objects**: No native button, textbox, etc.
2. **Event Delegation**: Manual collision detection required
3. **Styling System**: Limited visual customization
4. **Layout Management**: Manual positioning only
5. **State Management**: Must track hover, pressed, disabled states manually
6. **Accessibility**: No screen reader support

### GameMaker Strengths to Preserve
1. **Coordinate System Separation**: Room vs GUI coordinates
2. **Event-Driven Architecture**: Step, Draw, Mouse events
3. **Collision Detection**: Built-in `point_in_rectangle()` and sprite collision
4. **Performance**: Efficient for game-focused UI

## Recommended DGC Engine Approach

### Building on GameMaker Patterns
```typescript
// DGC Engine - GameObject-based clickables (similar to GameMaker objects)
class ClickableObject extends GameObject {
  private bounds: Rectangle
  private isHovered: boolean = false
  private isPressed: boolean = false
  
  constructor(x: number, y: number, width: number, height: number) {
    super('clickable', { x, y })
    this.bounds = { x, y, width, height }
    
    // GameMaker-style events
    this.addEventScript(GameEvent.STEP, () => this.handleStep())
    this.addEventScript(GameEvent.DRAW, () => this.handleDraw())
  }
  
  private handleStep() {
    const mousePos = this.getEngine().getMousePosition()
    const wasHovered = this.isHovered
    
    // Check if mouse is over this object (like GameMaker collision detection)
    this.isHovered = this.pointInBounds(mousePos.x, mousePos.y)
    
    // Mouse enter/leave (like GameMaker mouse events)
    if (this.isHovered && !wasHovered) {
      this.onMouseEnter()
    } else if (!this.isHovered && wasHovered) {
      this.onMouseLeave()
    }
    
    // Click detection (like GameMaker mouse_check_button_pressed)
    if (this.isHovered && this.getEngine().isMousePressed()) {
      this.onClick()
    }
  }
  
  protected onMouseEnter() {
    // Override in subclasses
  }
  
  protected onMouseLeave() {
    // Override in subclasses
  }
  
  protected onClick() {
    // Override in subclasses
  }
}

// DGC Engine - GUI-based clickables (similar to Draw GUI)
class UIObject extends GameObject {
  coordinateSystem: 'screen' = 'screen'
  
  constructor(elementType: string, x: number, y: number) {
    super('ui_' + elementType, { x, y })
    
    // Similar to GameMaker's Draw GUI event
    this.addEventScript('draw_gui', () => this.handleGUIDraw())
  }
  
  getGUIMousePosition() {
    // Similar to device_mouse_x_to_gui()
    return this.getEngine().getGUIMousePosition()
  }
}
```

### Key Design Principles from GameMaker
1. **Coordinate System Awareness**: Separate room and GUI/screen coordinates
2. **Event-Driven**: Use Step and Draw events for input handling
3. **Collision-Based**: Use bounding box collision for click detection
4. **State Management**: Track hover, pressed, etc. states manually
5. **Performance**: Efficient collision detection and minimal allocations

### Improvements Over GameMaker
1. **Built-in Clickable Types**: Button, TextBox, Slider components
2. **Automatic Event Handling**: Built-in mouse enter/leave/click events
3. **Styling System**: CSS-like styling for visual states
4. **Type Safety**: TypeScript interfaces for clickable properties
5. **DOM Integration**: Leverage HTML/CSS for complex UI when appropriate

## Implementation Strategy

### Phase 1: GameMaker-Style Clickables
- Implement `ClickableObject` base class
- Add collision-based click detection
- Support room coordinate clickables (world space)

### Phase 2: GUI Clickables  
- Implement screen coordinate system
- Add GUI mouse coordinate conversion
- Support overlay/HUD clickables

### Phase 3: DOM Integration
- Bridge clickable objects with HTML elements
- Support both canvas and DOM rendering
- Maintain GameMaker-style API

This approach preserves GameMaker's proven patterns while adding modern web capabilities and type safety.
