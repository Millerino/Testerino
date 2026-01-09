import { useState, type FormEvent } from 'react';

interface AddPurchaseFormProps {
  onAdd: (purchase: { item: string; price: number; date: string; note?: string }) => void;
}

export function AddPurchaseForm({ onAdd }: AddPurchaseFormProps) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!item.trim() || !price || parseFloat(price) <= 0) return;

    onAdd({
      item: item.trim(),
      price: parseFloat(price),
      date,
      note: note.trim() || undefined,
    });

    // Reset form
    setItem('');
    setPrice('');
    setNote('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-6 mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-sage-600 font-medium">
          {isExpanded ? 'Adding a win...' : 'Log something you didn\'t buy'}
        </span>
        <span
          className={`
            w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center
            text-sage-500 group-hover:bg-sage-200 transition-all duration-300
            ${isExpanded ? 'rotate-45' : ''}
          `}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${isExpanded ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0'}
        `}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="item" className="block text-sm text-sage-500 mb-1.5">
              What did you almost buy?
            </label>
            <input
              type="text"
              id="item"
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="e.g., New headphones"
              className="
                w-full px-4 py-3 rounded-xl border border-sage-200
                bg-cream-50 text-sage-800 placeholder-sage-400
                focus:border-sage-400 focus:ring-0 focus:outline-none
              "
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm text-sage-500 mb-1.5">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400">
                  $
                </span>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  className="
                    w-full pl-7 pr-4 py-3 rounded-xl border border-sage-200
                    bg-cream-50 text-sage-800 placeholder-sage-400
                    focus:border-sage-400 focus:ring-0 focus:outline-none
                  "
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm text-sage-500 mb-1.5">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="
                  w-full px-4 py-3 rounded-xl border border-sage-200
                  bg-cream-50 text-sage-800
                  focus:border-sage-400 focus:ring-0 focus:outline-none
                "
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm text-sage-500 mb-1.5">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Why did you decide not to buy it?"
              rows={2}
              className="
                w-full px-4 py-3 rounded-xl border border-sage-200
                bg-cream-50 text-sage-800 placeholder-sage-400 resize-none
                focus:border-sage-400 focus:ring-0 focus:outline-none
              "
            />
          </div>

          <button
            type="submit"
            className="
              w-full py-3 px-6 rounded-xl
              bg-sage-600 hover:bg-sage-700 active:bg-sage-800
              text-white font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2
            "
          >
            Log this win
          </button>
        </form>
      </div>
    </div>
  );
}
