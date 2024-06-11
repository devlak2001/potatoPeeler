import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../amplify/data/resource";
import "../styles/Leaderboard.scss";

const client = generateClient<Schema>();

export const Leaderboard = ({ userInfo }: any) => {
  const [scores, setScores] = useState<Schema["Score"]["type"][]>([]);

  const fetchScores = async () => {
    const { data: items } = await client.models.Score.list();
    console.log(items);
    setScores(items);
  };

  useEffect(() => {
    console.log(userInfo);
    fetchScores();
  }, []);

  return (
    <>
      <div className="leaderboard">
        <h1>GAME OVER</h1>
        <div className="wrapper">
          {scores
            .sort((a: any, b: any) => b.score - a.score)
            .map((el) => (
              <>
                <div
                  className={`${
                    userInfo.email === el.email ? "currentUser" : ""
                  }`}
                >
                  <span>{el.username}</span>
                  <span>{el.score}</span>
                </div>
              </>
            ))}
        </div>
        <button
          className="primaryButton"
          onClick={() => {
            window.location.reload();
          }}
          onTouchStart={(e) => {
            e.currentTarget.classList.add("interactedWith");
            e.currentTarget.classList.add("touchstart");
          }}
          onTouchEnd={(e) => {
            e.currentTarget.classList.remove("touchstart");
          }}
        >
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </>
  );
};
