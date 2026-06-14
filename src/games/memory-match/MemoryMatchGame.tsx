import { useCallback, useEffect, useState } from 'react'
import './MemoryMatchGame.css'

const PAIRS = 6 // number of equation/answer pairs (PAIRS * 2 cards on the board)
const FLIP_BACK_DELAY = 1000 // ms a mismatched pair stays visible before flipping back
const WIN_DELAY = 1000 // ms to let the player see the final pair before celebrating

type Status = 'ready' | 'playing' | 'won'

interface Card {
  /** Unique id for this specific card. */
  id: number
  /** Cards that go together share a pairId (one equation + one answer). */
  pairId: number
  type: 'equation' | 'answer'
  /** What's printed on the face of the card. */
  label: string
  matched: boolean
}

interface Level {
  name: string
  build: () => Array<{ equation: string; answer: string }>
}

// Distinct color per matched pair, indexed by pairId. Chosen for accessibility
// on the light card background.
const PAIR_COLORS = [
  '#16a34a', // green
  '#2563eb', // blue
  '#db2777', // pink
  '#ea580c', // orange
  '#7c3aed', // purple
  '#0891b2', // cyan
]
const PAIR_BG_COLORS = [
  '#dcfce7',
  '#dbeafe',
  '#fce7f3',
  '#ffedd5',
  '#ede9fe',
  '#cffafe',
]

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function simplify(n: number, d: number): [number, number] {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1
  return [n / g, d / g]
}

/**
 * Repeatedly call `generate` until we have `count` pairs whose equations AND
 * answers are all distinct — that way every face-up card maps to exactly one
 * partner on the board.
 */
function buildUnique(
  generate: () => { equation: string; answer: string },
  count: number,
): Array<{ equation: string; answer: string }> {
  const seenAnswers = new Set<string>()
  const seenEquations = new Set<string>()
  const out: Array<{ equation: string; answer: string }> = []
  for (let attempts = 0; out.length < count && attempts < 2000; attempts++) {
    const pair = generate()
    if (seenAnswers.has(pair.answer) || seenEquations.has(pair.equation)) continue
    seenAnswers.add(pair.answer)
    seenEquations.add(pair.equation)
    out.push(pair)
  }
  return out
}

// Levels are ordered from easiest to hardest. Each builder returns PAIRS
// unique equation/answer pairs appropriate for that level.
const LEVELS: Level[] = [
  {
    name: 'Easy Addition',
    build: () =>
      buildUnique(() => {
        const a = randInt(0, 9)
        const b = randInt(0, 9)
        return { equation: `${a} + ${b}`, answer: `${a + b}` }
      }, PAIRS),
  },
  {
    name: 'Bigger Addition',
    build: () =>
      buildUnique(() => {
        const a = randInt(10, 50)
        const b = randInt(10, 50)
        return { equation: `${a} + ${b}`, answer: `${a + b}` }
      }, PAIRS),
  },
  {
    name: 'Subtraction',
    build: () =>
      buildUnique(() => {
        const a = randInt(10, 30)
        const b = randInt(1, a)
        return { equation: `${a} − ${b}`, answer: `${a - b}` }
      }, PAIRS),
  },
  {
    name: 'Mixed Add & Subtract',
    build: () =>
      buildUnique(() => {
        if (Math.random() < 0.5) {
          const a = randInt(20, 80)
          const b = randInt(10, 50)
          return { equation: `${a} + ${b}`, answer: `${a + b}` }
        }
        const a = randInt(30, 99)
        const b = randInt(1, a)
        return { equation: `${a} − ${b}`, answer: `${a - b}` }
      }, PAIRS),
  },
  {
    name: 'Easy Multiplication',
    build: () =>
      buildUnique(() => {
        const a = randInt(2, 5)
        const b = randInt(2, 9)
        return { equation: `${a} × ${b}`, answer: `${a * b}` }
      }, PAIRS),
  },
  {
    name: 'Times Tables',
    build: () =>
      buildUnique(() => {
        const a = randInt(3, 12)
        const b = randInt(3, 12)
        return { equation: `${a} × ${b}`, answer: `${a * b}` }
      }, PAIRS),
  },
  {
    name: 'Division',
    build: () =>
      buildUnique(() => {
        const b = randInt(2, 10)
        const q = randInt(2, 10)
        const a = b * q
        return { equation: `${a} ÷ ${b}`, answer: `${q}` }
      }, PAIRS),
  },
  {
    name: 'Equivalent Fractions',
    build: () =>
      buildUnique(() => {
        const d = randInt(2, 6)
        const n = randInt(1, d - 1)
        const m = randInt(2, 4)
        const [sn, sd] = simplify(n, d)
        return { equation: `${n * m}/${d * m}`, answer: `${sn}/${sd}` }
      }, PAIRS),
  },
  {
    name: 'Fraction Addition',
    build: () =>
      buildUnique(() => {
        const d = randInt(3, 8)
        const a = randInt(1, d - 2)
        const b = randInt(1, d - a)
        const [sn, sd] = simplify(a + b, d)
        return {
          equation: `${a}/${d} + ${b}/${d}`,
          answer: sd === 1 ? `${sn}` : `${sn}/${sd}`,
        }
      }, PAIRS),
  },
  {
    name: 'Fraction Multiplication',
    build: () =>
      buildUnique(() => {
        const a = randInt(1, 3)
        const b = randInt(2, 5)
        const c = randInt(1, 3)
        const d = randInt(2, 5)
        const [sn, sd] = simplify(a * c, b * d)
        return {
          equation: `${a}/${b} × ${c}/${d}`,
          answer: sd === 1 ? `${sn}` : `${sn}/${sd}`,
        }
      }, PAIRS),
  },
]

