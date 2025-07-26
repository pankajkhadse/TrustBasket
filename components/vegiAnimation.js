// components/vegiAnimation.js
import React from "react";
import Lottie from "lottie-react";
import animationData from "../lottie-Animation/vegiAnimation.json"; // Adjust the path as needed

const vegiAnimation = () => {
  return (
    <div className="w-64 h-64">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default vegiAnimation;
