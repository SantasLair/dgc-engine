# Contributing to DGC Engine (Dream Game Crafter)

Thank you for your interest in **DGC Engine** - the Dream Game Crafter! This flexible GameMaker-style game engine is designed with adaptability in mind while maintaining the familiar feel of a web-first GameMaker-style engine. This project serves as both a functional game engine and an educational resource demonstrating modern game development practices.

> **🚧 Current Status**: This project is **not currently accepting public contributions** as it's in early development stages. Once the engine reaches a more mature state with stable architecture and comprehensive documentation, public contributions will be welcomed.

## 🎯 Project Goals

This project aims to:
- Demonstrate GameMaker-style architecture in TypeScript
- Showcase professional AI-assisted development practices  
- Provide a learning resource for game engine development
- Show professional documentation and development practices
- Create a foundation for 2D game development
- Build a flexible engine that adapts to your development style

## 📖 How to Use This Project

While contributions aren't being accepted yet, this project is valuable for:

### Learning & Education
- **Study the Architecture**: Examine GameMaker-style patterns in TypeScript
- **Learn AI-Assisted Development**: See how professional development works with AI tools
- **Understand Game Engine Design**: Follow the evolution from prototype to engine
- **Modern Web Development**: TypeScript, Vite, and modern tooling practices

### Building Upon the Project
- **Forks Are Welcome and Encouraged**: The MIT license allows you to create your own version
- **Make It Your Own**: Use this as a foundation for your own game engine projects
- **Educational Purposes**: Use as reference for learning game engine architecture
- **Experimentation**: Test concepts and learn from the codebase
- **Share Your Work**: We'd love to see what you build with this foundation!

## � Future Contributions

### When Contributions Will Be Accepted

Public contributions will be welcomed once the project reaches:

- **Stable Core Architecture**: Engine fundamentals are solidified
- **Comprehensive Documentation**: All systems are properly documented
- **Clear Development Guidelines**: Established patterns and standards
- **Testing Framework**: Proper testing infrastructure in place
- **Example Games**: Multiple working examples demonstrating engine capabilities

### Planned Contribution Areas

When ready, contributions will be welcomed in:

**Code Contributions**
- **Bug Fixes**: Help improve stability and performance
- **New GameObjects**: Add new object types (Projectile, NPC, etc.)
- **New Room Types**: Create specialized room classes
- **Renderer Improvements**: Enhance Pixi.js integration
- **Engine Features**: Add new engine capabilities

**Documentation**
- **Code Examples**: Add more usage examples
- **Tutorials**: Write guides for specific features
- **API Documentation**: Improve code documentation
- **Architecture Guides**: Explain design decisions

**Testing & Quality**
- **Bug Reports**: Report issues with clear reproduction steps
- **Performance Testing**: Identify optimization opportunities
- **Cross-browser Testing**: Ensure compatibility
- **Code Reviews**: Help review pull requests

### Stay Updated

- **Watch the Repository**: Get notifications when contributions open
- **Check the README**: Status updates will be posted there
- **Follow Development**: Monitor the [Development Log](./history/DEV_LOG.md) for progress

## 🏗️ Development Information

*The following sections are for reference and future use when contributions are accepted.*

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Setup Steps
1. **Fork the repository** on GitHub (when contributions are open)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/dgc-engine.git
   cd dgc-engine
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Code Style Guidelines

### TypeScript Standards
- Use **strict TypeScript** settings
- Prefer **interfaces** over types for object shapes
- Use **descriptive variable names**
- Add **JSDoc comments** for public methods

### GameMaker Conventions
- **GameObjects** go in `src/game/gameobjects/`
- **Rooms** go in `src/game/rooms/`
- Use **GameMaker-style events** (CREATE, STEP, DRAW, DESTROY)
- Follow **PascalCase** for classes, **camelCase** for variables

