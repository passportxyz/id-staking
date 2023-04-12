import React, { useContext } from "react";
import { Web3Context } from "../helpers/Web3Context";

const ROUNDS = {
  alpha: { roundId: 1 },
  beta: { roundId: 2 },
};

const RoundSelector = () => {
  const { roundInView, setRoundInView } = useContext(Web3Context);
  return (
    <div>
      Choose a Round:
      <select className="ml-2 mt-6" value={roundInView} onChange={e => setRoundInView(e.target.value)}>
        {Object.entries(ROUNDS).map(([name, { roundId }]) => (
          <option value={roundId} key={roundId}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoundSelector;
