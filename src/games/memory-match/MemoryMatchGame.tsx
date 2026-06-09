import { useCallback, useEffect, useState } from 'react'
import './MemoryMatchGame.css'

const PAIRS = 6 // number of equation/answer pairs (PAIRS * 2 cards on the board)
const FLIP_BACK_DELAY = 1000 // ms a mismatched pair stays visible before flipping back

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

function randomDigit() {
  // Single digit 0-9.
  return Math.floor(Math.random() * 10)
}

// Fisher–Yates shuffle (returns a new array).
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Build a shuffled deck of PAIRS equation cards and their matching answer
 * cards. Sums are kept unique across pairs so every equation has exactly one
 * answer card it can match — no ambiguity for the player.
 */
function newDeck(): Card[] {
  const usedSums = new Set<number>()
  const cards: Card[] = []
  let nextId = 0

  for (let pairId = 0; pairId < PAIRS; pairId++) {
    let a = randomDigit()
    let b = randomDigit()
    // Re-roll until we get a sum we haven't used yet, so answers are unique.
    while (usedSums.has(a + b)) {
      a = randomDigit()
      b = randomDigit()
    }
    usedSums.add(a + b)

    cards.push({
      id: nextId++,
      pairId,
      type: 'equation',
      label: `${a} + ${b}`,
      matched: false,
    })
    cards.push({
      id: nextId++,
      pairId,
      type: 'answer',
      label: `${a + b}`,
      matched: false,
    })
  }

  return shuffle(cards)
}

export default function MemoryMatchGame() {
  const [status, setStatus] = useState<Status>('ready')
  const [cards, setCards] = useState<Card[]>(newDeck)
  // Ids of the (at most two) face-up cards that aren't yet matched.
  const [flipped, setFlipped] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)

  const startGame = useCallback(() => {
    setCards(newDeck())
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

  // Win when every pair has been matched.
  useEffect(() => {
    if (status === 'playing' && score === PAIRS) {
      setStatus('won')
    }
  }, [status, score])

  const handleCardClick = (card: Card) => {
    if (status !== 'playing') return
    if (card.matched) return
    if (flipped.includes(card.id)) return
    if (flipped.length === 2) return // wait for the current pair to resolve

    setFlipped((prev) => [...prev, card.id])
  }

  return (
    <div className="memory-game">
      <h1>🧠 Memory Math Match</h1>

      {status === 'ready' && (
        <div className="panel">
          <p className="rules">
            Flip cards two at a time to match each{' '}
            <strong>addition problem</strong> with its <strong>answer</strong>.
            Remember where the cards are! Match all <strong>{PAIRS}</strong>{' '}
            pairs to win.
          </p>
          <button onClick={startGame}>Start</button>
        </div>
      )}

      {status === 'playing' && (
        <>
          <div className="hud">
            <span className="score">⭐ Score: {score}</span>
            <span className="moves">Tries: {moves}</span>
          </div>

          <div className="card-grid">
            {cards.map((card) => {
              const isFaceUp = card.matched || flipped.includes(card.id)
              return (
                <button
                  key={card.id}
                  className={`card ${isFaceUp ? 'face-up' : ''} ${
                    card.matched ? 'matched' : ''
                  }`}
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
            You cleared all {PAIRS} pairs in {moves} tries. Great memory!
          </p>
          <button onClick={startGame}>Play again</button>
        </div>
      )}
    </div>
  )
}
