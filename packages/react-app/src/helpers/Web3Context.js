import React, { useState, useMemo, createContext } from "react";

// Context starting state
const startingState = {
  setAddress: string => {},
  address: undefined,
  currentNetwork: "",
  setCurrentNetwork: () => {},
  roundInView: 1,
  setRoundInView: () => {},
  setLoggedIn: boolean => {},
  loggedIn: false,
};

// create our app context
export const Web3Context = createContext(startingState);

export function Web3Provider({ children, network = "localhost", DEBUG = false, NETWORKCHECK = true, ...props }) {
  const [address, setAddress] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [roundInView, setRoundInView] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);

  const stateMemo = useMemo(
    () => ({
      address,
      currentNetwork,
      roundInView,
      loggedIn,
    }),
    [address, currentNetwork, roundInView, loggedIn],
  );

  // use props as a way to pass configuration values
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
