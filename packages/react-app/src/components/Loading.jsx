import React from "react";
import ReactLoading from "react-loading";

const Loading = () => {
  return (
    <div className="flex flex-1 items-center justify-center my-10">
      <ReactLoading type="bubbles" color="#000" />
    </div>
  );
};

export default Loading;
