import React from 'react';
import { Printer, X, CheckCheck, FileText, Building2 } from 'lucide-react';

export interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentNumber?: string;
  category?: string;
  children: React.ReactNode;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title,
  documentNumber,
  category = 'Hati Rasmi ya Zahanati (Official Dispensary Document)',
  children,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Focus window and trigger browser print dialog
    window.focus();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print-bg">
      <div className="bg-white text-neutral-900 rounded-3xl shadow-2xl max-w-3xl w-full border border-neutral-300 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Action Bar (hidden in print) */}
        <div className="no-print p-4 bg-teal-900 text-white flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-teal-300" />
            <div>
              <h3 className="font-bold text-sm">Hakiki na Chapisha (Print Preview)</h3>
              <p className="text-[11px] text-teal-200">
                Tayari kwa printa ya ofisi au kuhifadhi kama PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
            >
              <Printer className="h-4 w-4" />
              <span>Chapisha Sasa (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-teal-800 transition"
              title="Funga dirisha"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="printable-document p-8 sm:p-10 overflow-y-auto space-y-6 text-xs bg-white font-sans">
          {/* Official Letterhead */}
          <div className="border-b-2 border-teal-800 pb-4 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
              Jamhuri ya Muungano wa Tanzania • Wizara ya Afya
            </div>
            <h1 className="text-lg sm:text-xl font-black text-teal-900 tracking-wide uppercase flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-teal-700" />
              <span>HOSPITAL MANAGEMENT SYSTEM AT NEEMA</span>
            </h1>
            <p className="text-[11px] text-neutral-600 font-medium">
              Nyamongo, Wilaya ya Tarime, Mkoa wa Mara, Tanzania • Simu / WhatsApp ya Mmiliki: 0763503097 • Huduma Masaa 24
            </p>
            <div className="flex items-center justify-between pt-2 text-[10px] text-neutral-500">
              <span className="font-semibold text-teal-800">{category}</span>
              {documentNumber && (
                <span className="font-mono font-bold bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-300">
                  Namba: {documentNumber}
                </span>
              )}
              <span className="font-mono">Tarehe: {new Date().toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Document Title Header */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div className="font-black text-sm text-neutral-800">{title}</div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Hati Imethibitishwa Kidijitali</span>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="py-2 text-neutral-800">
            {children}
          </div>

          {/* Official Footer and Signatures */}
          <div className="pt-6 border-t border-neutral-300 text-[10px] text-neutral-500 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center pt-2">
              <div className="space-y-6">
                <div className="h-10 border-b border-dashed border-neutral-400"></div>
                <p className="font-bold">Mhudumu / Msimamizi Aliyetoa</p>
              </div>
              <div className="space-y-6">
                <div className="h-10 border-b border-dashed border-neutral-400"></div>
                <p className="font-bold">Mganga Mkuu (Hospital Manager)</p>
              </div>
              <div className="hidden sm:block space-y-6">
                <div className="h-10 border-b border-dashed border-neutral-400 flex items-center justify-center">
                  <span className="text-[9px] font-bold uppercase text-teal-800 border border-teal-800/40 px-2 py-0.5 rounded">
                    MUHURI RASMI WA ZAHANATI
                  </span>
                </div>
                <p className="font-bold">Muhuri wa Hospital Management System at Neema</p>
              </div>
            </div>

            <p className="text-center text-[9px] text-neutral-400 pt-2 border-t border-neutral-100">
              Hati hii inatambuliwa kisheria kulingana na taratibu za utoaji huduma za afya za Zahanati ya Neema.
            </p>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="no-print p-3 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-xl"
          >
            Funga
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Chapisha (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
