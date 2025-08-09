/**
 * GameMaker-style constants and keywords
 * Provides unquoted keywords like GameMaker Studio
 */

/**
 * GameMaker 'all' keyword - refers to all instances of all object types
 * Usage: instance_destroy(all) instead of instance_destroy('all')
 */
export const all = 'all' as const

/**
 * GameMaker 'noone' keyword - refers to no object (null/undefined)
 * Usage: if (target === noone) instead of if (target === null)
 */
export const noone = null

/**
 * Type for object type identifiers that can include the 'all' keyword
 */
export type ObjectTypeOrAll = string | typeof all

/**
 * Type for object references that can be an object, noone, or null
 * In GameMaker, noone and null are interchangeable for object references
 */
export type ObjectOrNoone<T = any> = T | typeof noone | null

/**
 * Other GameMaker constants could go here:
 */
// export const self = 'self' as const
// export const other = 'other' as const
