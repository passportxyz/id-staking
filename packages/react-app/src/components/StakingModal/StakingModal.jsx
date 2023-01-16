import React from "react";
import SelfStakingModalContent from "./SelfStakingModalContent";
import CommunityStakingModalContent from "./CommunityStakingModalContent";

export default function StakingModal({
  roundData,
  isModalVisible,
  setIsModalVisible,
  stakingType,
  writeContracts,
  readContracts,
  tx,
  address,
  userSigner,
  round,
  mainnetProvider,
  targetNetwork,
  handleStakingTransaction,
}) {
  return (
    <div>
      {stakingType === "self" && (
        <SelfStakingModalContent
          roundData={roundData}
          writeContracts={writeContracts}
          readContracts={readContracts}
          tx={tx}
          address={address}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          userSigner={userSigner}
          round={round}
          handleStakingTransaction={handleStakingTransaction}
        />
      )}
      {stakingType === "community" && (
        <CommunityStakingModalContent
          roundData={roundData}
          writeContracts={writeContracts}
          readContracts={readContracts}
          tx={tx}
          address={address}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          userSigner={userSigner}
          round={round}
          mainnetProvider={mainnetProvider}
          targetNetwork={targetNetwork}
          handleStakingTransaction={handleStakingTransaction}
        />
      )}
    </div>
  );
}
