import React from "react";
import { Button, Modal, Input, notification } from "antd";

export default function StakingDoneNotificationModal({ onClose, visible }) {
  return (
    <Modal
      visible={visible}
      okText={`Create a Passport`}
      closable={false}
      footer={[
        <div
          className="flex flex-row justify-center"
          style={{
            paddingTop: "10px",
            paddingBottom: "10px",
            height: "auto",
          }}
        >
          <Button
            onClick={() => {
              onClose();
            }}
            className="py-10 rounded"
            style={{
              paddingTop: "10px",
              paddingBottom: "10px",
              height: "auto",
              width: "170px",
            }}
          >
            Done
          </Button>
          <Button
            onClick={() => {
              window.location.replace("https://passport.gitcoin.co/");
            }}
            className="rounded"
            style={{
              backgroundColor: "#6F3FF5",
              color: "white",
              paddingTop: "10px",
              paddingBottom: "10px",
              height: "auto",
              width: "170px",
            }}
          >
            Go to Passport
          </Button>
        </div>,
      ]}
    >
      <div>
        <div className="flex flex-row justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#F0EBFF" />
            <path
              transform="translate(14,14)"
              d="M7.00012 10L9.00012 12L13.0001 8M5.83486 2.69705C6.55239 2.63979 7.23358 2.35763 7.78144 1.89075C9.05993 0.801229 10.9403 0.801229 12.2188 1.89075C12.7667 2.35763 13.4478 2.63979 14.1654 2.69705C15.8398 2.83067 17.1695 4.16031 17.3031 5.83474C17.3603 6.55227 17.6425 7.23346 18.1094 7.78132C19.1989 9.0598 19.1989 10.9402 18.1094 12.2187C17.6425 12.7665 17.3603 13.4477 17.3031 14.1653C17.1695 15.8397 15.8398 17.1693 14.1654 17.303C13.4479 17.3602 12.7667 17.6424 12.2188 18.1093C10.9403 19.1988 9.05993 19.1988 7.78144 18.1093C7.23358 17.6424 6.55239 17.3602 5.83486 17.303C4.16043 17.1693 2.83079 15.8397 2.69717 14.1653C2.63991 13.4477 2.35775 12.7665 1.89087 12.2187C0.801351 10.9402 0.801351 9.0598 1.89087 7.78132C2.35775 7.23346 2.63991 6.55227 2.69717 5.83474C2.83079 4.16031 4.16043 2.83067 5.83486 2.69705Z"
              stroke="#059669"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div className="flex flex-row justify-center pt-5">
          <div className="text-lg text-gray-700">Your GTC has been successfully staked!</div>
        </div>
        <div className="flex flex-row justify-center">
          <div className="py-4 rounded-md font-libre-franklin text-center text-gray-500 text-lg">
            Please note that it might take up to five minutes for your staking activity to be recognized in the Passport
            app and claim your stamp. We appreciate your patience!
          </div>
        </div>
      </div>
    </Modal>
  );
}
