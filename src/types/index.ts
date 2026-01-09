export const CATEGORIES = {
  tech: { label: 'Tech & Gadgets', emoji: '📱', color: '#4a90d9' },
  fashion: { label: 'Fashion', emoji: '👗', color: '#e91e63' },
  food: { label: 'Food & Dining', emoji: '🍕', color: '#ff9800' },
  entertainment: { label: 'Entertainment', emoji: '🎮', color: '#9c27b0' },
  home: { label: 'Home & Living', emoji: '🏠', color: '#4caf50' },
  travel: { label: 'Travel', emoji: '✈️', color: '#00bcd4' },
  beauty: { label: 'Beauty & Care', emoji: '💄', color: '#f06292' },
  other: { label: 'Other', emoji: '📦', color: '#78909c' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export interface Purchase {
  id: string;
  item: string;
  price: number;
  date: string;
  note?: string;
  category?: CategoryKey;
}

export interface InvestmentProjection {
  date: string;
  principal: number;
  value: number;
  [key: string]: string | number; // For additional strategy values
}

export interface AppSettings {
  selectedStrategy: string;
  customRate?: number;
  timeHorizon: number;
}
