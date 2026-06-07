import { useCallback, useEffect, useRef, useState } from 'react'
import './AdditionGame.css'

const TIME_LIMIT = 10 // seconds allowed per problem
const TARGET = 10 // correct answers needed to win

type Status = 'ready' | 'playing' | 'won' | 'lost'

interface Problem {
  a: number
  b: number
}

function randomDigit() {
  // Single digit 0-9.
  return Math.floor(Math.random() * 10)
}

function newProblem(): Problem {
  return { a: randomDigit(), b: randomDigit() }
}

export default function AdditionGame() {
  const [status, setStatus] = useState<Status>('ready')
  const [problem, setProblem] = useState<Problem>(newProblem)
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [feedback, setFeedback] = useState<'none' | 'wrong'>('none')

  const inputRef = useRef<HTMLInputElement>(null)

  const startGame = useCallback(() => {
    setSolved(0)
    setProblem(newProblem())
    setAnswer('')
    setTimeLeft(TIME_LIMIT)
    setFeedback('none')
    setStatus('playing')
  }, [])

  // Countdown timer: runs only while playing. Each new problem resets it
  // (because timeLeft is set back to TIME_LIMIT when a problem is solved).
  useEffect(() => {
    if (status !== 'playing') return
    if (timeLeft <= 0) {
      setStatus('lost')
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [status, timeLeft])

  // Keep focus on the input while playing.
  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status, problem])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== 'playing') return

    const value = Number(answer)
    if (answer.trim() === '' || Number.isNaN(value)) return

    if (value === problem.a + problem.b) {
      const nowSolved = solved + 1
      setSolved(nowSolved)
      setAnswer('')
      setFeedback('none')
      if (nowSolved >= TARGET) {
        setStatus('won')
      } else {
        setProblem(newProblem())
        setTimeLeft(TIME_LIMIT) // fresh 10 seconds for the next problem
      }
    } else {
      // Wrong answer: give feedback and let them try again before time runs out.
      setFeedback('wrong')
      setAnswer('')
    }
  }

  return (
    <div className="addition-game">
      <h1>➕ Beat the Clock</h1>

      {status === 'ready' && (
        <div className="panel">
          <p className="rules">
            Solve <strong>{TARGET}</strong> addition problems to win. You get{' '}
            <strong>{TIME_LIMIT} seconds</strong> for each one — answer fast!
          </p>
          <button onClick={startGame}>Start</button>
        </div>
      )}

      {status === 'playing' && (
        <div className="panel">
          <div className="hud">
            <span className="score">
              Solved: {solved} / {TARGET}
            </span>
            <span className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
              ⏱ {timeLeft}s
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
            />
          </div>

          <div className="problem">
            {problem.a} + {problem.b} =
          </div>

          <form onSubmit={submit} className="answer-form">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              aria-label="Your answer"
              autoFocus
            />
            <button type="submit">Go</button>
          </form>

          {feedback === 'wrong' && (
            <p className="feedback wrong">Not quite — try again!</p>
          )}
        </div>
      )}

      {status === 'won' && (
        <div className="panel result">
          <p className="big">🎉 You win!</p>
          <p>You solved all {TARGET} problems in time. Great job!</p>
          <button onClick={startGame}>Play again</button>
        </div>
      )}

      {status === 'lost' && (
        <div className="panel result">
          <p className="big">⏰ Time's up!</p>
          <p>
            You solved {solved} of {TARGET}. Want to try again?
          </p>
          <button onClick={startGame}>Try again</button>
        </div>
      )}
    </div>
  )
}
