import React from "react";

const UnstakeButton = ({ amount = 0, handler }) => {
  const noBalance = parseInt(amount) === 0;

  return (
    <button
      onClick={noBalance ? null : handler}
      className={`flex md:max-w-button w-full justify-center text-white text-center border-0 py-2 focus:outline-none rounded-sm text-lg font-miriam-libre ${
        noBalance ? "bg-grayBtn" : "bg-dustRed"
      }`}
    >
      <span>{noBalance ? "Stake" : "Unstake All"}</span>
    </button>
  );
};

export default UnstakeButton;
