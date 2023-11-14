export type XstakeTo = {
  amount: string;
  to: {
    address: string;
  };
};

export type Stake = {
  stake: string;
};

export type XstakeAggregate = {
  total: string;
};

export type IndexedStakeData = {
  user?: {
    xstakeTo?: XstakeTo[];
    xstakeAggregates?: XstakeAggregate[];
    stakes?: Stake[];
  };
};
