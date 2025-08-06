import { GameObject, GameEvent } from '../engine'

/**
 * Item class that extends GameObject
 * Provides collectible items with various effects
 */
export class Item extends GameObject {
  constructor(x: number, y: number, itemType: string = 'coin', value: number = 10) {
    super('Item', { x, y })
    
    // Set item properties
    this.solid = false // Items don't block movement
    this.visible = true
    this.setVariable('itemType', itemType)
    this.setVariable('value', value)
    this.setVariable('bobOffset', Math.random() * Math.PI * 2)
    this.setVariable('collected', false)
    
    // Set item-specific properties based on type
    this.setItemProperties(itemType, value)
    
    this.setupItemEvents()
  }

  private setItemProperties(itemType: string, value: number): void {
    switch (itemType) {
      case 'coin':
        this.setVariable('value', value || 10)
        this.setVariable('effect', 'score')
        break
      case 'gem':
        this.setVariable('value', value || 25)
        this.setVariable('effect', 'score')
        break
      case 'health_potion':
        this.setVariable('value', value || 20)
        this.setVariable('effect', 'heal')
        break
      case 'key':
        this.setVariable('value', value || 1)
        this.setVariable('effect', 'key')
        break
      case 'powerup':
        this.setVariable('value', value || 30)
        this.setVariable('effect', 'powerup')
        break
      default:
        this.setVariable('value', value || 10)
        this.setVariable('effect', 'score')
    }
  }

  private setupItemEvents(): void {
    // Create event
    this.addEventScript(GameEvent.CREATE, (self) => {
      console.log(`${self.getVariable('itemType')} created at`, self.getPosition())
    })

    // Step event for visual effects
    this.addEventScript(GameEvent.STEP, (self) => {
      // Bobbing animation
      let bobOffset = self.getVariable('bobOffset')
      bobOffset += 0.1
      self.setVariable('bobOffset', bobOffset)
      
      // Check for player collision manually since items aren't solid
      this.checkPlayerCollision(self)
    })

    // Destroy event
    this.addEventScript(GameEvent.DESTROY, (self) => {
      const itemType = self.getVariable('itemType')
      console.log(`${itemType} destroyed`)
    })
  }

  private checkPlayerCollision(self: GameObject): void {
    if (self.getVariable('collected')) return
    
    // In a full implementation, you'd use the engine's collision system
    // For now, this is a simplified check
    // You would typically query the engine for nearby players:
    // const players = engine.getObjectsNear(self.getPosition(), 1, 'Player')
    
    // Placeholder for collision detection
    // This would be handled by the collision system in a full implementation
  }

  /**
   * Collect this item (called by player or collision system)
   */
  public collect(collector: GameObject): boolean {
    if (this.getVariable('collected')) return false
    
    this.setVariable('collected', true)
    
    const itemType = this.getVariable('itemType')
    const value = this.getVariable('value')
    const effect = this.getVariable('effect')
    
    console.log(`${itemType} collected by ${collector.objectType}!`)
    
    // Apply item effect to collector
    this.applyEffect(collector, effect, value)
    
    // Destroy the item
    this.destroy()
    
    return true
  }

  private applyEffect(collector: GameObject, effect: string, value: number): void {
    switch (effect) {
      case 'score':
        if (typeof (collector as any).addScore === 'function') {
          (collector as any).addScore(value)
        } else {
          // Fallback: add to a score variable
          const currentScore = collector.getVariable('score') || 0
          collector.setVariable('score', currentScore + value)
        }
        console.log(`+${value} score!`)
        break
        
      case 'heal':
        if (typeof (collector as any).heal === 'function') {
          (collector as any).heal(value)
        } else {
          // Fallback: add to health variable
          const currentHealth = collector.getVariable('health') || 0
          const maxHealth = collector.getVariable('maxHealth') || 100
          collector.setVariable('health', Math.min(maxHealth, currentHealth + value))
        }
        console.log(`+${value} health!`)
        break
        
      case 'key':
        const keys = collector.getVariable('keys') || 0
        collector.setVariable('keys', keys + value)
        console.log(`+${value} key!`)
        break
        
      case 'powerup':
        // Apply temporary powerup
        collector.setVariable('powered_up', true)
        collector.setTimer('powerup_duration', 10000) // 10 seconds
        console.log('Power up activated!')
        break
        
      default:
        console.log(`Unknown item effect: ${effect}`)
    }
  }

  // Public methods for external interaction
  public getItemType(): string {
    return this.getVariable('itemType') || 'unknown'
  }

  public getValue(): number {
    return this.getVariable('value') || 0
  }

  public isCollected(): boolean {
    return this.getVariable('collected') || false
  }

  public getBobOffset(): number {
    return this.getVariable('bobOffset') || 0
  }

  /**
   * Static factory methods for creating specific item types
   */
  static createCoin(x: number, y: number, value: number = 10): Item {
    return new Item(x, y, 'coin', value)
  }

  static createGem(x: number, y: number, value: number = 25): Item {
    return new Item(x, y, 'gem', value)
  }

  static createHealthPotion(x: number, y: number, healAmount: number = 20): Item {
    return new Item(x, y, 'health_potion', healAmount)
  }

  static createKey(x: number, y: number): Item {
    return new Item(x, y, 'key', 1)
  }

  static createPowerup(x: number, y: number, value: number = 30): Item {
    return new Item(x, y, 'powerup', value)
  }
}
