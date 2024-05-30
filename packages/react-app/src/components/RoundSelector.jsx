import React, { useContext } from "react";
import { Web3Context } from "../helpers/Web3Context";

const ROUNDS = {
  "Alpha Round": { roundId: 1 },
  "Beta Round": { roundId: 2 },
  "Season 18": { roundId: 3 },
  "Season 19": { roundId: 4 },
  "Season 20": { roundId: 5 },
  "Season 21": { roundId: 6 },
  "Season 22": { roundId: 7 },
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
