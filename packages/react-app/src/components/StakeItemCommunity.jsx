import React from "react";

// Format User Address
import DisplayAddressEns from "./DisplayAddressEns";
import { formatAmountUnits } from "./StakingModal/utils";

const StakeItemCommunity = ({
  icon,
  title,
  description,
  amount,
  buttonText,
  buttonHandler,
  roundData,
  mainnetProvider,
}) => {
  return (
    <div className="border-divider border-b">
      <div className="flex items-start md:items-center mx-auto pb-4 flex-col md:flex-row">
        <div className="flex flex-row items-center justify-start">
          <div className="w-20 h-20 mr-5 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
            {icon}
          </div>
          <div className="flex-col text-left">
            <h2 className="text-gray-900 text-lg title-font font-medium mb-0">{title}</h2>
            <div className="leading-relaxed text-base">{description}</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-auto items-center justify-center flex-grow text-left md:text-center md:my-0 my-7">
          <h2 className="text-gray-900 text-lg title-font font-medium mb-0">{amount} GTC</h2>
          <span className="leading-relaxed text-base">Staked</span>
        </div>
        <button
          onClick={buttonHandler}
          className="flex md:max-w-button w-full justify-center text-white text-center bg-purple-connectPurple border-0 py-2 focus:outline-none hover:bg-indigo-600 rounded-sm text-lg font-miriam-libre"
        >
          <span>{buttonText}</span>
        </button>
      </div>
      {/* List all users staked on  */}
      <div className="flex items-start md:items-center mx-auto  flex-col md:flex-row">
        <ul>
          {roundData &&
            roundData.map(data => (
              <li className="flex flex-row">
                <div className="mx-10 md:mx-28 text-xl grid grid-col-2 grid-flow-col gap-20 md:gap-60 mb-2">
                  <DisplayAddressEns
                    style={{ color: "black" }}
                    address={data.to.address}
                    ensProvider={mainnetProvider}
                  />
                  {formatAmountUnits(data.amount)} GTC
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default StakeItemCommunity;
