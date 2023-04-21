import React, { useContext } from "react";
import { Web3Context } from "../helpers/Web3Context";

const ROUNDS = {
  Alpha: { roundId: 1 },
  Beta: { roundId: 2 },
};

const RoundSelector = () => {
  const { roundInView, setRoundInView } = useContext(Web3Context);
  return (
    <select className="px-2 py-1" value={roundInView} onChange={e => setRoundInView(e.target.value)}>
      {Object.entries(ROUNDS).map(([name, { roundId }]) => (
        <option value={roundId} key={roundId}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default RoundSelector;
