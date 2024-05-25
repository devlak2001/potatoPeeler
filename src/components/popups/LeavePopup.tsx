import { useEffect, useState } from "react";
import "../../styles/Popups.scss";

export const LeavePopup = ({
  link,
  leaveButtonOnClick,
  stayButtonOnClick,
  text,
  leaveBtnText,
}: any) => {
  const [mounted, setMounted] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div
        className={`leavePopupWrapper ${mounted ? "animateIn" : ""} ${
          animateOut ? "animateOut" : ""
        }`}
      >
        <div className="popup">
          <img
            src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/leavePopupBkg.png"
            alt=""
            className="bkg"
          />
          <div className="text1">Whoa!</div>
          {text}
          <button
            className="primaryButton"
            onClick={() => {
              setAnimateOut(true);
              stayButtonOnClick();
            }}
            onTouchStart={(e) => {
              e.currentTarget.classList.add("interactedWith");
              e.currentTarget.classList.add("touchstart");
            }}
            onTouchEnd={(e) => {
              e.currentTarget.classList.remove("touchstart");
            }}
          >
            <span>STAY</span>
          </button>
          {link ? (
            <a className="leaveButton" href={link}>
              LEAVE
            </a>
          ) : (
            <button
              className="leaveButton"
              onClick={() => {
                setAnimateOut(true);
                if (leaveButtonOnClick) {
                  leaveButtonOnClick();
                }
              }}
            >
              {leaveBtnText}
            </button>
          )}

          <img
            src="https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/popups/wormy.png"
            alt=""
            className="wormy"
          />
        </div>
      </div>
    </>
  );
};
