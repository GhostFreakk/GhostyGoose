import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/style_menu.css';

function Menu() {
  const [alienMode, setAlienMode] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <audio autoPlay loop>
        <source src="/audio/menu.mp3" type="audio/mpeg" />
      </audio>
      <section className="play_field">
        <div className="play_field__ticker">
          <p className="play_field__ticker__text">
            <span className="play_field__ticker__text__letter-01">G</span>
            <span className="play_field__ticker__text__letter-02">h</span>
            <span className="play_field__ticker__text__letter-03">o</span>
            <span className="play_field__ticker__text__letter-04">s</span>
            <span className="play_field__ticker__text__letter-05">t</span>
            <span className="play_field__ticker__text__letter-06">y</span>
            <span className="play_field__ticker__text__letter-07">G</span>
            <span className="play_field__ticker__text__letter-08">o</span>
            <span className="play_field__ticker__text__letter-09">o</span>
            <span className="play_field__ticker__text__letter-10">s</span>
            <span className="play_field__ticker__text__letter-11">e</span>
            <span className="play_field__ticker__text__letter-12">&nbsp;</span>
            <span className="play_field__ticker__text__letter-01">m</span>
            <span className="play_field__ticker__text__letter-02">a</span>
            <span className="play_field__ticker__text__letter-03">d</span>
            <span className="play_field__ticker__text__letter-04">e</span>
            <span className="play_field__ticker__text__letter-05">&nbsp;</span>
            <span className="play_field__ticker__text__letter-06">b</span>
            <span className="play_field__ticker__text__letter-07">y</span>
            <span className="play_field__ticker__text__letter-08">&nbsp;</span>
            <span className="play_field__ticker__text__letter-09">A</span>
            <span className="play_field__ticker__text__letter-10">h</span>
            <span className="play_field__ticker__text__letter-11">m</span>
            <span className="play_field__ticker__text__letter-12">e</span>
            <span className="play_field__ticker__text__letter-01">d</span>
            <span className="play_field__ticker__text__letter-02">&nbsp;</span>
            <span className="play_field__ticker__text__letter-03">S</span>
            <span className="play_field__ticker__text__letter-04">h</span>
            <span className="play_field__ticker__text__letter-05">a</span>
            <span className="play_field__ticker__text__letter-06">f</span>
            <span className="play_field__ticker__text__letter-07">i</span>
            <span className="play_field__ticker__text__letter-08">q</span>
          </p>
        </div>
        <div className="play_field__main">
          <div className="play_field__main__menu">
            <button
              className="play_field__main__menu__level"
              style={{ marginBottom: '1em', background: alienMode ? '#222' : '#eee', color: alienMode ? '#0ff' : '#222', border: '2px solid #0ff', borderRadius: '1em', fontWeight: 'bold' }}
              onClick={() => setAlienMode(m => !m)}
            >
              {alienMode ? 'Alien Mode: ON' : 'Alien Mode: OFF'}
            </button>
            <button
              className="play_field__main__menu__level"
              onClick={() => navigate('/level-01', { state: { alienMode } })}
              tabIndex={1}
              accessKey="1"
            >
              {alienMode ? 'Alien Invasion' : 'Level 1'}
            </button>
            <h1 className="play_field__main__sticker__title_mobile">Ghosty<br />Goose</h1>
          </div>
          <div className="play_field__main__sticker">
            <h1 className="play_field__main__sticker__title">Ghosty<br />Goose</h1>
          </div>
        </div>
      </section>
    </>
  );
}

export default Menu; 