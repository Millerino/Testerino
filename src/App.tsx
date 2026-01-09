import { Header, AddPurchaseForm, SavingsOverview, PurchaseList, InvestmentChart } from './components';
import { usePurchases } from './hooks/usePurchases';

function App() {
  const { purchases, addPurchase, removePurchase } = usePurchases();

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <Header />
        <SavingsOverview purchases={purchases} />
        <InvestmentChart purchases={purchases} />
        <AddPurchaseForm onAdd={addPurchase} />
        <PurchaseList purchases={purchases} onRemove={removePurchase} />

        {/* Footer with explanation */}
        <footer className="text-center mt-12 pb-8">
          <p className="text-sage-400 text-xs leading-relaxed max-w-md mx-auto">
            Every impulse you resist is a seed planted for your future self.
            <br />
            <span className="text-sage-300 mt-2 block">
              Investment projections assume a 7% annual return based on historical S&P 500 performance adjusted for inflation. Actual returns may vary.
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
