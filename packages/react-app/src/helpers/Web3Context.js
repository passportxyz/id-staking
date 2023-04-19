import React, { useState, useMemo, createContext } from "react";

const CURRENT_ROUND = process.env.REACT_APP_CURRENT_ROUND || 1;

// Context starting state
const startingState = {
  setAddress: string => {},
  address: undefined,
  currentNetwork: "",
  setCurrentNetwork: () => {},
  roundInView: CURRENT_ROUND,
  setRoundInView: () => {},
  setLoggedIn: boolean => {},
  loggedIn: false,
};

// create our app context
export const Web3Context = createContext(startingState);

export function Web3Provider({ children, network = "localhost", DEBUG = false, NETWORKCHECK = true, ...props }) {
  const [address, setAddress] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [roundInView, setRoundInView] = useState(CURRENT_ROUND);
  const [loggedIn, setLoggedIn] = useState(false);

  const providerProps = {
    address,
    setAddress,
    currentNetwork,
    setCurrentNetwork,
    roundInView,
    setRoundInView,
    setLoggedIn,
    loggedIn,
  };

  return <Web3Context.Provider value={providerProps}>{children}</Web3Context.Provider>;
}
