import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/style_level_01.css';

const SHOT_AUDIO = '/audio/shot.mp3';
const DUCK_AUDIO = '/audio/duck.mp3';
const GAME_AUDIO = '/audio/game.mp3';

const DUCKS_TO_KILL = 25;
const GAME_TIME = 3 * 60; // 10 minutes in seconds
const DUCKS_ON_SCREEN = 10;
const DUCK_SIZE_NORMAL = 100;
const DUCK_SIZE_ALIEN = 140;
const DUCK_SPEED_MIN = 1.5;
const DUCK_SPEED_MAX = 3.5;
const DUCK_VERTICAL_SPEED = 0.7;

function getRandomY() {
  const minY = 20;
  const maxY = window.innerHeight * 0.86 - DUCK_SIZE_NORMAL - 20;
  return Math.random() * (maxY - minY) + minY;
}

function getRandomVelocity(fromLeft) {
  const speed = Math.random() * (DUCK_SPEED_MAX - DUCK_SPEED_MIN) + DUCK_SPEED_MIN;
  const vx = fromLeft ? speed : -speed;
  const vy = (Math.random() - 0.5) * DUCK_VERTICAL_SPEED * 2;
  return { vx, vy };
}

function createDuck(id) {
  const fromLeft = Math.random() < 0.5;
  return {
    id,
    x: fromLeft ? -DUCK_SIZE_NORMAL : window.innerWidth,
    y: getRandomY(),
    ...getRandomVelocity(fromLeft),
    fromLeft,
    shot: false,
  };
}

