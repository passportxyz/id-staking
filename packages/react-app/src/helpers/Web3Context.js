import React, { useCallback, useEffect, useState, useRef, useMemo, createContext } from "react";

const startingState = {
  setAddress: () => {},
  address: undefined,
  currentNetwork: "",
  setCurrentNetwork: () => {},
};

// create our app context
export const Web3Context = createContext(startingState);

export function Web3Provider({ children, network = "localhost", DEBUG = false, NETWORKCHECK = true, ...props }) {
  const [address, setAddress] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");

  const stateMemo = useMemo(
    () => ({
      address,
      currentNetwork,
    }),
    [address, currentNetwork],
  );

  // use props as a way to pass configuration values
  const providerProps = {
    address,
    setAddress,
    currentNetwork,
    setCurrentNetwork,
  };

  return <Web3Context.Provider value={providerProps}>{children}</Web3Context.Provider>;
}
