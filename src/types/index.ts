export interface Purchase {
  id: string;
  item: string;
  price: number;
  date: string; // ISO date string
  note?: string;
}

export interface InvestmentProjection {
  date: string;
  principal: number;
  value: number;
}
