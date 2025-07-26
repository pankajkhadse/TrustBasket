import React from "react";
import Lottie from "lottie-react";
import animationData from "../lottie-Animation/verify.json"; // Adjust the path as needed

const VerifyAnimation = ({ className }: { className?: string }) => {
  return <Lottie animationData={animationData} loop className={className} />;
};


export default VerifyAnimation;
