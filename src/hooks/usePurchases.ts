import { useState, useEffect, useCallback } from 'react';
import type { Purchase } from '../types';

const STORAGE_KEY = 'impulse-tracker-purchases';

function loadPurchases(): Purchase[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePurchases(purchases: Purchase[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadPurchases());

  useEffect(() => {
    savePurchases(purchases);
  }, [purchases]);

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
    };
    setPurchases(prev => [newPurchase, ...prev]);
  }, []);

  const removePurchase = useCallback((id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  }, []);

  return { purchases, addPurchase, removePurchase };
}
