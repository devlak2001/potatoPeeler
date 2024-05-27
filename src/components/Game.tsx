import { useEffect, useRef, useState } from "react";
import "../styles/Minigame.scss";
import { LeavePopup } from "./popups/LeavePopup";
import { preloadImages } from "../utils/preloadImages";
import {
  FetchUserAttributesOutput,
  fetchUserAttributes,
} from "aws-amplify/auth";

import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const quadraticBezier = (
  start: number,
  control: number,
  end: number,
  t: number
) =>
  Math.pow(1 - t, 2) * start + 2 * (1 - t) * t * control + Math.pow(t, 2) * end;

export type MiniGameProps = {
  //   setShowMinigame: (show: boolean) => void;
  //   setShowMainMenu: (show: boolean) => void;
};

export default function Game({ signOut, scores }: any) {
  // const miniGameTimerRef = useRef<NodeJS.Timer>();

  const gameWrapper = useRef<HTMLDivElement>(null);

  const gamePausedRef = useRef<boolean>(false);
  const [gamePuased, setGamePaused] = useState(false);
  const timePaused = useRef(0);
  const lastPauseTimestamp = useRef(Date.now());
  const [userInfo, setUserInfo] = useState<FetchUserAttributesOutput | null>(
    null
  );

  const [homeBtnClicked, setHomeBtnClicked] = useState(false);
  const [exitBtnClicked, setExitBtnClicked] = useState(false);
  const [infoBtnClicked] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [lives, setLives] = useState(5);

  const [score, setScore] = useState("000");
  const potatoesNumberStartValue = 0;
  const potatoesNumberRef = useRef(potatoesNumberStartValue);
  const [potatoesNumber, setPotatoesNumber] = useState(
    potatoesNumberRef.current.toString()
  );

  //   useEffect(() => {
  //     preloadImages(images);
  //   }, []);

  //   useEffect(() => {
  //     if (showSignUp) {
  //       setAnimateSignUp(true);
  //     }
  //   }, [showSignUp]);

  useEffect(() => {
    preloadImages([
      "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/leavePopupBkg.png",
      "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/wormy.png",
    ]);
    (async () => {
      const attributes = await fetchUserAttributes();
      console.log(attributes);
      setUserInfo(attributes);
    })();
  }, []);

  useEffect(() => {
    if (lives === 0 && userInfo) {
      (async () => {
        setGameEnded(true);
        if (scores.some((record: any) => record.email === userInfo.email)) {
          const foundUser = scores.find(
            (record: any) => record.email === userInfo.email
          );
          if (foundUser.score < score) {
            await client.models.Score.update({
              id: foundUser.id,
              score: Number(score),
            });
		window.location.reload();
          } else {
		  window.location.reload();
	  }
          console.log("User Found");
        } else {
          console.log("User Not Found");
          await client.models.Score.create({
            email: userInfo.email,
            username: userInfo.preferred_username,
            score: Number(score),
          });
          window.location.reload();
        }
      })();
    }
  }, [lives, userInfo, scores, score]);

  useEffect(() => {
    let start = Date.now(),
      potatoFallingDuration = 10000,
      potatoRows: NodeListOf<HTMLElement> | null = null;

    const peelers: NodeListOf<HTMLElement> =
      gameWrapper.current!.querySelectorAll(".peelers div");

    const checkHorizontal = () => {
      if (window.innerWidth > window.innerHeight) {
        gamePausedRef.current = true;
        lastPauseTimestamp.current = Date.now();
        setGamePaused(() => true);
      }
    };

    window.addEventListener("resize", checkHorizontal);

    // This prevents zoom
    document.addEventListener("gesturestart", (e) => {
      e.preventDefault();
    });

    // This is how we check if game is gamePausedRef
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !gamePausedRef.current) {
        gamePausedRef.current = true;
        lastPauseTimestamp.current = Date.now();
        setGamePaused(true);
      }
    });

    // This is how we check if game is gamePausedRef
    window.addEventListener("blur", () => {
      if (!gamePausedRef.current) {
        gamePausedRef.current = true;
        lastPauseTimestamp.current = Date.now();
        setGamePaused(true);
      }
    });

    const peelersOffsetTop = (gameWrapper.current!.querySelector(
      ".peelers"
    ) as HTMLElement)!.offsetTop;
    const peelersHeight =
      gameWrapper.current!.querySelector(".peelers")!.clientHeight;

    // console.log(peelersHeight);

    // function that gradually increased over time to other number, used here to increase speed of potatoes falling down
    const potatoSpeedIncrease = (
      start: number,
      end: number,
      duration: number
    ) => {
      const interval = 10;
      const steps = duration / interval;
      const stepValue = (end - start) / steps;

      let stepCount = 0;

      const transitionInterval = setInterval(() => {
        // we will not increase speed if the game is gamePausedRef
        if (!gamePausedRef.current) {
          potatoFallingDuration += stepValue;
          stepCount++;

          if (stepCount >= steps) {
            clearInterval(transitionInterval);
          }
        }
      }, interval);
    };

    potatoSpeedIncrease(potatoFallingDuration, 3500, 30000);

    const generatePotatoes = (elapsedTime: number) => {
      const potatoRow: HTMLElement = document.createElement("div");
      potatoRow.dataset.elapsedTime = elapsedTime.toString();
      potatoRow.className = "potatoRow";
      potatoRow.style.bottom = `${window.innerHeight}px`;

      // Here it is randomly decided how many potatoes will be generated in one potatoRow
      const numPotatoes = Math.random() < 0.5 ? 1 : 2;
      const columns = [1, 2, 3];
      for (let i = 0; i < 3; i++) {
        // Here we chose the random column to which we will add the potato
        const randomIndex = Math.floor(Math.random() * columns.length);

        if (i < numPotatoes) {
          const potato = document.createElement("div");
          potato.style.gridColumn = `${columns[randomIndex]}`;
          potato.dataset.column = `${columns[randomIndex]}`;
          potato.className = "potato";
          potatoRow.append(potato);

          // Here we decrease the number of potatoes that are left
          // I am using both ref value and set function because we are trying not to use state variable directly inside this effect because then we have to add it to dependency array
          potatoesNumberRef.current++;
          setPotatoesNumber(
            potatoesNumberRef.current.toString().padStart(3, "0")
          );
        } else {
          const stone = document.createElement("div");
          stone.style.gridColumn = `${columns[randomIndex]}`;
          stone.dataset.column = `${columns[randomIndex]}`;
          stone.className = "stone";
          potatoRow.append(stone);
        }

        // Here we remove the column index that was previously chosen, so in the next iteration of for loop, we can't randomly chose the same column
        columns.splice(randomIndex, 1);
      }
      gameWrapper.current!.prepend(potatoRow);
      potatoRows = gameWrapper.current!.querySelectorAll(".potatoRow");
    };

    // function that handles touchstart event on minigame screen
    const gameWrapperOnTouchStart = (e: any) => {
      // There was some issues with touchstart event on google on iOS, so I added this and it fixed it
      e.preventDefault();

      const currentTarget = e.target;
      // In this if statement, we check if user touched potato, and if the potato that was touched is on the cutting board
      if (
        ((currentTarget as HTMLElement).classList.contains("potato") ||
          (currentTarget as HTMLElement).classList.contains("stone")) &&
        (currentTarget as HTMLElement).getBoundingClientRect().top +
          (currentTarget as HTMLElement).clientHeight >
          peelersOffsetTop &&
        (currentTarget as HTMLElement).getBoundingClientRect().top <
          peelersOffsetTop + peelersHeight
      ) {
        // Sound.potatoTapSound.play();
        (currentTarget as HTMLElement).classList.add("clicked");
        peelers[
          parseInt((currentTarget as HTMLElement).dataset.column!) - 1
        ].classList.remove("peeling");
        // Here we are using setTimeout that basically triggers instantly just so we can re-trigger CSS animation, because just changing animation property alone won't do anything
        setTimeout(() => {
          peelers[
            parseInt((currentTarget as HTMLElement).dataset.column!) - 1
          ].classList.add("peeling");
        }, 0);

        const scoreIncrementIndicator = document.createElement("div");
        if ((currentTarget as HTMLElement).classList.contains("potato")) {
          scoreIncrementIndicator.textContent = `+${10}`;
          scoreIncrementIndicator.className = "scoreIncrementIndicator";
        } else {
          scoreIncrementIndicator.textContent = `-${1}`;
          scoreIncrementIndicator.className = "livesDecrementIndicator";
        }

        gameWrapper.current!.append(scoreIncrementIndicator);

        if (e.type === "touchstart") {
          // Handle touchstart event
          scoreIncrementIndicator.style.top = `${
            e.changedTouches[0].clientY -
            scoreIncrementIndicator.clientHeight / 2
          }px`;
          scoreIncrementIndicator.style.left = `${
            e.changedTouches[0].clientX -
            scoreIncrementIndicator.clientWidth / 2
          }px`;
        } else if (e.type === "mousedown") {
          scoreIncrementIndicator.style.top = `${
            e.clientY - scoreIncrementIndicator.clientHeight / 2
          }px`;
          scoreIncrementIndicator.style.left = `${
            e.clientX - scoreIncrementIndicator.clientWidth / 2
          }px`;
        }

        // Here we are using setTimeout that basically triggers instantly just so we can re-trigger CSS transition, because just changing CSS property alone won't do anything
        setTimeout(() => {
          const clockwise = Math.random() < 0.5 ? 1 : -1;
          scoreIncrementIndicator.style.transform = `translateY(-${
            100 + randomIntFromInterval(0, 50)
          }%) scale(${1 + randomIntFromInterval(0, 50) / 100}) rotate(${
            clockwise * Math.floor(Math.random() * 45)
          }deg)`;
          scoreIncrementIndicator.style.opacity = "0";
        }, 0);

        // removing this element from the dom because after there is too much elements added to the DOM, game starts to lag
        setTimeout(() => {
          gameWrapper.current!.removeChild(scoreIncrementIndicator);
        }, 500);

        //Score calulation
        if ((currentTarget as HTMLElement).classList.contains("potato")) {
          setScore((score) => (Number(score) + 10).toFixed(0).padStart(3, "0"));
          if (e.type === "touchstart") {
            // Handle touchstart event
            generateFries(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY,
              "potato"
            );
          } else if (e.type === "mousedown") {
            generateFries(e.clientX, e.clientY, "potato");
          }
        } else {
          setLives((lives) => lives - 1);
          if (e.type === "touchstart") {
            // Handle touchstart event
            generateFries(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY,
              "stone"
            );
          } else if (e.type === "mousedown") {
            generateFries(e.clientX, e.clientY, "stone");
          }
        }
      } else {
        const scoreIncrementIndicator = document.createElement("div");
        scoreIncrementIndicator.textContent = "-5";
        scoreIncrementIndicator.className = "scoreIncrementIndicator";

        gameWrapper.current!.append(scoreIncrementIndicator);

        if (e.type === "touchstart") {
          // Handle touchstart event
          scoreIncrementIndicator.style.top = `${
            e.changedTouches[0].clientY -
            scoreIncrementIndicator.clientHeight / 2
          }px`;
          scoreIncrementIndicator.style.left = `${
            e.changedTouches[0].clientX -
            scoreIncrementIndicator.clientWidth / 2
          }px`;
        } else if (e.type === "mousedown") {
          scoreIncrementIndicator.style.top = `${
            e.clientY - scoreIncrementIndicator.clientHeight / 2
          }px`;
          scoreIncrementIndicator.style.left = `${
            e.clientX - scoreIncrementIndicator.clientWidth / 2
          }px`;
        }

        // Here we are using setTimeout that basically triggers instantly just so we can re-trigger CSS transition, because just changing CSS property alone won't do anything
        setTimeout(() => {
          const clockwise = Math.random() < 0.5 ? 1 : -1;
          scoreIncrementIndicator.style.transform = `translateY(-${
            100 + randomIntFromInterval(0, 50)
          }%) scale(${1 + randomIntFromInterval(0, 50) / 100}) rotate(${
            clockwise * Math.floor(Math.random() * 45)
          }deg)`;
          scoreIncrementIndicator.style.opacity = "0";
        }, 0);

        setTimeout(() => {
          gameWrapper.current!.removeChild(scoreIncrementIndicator);
        }, 500);

        setScore((score) =>
          Math.max(0, Number(score) - 5)
            .toString()
            .padStart(3, "0")
        );
      }
    };

    gameWrapper.current!.addEventListener(
      "touchstart",
      gameWrapperOnTouchStart
    );
    gameWrapper.current!.addEventListener("mousedown", gameWrapperOnTouchStart);

    // function that generates fries that fall down if you succeed in cutting potato
    const generateFries = (x: number, y: number, type: string) => {
      const documentFragment = document.createDocumentFragment();
      for (let i = 0; i < 10; i++) {
        const generatedFry = document.createElement("img");
        generatedFry.src =
          type === "potato"
            ? "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fry.png"
            : "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/stoneFragment.svg";
        generatedFry.className = "generatedFry";
        documentFragment.appendChild(generatedFry);

        generatedFry.style.transform = `rotate(${randomIntFromInterval(
          0,
          360
        )}deg)`;

        const randomX = randomIntFromInterval(x - 25, x + 25);

        animateElementInArc(
          generatedFry,
          randomX,
          randomIntFromInterval(y - 25, y + 25),
          randomIntFromInterval(randomX - 25, randomX + 25),
          window.innerHeight,
          750
        );
      }
      gameWrapper.current!.appendChild(documentFragment);
    };

    // function that animates element to move in arc-like path, it adds more motion and randomness to the animation
    const animateElementInArc = (
      element: HTMLElement,
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      duration: number
    ) => {
      const controlX = startX;
      const controlY = randomIntFromInterval(startY - 100, startY);

      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentX = quadraticBezier(startX, controlX, endX, progress);
        const currentY = quadraticBezier(startY, controlY, endY, progress);

        element.style.top = currentY + "px";
        element.style.left = currentX + "px";

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // removing this element from the DOM because after there is too much elements added to the DOM, game starts to lag
          gameWrapper.current!.removeChild(element);
        }
      };

      animate();
    };

    const potatoesFalling = () => {
      if (!gamePausedRef.current) {
        // We need to subtract the time the game was paused, because that's ho we will get how much time really passed in the game since game started. This is important because we use this elapsed time value to update position of the potatoes
        // I will refactor speeding of the game soon
        const elapsed = Date.now() - start - timePaused.current;

        // Here we go through each potatoRow and update their position
        potatoRows!.forEach((el: HTMLElement) => {
          const value =
            (elapsed - Number(el.dataset.elapsedTime)) / potatoFallingDuration;
          if (value < 1) {
            el.style.bottom = `${
              window.innerHeight -
              peelersHeight * 0.2 -
              32 -
              (window.innerHeight + peelersHeight * 1.2) * value
            }px`;
          }
        });

        // Here we check if potatoRow that is closes to top of the screen is fully visible, if it is, we generate another potatoRow
        if (potatoRows![0].offsetTop > peelersHeight * 0.8) {
          // We are adding elapsedTime to generated potatoRow, so we can use that value later for animating each potatoRow differently
          generatePotatoes(elapsed);
        }

        // Here we remove potatoRow if it is out of screen, we always check the last element in potatoRows array, cuz they are always closest to bottom of the screen
        if (
          potatoRows![potatoRows!.length - 1].offsetTop > window.innerHeight
        ) {
          gameWrapper.current!.removeChild(potatoRows![potatoRows!.length - 1]);
          potatoRows = gameWrapper.current!.querySelectorAll(".potatoRow");

          // Here we check if there are no more potatoRows after potatoRow is removed
        }
      }
      if (potatoRows?.length) {
        requestAnimationFrame(potatoesFalling);
      } else {
        setGameEnded(true);
      }
    };

    // Here we are generating the initial potatoRow
    generatePotatoes(0);
    requestAnimationFrame(potatoesFalling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={`minigame ${animateOut ? "animateOut" : ""}`}
        style={{ pointerEvents: lives === 0 ? "none" : "all" }}
      >
        <img
          className="conveyorBelt"
          src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/conveyorBelt.png"
          alt=""
        />
        <img
          className="conveyorBeltMask"
          src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/conveyorBeltMask.png"
          alt=""
        />
        <img
          className="fryer"
          src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryer.png"
          alt=""
        />
        <img
          className="fryerMask"
          src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryerMask.png"
          alt=""
        />

        <div className="topBar">
          <button
            className="homeButton"
            onClick={() => {
              gamePausedRef.current = true;
              lastPauseTimestamp.current = Date.now();
              setHomeBtnClicked(true);
            }}
            onTouchStart={(e) => {
              e.currentTarget.classList.add("interactedWith");
              e.currentTarget.classList.add("touchstart");
            }}
            onTouchEnd={(e) => {
              e.currentTarget.classList.remove("touchstart");
            }}
          >
            <svg
              fill="#000000"
              height="800px"
              width="800px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 489.533 489.533"
            >
              <g>
                <path
                  d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9
		l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6
		c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6
		C49.575,418.961,150.875,501.261,268.175,488.161z"
                />
              </g>
            </svg>
          </button>
          {/* <button
            className="infoButton"
            onClick={() => {
              gamePausedRef.current = true;
              lastPauseTimestamp.current = Date.now();
              setInfoBtnClicked(true);
            }}
            onTouchStart={(e) => {
              e.currentTarget.classList.add("interactedWith");
              e.currentTarget.classList.add("touchstart");
            }}
            onTouchEnd={(e) => {
              e.currentTarget.classList.remove("touchstart");
            }}
          >
            <svg
              width="5"
              height="17"
              viewBox="0 0 5 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.31055 8.10156L2.31055 15.0756"
                stroke="#1D1D1B"
                strokeWidth="3.48701"
                strokeLinecap="round"
              />
              <circle
                cx="2.31041"
                cy="2.28893"
                r="1.35927"
                fill="#1D1D1B"
                stroke="#1D1D1B"
                strokeWidth="0.906182"
              />
            </svg>
          </button> */}
          <div className={`potatoesNumber`}>
            <img
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/potatoNumberBkg.png"
              alt=""
              className="bkg"
            />
            <img
              className="potato"
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/potato.png"
              alt=""
            />
            <div
              className={`digitsWrapper ${
                potatoesNumber.length === 4 ? "fourDigits" : ""
              }`}
            >
              <AnimatedNumber number={potatoesNumber} />
            </div>
          </div>
          <div className="score">
            <img
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryNumberBkg.png"
              alt=""
              className="bkg"
            />
            <img
              className="fries"
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fries.png"
              alt=""
            />
            <div
              className={`digitsWrapper ${
                score.length === 4 ? "fourDigits" : ""
              }`}
            >
              <AnimatedNumber number={score} />
            </div>
          </div>
          <div className="lives">
            <img
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryNumberBkg.png"
              alt=""
              className="bkg"
            />
            <img
              className="heart"
              src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/heart.png"
              alt=""
            />
            <div className={`digitsWrapper`}>
              <AnimatedNumber number={lives.toString()} />
            </div>
          </div>
          <button
            className="exitButton"
            onClick={() => {
              gamePausedRef.current = true;
              lastPauseTimestamp.current = Date.now();
              setExitBtnClicked(true);
            }}
            onTouchStart={(e) => {
              e.currentTarget.classList.add("interactedWith");
              e.currentTarget.classList.add("touchstart");
            }}
            onTouchEnd={(e) => {
              e.currentTarget.classList.remove("touchstart");
            }}
          >
            <svg
              fill="#000000"
              height="800px"
              width="800px"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 330 330"
            >
              <g id="XMLID_2_">
                <path
                  id="XMLID_4_"
                  d="M51.213,180h173.785c8.284,0,15-6.716,15-15s-6.716-15-15-15H51.213l19.394-19.393
		c5.858-5.857,5.858-15.355,0-21.213c-5.856-5.858-15.354-5.858-21.213,0L4.397,154.391c-0.348,0.347-0.676,0.71-0.988,1.09
		c-0.076,0.093-0.141,0.193-0.215,0.288c-0.229,0.291-0.454,0.583-0.66,0.891c-0.06,0.09-0.109,0.185-0.168,0.276
		c-0.206,0.322-0.408,0.647-0.59,0.986c-0.035,0.067-0.064,0.138-0.099,0.205c-0.189,0.367-0.371,0.739-0.53,1.123
		c-0.02,0.047-0.034,0.097-0.053,0.145c-0.163,0.404-0.314,0.813-0.442,1.234c-0.017,0.053-0.026,0.108-0.041,0.162
		c-0.121,0.413-0.232,0.83-0.317,1.257c-0.025,0.127-0.036,0.258-0.059,0.386c-0.062,0.354-0.124,0.708-0.159,1.069
		C0.025,163.998,0,164.498,0,165s0.025,1.002,0.076,1.498c0.035,0.366,0.099,0.723,0.16,1.08c0.022,0.124,0.033,0.251,0.058,0.374
		c0.086,0.431,0.196,0.852,0.318,1.269c0.015,0.049,0.024,0.101,0.039,0.15c0.129,0.423,0.28,0.836,0.445,1.244
		c0.018,0.044,0.031,0.091,0.05,0.135c0.16,0.387,0.343,0.761,0.534,1.13c0.033,0.065,0.061,0.133,0.095,0.198
		c0.184,0.341,0.387,0.669,0.596,0.994c0.056,0.088,0.104,0.181,0.162,0.267c0.207,0.309,0.434,0.603,0.662,0.895
		c0.073,0.094,0.138,0.193,0.213,0.285c0.313,0.379,0.641,0.743,0.988,1.09l44.997,44.997C52.322,223.536,56.161,225,60,225
		s7.678-1.464,10.606-4.394c5.858-5.858,5.858-15.355,0-21.213L51.213,180z"
                />
                <path
                  id="XMLID_5_"
                  d="M207.299,42.299c-40.944,0-79.038,20.312-101.903,54.333c-4.62,6.875-2.792,16.195,4.083,20.816
		c6.876,4.62,16.195,2.794,20.817-4.083c17.281-25.715,46.067-41.067,77.003-41.067C258.414,72.299,300,113.884,300,165
		s-41.586,92.701-92.701,92.701c-30.845,0-59.584-15.283-76.878-40.881c-4.639-6.865-13.961-8.669-20.827-4.032
		c-6.864,4.638-8.67,13.962-4.032,20.826c22.881,33.868,60.913,54.087,101.737,54.087C274.956,287.701,330,232.658,330,165
		S274.956,42.299,207.299,42.299z"
                />
              </g>
            </svg>
          </button>
        </div>
        <div className="potatoGame" ref={gameWrapper}>
          <div className="peelers">
            <div>
              <img
                className="knife"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/knife.png"
                alt=""
              />
              <img
                className="cuttingBoard"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/cuttingBoard.png"
                alt=""
              />
            </div>
            <div>
              <img
                className="knife"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/knife.png"
                alt=""
              />
              <img
                className="cuttingBoard"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/cuttingBoard.png"
                alt=""
              />
            </div>
            <div>
              <img
                className="knife"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/knife.png"
                alt=""
              />
              <img
                className="cuttingBoard"
                src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/cuttingBoard.png"
                alt=""
              />
            </div>
          </div>
        </div>
        {homeBtnClicked && (
          <LeavePopup
            stayButtonOnClick={() => {
              setTimeout(() => {
                gamePausedRef.current = false;
                timePaused.current += Date.now() - lastPauseTimestamp.current;
                setHomeBtnClicked(false);
                setGamePaused(false);
              }, 250);
            }}
            text={
              <>
                <div className="text2">wanna try again?</div>
                <div className="text3">You sure about this?</div>
              </>
            }
            leaveBtnText={"RESTART"}
            leaveButtonOnClick={() => {
              setTimeout(() => {
                window.location.reload();
              }, 250);
            }}
          />
        )}
        {exitBtnClicked && (
          <LeavePopup
            stayButtonOnClick={() => {
              setTimeout(() => {
                gamePausedRef.current = false;
                timePaused.current += Date.now() - lastPauseTimestamp.current;
                setGamePaused(false);
                setExitBtnClicked(false);
              }, 250);
            }}
            text={
              <>
                <div className="text2">wanna log out?</div>
                <div className="text3">You sure about this?</div>
              </>
            }
            leaveBtnText={"LOG OUT"}
            leaveButtonOnClick={() => {
              setAnimateOut(true);
              signOut();
              window.location.reload();
            }}
          />
        )}
        {infoBtnClicked && (
          <></>
          //   <MakeFriesPopup
          //     stayButtonOnClick={() => {
          //       setTimeout(() => {
          //         gamePausedRef.current = false;
          //         timePaused.current += Date.now() - lastPauseTimestamp.current;
          //         setInfoBtnClicked(false);
          //         setGamePaused(false);
          //       }, 250);
          //     }}
          //   />
        )}
        {gamePuased &&
          !gameEnded &&
          !infoBtnClicked &&
          !homeBtnClicked &&
          !exitBtnClicked && (
            <LeavePopup
              stayButtonOnClick={() => {
                setTimeout(() => {
                  gamePausedRef.current = false;
                  timePaused.current += Date.now() - lastPauseTimestamp.current;
                  setHomeBtnClicked(false);
                  setGamePaused(false);
                }, 250);
              }}
              text={
                <>
                  <div className="text2">wanna try again?</div>
                  <div className="text3">You sure about this?</div>
                </>
              }
              leaveBtnText={"RESTART"}
              leaveButtonOnClick={() => {
                setAnimateOut(true);
                setTimeout(() => {
                  window.location.reload();
                }, 250);
              }}
            />
          )}
        {gameEnded && (
          <>
            <div className="endGame"></div>
          </>
        )}
        <div className="username">{}</div>
      </div>
    </>
  );
}

const AnimatedNumber = ({ number }: { number: string }) => {
  return (
    <>
      {Array.from(number).map((digit: any, index: number) => (
        <div
          key={`digit-${index}`}
          className="digits"
          style={{
            transform: `translateY(-${(digit / 10) * 100}%)`,
          }}
        >
          <div>
            <span>0</span>
          </div>
          <div>
            <span>1</span>
          </div>
          <div>
            <span>2</span>
          </div>
          <div>
            <span>3</span>
          </div>
          <div>
            <span>4</span>
          </div>
          <div>
            <span>5</span>
          </div>
          <div>
            <span>6</span>
          </div>
          <div>
            <span>7</span>
          </div>
          <div>
            <span>8</span>
          </div>
          <div>
            <span>9</span>
          </div>
        </div>
      ))}
    </>
  );
};
