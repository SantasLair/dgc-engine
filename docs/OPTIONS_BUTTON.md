# Menu System Guide

Learn how to create game menus with options buttons and settings screens.

## What You Can Do

The DGC Engine menu system lets you create professional-looking game menus with options buttons. You can choose between two different styles depending on whether your options are ready or still being developed.

## Options Button Styles

### 1. Interactive Options (`'popup'`)
**When to use**: Your game options are ready and functional

- **Look**: Blue button that highlights when you hover over it
- **Behavior**: Opens a detailed options popup with all your game settings
- **What's included**: 
  - Audio settings (Master Volume, Sound Effects, Music)
  - Graphics settings (Resolution, Fullscreen, VSync)
  - Control settings
  - Professional modal dialog that closes when you click outside

### 2. Coming Soon Style (`'grayed'`)
**When to use**: Your options aren't ready yet but you want to show the button

- **Look**: Gray/disabled button that clearly shows it's not available
- **Behavior**: Shows "Options are not available yet" when you hover over it
- **What happens**: Button can't be clicked (cursor shows "not allowed")

## How to Set It Up

In your menu room file, find this line and change it to the style you want:

```typescript
// For working options popup
private optionsStyle: 'popup' | 'grayed' = 'popup'

// For "coming soon" button
private optionsStyle: 'popup' | 'grayed' = 'grayed'
```

## What's in the Options Popup

When you use the `'popup'` style, players get a full options screen with:

### Audio Settings
- Master Volume (0-100%)
- Sound Effects Volume (0-100%)
- Music Volume (0-100%)

### Audio Settings
- **Master Volume**: Control overall game volume (0-100%)
- **Sound Effects**: Control sound effects volume (0-100%)  
- **Music Volume**: Control background music volume (0-100%)

### Graphics Settings
- **Resolution**: Choose screen resolution (1920x1080, 1366x768, 1280x720)
- **Fullscreen**: Toggle between windowed and fullscreen mode
- **VSync**: Enable/disable vertical sync for smoother graphics

### Control Settings
- **Mouse Sensitivity**: Adjust how fast the mouse moves (0-100%)
- **Invert Y-Axis**: Flip mouse up/down movement

## 💡 Tips for Developers

### Starting with "Coming Soon"
If you're just starting development, use the `'grayed'` style first. This lets players know options will be available later without showing empty functionality.

### Making Options Work
When you're ready to add real functionality:

1. Switch to `'popup'` style
2. Connect each setting to your game's settings system
3. The popup framework is already built - just add your functionality!

### Customizing the Look
The options popup is designed to match your game's style. All the styling is ready to customize with your game's colors and fonts.

## 🎮 Example Usage

```typescript
// In your MenuRoom.ts file:

// Show working options
private optionsStyle: 'popup' | 'grayed' = 'popup'

// Show "coming soon" options  
private optionsStyle: 'popup' | 'grayed' = 'grayed'
```

The menu system handles everything automatically - just choose your style and you're ready to go!
4. Remove the "Coming Soon" notice
5. Add save/cancel functionality

The current implementation provides a solid foundation for future options development while providing a professional user experience in the interim.
