import type { ComponentType } from 'react'
import AdditionGame from './addition/AdditionGame'
import MemoryMatchGame from './memory-match/MemoryMatchGame'

export interface Game {
  /** URL slug, used in the route path. */
  id: string
  title: string
  description: string
  emoji: string
  component: ComponentType
}

/**
 * Add new games here and they automatically appear on the home page
 * and get their own route.
 */
export const games: Game[] = [
  {
    id: 'addition',
    title: 'Beat the Clock: Addition',
    description: 'Solve 10 single-digit addition problems before time runs out!',
    emoji: '➕',
    component: AdditionGame,
  },
  {
    id: 'memory-match',
    title: 'Memory Math Match',
    description: 'Flip cards to match addition problems with their answers!',
    emoji: '🧠',
    component: MemoryMatchGame,
  },
]
