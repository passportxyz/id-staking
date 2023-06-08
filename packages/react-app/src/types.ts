export type XstakeTo = {
  amount: string;
  to: {
    address: string;
  };
};

export type Stake = {
  stake: string;
};

export type XstakeAggregates = {
  total: string;
  id: string;
};

export type IndexedStakeData = {
  user?: {
    xstakeTo?: XstakeTo[];
    xstakeAggregates?: XstakeAggregates[];
    stakes?: Stake[];
  };
};
