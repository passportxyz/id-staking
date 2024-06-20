// Overlay.js
import React from "react";

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const Overlay = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 blur-sm bg-white bg-opacity-50 flex items-center justify-center z-50 h-[400px] w-[600px]">
      <div className="bg-black pb-6 rounded-lg shadow-lg h-[400px] w-[600px]">
        <div className="flex justify-end pt-2 px-2">
          <button className="text-white h-6 w-6" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="px-6">
          <h2
            className="text-5xl font-semibold mb-4"
            style={{
              background: "linear-gradient(89.92deg, #C1F6FF 0.06%, #6CB6AD 103.26%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Identity Staking <br /> V2 Is Here!
          </h2>
          <p className="text-white text-xl mb-4">
            We are migrating to a new home. You <br /> can manage both new and old stakes <br /> in the new V2 staking
            app.
          </p>
          <button
            className="text-black px-4 py-2 rounded-md h-[50px] w-full"
            style={{
              background: "#C1F6FF",
            }}
          >
            <a href="https://stake.passport.xyz/#/home" className="text-black">
              Go to Identity Staking V2
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