// Fisher–Yates shuffle (returns a new array).
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function newDeck(levelIndex: number): Card[] {
  const config = LEVELS[Math.min(levelIndex, LEVELS.length - 1)]
  const pairs = config.build()
  const cards: Card[] = []
  let nextId = 0
  pairs.forEach((p, pairId) => {
    cards.push({
      id: nextId++,
      pairId,
      type: 'equation',
      label: p.equation,
      matched: false,
    })
    cards.push({
      id: nextId++,
      pairId,
      type: 'answer',
      label: p.answer,
      matched: false,
    })
  })
  return shuffle(cards)
}

export default function MemoryMatchGame() {
  const [status, setStatus] = useState<Status>('ready')
  const [level, setLevel] = useState(0)
  const [cards, setCards] = useState<Card[]>(() => newDeck(0))
  // Ids of the (at most two) face-up cards that aren't yet matched.
  const [flipped, setFlipped] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)

  const startGame = useCallback((startLevel: number) => {
    setLevel(startLevel)
    setCards(newDeck(startLevel))
    setFlipped([])
    setScore(0)
    setMoves(0)
    setStatus('playing')
  }, [])

  // When two cards are flipped, check for a match. A pair matches when both
  // cards share a pairId (one equation + its answer).
  useEffect(() => {
    if (flipped.length !== 2) return

    const [firstId, secondId] = flipped
    const first = cards.find((c) => c.id === firstId)!
    const second = cards.find((c) => c.id === secondId)!

    setMoves((m) => m + 1)

    if (first.pairId === second.pairId) {
      // Match! Mark both cards as matched and clear the selection.
      setCards((prev) =>
        prev.map((c) =>
          c.pairId === first.pairId ? { ...c, matched: true } : c,
        ),
      )
      setScore((s) => s + 1)
      setFlipped([])
    } else {
      // No match: flip them back after a short delay so the player can see.
      const timer = setTimeout(() => setFlipped([]), FLIP_BACK_DELAY)
      return () => clearTimeout(timer)
    }
  }, [flipped, cards])

  // Win when every pair has been matched — but hold on the final pair for a
  // beat so the player sees it land before the celebration screen takes over.
  useEffect(() => {
    if (status === 'playing' && score === PAIRS) {
      const timer = setTimeout(() => setStatus('won'), WIN_DELAY)
      return () => clearTimeout(timer)
    }
  }, [status, score])

  const handleCardClick = (card: Card) => {
    if (status !== 'playing') return
    if (card.matched) return
    if (flipped.includes(card.id)) return
    if (flipped.length === 2) return // wait for the current pair to resolve

    setFlipped((prev) => [...prev, card.id])
  }

  const hasNextLevel = level < LEVELS.length - 1
  const currentLevelName = LEVELS[level].name

  return (
    <div className="memory-game">
      <h1>🧠 Memory Math Match</h1>

      {status === 'ready' && (
        <div className="panel">
          <p className="rules">
            Flip cards two at a time to match each{' '}
            <strong>math problem</strong> with its <strong>answer</strong>.
            Remember where the cards are! Match all <strong>{PAIRS}</strong>{' '}
            pairs to win. Clear a level to unlock the next, harder one.
          </p>
          <button onClick={() => startGame(0)}>Start</button>
        </div>
      )}

      {status === 'playing' && (
        <>
          <div className="hud">
            <span className="level">Level {level + 1}</span>
            <span className="score">⭐ {score}</span>
            <span className="moves">Tries: {moves}</span>
          </div>
          <p className="level-name">{currentLevelName}</p>

          <div className="card-grid">
            {cards.map((card) => {
              const isFaceUp = card.matched || flipped.includes(card.id)
              const pairStyle = card.matched
                ? ({
                    '--pair-color':
                      PAIR_COLORS[card.pairId % PAIR_COLORS.length],
                    '--pair-bg':
                      PAIR_BG_COLORS[card.pairId % PAIR_BG_COLORS.length],
                  } as React.CSSProperties)
                : undefined
              return (
                <button
                  key={card.id}
                  className={`card ${isFaceUp ? 'face-up' : ''} ${
                    card.matched ? 'matched' : ''
                  }`}
                  style={pairStyle}
                  onClick={() => handleCardClick(card)}
                  disabled={isFaceUp}
                  aria-label={isFaceUp ? card.label : 'Hidden card'}
                >
                  <span className="card-inner">
                    <span className="card-back">?</span>
                    <span className="card-front">{card.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {status === 'won' && (
        <div className="panel result">
          <p className="big">🎉 You matched them all!</p>
          <p>
            You cleared <strong>Level {level + 1}: {currentLevelName}</strong>{' '}
            in {moves} tries.
          </p>
          {hasNextLevel ? (
            <p className="next-hint">
              Ready for <strong>Level {level + 2}: {LEVELS[level + 1].name}</strong>?
            </p>
          ) : (
            <p className="next-hint">
              🏆 You finished every level! Replay any time to keep your skills sharp.
            </p>
          )}
          <div className="actions">
            {hasNextLevel && (
              <button onClick={() => startGame(level + 1)}>
                Next Level →
              </button>
            )}
            <button className="secondary" onClick={() => startGame(level)}>
              Play this level again
            </button>
            {level > 0 && (
              <button className="secondary" onClick={() => startGame(0)}>
                Back to Level 1
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
