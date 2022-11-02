/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import "./App.css";
import PropTypes from "prop-types";

const MIN_STARS = -5;
const MAX_STARS = 6;

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

const PlayAgain = (props) => (
  <button onClick={props.onClick} className="playagain">
    PLAY AGAIN
  </button>
);

function SplashImage() {
  return (
    <div
      className="splash fadeIn overlay"
      onClick={() => {
        let audio = new Audio("./audio/js-wild-west-intro.mp3");
        audio.play();

        setTimeout(() => {
          audio.pause();
        }, 2650);

        let splashScreen = document.querySelector(".splash");
        splashScreen.classList.toggle("fadeOut");
        splashScreen.classList.toggle("hide");
      }}>
      <img
        src="./images/wild-west-JS-final.jpg"
        width="600px"
        alt="wild west"
      />
    </div>
  );
}

function App() {
  const [stars, setStars] = useState(utils.random(MIN_STARS, MAX_STARS));
  const [availableNumbers, setAvailableNumbers] = useState(
    utils.range(MIN_STARS, MAX_STARS)
  );
  const [candidateNumbers, setCandidateNumbers] = useState([]);

  const candidatesAreWrong = utils.sum(candidateNumbers) > stars;
  const gameIsDone = availableNumbers.length === 1;

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
    if (currentStatus == "used") {
      return;
    }

    const newCadidateNumbers =
      currentStatus === "available"
        ? candidateNumbers.concat(number)
        : candidateNumbers.filter((cn) => cn !== number);

    if (utils.sum(newCadidateNumbers) !== stars) {
      setCandidateNumbers(newCadidateNumbers);
    } else {
      const newAvailableNumbers = availableNumbers.filter(
        (n) => !newCadidateNumbers.includes(n)
      );
      //redraw number of stars (from what's available)
      setStars(utils.randomSumIn(newAvailableNumbers, MAX_STARS));
      setAvailableNumbers(newAvailableNumbers);
      setCandidateNumbers([]);
    }
  };

  const resetGame = () => {
    setStars(utils.random(MIN_STARS, MAX_STARS));
    setAvailableNumbers(utils.range(MIN_STARS, MAX_STARS));
    setCandidateNumbers([]);
  };

  return (
    <div className="game">
      <div className="help">
        Howdy, pardner! Pick one or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {gameIsDone ? (
            <PlayAgain onClick={resetGame} />
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
        <div className="timer">Time Remaining: {MAX_STARS + 1}</div>
        <button
          title="exit"
          type="reset"
          className="exit"
          onClick={() => {
            let splashScreen = document.querySelector(".splash");
            splashScreen.classList.replace("fadeOut", "fadeIn");
            splashScreen.classList.toggle("hide");
            resetGame();
          }}>
          EXIT THE SALOON
        </button>
      </div>
      <SplashImage />
    </div>
  );
}

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
};

// Color Theme
// eslint-disable-next-line no-unused-vars
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

export default App;
