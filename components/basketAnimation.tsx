import React from "react";
import Lottie from "lottie-react";
import animationData from "../lottie-Animation/basket.json"; // Adjust the path as needed

const BasketAnimation = ({ className }: { className?: string }) => {
  return <Lottie animationData={animationData} loop className={className} />;
};


export default BasketAnimation;
