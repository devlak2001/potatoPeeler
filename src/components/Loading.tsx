import { useEffect, useState } from "react";
import "../styles/Loading.scss";

const images = [
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fry.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/conveyorBelt.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/conveyorBeltMask.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryer.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryerMask.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/potatoNumberBkg.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/potato.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryNumberBkg.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fries.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/knife.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/cuttingBoard.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/bkg.png",
  "https://devlak2001.s3.eu-central-1.amazonaws.com/potatoPeeler/game/fryPointsBkg.png",
];

export const Loading = ({ setShowGame }: any) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [spinnerMinTimePassed, setSpinnerMinTimePassed] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSpinnerMinTimePassed(true);
    }, 1000);

    const loadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      try {
        await Promise.all(images.map((img) => loadImage(img)));
        // Perform your desired action here
        setImagesLoaded(true);
      } catch (err) {
        console.error("An error occurred while loading the images", err);
      }
    };

    loadAllImages();
  }, []);

  useEffect(() => {
    if (imagesLoaded && spinnerMinTimePassed) {
      setShowGame(true);
    }
  }, [imagesLoaded, spinnerMinTimePassed]);

  return (
    <>
      {(!imagesLoaded || !spinnerMinTimePassed) && (
        <div className="spinnerWrapper">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
};
