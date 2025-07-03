import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/style_index.css';

function Index() {
  return (
    <div className="splash_screen">
      <div className="splash_screen__sticker">
        <h1 className="splash_screen__sticker__title">Ghosty<br />Goose</h1>
      </div>
      <div className="splash_screen__curtain">
        <div className="splash_screen__curtain__container">
          <Link
            className="splash_screen__curtain__container__btn_start"
            to="/menu"
            tabIndex={1}
            accessKey="1"
          >
            Start the game
          </Link>
          <p className="splash_screen__curtain__container__text_helper">Start the game</p>
        </div>
      </div>
    </div>
  );
}

export default Index; 