function Level01() {
  const navigate = useNavigate();
  const location = useLocation();
  const alienMode = location.state && location.state.alienMode;
  const [killed, setKilled] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [paused, setPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [ducks, setDucks] = useState(() => Array.from({length: DUCKS_ON_SCREEN}, (_, i) => createDuck(i)));
  const duckIdRef = useRef(DUCKS_ON_SCREEN);
  const timerRef = useRef();
  const animRef = useRef();
  const playFieldRef = useRef();
  const [cursor, setCursor] = useState('crosshair');

  // Swap assets and theme for Alien mode
  const DUCK_IMAGE = alienMode ? '/img/alien.gif' : '/img/Duck.gif';
  const SHOT_IMAGE = '/img/shot.png';
  const PLAYFIELD_BG = alienMode ? "url('/img/space.jpg')" : "url('/img/Play_field.jpg')";
  const THEME_TEXT = alienMode ? 'Alien Invasion' : 'Ghosty Goose';
  const GAME_AUDIO_SRC = alienMode ? '/audio/alien-game.mp3' : GAME_AUDIO;
  const DUCK_AUDIO_SRC = alienMode ? '/audio/alien.mp3' : DUCK_AUDIO;
  const DUCK_SIZE = alienMode ? DUCK_SIZE_ALIEN : DUCK_SIZE_NORMAL;

  // Timer logic
  useEffect(() => {
    if (gameOver || win || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameOver, win, paused]);

  // Ducks movement logic
  useEffect(() => {
    if (gameOver || win || paused) return;
    let lastTime = performance.now();
    function animate(now) {
      const dt = Math.min((now - lastTime) / 16, 2); // ~60fps, cap delta
      lastTime = now;
      setDucks(prevDucks => prevDucks.map(duck => {
        let { x, y, vx, vy, fromLeft, id } = duck;
        x += vx * dt * 4; // speed multiplier for visible effect
        y += vy * dt * 4;
        // Bounce off top/bottom
        if (y < 0) {
          y = 0;
          vy = Math.abs(vy);
        } else if (y > window.innerHeight * 0.86 - DUCK_SIZE) {
          y = window.innerHeight * 0.86 - DUCK_SIZE;
          vy = -Math.abs(vy);
        }
        // Reverse direction if hit left/right edge
        if (x < -DUCK_SIZE) {
          x = -DUCK_SIZE;
          vx = Math.abs(vx);
          fromLeft = true;
        } else if (x > window.innerWidth) {
          x = window.innerWidth;
          vx = -Math.abs(vx);
          fromLeft = false;
        }
        // Occasionally change vy for more natural movement
        if (Math.random() < 0.01) {
          vy += (Math.random() - 0.5) * 0.7;
          vy = Math.max(Math.min(vy, DUCK_VERTICAL_SPEED), -DUCK_VERTICAL_SPEED);
        }
        return { id, x, y, vx, vy, fromLeft };
      }));
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameOver, win, paused]);

  // Pause menu logic (ESC key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPaused(p => !p);
        setShowPauseMenu(s => !s);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Play shot sound on any left mouse click
  useEffect(() => {
    if (paused) return;
    const handleShot = (e) => {
      if (e.button === 0) {
        const audio = new window.Audio(SHOT_AUDIO);
        audio.play().catch(err => {
          console.log('Audio play error (shot):', err);
        });
      }
    };
    window.addEventListener('mousedown', handleShot);
    return () => window.removeEventListener('mousedown', handleShot);
  }, [paused]);

  // Handle duck kill
  const handleDuck = useCallback((id) => {
    if (paused) return;
    const audio = new window.Audio(DUCK_AUDIO_SRC);
    audio.play().catch(err => {
      console.log('Audio play error (duck):', err);
    });
    setKilled(prev => {
      const next = prev + 1;
      if (next >= DUCKS_TO_KILL) {
        setWin(true);
        clearInterval(timerRef.current);
        cancelAnimationFrame(animRef.current);
      }
      return next;
    });
    // Set shot=true for this duck, then remove after 1 second
    setDucks(prevDucks => prevDucks.map(d => d.id === id ? { ...d, shot: true } : d));
    setTimeout(() => {
      setDucks(prevDucks => {
        const newDucks = prevDucks.filter(d => d.id !== id);
        newDucks.push(createDuck(duckIdRef.current++));
        return newDucks;
      });
    }, 1000);
  }, [paused]);

  const handleRestart = () => {
    setKilled(0);
    setGameOver(false);
    setWin(false);
    setTimeLeft(GAME_TIME);
    setPaused(false);
    setShowPauseMenu(false);
    duckIdRef.current = DUCKS_ON_SCREEN;
    setDucks(Array.from({length: DUCKS_ON_SCREEN}, (_, i) => createDuck(i)));
  };

  // Timer display
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  // Cursor change on left click
  useEffect(() => {
    if (paused || gameOver || win) return;
    const playField = playFieldRef.current;
    if (!playField) return;
    let timeoutId = null;
    const handleMouseDown = (e) => {
      if (e.button === 0) {
        setCursor(`url('/img/shot.png'), crosshair`);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setCursor('crosshair'), 1000);
      }
    };
    const handleMouseUp = (e) => {
      if (e.button === 0) {
        setCursor('crosshair');
      }
    };
    playField.addEventListener('mousedown', handleMouseDown);
    playField.addEventListener('mouseup', handleMouseUp);
    return () => {
      playField.removeEventListener('mousedown', handleMouseDown);
      playField.removeEventListener('mouseup', handleMouseUp);
      clearTimeout(timeoutId);
    };
  }, [paused, gameOver, win]);

  return (
    <>
      <audio autoPlay loop>
        <source src={GAME_AUDIO_SRC} type="audio/mpeg" />
      </audio>
      <section
        className="play_field"
        ref={playFieldRef}
        style={{ cursor, backgroundImage: PLAYFIELD_BG }}
      >
        {/* Top bar: Timer and Counter */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1em 2em',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: '2em',
          fontFamily: 'KoHo, Oswald, sans-serif',
          letterSpacing: '2px',
        }}>
          <div>Time: {minutes}:{seconds}</div>
          <div style={{fontWeight: 700}}>{THEME_TEXT}</div>
          <div>{alienMode ? 'Aliens' : 'Ducks'}: {killed} / {DUCKS_TO_KILL}</div>
        </div>
        <div className="play_field__sky" style={{position: 'relative', width: '100%', height: '86vh', overflow: 'hidden'}}>
          {!gameOver && !win && !paused && ducks.map(duck => (
            <div
              className="play_field__sky__duck"
              key={duck.id}
              style={{
                position: 'absolute',
                left: duck.x,
                top: duck.y,
                transition: 'none',
                zIndex: 10,
              }}
            >
              <input
                className="play_field__sky__duck__checkbox"
                type="checkbox"
                id={`duck_${duck.id}`}
                style={{display: 'none'}}
                onChange={() => handleDuck(duck.id)}
                disabled={duck.shot}
              />
              <label
                className={`play_field__sky__duck__label`}
                htmlFor={`duck_${duck.id}`}
                style={{cursor: duck.shot ? 'default' : 'pointer', display: 'block'}}
              >
                <img
                  className="play_field__sky__duck__label__img"
                  src={duck.shot ? SHOT_IMAGE : DUCK_IMAGE}
                  alt={duck.shot ? (alienMode ? 'Shot Alien' : 'Shot Duck') : (alienMode ? 'Alien' : 'Duck')}
                  style={{
                    width: DUCK_SIZE,
                    height: DUCK_SIZE,
                    userSelect: 'none',
                    transform: duck.fromLeft ? 'scaleX(1)' : 'scaleX(-1)',
                    opacity: duck.shot ? 0.8 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  draggable={false}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="play_field__land">
          {(gameOver || win) ? (
            <div style={{ textAlign: 'center', margin: '2em 0' }}>
              <h2 style={{ color: win ? '#0c0' : '#c00', fontSize: '2em' }}>
                {win ? 'You Win!' : 'Game Over!'}
              </h2>
              <button className="play_field__land__btn_box__button" onClick={handleRestart}>Play Again</button>
              <Link className="play_field__land__btn_box__button play_field__land__btn_box__link" to="/menu">Menu</Link>
            </div>
          ) : null}
        </div>
        {showPauseMenu && !gameOver && !win && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2em',
          }}>
            <div style={{marginBottom: '1em'}}>Paused</div>
            <button className="play_field__land__btn_box__button" onClick={() => { setPaused(false); setShowPauseMenu(false); }}>Resume</button>
            <button className="play_field__land__btn_box__button" onClick={handleRestart}>Restart</button>
            <Link className="play_field__land__btn_box__button play_field__land__btn_box__link" to="/menu">Menu</Link>
            <div style={{marginTop: '1em', fontSize: '0.7em'}}>Press ESC to resume</div>
          </div>
        )}
      </section>
    </>
  );
}

export default Level01;