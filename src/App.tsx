import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { games } from './games/registry'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {games.map((game) => {
        const GameComponent = game.component
        return (
          <Route
            key={game.id}
            path={`/games/${game.id}`}
            element={
              <div className="page">
                <Link className="back-link" to="/">
                  ← All games
                </Link>
                <GameComponent />
              </div>
            }
          />
        )
      })}
      <Route
        path="*"
        element={
          <div className="page">
            <p>Game not found.</p>
            <Link className="back-link" to="/">
              ← Back to all games
            </Link>
          </div>
        }
      />
    </Routes>
  )
}