### Example GameObject:
```typescript
export class NewGameObject extends GameObject {
  constructor(x: number, y: number) {
    super('NewGameObject', { x, y, visible: true })
    this.setupEvents()
  }

  private setupEvents(): void {
    this.addEventScript(GameEvent.CREATE, (self) => {
      // Initialization logic
    })

    this.addEventScript(GameEvent.STEP, (self) => {
      // Per-frame logic
    })
  }
}
```

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Follow code style** guidelines
4. **Write clear commit messages**

### Commit Message Format
```
type: Brief description

- Detailed change 1
- Detailed change 2
- Impact or benefit

Examples:
feat: Add Projectile GameObject with collision detection
fix: Resolve room transition memory leak
docs: Add tutorial for custom GameObjects
refactor: Improve renderer abstraction pattern
```

### Pull Request Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested in development environment
- [ ] No console errors
- [ ] Documentation updated if needed

## Related Issues
Fixes #(issue number)
```

## 🎮 GameMaker Architecture Guide

### Adding New GameObjects
1. Create file in `src/game/gameobjects/`
2. Extend `GameObject` base class
3. Use GameMaker-style events
4. Export in `gameobjects/index.ts`
5. Add documentation in `gameobjects/README.md`

### Adding New Rooms
1. Create file in `src/game/rooms/`
2. Extend `Room` base class
3. Implement room lifecycle events
4. Export in `rooms/index.ts`
5. Add to game in `Game.ts setupRooms()`

### Engine Modifications
1. Core engine files are in `src/engine/`
2. Maintain backward compatibility
3. Add comprehensive tests
4. Update engine documentation

## 📚 Learning Resources

### Understanding the Architecture
- **[Development Log](./history/DEV_LOG.md)** - Complete project evolution
- **[Engine Documentation](./history/ENGINE.md)** - Core architecture
- **[Room System Guide](./history/ROOM_SYSTEM.md)** - Room management

### GameMaker Concepts
- **Event-Driven Programming**: Objects respond to events
- **Room-Based Organization**: Games organized into rooms/levels
- **Object Lifecycle**: CREATE → STEP → DRAW → DESTROY
- **Inheritance Patterns**: Base classes with specialized behavior

## 🐛 Current Issue Reporting

### For Now
Since public contributions aren't being accepted yet:
- **Issues are primarily for tracking development progress**
- **Bug reports from users are still valuable for improving the project**
- **Feature suggestions are welcome for future consideration**

### Bug Reports
If you encounter issues, you can still report them:
- **Description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment** (browser, OS, Node.js version)
- **Screenshots** if applicable

### Feature Requests
Feel free to suggest features for future development:
- **Use case** for the feature
- **Proposed implementation** approach
- **Examples** of similar features in other engines
- **Benefits** to the project

*Note: Issues will be reviewed but may not receive immediate responses during early development.*

## 💬 Community

### Current Status
- **GitHub Issues**: For bug reports and feature suggestions (review only)
- **Documentation**: Comprehensive guides in `/history` folder for learning
- **Codebase**: Available for study and educational use

### When Contributions Open
- **GitHub Issues**: Technical discussions and bug reports
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and improvements

## 🙏 Recognition

When public contributions are accepted, contributors will be:
- **Listed** in project acknowledgments
- **Credited** in relevant documentation
- **Mentioned** in release notes for significant contributions

## 🚀 Future Vision

**DGC Engine** aims to become a flexible dream game engine for TypeScript developers - one that adapts to different development styles and project needs. While we're not accepting direct contributions during early development, **forks are actively encouraged**! 

### We Welcome Forks
- **Build Your Own Version**: Take this foundation and make it yours
- **Experiment Freely**: Try new features and architectural ideas  
- **Create Specialized Engines**: Adapt it for specific game types or needs
- **Educational Projects**: Use it as a learning platform
- **Show Us What You Build**: Share your creations - we'd love to see them!

Once the foundation is solid, direct contributions will help make this a valuable resource for the game development community.

Thank you for your interest! Whether you're studying the code, forking for your own projects, or waiting to contribute directly, you're part of this journey. 🎮
