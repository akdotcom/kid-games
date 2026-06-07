import { Link } from 'react-router-dom'
import { games } from '../games/registry'

export default function Home() {
  return (
    <>
      <header className="site-header">
        <h1>🎮 Kid Games</h1>
        <p>Pick a game and have fun!</p>
      </header>
      <main className="page">
        <div className="game-grid">
          {games.map((game) => (
            <Link
              key={game.id}
              className="game-card"
              to={`/games/${game.id}`}
            >
              <div className="emoji">{game.emoji}</div>
              <h2>{game.title}</h2>
              <p>{game.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
