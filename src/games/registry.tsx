import type { ComponentType } from 'react'
import AdditionGame from './addition/AdditionGame'
import MemoryMatchGame from './memory-match/MemoryMatchGame'
import TicTacToeGame from './tic-tac-toe/TicTacToeGame'

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
  {
    id: 'tic-tac-toe',
    title: 'Math Tic-Tac-Toe',
    description: 'Solve a square\'s addition problem to claim it. Three in a row wins!',
    emoji: '❌',
    component: TicTacToeGame,
  },
]
