import { useState, type FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES, type CategoryKey } from '../types';

interface AddPurchaseFormProps {
  onAdd: (purchase: {
    item: string;
    price: number;
    date: string;
    note?: string;
    category?: CategoryKey;
  }) => void;
}

function triggerConfetti() {
  // Burst from the left
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: ['#5f755f', '#c4956a', '#7a8f7a', '#d4a574'],
  });

  // Burst from the right
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors: ['#5f755f', '#c4956a', '#7a8f7a', '#d4a574'],
  });
}

export function AddPurchaseForm({ onAdd }: AddPurchaseFormProps) {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<CategoryKey>('other');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!item.trim() || !price || parseFloat(price) <= 0) return;

    setIsSubmitting(true);

    // Brief delay for animation
    await new Promise(resolve => setTimeout(resolve, 200));

    onAdd({
      item: item.trim(),
      price: parseFloat(price),
      date,
      note: note.trim() || undefined,
      category,
    });

    // Celebrate!
    triggerConfetti();

    // Reset form
    setItem('');
    setPrice('');
    setNote('');
    setCategory('other');
    setIsSubmitting(false);
    setIsExpanded(false);
  };

  const categories = Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-6 mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <span
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isExpanded
                ? 'bg-sage-500 text-white'
                : 'bg-sage-100 text-sage-500 group-hover:bg-sage-200'
              }
            `}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
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
          <span className="text-sage-700 font-medium">
            {isExpanded ? 'Log your win' : 'Resisted an impulse?'}
          </span>
        </div>
        {!isExpanded && (
          <span className="text-sm text-sage-400 group-hover:text-sage-500 transition-colors">
            Tap to add
          </span>
        )}
      </button>

      <div
        className={`
          transition-all duration-300 ease-out
          ${isExpanded ? 'max-h-[600px] opacity-100 mt-5' : 'max-h-0 opacity-0'}
        `}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label htmlFor="item" className="block text-sm text-sage-500 mb-1.5">
              What did you almost buy?
            </label>
            <input
              type="text"
              id="item"
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="e.g., New headphones, Designer bag..."
              className="
                w-full px-4 py-3 rounded-xl border border-sage-200
                bg-cream-50 text-sage-800 placeholder-sage-400
                focus:border-sage-400 focus:ring-0 focus:outline-none
                transition-colors
              "
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm text-sage-500 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5
                    transition-all duration-200
                    ${category === key
                      ? 'text-white shadow-sm'
                      : 'bg-cream-100 text-sage-600 hover:bg-cream-200'
                    }
                  `}
                  style={category === key ? { backgroundColor: cat.color } : {}}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price and Date */}
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
                    transition-colors
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
                  transition-colors
                "
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm text-sage-500 mb-1.5">
              Why did you decide not to buy it? (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Remind yourself why you made this choice..."
              rows={2}
              className="
                w-full px-4 py-3 rounded-xl border border-sage-200
                bg-cream-50 text-sage-800 placeholder-sage-400 resize-none
                focus:border-sage-400 focus:ring-0 focus:outline-none
                transition-colors
              "
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium
              transition-all duration-200
              ${isSubmitting
                ? 'bg-sage-300 text-sage-500 cursor-not-allowed'
                : 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white shadow-sm hover:shadow'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Log this win'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
