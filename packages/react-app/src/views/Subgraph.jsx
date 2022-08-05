import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";

function Subgraph(props) {
  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  return (
    <>
      <div style={{ width: "100%", margin: "auto", paddingBottom: 64 }}>
        <div style={{ margin: 32, height: 400, border: "1px solid #888888", minHeight: "80vh", textAlign: "left" }}>
          <GraphiQL fetcher={graphQLFetcher} docExplorerOpen />
        </div>
      </div>

      <div style={{ padding: 64 }}>...</div>
    </>
  );
}

export default Subgraph;
