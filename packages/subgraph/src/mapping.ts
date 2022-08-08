import { BigInt, Address } from '@graphprotocol/graph-ts'
import { IDStaking, roundCreated, selfStake, tokenMigrated, xStake } from '../generated/IDStaking/IDStaking'
import { User, Stake, XStake, Migration, Round } from '../generated/schema'

function handleUser(userAddress: Address, createdAt: BigInt, hash: String): User {
  let userId = userAddress.toHexString()

  let user = User.load(userId)

  if (user === null) {
    user = new User(userId)
    user.address = userAddress
    user.createdAt = createdAt
    user.transactionHash = hash
  }

  return user
}

export function handleRound(event: roundCreated): void {
  let roundId = event.params.id.toHexString()

  let round = Round.load(roundId)

  let contract = IDStaking.bind(event.address)

  let roundInfo = contract.fetchRoundMeta(event.params.id)

  if (round === null) {
    round = new Round(roundId)
    round.tvl = BigInt.fromI32(0)
    round.start = roundInfo.value0
    round.duration = roundInfo.value1
    round.meta = roundInfo.value3
    round.createdAt = event.block.timestamp
    round.transactionHash = event.transaction.hash.toHex()
  }

  round.save()
}

export function handleStake(event: selfStake): void {
  let roundId = event.params.roundId.toHexString()

  let round = Round.load(roundId)
  let user = handleUser(event.params.staker, event.block.timestamp, event.transaction.hash.toHex())

  let stakerId = user.id + '-' + roundId

  if (round !== null) {
    if (event.params.staked) {
      round.tvl = round.tvl.plus(event.params.amount)
    } else {
      round.tvl = round.tvl.minus(event.params.amount)
    }
  } else {
    return
  }

  let staker = Stake.load(stakerId)

  if (staker === null) {
    staker = new Stake(stakerId)
    staker.user = user.id
    staker.round = roundId
    staker.stake = event.params.amount
  } else {
    if (event.params.staked) {
      staker.stake = staker.stake.plus(event.params.amount)
    } else {
      staker.stake = staker.stake.minus(event.params.amount)
    }
  }

  staker.save()
  round.save()
  user.save()
}

export function handleMigration(event: tokenMigrated): void {
  let fromRoundId = event.params.fromRound.toHexString()
  let toRoundId = event.params.toRound.toHexString()
  let migrationId = event.params.staker.toHexString() + '-' + fromRoundId + '-' + toRoundId

  let fromRound = Round.load(fromRoundId)
  let toRound = Round.load(toRoundId)
  let migration = Migration.load(migrationId)
  let user = handleUser(event.params.staker, event.block.timestamp, event.transaction.hash.toHex())

  if (fromRound !== null && toRound !== null && migration === null) {
    fromRound.tvl = fromRound.tvl.minus(event.params.amount)
    toRound.tvl = toRound.tvl.plus(event.params.amount)

    // register migration
    migration = new Migration(migrationId)
    migration.user = user.id
    migration.stake = event.params.staker.toHexString() + '-' + toRoundId
    migration.toRound = toRoundId
    migration.amount = event.params.amount
    migration.fromRound = fromRoundId
    migration.createdAt = event.block.timestamp
    migration.transactionHash = event.transaction.hash.toHex()
  } else {
    return
  }

  fromRound.save()
  toRound.save()
  migration.save()
  user.save()
}

export function handleXStake(event: xStake): void {
  let roundId = event.params.roundId.toHexString()

  let round = Round.load(roundId)
  let staker = handleUser(event.params.staker, event.block.timestamp, event.transaction.hash.toHex())
  let stakee = handleUser(event.params.user, event.block.timestamp, event.transaction.hash.toHex())

  let xstakeId = staker.id + '-' + stakee.id + '-' + roundId

  let xstake = XStake.load(xstakeId)

  if (round !== null) {
    if (event.params.staked) {
      round.tvl = round.tvl.plus(event.params.amount)
    } else {
      round.tvl = round.tvl.minus(event.params.amount)
    }
  } else {
    return
  }

  if (stakee !== null) {
    if (event.params.staked) {
      stakee.totalStakedOnMe = stakee.totalStakedOnMe.plus(event.params.amount)
    } else {
      stakee.totalStakedOnMe = stakee.totalStakedOnMe.minus(event.params.amount)
    }
  }

  if (xstake === null) {
    xstake = new XStake(xstakeId)
    xstake.to = stakee.id
    xstake.from = staker.id
    xstake.round = round.id
    xstake.amount = event.params.amount
  } else {
    if (event.params.staked) {
      xstake.amount = xstake.amount.plus(event.params.amount)
    } else {
      xstake.amount = xstake.amount.minus(event.params.amount)
    }
  }

  round.save()
  staker.save()
  stakee.save()
  xstake.save()
}

//  -----------------------------------------------------------

// export function handleStaking(event: SetPurpose): void {
//   let senderString = event.params.sender.toHexString();

//   let sender = Sender.load(senderString);

//   if (sender === null) {
//     sender = new Sender(senderString);
//     sender.address = event.params.sender;
//     sender.createdAt = event.block.timestamp;
//     sender.purposeCount = BigInt.fromI32(1);
//   } else {
//     sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1));
//   }

//   let purpose = new Purpose(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   );

//   purpose.purpose = event.params.purpose;
//   purpose.sender = senderString;
//   purpose.createdAt = event.block.timestamp;
//   purpose.transactionHash = event.transaction.hash.toHex();

//   purpose.save();
//   sender.save();
// }
