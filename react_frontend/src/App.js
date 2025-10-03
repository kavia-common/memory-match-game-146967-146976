import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Memory Match Game - Ocean Professional Theme
 * - Centered grid of memory cards
 * - Score (moves, matches) and timer above grid
 * - Reset button
 * - Smooth card flip transitions, rounded corners, subtle gradients/shadows
 */

// PUBLIC_INTERFACE
function App() {
  /** Theme control (light only visually but allows toggling if desired) */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Deck configuration
  const baseIcons = useMemo(
    () => ['🐳', '🐠', '🐙', '🦀', '🐟', '🪼', '🦞', '🐬'],
    []
  );

  // Game state
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]); // indexes of currently flipped (max 2)
  const [matched, setMatched] = useState(new Set()); // indexes that are matched
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize deck
  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // PUBLIC_INTERFACE
  function newGame() {
    const duplicated = [...baseIcons, ...baseIcons];
    const shuffled = shuffle(duplicated).map((icon, i) => ({
      id: `${icon}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      icon,
    }));
    setDeck(shuffled);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setTimerActive(false);
    setIsBusy(false);
  }

  // PUBLIC_INTERFACE
  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // PUBLIC_INTERFACE
  function onCardClick(index) {
    if (isBusy) return;
    if (matched.has(index)) return;
    if (flipped.includes(index)) return;

    if (!timerActive) setTimerActive(true);

    const nextFlipped = [...flipped, index];

    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsBusy(true);
      setMoves((m) => m + 1);
      const [i1, i2] = nextFlipped;
      const isMatch = deck[i1].icon === deck[i2].icon;

      setTimeout(() => {
        if (isMatch) {
          const nextMatched = new Set(matched);
          nextMatched.add(i1);
          nextMatched.add(i2);
          setMatched(nextMatched);
          setMatches((prev) => prev + 1);
          setFlipped([]);
          setIsBusy(false);
          if (nextMatched.size === deck.length) {
            setTimerActive(false);
          }
        } else {
          setFlipped([]);
          setIsBusy(false);
        }
      }, 650);
    }
  }

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  const allMatched = matched.size === deck.length && deck.length > 0;

  return (
    <div className="ocean-app" data-theme={theme}>
      <TopNav theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
      <main className="container">
        <Header
          moves={moves}
          matches={matches}
          time={formattedTime}
          onReset={newGame}
          isComplete={allMatched}
        />
        <GameGrid
          deck={deck}
          flipped={flipped}
          matched={matched}
          onCardClick={onCardClick}
          isBusy={isBusy}
        />
        {allMatched && (
          <CompletionBanner
            moves={moves}
            time={formattedTime}
            onReset={newGame}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

// PUBLIC_INTERFACE
function TopNav({ theme, onToggleTheme }) {
  /** Top bar with brand and theme toggle */
  return (
    <nav className="topnav">
      <div className="brand">
        <span className="brand-bubble">🌊</span>
        <span className="brand-text">Ocean Match</span>
      </div>
      <button
        className="btn ghost small"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </nav>
  );
}

// PUBLIC_INTERFACE
function Header({ moves, matches, time, onReset, isComplete }) {
  /** Header with stats and reset button */
  return (
    <section className="panel">
      <div className="stats">
        <Stat label="Time" value={time} />
        <Stat label="Moves" value={moves} />
        <Stat label="Matches" value={matches} />
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onReset} aria-label="Reset game">
          {isComplete ? 'Play Again' : 'Reset'}
        </button>
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
function Stat({ label, value }) {
  /** Single stat pill */
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameGrid({ deck, flipped, matched, onCardClick, isBusy }) {
  /** Grid of memory cards */
  return (
    <section className={`grid ${isBusy ? 'busy' : ''}`} aria-busy={isBusy}>
      {deck.map((card, index) => {
        const isFlipped = flipped.includes(index) || matched.has(index);
        return (
          <Card
            key={card.id}
            icon={card.icon}
            flipped={isFlipped}
            disabled={matched.has(index)}
            onClick={() => onCardClick(index)}
          />
        );
      })}
    </section>
  );
}

// PUBLIC_INTERFACE
function Card({ icon, flipped, onClick, disabled }) {
  /** A single memory card with flip animation */
  return (
    <button
      className={`card ${flipped ? 'flipped' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={flipped ? `Revealed ${icon}` : 'Hidden card'}
    >
      <div className="card-inner">
        <div className="card-face card-back" aria-hidden={flipped}>
          {/* Back design */}
          <div className="ripple" />
          <span className="dot" />
        </div>
        <div className="card-face card-front" aria-hidden={!flipped}>
          <span className="icon">{icon}</span>
        </div>
      </div>
    </button>
  );
}

// PUBLIC_INTERFACE
function CompletionBanner({ moves, time, onReset }) {
  /** Banner displayed when game completes */
  return (
    <div className="banner">
      <div className="banner-content">
        <h2 className="banner-title">Great job!</h2>
        <p className="banner-subtitle">You matched all pairs.</p>
        <div className="banner-stats">
          <span className="pill">Time: {time}</span>
          <span className="pill">Moves: {moves}</span>
        </div>
        <button className="btn primary large" onClick={onReset}>
          Play Again
        </button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Footer() {
  /** Minimal footer */
  return (
    <footer className="footer">
      <span className="muted">Ocean Professional • Memory Match</span>
    </footer>
  );
}

export default App;
