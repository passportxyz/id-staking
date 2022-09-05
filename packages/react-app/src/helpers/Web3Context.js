import React, { useCallback, useEffect, useState, useRef, useMemo, createContext } from "react";

const startingState = {
  setAddress: () => {},
  address: undefined,
  currentNetwork: "",
  setCurrentNetwork: () => {},
  roundInView: 1,
  setRoundInView: () => {},
};

// create our app context
export const Web3Context = createContext(startingState);

export function Web3Provider({ children, network = "localhost", DEBUG = false, NETWORKCHECK = true, ...props }) {
  const [address, setAddress] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [roundInView, setRoundInView] = useState(1);

  const stateMemo = useMemo(
    () => ({
      address,
      currentNetwork,
      roundInView,
    }),
    [address, currentNetwork, roundInView],
  );

  // use props as a way to pass configuration values
  const providerProps = {
    address,
    setAddress,
    currentNetwork,
    setCurrentNetwork,
    roundInView,
    setRoundInView,
  };

  return <Web3Context.Provider value={providerProps}>{children}</Web3Context.Provider>;
}
