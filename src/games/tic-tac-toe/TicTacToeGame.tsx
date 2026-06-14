import { useEffect, useMemo, useRef, useState } from 'react'
import './TicTacToeGame.css'

type Player = 'X' | 'O'
type Cell = Player | null

interface Equation {
  a: number
  b: number
  sum: number
}

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** Shuffle a copy of an array (Fisher–Yates). */
function shuffle<T>(items: T[]): T[] {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Build 9 addition equations whose sums are all different. We pick 9 distinct
 * target sums (2–18) and, for each, choose single-digit addends that add up to
 * it. Distinct sums mean a player can never reuse an answer from another square.
 */
function buildEquations(): Equation[] {
  const sums = shuffle(
    Array.from({ length: 17 }, (_, i) => i + 2), // 2..18
  ).slice(0, 9)

  return sums.map((sum) => {
    // Valid single-digit (0–9) addends for this sum.
    const lo = Math.max(0, sum - 9)
    const hi = Math.min(9, sum)
    const a = lo + Math.floor(Math.random() * (hi - lo + 1))
    return { a, b: sum - a, sum }
  })
}

function findWinner(board: Cell[]): { player: Player; line: number[] } | null {
  for (const line of LINES) {
    const [x, y, z] = line
    if (board[x] && board[x] === board[y] && board[y] === board[z]) {
      return { player: board[x] as Player, line }
    }
  }
  return null
}

export default function TicTacToeGame() {
  const [equations, setEquations] = useState<Equation[]>(buildEquations)
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null))
  const [current, setCurrent] = useState<Player>('X')
  const [selected, setSelected] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'none' | 'wrong'>('none')

  const inputRef = useRef<HTMLInputElement>(null)

  const result = useMemo(() => findWinner(board), [board])
  const isDraw = !result && board.every((c) => c !== null)
  const gameOver = !!result || isDraw

  // Focus the answer box whenever a square is picked.
  useEffect(() => {
    if (selected !== null) inputRef.current?.focus()
  }, [selected])

  const newGame = () => {
    setEquations(buildEquations())
    setBoard(Array(9).fill(null))
    setCurrent('X')
    setSelected(null)
    setAnswer('')
    setFeedback('none')
  }

  const pickSquare = (index: number) => {
    if (gameOver || board[index] !== null) return
    setSelected(index)
    setAnswer('')
    setFeedback('none')
  }

  const cancelSelection = () => {
    setSelected(null)
    setAnswer('')
    setFeedback('none')
  }

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected === null) return

    const value = Number(answer)
    if (answer.trim() === '' || Number.isNaN(value)) return

    if (value === equations[selected].sum) {
      const next = board.slice()
      next[selected] = current
      setBoard(next)
      setSelected(null)
      setAnswer('')
      setFeedback('none')
      // Only pass the turn if the move didn't already win the game.
      if (!findWinner(next)) {
        setCurrent((p) => (p === 'X' ? 'O' : 'X'))
      }
    } else {
      setFeedback('wrong')
      setAnswer('')
    }
  }

  const eq = selected !== null ? equations[selected] : null

  return (
    <div className="ttt-game">
      <h1>❌⭕ Math Tic-Tac-Toe</h1>

      {/* Turn banner — always shows clearly whose move it is. */}
      {!gameOver && (
        <div className={`turn-banner player-${current}`}>
          <span className="turn-mark">{current}</span>
          <span className="turn-text">Player {current}&apos;s turn</span>
        </div>
      )}

      {result && (
        <div className={`turn-banner result player-${result.player}`}>
          <span className="turn-mark">{result.player}</span>
          <span className="turn-text">🎉 Player {result.player} wins!</span>
        </div>
      )}

      {isDraw && (
        <div className="turn-banner result player-draw">
          <span className="turn-text">🤝 It&apos;s a draw!</span>
        </div>
      )}

      <p className="hint">
        Solve a square&apos;s addition problem to claim it. Every square has a
        different answer!
      </p>

      <div className={`board ${selected !== null ? 'choosing' : ''}`}>
        {board.map((cell, i) => {
          const isWinning = result?.line.includes(i)
          return (
            <button
              key={i}
              className={[
                'cell',
                cell ? `taken player-${cell}` : 'open',
                selected === i ? 'selected' : '',
                isWinning ? 'winning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => pickSquare(i)}
              disabled={gameOver || cell !== null}
              aria-label={
                cell
                  ? `Square taken by ${cell}`
                  : `Claim square: ${equations[i].a} plus ${equations[i].b}`
              }
            >
              {cell ? (
                <span className="piece">{cell}</span>
              ) : (
                <span className="equation">
                  {equations[i].a} + {equations[i].b}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {eq && !gameOver && (
        <form className={`answer-card player-${current}`} onSubmit={submitAnswer}>
          <p className="ask">
            Player <strong>{current}</strong>, what is{' '}
            <strong>
              {eq.a} + {eq.b}
            </strong>
            ?
          </p>
          <div className="answer-row">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              aria-label="Your answer"
            />
            <button type="submit">Claim</button>
            <button type="button" className="ghost" onClick={cancelSelection}>
              Cancel
            </button>
          </div>
          {feedback === 'wrong' && (
            <p className="feedback wrong">Not quite — try again!</p>
          )}
        </form>
      )}

      <button className="reset" onClick={newGame}>
        {gameOver ? 'Play again' : 'New game'}
      </button>
    </div>
  )
}
