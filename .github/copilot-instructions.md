# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a turn-based movement game demo project built with:
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **rapid-render** - Immediate-mode 2D rendering library
- **EasyStar.js** - A* pathfinding library for 2D grids
- **MessagePack** - Binary data serialization
- **HTML5 Canvas** - 2D rendering target

## Game Architecture Guidelines

- Use object-oriented programming with TypeScript classes
- Implement GameMaker-style event system with GameObject base class
- Use immediate-mode rendering with rapid-render library
- Implement a grid-based game board system
- Use EasyStar.js for pathfinding calculations
- Follow turn-based game patterns with clear state management
- Use MessagePack binary format for room data
- Keep rendering logic separate from game logic
- Use proper TypeScript typing throughout the codebase

## Project Context

- Always reference the `.ai-context.md` file in the workspace root for comprehensive project context
- This file contains important project information, architecture decisions, and development guidelines
- Use the information in `.ai-context.md` to inform code suggestions and maintain consistency with project patterns

## Project History & Milestones

- **Milestone Documentation**: Located in `history/milestones/` - detailed logs of major project achievements and technical evolution
- **Development History**: `history/DEV_LOG.md` contains the complete chronological development journey
- **Architecture Guides**: `history/ENGINE.md` and `history/ROOM_SYSTEM.md` document core system designs
- **Progress Tracking**: Use `history/PENDING_COMMITS.md` to track minor commits between milestones
- When making significant changes, consider documenting them as part of milestone progression

## Development Environment

- **Operating System**: Windows
- **Shell**: PowerShell (use PowerShell syntax for all terminal commands)
- **Package Manager**: npm
- When suggesting terminal commands, use PowerShell syntax and conventions
- Use `;` for command chaining when needed
- Prefer PowerShell cmdlets and syntax over bash/cmd equivalents
- Batch terminal commands together when possible to minimize user interactions

## Git Workflow

- Use minimal commit messages unless instructed otherwise
- Keep commits focused and atomic
- Follow conventional commit format when specified
- Always push changes after committing
- Track minor commits in `history/PENDING_COMMITS.md` for milestone grouping

## Code Style

- Use descriptive variable and function names
- Implement proper error handling
- Add JSDoc comments for public methods
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Prefer composition over inheritance where appropriate
