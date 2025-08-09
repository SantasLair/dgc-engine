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
 * Type for object type identifiers that can include the 'all' keyword
 */
export type ObjectTypeOrAll = string | typeof all

/**
 * Other GameMaker constants could go here:
 */
// export const noone = null
// export const self = 'self' as const
// export const other = 'other' as const
