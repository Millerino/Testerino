import { useState } from 'react';
import {
  Header,
  AddPurchaseForm,
  SavingsOverview,
  PurchaseList,
  InvestmentChart,
  StrategySelector,
} from './components';
import { usePurchases } from './hooks/usePurchases';
import type { StrategyKey } from './utils/investment';

function App() {
  const { purchases, addPurchase, removePurchase } = usePurchases();
  const [strategy, setStrategy] = useState<StrategyKey>('sp500');
  const [customRate, setCustomRate] = useState(0.10);

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <Header />
        <SavingsOverview purchases={purchases} strategy={strategy} />
        <StrategySelector
          selectedStrategy={strategy}
          customRate={customRate}
          onStrategyChange={setStrategy}
          onCustomRateChange={setCustomRate}
        />
        <InvestmentChart purchases={purchases} strategy={strategy} />
        <AddPurchaseForm onAdd={addPurchase} />
        <PurchaseList
          purchases={purchases}
          strategy={strategy}
          onRemove={removePurchase}
        />

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <p className="text-sage-400 text-xs leading-relaxed max-w-md mx-auto">
            Every impulse you resist is a seed planted for your future self.
          </p>
          <p className="text-sage-300 text-xs mt-3 max-w-sm mx-auto">
            Investment projections are estimates based on historical data.
            Actual returns may vary. This is not financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
