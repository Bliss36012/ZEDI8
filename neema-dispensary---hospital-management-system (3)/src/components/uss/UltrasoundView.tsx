import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { InteractiveCard } from '../common/InteractiveCard';
import { UltrasoundRecord } from '../../types/hospital';
import { PrintModal } from '../common/PrintModal';
import { openWhatsAppWebChat } from '../../utils/whatsapp';
import {
  ScanLine,
  Activity,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  Stethoscope,
  ChevronRight,
  Eye,
  Plus,
  MessageSquare,
  Building2,
} from 'lucide-react';

export const UltrasoundView: React.FC = () => {
  const { patients } = useHospital();

  const [ultrasoundRecords, setUltrasoundRecords] = useState<UltrasoundRecord[]>([
    {
      id: 'uss-001',
      scanNumber: 'ND-USS-2026-0312',
      patientId: 'pat-001',
      patientName: 'Grace Neema Kimaro',
      opdNumber: 'ND-TZ-2026-0814',
      age: 28,
      gender: 'Female',
      scanType: 'USS OBSTETRIC',
      officialPrice: 25000,
      clinicalIndication: 'Routine 3rd Trimester Obstetric Evaluation & Fetal Well-being',
      referringDoctor: 'Dkt. Amina Mwakyusa',
      sonographerName: 'Sonographer Francis Mushi (Radiology Dept)',
      date: '2026-10-26',
      findings:
        'Single live intrauterine fetus in cephalic presentation. Adequate liquor volume (AFI 14.2 cm). Placenta is anterior, high, away from internal os. Normal fetal cardiac activity (FHR 144 bpm). Good somatic movements observed.',
      measurements: {
        bpd: '88 mm (36w 2d)',
        fl: '71 mm (36w 4d)',
        ac: '320 mm (36w 0d)',
        efw: '2,750 grams (± 150g)',
        edd: '2026-11-20',
        afi: '14.2 cm (Normal)',
        placentaLocation: 'Anterior High (Grade II)',
        fetalPresentation: 'Cephalic (Longitudinal lie)',
      },
      impression: 'Single active intrauterine pregnancy at ~36 weeks with normal fetal growth and adequate liquor.',
      recommendations: 'Continue routine Antenatal Care (ANC) and monitor kick counts.',
      status: 'Finalized',
    },
    {
      id: 'uss-002',
      scanNumber: 'ND-USS-2026-0313',
      patientId: 'pat-003',
      patientName: 'Hassan Juma Bakari',
      opdNumber: 'ND-TZ-2026-0816',
      age: 52,
      gender: 'Male',
      scanType: 'USS ABDOMINAL / PELVIC',
      officialPrice: 25000,
      clinicalIndication: 'Right Upper Quadrant pain, postprandial dyspepsia, suspected cholelithiasis',
      referringDoctor: 'Dkt. Joseph Mrema (Mganga Mkuu)',
      sonographerName: 'Sonographer Francis Mushi',
      date: '2026-10-25',
      findings:
        'Liver is normal in size, smooth contour, no focal lesion. Gallbladder is distended with acoustic shadowing calculi measuring 1.2 cm in the neck. No wall thickening or pericholecystic fluid. Spleen and kidneys are sonographically normal.',
      measurements: {
        organDetails: 'Gallbladder stone 12mm; CBD 4.5mm (Normal); Liver span 14.5cm',
      },
      impression: 'Symptomatic Cholelithiasis (Gallbladder calculus) without active acute cholecystitis.',
      recommendations: 'Surgical consult for elective laparoscopic cholecystectomy consideration.',
      status: 'Finalized',
    },
    {
      id: 'uss-003',
      scanNumber: 'ND-USS-2026-0314',
      patientId: 'pat-004',
      patientName: 'Subira Juma Mwinyi',
      opdNumber: 'ND-TZ-2026-0817',
      age: 34,
      gender: 'Female',
      scanType: 'Pelvic / Gynae (Nyonga & Kizazi)',
      officialPrice: 25000,
      clinicalIndication: 'Secondary dysmenorrhea and menorrhagia for 6 months',
      referringDoctor: 'Dkt. Amina Mwakyusa',
      sonographerName: 'Sonographer Francis Mushi',
      date: '2026-10-26',
      findings:
        'Anteverted enlarged uterus with an intramural-subserosal hypoechoic well-circumscribed lesion in the anterior myometrium measuring 3.8 x 3.2 cm. Endometrial stripe is uniform (7mm). Both ovaries appear normal with functional follicles.',
      measurements: {
        organDetails: 'Uterine dimensions: 9.5 x 6.2 x 5.4 cm; Anterior myoma 38mm',
      },
      impression: 'Solitary Uterine Leiomyoma (Uterine Fibroid 3.8cm).',
      recommendations: 'Medical therapy and periodic sonographic surveillance.',
      status: 'Finalized',
    },
    {
      id: 'uss-004',
      scanNumber: 'ND-USS-2026-0315',
      patientId: 'pat-005',
      patientName: 'Patrick Mtambo',
      opdNumber: 'ND-TZ-2026-0818',
      age: 46,
      gender: 'Male',
      scanType: 'USS KUB (Kidney, Ureter, Bladder)',
      officialPrice: 30000,
      clinicalIndication: 'Flank pain, dysuria, microscopic hematuria on urinalysis',
      referringDoctor: 'Dkt. Joseph Mrema',
      sonographerName: 'Sonographer Francis Mushi',
      date: '2026-10-26',
      findings:
        'Right kidney normal (10.8 cm). Left kidney shows mild hydronephrosis with a 5.8 mm non-obstructing calculus at the upper pole calyx. Ureters not dilated. Urinary bladder wall smooth, lumen clear with pre-void volume 380ml and post-void residue 25ml. Prostate size 24g (Normal).',
      measurements: {
        organDetails: 'Left calyceal calculus 5.8mm; Right kidney 10.8cm; Left kidney 11.2cm; Bladder post-void 25ml',
      },
      impression: 'Left Nephrolithiasis (Renal Calculus 5.8mm) with mild pelvicalyceal fullness.',
      recommendations: 'Increased oral hydration, antispasmodic therapy, and urology follow-up.',
      status: 'Finalized',
    },
  ]);

  const [selectedScan, setSelectedScan] = useState<UltrasoundRecord>(ultrasoundRecords[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState<boolean>(false);

  // New Scan state
  const [newPatientId, setNewPatientId] = useState<string>(patients[0]?.id || '');
  const [newScanType, setNewScanType] = useState<UltrasoundRecord['scanType']>('USS OBSTETRIC');
  const [newIndication, setNewIndication] = useState<string>('Routine Pregnancy Ultrasound Evaluation');
  const [newFindings, setNewFindings] = useState<string>('Live fetus visualized, normal cardiac motion, adequate amniotic fluid.');
  const [newImpression, setNewImpression] = useState<string>('Normal intrauterine pregnancy with satisfactory development.');

  const handleCreateNewScan = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === newPatientId) || patients[0];
    const price =
      newScanType === 'USS KUB (Kidney, Ureter, Bladder)' ? 30000 : 25000;
    const newRecord: UltrasoundRecord = {
      id: `uss-${Date.now()}`,
      scanNumber: `ND-USS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: pat.id,
      patientName: pat.fullName,
      opdNumber: pat.opdNumber,
      age: 30,
      gender: pat.gender as any,
      scanType: newScanType,
      officialPrice: price,
      clinicalIndication: newIndication,
      referringDoctor: 'Dkt. Amina Mwakyusa',
      sonographerName: 'Sonographer Francis Mushi',
      date: new Date().toISOString().split('T')[0],
      findings: newFindings,
      measurements: {
        bpd: '82 mm',
        fl: '66 mm',
        efw: '2,200g',
        edd: '2026-12-05',
        afi: '13.5 cm',
        placentaLocation: 'Posterior High',
        fetalPresentation: 'Cephalic',
      },
      impression: newImpression,
      recommendations: 'Routine antenatal monitoring.',
      status: 'Finalized',
    };

    setUltrasoundRecords((prev) => [newRecord, ...prev]);
    setSelectedScan(newRecord);
    setIsNewScanModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <InteractiveCard className="p-6 sm:p-8" glowColor="rgba(245, 158, 11, 0.3)">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span>Diagnostic Medical Sonography</span>
              <span>•</span>
              <span>High-Resolution Imaging</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>USS ULTRASOUND & SONOGRAPHY</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                Picha za Ultrasound
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Kitengo cha kisasa cha uchunguzi wa picha za ultrasound kwa wajawazito (Obstetric 2D/3D), uchunguzi wa viungo vya ndani ya tumbo (Abdominal), nyonga na kizazi (Pelvic/Gynae), na mishipa ya damu (Doppler).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewScanModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/30 transition"
              title="Kurekodi ripoti mpya ya ultrasound"
            >
              <Plus className="h-4 w-4" />
              <span>Rekodi Kipimo Kipya cha USS</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs flex items-center gap-2 border border-neutral-700 transition"
              title="Chapisha ripoti rasmi ya ultrasound kwa mgonjwa"
            >
              <Printer className="h-4 w-4" />
              <span>Chapisha Ripoti Rasmi</span>
            </button>
          </div>
        </div>
      </InteractiveCard>

      {/* Main Grid: Scan List & Detailed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scan Records List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 px-1 flex items-center justify-between">
            <span>Vipimo Vilivyofanyika ({ultrasoundRecords.length})</span>
            <span className="text-amber-600">Bofya kupitia</span>
          </div>

          {ultrasoundRecords.map((scan) => (
            <InteractiveCard
              key={scan.id}
              onClick={() => setSelectedScan(scan)}
              className={`p-4 transition ${
                selectedScan.id === scan.id
                  ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : ''
              }`}
              glowColor="rgba(245, 158, 11, 0.2)"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-mono text-neutral-500">{scan.scanNumber}</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full text-[10px]">
                  {scan.scanType.split(' ')[0]}
                </span>
              </div>

              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                {scan.patientName}
              </h4>
              <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                {scan.clinicalIndication}
              </p>

              <div className="mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{scan.date}</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  Angalia Ripoti →
                </span>
              </div>
            </InteractiveCard>
          ))}
        </div>

        {/* Right: Detailed Sonography Report Viewer */}
        {selectedScan && (
          <div className="lg:col-span-2 space-y-4">
            <InteractiveCard className="p-6 sm:p-8 space-y-6" glowColor="rgba(245, 158, 11, 0.25)">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                    <ScanLine className="h-4 w-4" />
                    <span>RIPOTI RASMI YA PICHA ZA ULTRASOUND (SONOGRAPHY REPORT)</span>
                  </div>
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                    {selectedScan.scanType}
                  </h2>
                  <div className="text-xs text-neutral-500">
                    Namba: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{selectedScan.scanNumber}</span> • Tarehe: {selectedScan.date}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Habari, ripoti ya Ultrasound ya ${selectedScan.patientName} (${selectedScan.scanNumber}) iko tayari.\nUtambuzi (Impression): ${selectedScan.impression}\nMapendekezo: ${selectedScan.recommendations}`;
                      openWhatsAppWebChat('+255714234567', text);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    title="Tuma muhtasari wa ultrasound kwa WhatsApp ya mgonjwa"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Tuma WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300"
                    title="Chapisha Ripoti"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Patient Meta Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-2xl">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Mgonjwa:</span>
                  <strong>{selectedScan.patientName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">OPD Number:</span>
                  <strong className="font-mono">{selectedScan.opdNumber}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Umri & Jinsia:</span>
                  <strong>{selectedScan.age} yrs • {selectedScan.gender}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Daktari Aliyeelekeza:</span>
                  <strong className="truncate block">{selectedScan.referringDoctor}</strong>
                </div>
              </div>

              {/* Clinical Measurements (Obstetric or Abdominal) */}
              {selectedScan.measurements && Object.keys(selectedScan.measurements).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
                    Vipimo vya Kichanga / Viungo (Sonographic Biometry):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {selectedScan.measurements.bpd && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] text-neutral-400 block font-bold">BPD (Kipenyo cha Kichwa):</span>
                        <strong className="text-amber-600 font-mono text-sm">{selectedScan.measurements.bpd}</strong>
                      </div>
                    )}
                    {selectedScan.measurements.fl && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] text-neutral-400 block font-bold">FL (Urefu wa Paja):</span>
                        <strong className="text-amber-600 font-mono text-sm">{selectedScan.measurements.fl}</strong>
                      </div>
                    )}
                    {selectedScan.measurements.efw && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] text-neutral-400 block font-bold">Uzito Unaokadiriwa (EFW):</span>
                        <strong className="text-emerald-600 font-mono text-sm">{selectedScan.measurements.efw}</strong>
                      </div>
                    )}
                    {selectedScan.measurements.edd && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] text-neutral-400 block font-bold">Tarehe ya Kujifungua (EDD):</span>
                        <strong className="text-purple-600 font-mono text-sm">{selectedScan.measurements.edd}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Findings Text */}
              <div className="space-y-2 text-xs">
                <h4 className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
                  Uchunguzi Uliopatikana (Sonographic Findings):
                </h4>
                <p className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 leading-relaxed text-neutral-800 dark:text-neutral-200 font-medium">
                  {selectedScan.findings}
                </p>
              </div>

              {/* Impression & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                  <span className="font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px] block mb-1">
                    Hitimisho la Kipimo (Impression):
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-100 font-bold leading-relaxed">
                    {selectedScan.impression}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80">
                  <span className="font-extrabold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[10px] block mb-1">
                    Mapendekezo ya Kitabibu (Recommendations):
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-100 font-bold leading-relaxed">
                    {selectedScan.recommendations}
                  </p>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <div>
                  <span>Mtaalamu wa Picha: </span>
                  <strong className="text-neutral-800 dark:text-neutral-200">{selectedScan.sonographerName}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Kipimo Kimethibitishwa (Verified)</span>
                </div>
              </div>
            </InteractiveCard>
          </div>
        )}
      </div>

      {/* PRINT MODAL FOR ULTRASOUND REPORT */}
      {selectedScan && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="RIPOTI RASMI YA UCHUNGUZI WA ULTRASOUND (DIAGNOSTIC SONOGRAPHY REPORT)"
          documentNumber={selectedScan.scanNumber}
          category="Idara ya Picha za Mionzi na Ultrasound (Radiology & Imaging Directorate)"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-300">
              <div>
                <span className="text-neutral-500 block">Jina la Mgonjwa:</span>
                <strong className="text-sm">{selectedScan.patientName}</strong>
                <div className="text-[11px] text-neutral-600">OPD: {selectedScan.opdNumber} | Umri: {selectedScan.age}</div>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block">Aina ya Kipimo:</span>
                <strong className="text-teal-800">{selectedScan.scanType}</strong>
                <div className="text-[11px] text-neutral-600">Tarehe: {selectedScan.date}</div>
              </div>
            </div>

            <div>
              <strong className="block text-neutral-700 uppercase font-bold mb-1">Sababu ya Kipimo (Indication):</strong>
              <p className="p-2 bg-white rounded border border-neutral-200">{selectedScan.clinicalIndication}</p>
            </div>

            <div>
              <strong className="block text-neutral-700 uppercase font-bold mb-1">Uchunguzi Uliopatikana (Findings):</strong>
              <p className="p-3 bg-white rounded border border-neutral-200 leading-relaxed">{selectedScan.findings}</p>
            </div>

            {selectedScan.measurements && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-300">
                <strong className="block text-neutral-700 uppercase font-bold mb-1">Vipimo Halisi (Biometry):</strong>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedScan.measurements).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-[10px] text-neutral-500 uppercase">{key}:</span>
                      <strong className="block">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
              <strong className="block text-amber-900 uppercase font-bold mb-0.5">Hitimisho (Impression):</strong>
              <p className="font-bold text-neutral-900">{selectedScan.impression}</p>
            </div>

            <div className="pt-4 border-t flex justify-between text-neutral-600">
              <div>
                <span>Daktari: </span><strong>{selectedScan.referringDoctor}</strong>
              </div>
              <div>
                <span>Sonographer: </span><strong>{selectedScan.sonographerName}</strong>
              </div>
            </div>
          </div>
        </PrintModal>
      )}

      {/* NEW SCAN MODAL */}
      {isNewScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                  Kurekodi Kipimo Kipya cha Ultrasound
                </h3>
                <p className="text-xs text-neutral-500">Neema Dispensary Ultrasound Unit</p>
              </div>
              <button type="button" onClick={() => setIsNewScanModalOpen(false)} className="text-neutral-400">✕</button>
            </div>

            <form onSubmit={handleCreateNewScan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Mgonjwa</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.opdNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Aina ya Ultrasound & Bei Rasmi (Official Tariff)
                </label>
                <select
                  value={newScanType}
                  onChange={(e) => setNewScanType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold text-neutral-800 dark:text-neutral-100"
                >
                  <option value="USS OBSTETRIC">USS OBSTETRIC — TZS 25,000 (AGREED)</option>
                  <option value="USS KUB (Kidney, Ureter, Bladder)">USS KUB (Kidney, Ureter, Bladder) — TZS 30,000 (AGREED)</option>
                  <option value="USS ABDOMINAL / PELVIC">USS ABDOMINAL / PELVIC — TZS 25,000 (AGREED)</option>
                  <option value="Pelvic / Gynae (Nyonga & Kizazi)">Pelvic / Gynae (Nyonga & Kizazi) — TZS 25,000</option>
                  <option value="Doppler / Vascular">Doppler / Vascular — TZS 35,000</option>
                  <option value="Cardiac Echo">Cardiac Echo — TZS 45,000</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Sababu ya Kipimo (Indication)</label>
                <input
                  type="text"
                  required
                  value={newIndication}
                  onChange={(e) => setNewIndication(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Matokeo ya Uchunguzi (Findings)</label>
                <textarea
                  rows={3}
                  required
                  value={newFindings}
                  onChange={(e) => setNewFindings(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Hitimisho (Impression)</label>
                <input
                  type="text"
                  required
                  value={newImpression}
                  onChange={(e) => setNewImpression(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold text-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewScanModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-neutral-500 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Hifadhi Ripoti ya Ultrasound
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
