import React, { useState } from 'react';
import {
  OFFICIAL_DISPENSARY_PRICELIST,
  DispensaryServiceItem,
} from '../../data/officialPricelist';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { PrintModal } from '../common/PrintModal';
import { InteractiveCard } from '../common/InteractiveCard';
import {
  DollarSign,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Tag,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  ScanLine,
  BedDouble,
  Scissors,
  Eye,
  PlusCircle,
} from 'lucide-react';

interface PricelistTariffViewProps {
  onSelectServiceForBilling?: (service: DispensaryServiceItem) => void;
}

export const PricelistTariffView: React.FC<PricelistTariffViewProps> = ({
  onSelectServiceForBilling,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const categories = [
    { key: 'All', label: 'Huduma Zote (All Services)', icon: Tag, count: OFFICIAL_DISPENSARY_PRICELIST.length },
    { key: 'A: RECEPTION & REGISTRATION', label: 'A: Mapokezi & Usajili (5,000/=)', icon: Tag, count: 1 },
    { key: 'B: LABORATORY INVESTIGATION', label: 'B: Maabara (Laboratory)', icon: FlaskConical, count: 23 },
    { key: 'C: CONSULTATION', label: 'C: Ushauri wa Daktari (Consultation)', icon: Stethoscope, count: 4 },
    { key: 'D: RADIOLOGICAL IMAGING', label: 'D: Ultrasound (USS Imaging)', icon: ScanLine, count: 3 },
    { key: 'F: PROCEDURE', label: 'F: Upasuaji Mdogo (Procedures & Labour)', icon: Scissors, count: 17 },
    { key: 'G: ADMISSION FEE', label: 'G: Ada ya Kulazwa Wodi (Admission)', icon: BedDouble, count: 2 },
    { key: 'E: EYE PROCEDURES', label: 'E: Macho (Eye Procedures)', icon: Eye, count: 7 },
  ];

  // Alphabet Quick-Sort Letters (A-Z)
  const alphabetLetters = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const filteredServices = OFFICIAL_DISPENSARY_PRICELIST.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const nameLower = item.name.toLowerCase();
    const swahiliLower = item.swahiliName.toLowerCase();
    const codeLower = item.code.toLowerCase();
    const notesLower = (item.sitlNotes || '').toLowerCase();

    // Alphabet filter
    const matchesLetter =
      activeLetter === 'ALL' ||
      nameLower.startsWith(activeLetter.toLowerCase()) ||
      swahiliLower.startsWith(activeLetter.toLowerCase());

    // Progressive typing search: matches if starts with, or contains
    const matchesSearch =
      q === '' ||
      nameLower.includes(q) ||
      swahiliLower.includes(q) ||
      codeLower.includes(q) ||
      notesLower.includes(q);

    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesLetter && matchesSearch && matchesCat;
  }).sort((a, b) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      // Prioritize items whose name starts with the typed query, then alphabetical
      const aStarts = a.name.toLowerCase().startsWith(q) || a.swahiliName.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q) || b.swahiliName.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    // Alphabetical auto-sort by name
    return a.name.localeCompare(b.name);
  });

  const handleExportPricelistExcel = () => {
    const headers = [
      'S/N',
      'Code',
      'Category',
      'Product / Service Name',
      'Swahili Name',
      'Official Price (TZS)',
      'SITL Insurance Status',
      'Reviewed Price (TZS)',
      'Department',
      'Notes & Conditions',
    ];
    const rows = OFFICIAL_DISPENSARY_PRICELIST.map((s) => [
      s.sn || '-',
      s.code,
      s.category,
      s.name,
      s.swahiliName,
      s.officialPrice,
      s.sitlStatus,
      s.sitlReviewPrice || 'AGREED',
      s.departmentScope,
      s.sitlNotes || 'Covered',
    ]);
    exportToExcel(
      `Neema_Dispensary_Official_Pricelist_${new Date().toISOString().split('T')[0]}`,
      'NEEMA DISPENSARY - OFFICIAL PRICELIST & SITL INSURANCE TARIFF',
      headers,
      rows
    );
  };

  const handleExportPricelistWord = () => {
    exportToWord(
      `Neema_Dispensary_Tariff_Schedule_${new Date().toISOString().split('T')[0]}`,
      'NEEMA DISPENSARY - OFFICIAL SERVICE CHARGES & TARIFF SCHEDULE',
      'Ministry of Health Licensed Health Facility - Nyamongo, Tarime, Tanzania (Ref: SITL-REVIEW-2026)',
      [
        {
          heading: '1. Executive Pricing & Insurance Tariff Summary',
          paragraphs: [
            `Standard service fee schedule established for Neema Dispensary clinical operations, laboratory diagnostics, ultrasound sonography, surgical toilet/minor theatre, maternity packages, and ward admissions.`,
            `Total indexed billable services: ${OFFICIAL_DISPENSARY_PRICELIST.length} clinical items.`,
          ],
          table: {
            headers: ['Code', 'Service / Investigation', 'Official Price (TZS)', 'SITL Status', 'SITL Review (TZS)'],
            rows: OFFICIAL_DISPENSARY_PRICELIST.map((s) => [
              s.code,
              s.name,
              s.officialPrice.toLocaleString(),
              s.sitlStatus,
              s.sitlReviewPrice ? s.sitlReviewPrice.toLocaleString() : 'AGREED',
            ]),
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <InteractiveCard
        className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-neutral-900 text-white rounded-2xl shadow-xl"
        glowColor="rgba(16, 185, 129, 0.25)"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ratiba Rasmi ya Bei (Official Pricelist)</span>
              </span>
              <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
                SITL REVIEW VERIFIED
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Neema Dispensary Service Tariffs & Price Schedule
            </h2>
            <p className="text-xs text-emerald-200/80 max-w-2xl">
              Bei rasmi za huduma za matibabu, vipimo 23 vya maabara, ultrasound ya mimba (USS Obstetric 25,000), KUB (30,000), tumbo (25,000), ushauri wa daktari, vifurushi vya uzazi (Normal Delivery 100,000), na ada ya vitanda vya wodi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPricelistExcel}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
              title="Pakua ratiba ya bei kwenye Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Pakua Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportPricelistWord}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
              title="Pakua ratiba ya bei kwenye Word"
            >
              <FileText className="h-4 w-4" />
              <span>Pakua Word</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
              title="Chapisha orodha ya bei (Printable Tariff Guide)"
            >
              <Printer className="h-4 w-4" />
              <span>Chapisha Bei (Print)</span>
            </button>
          </div>
        </div>
      </InteractiveCard>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/30 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar & Alphabetical Auto-Sort Bar */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tafuta huduma kwa jina au herufi... (mfano: A, B, C, MRDT, FBP, USS, Delivery, Glucose)"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                // When user types first letter, sync alphabet if empty or matching
                if (val.trim().length === 1) {
                  const firstChar = val.trim().toUpperCase();
                  if (alphabetLetters.includes(firstChar)) {
                    setActiveLetter(firstChar);
                  }
                } else if (val.trim().length === 0) {
                  setActiveLetter('ALL');
                }
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveLetter('ALL');
                }}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs font-bold"
                title="Futa utafutaji"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs font-bold text-neutral-500">
            Inaonyesha huduma: <strong className="text-neutral-900 dark:text-white font-mono">{filteredServices.length}</strong> / {OFFICIAL_DISPENSARY_PRICELIST.length}
          </div>
        </div>

        {/* Alphabet Bar: Auto-Sort items starting with chosen letter */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">
              Chagua Herufi ya Kuanzia (Alphabetical Auto-Sort):
            </span>
            {activeLetter !== 'ALL' && (
              <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-1.5 py-0.5 rounded">
                Herufi: {activeLetter}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {alphabetLetters.map((letter) => {
              const isSelected = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setActiveLetter(letter);
                    if (letter !== 'ALL') {
                      setSearchQuery(letter);
                    } else {
                      setSearchQuery('');
                    }
                  }}
                  className={`min-w-[28px] h-7 px-1.5 text-xs font-black rounded-lg transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600'
                  }`}
                  title={letter === 'ALL' ? 'Onyesha huduma zote' : `Onyesha huduma zinazoanza na herufi ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricelist Table */}
      <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">S/N & Code</th>
                <th className="py-3 px-4">Jina la Huduma / Kipimo</th>
                <th className="py-3 px-4">Kitengo</th>
                <th className="py-3 px-4 text-right">Bei Rasmi (Official Price)</th>
                <th className="py-3 px-4">SITL Insurance Tariff</th>
                <th className="py-3 px-4">Masharti / Maelezo</th>
                {onSelectServiceForBilling && <th className="py-3 px-4 text-right">Hatua</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredServices.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      {item.code}
                    </span>
                    {item.sn && (
                      <span className="ml-1 text-[10px] text-neutral-400 font-mono">
                        (#{item.sn})
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-neutral-900 dark:text-white text-xs">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium italic">
                      {item.swahiliName}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                      {item.category.replace(/^[A-Z]:\s*/, '')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-black text-sm text-neutral-900 dark:text-white">
                    TZS {item.officialPrice.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    {item.sitlStatus === 'AGREED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>AGREED</span>
                      </span>
                    )}
                    {item.sitlStatus === 'REVIEW_PRICE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        <DollarSign className="h-3 w-3 text-amber-600" />
                        <span>SITL: TZS {item.sitlReviewPrice?.toLocaleString()}</span>
                      </span>
                    )}
                    {item.sitlStatus === 'NOT_COVERED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300/40">
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                        <span>NOT COVERED</span>
                      </span>
                    )}
                    {item.sitlStatus === 'SPECIFY_REQUIRED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300/40">
                        <Info className="h-3 w-3 text-blue-600" />
                        <span>SPECIFY REQ.</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-neutral-500 max-w-xs">
                    {item.sitlNotes ? (
                      <span className="text-amber-800 dark:text-amber-300 font-medium">
                        {item.sitlNotes}
                      </span>
                    ) : (
                      <span className="text-neutral-400">Huduma ya kawaida</span>
                    )}
                  </td>

                  {onSelectServiceForBilling && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectServiceForBilling(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] shadow-sm transition"
                        title="Ongeza huduma hii kwenye ankara ya mgonjwa"
                      >
                        <PlusCircle className="h-3 w-3" />
                        <span>Weka Kwenye Bili</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Pricelist Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Ratiba Rasmi ya Bei - Hospital Management System at Neema (Nyamongo, Tarime)"
        category="Revenue & Billing Directorate / SITL Tariff"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="border-b pb-3 text-center">
            <h1 className="text-base sm:text-lg font-black tracking-tight">HOSPITAL MANAGEMENT SYSTEM AT NEEMA</h1>
            <p className="text-[11px] text-neutral-600">
              OFFICIAL SERVICE CHARGES & SITL HEALTH INSURANCE TARIFF SCHEDULE
            </p>
            <p className="text-[10px] text-neutral-500">
              Nyamongo, Tarime, Tanzania • Simu ya Mmiliki: 0763503097 • Tarehe: {new Date().toLocaleDateString('sw-TZ')}
            </p>
          </div>

          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-800 font-bold">
                <th className="py-1">Code</th>
                <th className="py-1">Huduma / Kipimo</th>
                <th className="py-1">Kitengo</th>
                <th className="py-1 text-right">Bei Rasmi (TZS)</th>
                <th className="py-1">Hali ya Bima (SITL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredServices.map((s) => (
                <tr key={s.id}>
                  <td className="py-1 font-mono font-bold">{s.code}</td>
                  <td className="py-1">
                    <span className="font-bold">{s.name}</span>
                    {s.sitlNotes && <div className="text-[9px] text-neutral-500 italic">{s.sitlNotes}</div>}
                  </td>
                  <td className="py-1 text-[10px]">{s.category.replace(/^[A-Z]:\s*/, '')}</td>
                  <td className="py-1 text-right font-mono font-bold">{s.officialPrice.toLocaleString()}</td>
                  <td className="py-1 text-[10px]">
                    {s.sitlReviewPrice ? `Review: ${s.sitlReviewPrice.toLocaleString()}` : s.sitlStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-4 border-t text-[10px] text-neutral-500 text-center">
            Ratiba hii ya bei imethibitishwa na Mganga Mkuu (Medical Director) na Ofisi ya Fedha kwa mujibu wa miongozo ya Wizara ya Afya ya Tanzania.
          </div>
        </div>
      </PrintModal>
    </div>
  );
};
