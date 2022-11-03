/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import "./App.css";
import PropTypes from "prop-types";

const MIN_STARS = 1;
const MAX_STARS = 10;

const StarsDisplay = (props) => {
  return (
    <>
      {utils.range(1, props.count).map((starId) => (
        <div key={starId} className="star" />
      ))}
    </>
  );
};

const PlayNumber = (props) => (
  <button
    className="number"
    style={{ backgroundColor: colors[props.status] }}
    onClick={() => {
      console.info(`Clicked number: %c${props.number}`, "color: yellow;");
      props.onClick(props.number, props.status);
    }}>
    {props.number}
  </button>
);

function GameStatusSwitch(gameStatus) {
  switch (gameStatus) {
    case "lost":
      return "Game Over!";
    case "won":
      new Audio("./audio/yeehaw.wav").play();
      return "Yeehaw!";
  }
}

const PlayAgain = (props) => (
  <div>
    <div className="gameOutcome" style={{ color: props.gameStatus === "lost" ? "red" : "green" }}>
      {GameStatusSwitch(props.gameStatus)}
    </div>
    <button onClick={props.onClick} className="playagain">
      PLAY AGAIN
    </button>
  </div>
);

const SplashImage = (props) => (
  <div className="splash fadeIn overlay" onClick={props.onClick}>
    <img src="./images/wild-west-JS-final.jpg" width="600px" alt="wild west" />
  </div>
);

const Game = (props) => {
  const [stars, setStars] = useState(utils.random(MIN_STARS, MAX_STARS));
  const [availableNumbers, setAvailableNumbers] = useState(utils.range(MIN_STARS, MAX_STARS));
  const [candidateNumbers, setCandidateNumbers] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (secondsLeft > 0 && availableNumbers.length > 0 && secondsLeft !== null) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }

    //console.info(`Rendering done`);
    //return () => console.info(`Component is about to rerender`);
  });

  const candidatesAreWrong = utils.sum(candidateNumbers) > stars;

  const gameStatus = availableNumbers.length === 0 ? "won" : secondsLeft === 0 ? "lost" : "active";

  const numberStatus = (number) => {
    if (!availableNumbers.includes(number)) {
      return "used";
    }

    if (candidateNumbers.includes(number)) {
      return candidatesAreWrong ? "wrong" : "candidate";
    }

    return "available";
  };

  const onNumberClick = (number, currentStatus) => {
    if (gameStatus !== "active" || currentStatus == "used") {
      return;
    }

    const newCadidateNumbers =
      currentStatus === "available"
        ? candidateNumbers.concat(number)
        : candidateNumbers.filter((cn) => cn !== number);

    if (utils.sum(newCadidateNumbers) !== stars) {
      setCandidateNumbers(newCadidateNumbers);
    } else {
      const newAvailableNumbers = availableNumbers.filter((n) => !newCadidateNumbers.includes(n));
      //redraw number of stars (from what's available)
      setStars(utils.randomSumIn(newAvailableNumbers, MAX_STARS));
      setAvailableNumbers(newAvailableNumbers);
      setCandidateNumbers([]);
    }
  };

  const resetGame = () => {
    let audio = new Audio("./audio/js-wild-west-intro.mp3");
    audio.play();

    setTimeout(() => {
      audio.pause();
    }, 2650);

    let splashScreen = document.querySelector(".splash");
    if (splashScreen) {
      splashScreen.classList.toggle("fadeOut");
      splashScreen.classList.toggle("hide");
    }

    setStars(utils.random(MIN_STARS, MAX_STARS));
    setAvailableNumbers(utils.range(MIN_STARS, MAX_STARS));
    setCandidateNumbers([]);
    setSecondsLeft(MAX_STARS + 10);
  };

  return (
    <div className="game">
      <div className="help">
        Howdy, pardner! Pick one or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {gameStatus !== "active" ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
            <StarsDisplay count={stars} />
          )}
        </div>
        <div className="right">
          {utils.range(MIN_STARS, MAX_STARS).map((number) => (
            <PlayNumber
              key={number}
              status={numberStatus(number)}
              number={number}
              onClick={onNumberClick}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="timer">
          Time Remaining: <div className="countDown">{secondsLeft}</div>
        </div>
        <button
          title="exit"
          type="reset"
          className="exit"
          onClick={() => {
            let splashScreen = document.querySelector(".splash");
            if (splashScreen) {
              splashScreen.classList.replace("fadeOut", "fadeIn");
              splashScreen.classList.toggle("hide");
            }
            resetGame();
          }}>
          EXIT THE SALOON
        </button>
      </div>
      <SplashImage onClick={resetGame} />
    </div>
  );
};

function JSWildWest() {
  const [gameId, setGameId] = useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
}

Game.propTypes = {
  startNewGame: PropTypes.func.isRequired,
};

StarsDisplay.propTypes = {
  count: PropTypes.number.isRequired,
};

PlayNumber.propTypes = {
  number: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

PlayAgain.propTypes = {
  onClick: PropTypes.func.isRequired,
  gameStatus: PropTypes.string.isRequired,
};

SplashImage.propTypes = {
  onClick: PropTypes.func.isRequired,
};

// Color Theme
const colors = {
  available: "lightgray",
  used: "lightgreen",
  wrong: "lightcoral",
  candidate: "deepskyblue",
};

const splashState = {
  fadedOut: "splash fadeIn overlay",
  fadedIn: "splash fadeOut overlay",
};

// Math science
const utils = {
  // Sum an array
  sum: (arr) => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};

export default JSWildWest;
