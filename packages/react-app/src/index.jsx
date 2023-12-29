import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Web3Provider } from "./helpers/Web3Context";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const targetNetwork = "goerli";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

// const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";
const subgraphUri =
  process.env.REACT_APP_SUBGRAPH_URL || "https://api.thegraph.com/subgraphs/name/moonshotcollective/id-staking";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Web3Provider network={targetNetwork}>
        <ApolloProvider client={client}>
          <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
            <App subgraphUri={subgraphUri} />
          </ThemeSwitcherProvider>
        </ApolloProvider>
      </Web3Provider>
    </QueryClientProvider>
  </BrowserRouter>,
);
