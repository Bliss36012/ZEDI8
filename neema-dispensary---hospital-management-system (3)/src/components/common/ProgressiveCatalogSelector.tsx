import React, { useState, useMemo } from 'react';
import {
  OFFICIAL_DISPENSARY_PRICELIST,
  DispensaryServiceItem,
  searchCatalogWithProgressiveMatching,
} from '../../data/officialPricelist';
import { Search, Tag, X, Check, Sparkles, Filter } from 'lucide-react';

interface ProgressiveCatalogSelectorProps {
  onSelectItem: (item: DispensaryServiceItem) => void;
  selectedItemId?: string;
  placeholder?: string;
  initialCategory?: 'All' | 'reception' | 'laboratory' | 'consultation' | 'radiology' | 'eye' | 'procedure' | 'admission' | 'pharmacy_med' | 'supplies';
  showCategoryFilters?: boolean;
}

export const ProgressiveCatalogSelector: React.FC<ProgressiveCatalogSelectorProps> = ({
  onSelectItem,
  selectedItemId,
  placeholder = 'Tafuta huduma, dawa au kipimo... (mf: A, Paracetamol, MRDT, USS, 7000)',
  initialCategory = 'All',
  showCategoryFilters = true,
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeLetter, setActiveLetter] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Alphabet Quick-Sort Ribbon
  const alphabetLetters = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const categoryPills = [
    { key: 'All', label: 'Zote (All 1,234)' },
    { key: 'laboratory', label: 'Vipimo vya Lab (23)' },
    { key: 'consultation', label: 'Consultations (4)' },
    { key: 'radiology', label: 'Ultrasound USS (3)' },
    { key: 'procedure', label: 'Taratibu & Minor OT (16)' },
    { key: 'pharmacy_med', label: 'Dawa (Pharmacy 950+)' },
    { key: 'supplies', label: 'Vifaa & Orthopaedics (200+)' },
    { key: 'admission', label: 'Wodi & Kulazwa (2)' },
  ];

  // Progressive matched items
  const results = useMemo(() => {
    return searchCatalogWithProgressiveMatching(
      OFFICIAL_DISPENSARY_PRICELIST,
      searchText,
      activeLetter,
      activeCategory
    );
  }, [searchText, activeLetter, activeCategory]);

  const handleSelectLetter = (letter: string) => {
    setActiveLetter(letter);
    if (letter === 'ALL') {
      setSearchText('');
    } else {
      setSearchText(letter);
    }
    setIsDropdownOpen(true);
  };

  const handleChoose = (item: DispensaryServiceItem) => {
    onSelectItem(item);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Category Pills (Optional) */}
      {showCategoryFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categoryPills.map((p) => {
            const isSel = activeCategory === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setActiveCategory(p.key);
                  setIsDropdownOpen(true);
                }}
                className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input with Auto-ranking indicator */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-teal-600" />
        <input
          type="text"
          value={searchText}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setSearchText(val);
            setIsDropdownOpen(true);
            if (val.trim().length === 1 && alphabetLetters.includes(val.trim().toUpperCase())) {
              setActiveLetter(val.trim().toUpperCase());
            } else if (val.trim().length === 0) {
              setActiveLetter('ALL');
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => {
              setSearchText('');
              setActiveLetter('ALL');
            }}
            className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Alphabetical Quick-Sort Ribbon (A - Z buttons) */}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
        {alphabetLetters.map((letter) => {
          const isSel = activeLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => handleSelectLetter(letter)}
              className={`h-6 min-w-[22px] px-1 text-[10px] font-black rounded-lg transition-all ${
                isSel
                  ? 'bg-teal-600 text-white shadow-sm scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-teal-100 dark:hover:bg-teal-950/60'
              }`}
              title={`Onyesha huduma & dawa zinazoanza na herufi ${letter}`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Results Dropdown / Picker */}
      {isDropdownOpen && (
        <div className="border border-teal-200 dark:border-teal-900 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-slide-up">
          <div className="p-2 bg-teal-50/80 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900 flex justify-between items-center text-[11px] text-teal-900 dark:text-teal-200 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Matokeo: {results.length} bidhaa / huduma zimepatikana</span>
            </span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 text-xs"
            >
              Funga (✕)
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {results.slice(0, 50).map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleChoose(item)}
                  className={`p-2.5 flex items-center justify-between gap-2 hover:bg-teal-50 dark:hover:bg-teal-950/30 cursor-pointer transition ${
                    isSelected ? 'bg-teal-50/70 dark:bg-teal-950/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span>{item.category.replace(/^[A-Z]:\s*/, '')}</span>
                      <span>•</span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{item.departmentScope}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                      TZS {item.officialPrice.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      className="mt-1 px-2 py-0.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shadow-sm"
                    >
                      + Chagua
                    </button>
                  </div>
                </div>
              );
            })}

            {results.length === 0 && (
              <div className="p-6 text-center text-neutral-400 text-xs">
                Hakuna huduma au dawa inayolingana na utafutaji wako.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
