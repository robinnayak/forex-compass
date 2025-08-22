"use client";
import Lottie from "lottie-react";
import animationData from "../../../public/Background looping animation.json";

const BackgroundAnimation = () => {
  const style: React.CSSProperties = {
    height: '100%',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: 'hidden',
  };

  return (
    <Lottie
      animationData={animationData}
      style={style}
      loop={true}
    />
  );
};

export default BackgroundAnimation;

