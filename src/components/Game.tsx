import { useEffect, useRef, useState } from "react";
import "../styles/Minigame.scss";
import { LeavePopup } from "./popups/LeavePopup";
import { preloadImages } from "../utils/preloadImages";

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

export default function Game(props: MiniGameProps) {
  // const miniGameTimerRef = useRef<NodeJS.Timer>();

  const gameWrapper = useRef<HTMLDivElement>(null);

  const gamePausedRef = useRef<boolean>(false);
  const [gamePuased, setGamePaused] = useState(false);
  const timePaused = useRef(0);
  const lastPauseTimestamp = useRef(Date.now());

  const [friesPopupSkipped, setFriesPopupSkipped] = useState(false);

  const [homeBtnClicked, setHomeBtnClicked] = useState(false);
  const [exitBtnClicked, setExitBtnClicked] = useState(false);
  const [infoBtnClicked, setInfoBtnClicked] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

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
    if (gameEnded && friesPopupSkipped) {
    }
  }, [gameEnded, friesPopupSkipped]);

  useEffect(() => {
    preloadImages([
      "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/leavePopupBkg.png",
      "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/wormy.png",
    ]);
  }, []);

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
      for (let i = 0; i < numPotatoes; i++) {
        // Here we chose the random column to which we will add the potato
        const randomIndex = Math.floor(Math.random() * columns.length);

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

        // Here we remove the column index that was previously chosen, so in the next iteration of for loop, we can't randomly chose the same column
        columns.splice(randomIndex, 1);
      }
      gameWrapper.current!.prepend(potatoRow);
      potatoRows = gameWrapper.current!.querySelectorAll(".potatoRow");
    };

    // function that handles touchstart event on minigame screen
    const gameWrapperOnTouchStart = (e: TouchEvent) => {
      // There was some issues with touchstart event on google on iOS, so I added this and it fixed it
      e.preventDefault();

      const currentTarget = e.target;
      // In this if statement, we check if user touched potato, and if the potato that was touched is on the cutting board
      if (
        (currentTarget as HTMLElement).classList.contains("potato") &&
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
        scoreIncrementIndicator.textContent = `+${10}`;
        scoreIncrementIndicator.className = "scoreIncrementIndicator";

        gameWrapper.current!.append(scoreIncrementIndicator);

        scoreIncrementIndicator.style.top = `${
          e.changedTouches[0].clientY - scoreIncrementIndicator.clientHeight / 2
        }px`;
        scoreIncrementIndicator.style.left = `${
          e.changedTouches[0].clientX - scoreIncrementIndicator.clientWidth / 2
        }px`;

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
        setScore((score) => (Number(score) + 10).toFixed(0).padStart(3, "0"));

        generateFries(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      } else {
        const scoreIncrementIndicator = document.createElement("div");
        scoreIncrementIndicator.textContent = "-5";
        scoreIncrementIndicator.className = "scoreIncrementIndicator";

        gameWrapper.current!.append(scoreIncrementIndicator);

        scoreIncrementIndicator.style.top = `${
          e.changedTouches[0].clientY - scoreIncrementIndicator.clientHeight / 2
        }px`;
        scoreIncrementIndicator.style.left = `${
          e.changedTouches[0].clientX - scoreIncrementIndicator.clientWidth / 2
        }px`;

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

    // function that generates fries that fall down if you succeed in cutting potato
    const generateFries = (x: number, y: number) => {
      const documentFragment = document.createDocumentFragment();
      for (let i = 0; i < 10; i++) {
        const generatedFry = document.createElement("img");
        generatedFry.src =
          "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fry.png";
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
              window.innerWidth * 0.115 -
              32 -
              (window.innerHeight + window.innerWidth / 3) * value
            }px`;
          }
        });

        // Here we check if potatoRow that is closes to top of the screen is fully visible, if it is, we generate another potatoRow
        if (potatoRows![0].offsetTop > peelersHeight * 1.2) {
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
      <div className={`minigame ${animateOut ? "animateOut" : ""}`}>
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
          {/* <button
            className="exitButton"
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
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.22091 6.58326L12.6463 2.15792C12.8563 1.94826 12.9744 1.66376 12.9747 1.367C12.9749 1.07024 12.8573 0.785534 12.6477 0.575509C12.438 0.365483 12.1535 0.247344 11.8567 0.247082C11.56 0.24682 11.2753 0.364456 11.0652 0.574111L6.6399 4.99945L2.21456 0.574111C2.00453 0.364085 1.71968 0.246094 1.42266 0.246094C1.12563 0.246094 0.840778 0.364085 0.630752 0.574111C0.420726 0.784137 0.302734 1.06899 0.302734 1.36601C0.302734 1.66304 0.420726 1.94789 0.630752 2.15792L5.0561 6.58326L0.630752 11.0086C0.420726 11.2186 0.302734 11.5035 0.302734 11.8005C0.302734 12.0975 0.420726 12.3824 0.630752 12.5924C0.840778 12.8024 1.12563 12.9204 1.42266 12.9204C1.71968 12.9204 2.00453 12.8024 2.21456 12.5924L6.6399 8.16707L11.0652 12.5924C11.2753 12.8024 11.5601 12.9204 11.8571 12.9204C12.1542 12.9204 12.439 12.8024 12.6491 12.5924C12.8591 12.3824 12.9771 12.0975 12.9771 11.8005C12.9771 11.5035 12.8591 11.2186 12.6491 11.0086L8.22091 6.58326Z"
                fill="#1D1D1B"
              />
            </svg>
          </button> */}
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
            leaveButtonOnClick={() => {
              setAnimateOut(true);
              setTimeout(() => {
                window.location.reload();
              }, 250);
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
              leaveButtonOnClick={() => {
                setAnimateOut(true);
                setTimeout(() => {
                  window.location.reload();
                }, 250);
              }}
            />
          )}
        {gameEnded && <></>}
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
