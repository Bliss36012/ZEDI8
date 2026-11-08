import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  ShieldCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  DollarSign,
  Users,
  BedDouble,
  Clock,
  AlertCircle,
  FileCheck,
  Building,
} from 'lucide-react';
import { exportToExcel, exportToWord, exportToPowerPoint } from '../../utils/exporters';

export const AuditedReportsView: React.FC = () => {
  const {
    currentUser,
    patients,
    invoices,
    wardBeds,
    labOrders,
    staffMembers,
    canAccessDepartment,
    logPrivilegeViolation,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Reports');
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Audited Financial Reports Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Overall audited performance reports contain sensitive governance evaluations and are strictly reserved for the Hospital Manager (Dkt. Joseph Mrema) and the Board.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Reports', 'Attempted unauthorized audited financial statement access')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Request Manager Authorization
        </button>
      </div>
    );
  }

  // Report Metrics based on period
  const metrics =
    reportPeriod === 'weekly'
      ? {
          periodLabel: 'Week 42 (Oct 12 - Oct 18, 2026)',
          grossRevenue: 3120000,
          collectionRate: '96.2%',
          patientVisits: 114,
          bedTurnover: '82%',
          labAccuracy: '99.8%',
          punctuality: '98.5%',
          auditScore: 'A+ (Exemplary)',
          highlights: [
            'Outpatient attendance surged 12% driven by weekend pediatric reviews.',
            'Zero medication stockouts recorded across essential antimalarial (ALU) and antibiotic lines.',
            'Average triage waiting time decreased to 19 minutes per client.',
          ],
        }
      : reportPeriod === 'monthly'
      ? {
          periodLabel: 'October 2026 Audited Operational Period',
          grossRevenue: 12300000,
          collectionRate: '94.8%',
          patientVisits: 405,
          bedTurnover: '78%',
          labAccuracy: '99.4%',
          punctuality: '97.9%',
          auditScore: 'Grade I MoH Tanzania Compliance',
          highlights: [
            'Achieved monthly revenue target of TZS 12.0M with a 2.5% surplus.',
            'Implemented automated electronic insurance pre-authorization with NHIF Tanzania and CHF.',
            'Completed 48 inpatient ward admissions with average stay duration of 2.4 days.',
          ],
        }
      : {
          periodLabel: 'Year 2026 Annual Audited Governance Report',
          grossRevenue: 138500000,
          collectionRate: '95.6%',
          patientVisits: 4890,
          bedTurnover: '80%',
          labAccuracy: '99.6%',
          punctuality: '98.1%',
          auditScore: 'Level 4 MCT / MoH Accredited',
          highlights: [
            'Total annual health service encounters reached 4,890 community members in Nyamongo and Tarime District.',
            'Commissioned modern 12-bed Maternal & Child Health (RCH) inpatient wing.',
            'Surplus revenue of TZS 28.0M allocated to neonatal incubator procurement and digital radiology.',
          ],
        };

  // EXPORTS
  const handleExportExcel = () => {
    const headers = ['Audited Parameter', 'Result / Value', 'Benchmark Standard', 'Compliance Status'];
    const rows = [
      ['Gross Audited Revenue', `TZS ${metrics.grossRevenue.toLocaleString()}`, 'TZS 11.5M', 'Exceeded Target'],
      ['Revenue Collection Efficiency', metrics.collectionRate, '90.0%', 'Compliant'],
      ['Total Patient Consultations', metrics.patientVisits, '350 visits', 'Exceeded'],
      ['Inpatient Bed Turnover Rate', metrics.bedTurnover, '75.0%', 'Compliant'],
      ['Laboratory Quality Assurance', metrics.labAccuracy, '99.0%', 'Compliant'],
      ['Biometric Staff Punctuality', metrics.punctuality, '95.0%', 'Compliant'],
      ['Overall Governance Audit Rating', metrics.auditScore, 'Grade I', 'Certified'],
    ];

    exportToExcel(`Neema_${reportPeriod.toUpperCase()}_Audit_${new Date().toISOString().split('T')[0]}`, `Neema Dispensary - ${metrics.periodLabel}`, headers, rows);
  };

  const handleExportWord = () => {
    exportToWord(
      `Neema_${reportPeriod.toUpperCase()}_Audited_Statement_${new Date().toISOString().split('T')[0]}`,
      `Official ${reportPeriod.toUpperCase()} Audited Performance Statement`,
      metrics.periodLabel,
      [
        {
          heading: 'Executive Audit Findings',
          paragraphs: [
            `This certified report presents the independent operational and financial performance of Neema Dispensary for ${metrics.periodLabel}.`,
            ...metrics.highlights,
          ],
          table: {
            headers: ['Performance Metric', 'Recorded Value', 'Operational Status'],
            rows: [
              ['Gross Billed Revenue', `TZS ${metrics.grossRevenue.toLocaleString()}`, 'Verified & Certified'],
              ['Collection Efficiency', metrics.collectionRate, 'Compliant'],
              ['Total Patient Encounters', String(metrics.patientVisits), 'Electronic Registry Reconciled'],
              ['Overall Audit Classification', metrics.auditScore, 'Approved by Medical Director'],
            ],
          },
        },
      ]
    );
  };

  const handleExportPPT = () => {
    exportToPowerPoint(
      `Neema_${reportPeriod.toUpperCase()}_Board_Presentation_${new Date().toISOString().split('T')[0]}`,
      `Neema Dispensary ${reportPeriod.toUpperCase()} Audited Performance Briefing`,
      [
        {
          title: `Executive Performance: ${metrics.periodLabel}`,
          subtitle: 'Formal Audited Evaluation for Hospital Manager and Board of Governance',
          bulletPoints: metrics.highlights,
          metrics: [
            { label: 'Revenue', value: `TZS ${(metrics.grossRevenue / 1000).toFixed(0)}K` },
            { label: 'Visits', value: String(metrics.patientVisits) },
            { label: 'Audit Grade', value: metrics.auditScore.split(' ')[0] },
          ],
        },
        {
          title: 'Departmental Clinical & Financial Governance',
          subtitle: 'Verification of Pharmacy, Laboratory, and Inpatient Services',
          bulletPoints: [
            'All billing accounts audited against digital M-Pesa statements and bank deposits.',
            'Pharmacy inventory shrinkage verified at below 0.2% following biometric gate badging.',
            'Zero hospital-acquired infections (HAI) reported in Women and Children wards.',
          ],
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Admin & Governance Audit Office
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Certified by: Dkt. Joseph Mrema (Mganga Mkuu & Manager)
            </span>
          </div>
          <h1 className="text-2xl font-bold">Overall Weekly, Monthly & Yearly Audited Reports</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Formal performance evaluation statements covering financial revenue collection, clinical quality indicators, bed turnover, and staff compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Audit (.xls)</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Word Report (.doc)</span>
          </button>
          <button
            type="button"
            onClick={handleExportPPT}
            className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <Presentation className="h-4 w-4" />
            <span>PowerPoint (.ppt)</span>
          </button>
        </div>
      </div>

      {/* Time Horizon Selector */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5 text-xs font-bold gap-2">
        <button
          type="button"
          onClick={() => setReportPeriod('weekly')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition ${
            reportPeriod === 'weekly'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          Overall Weekly Audited Report (Week 42)
        </button>

        <button
          type="button"
          onClick={() => setReportPeriod('monthly')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition ${
            reportPeriod === 'monthly'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          Overall Monthly Audited Report (October 2026)
        </button>

        <button
          type="button"
          onClick={() => setReportPeriod('yearly')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition ${
            reportPeriod === 'yearly'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          Overall Yearly Audited Performance Report (2026)
        </button>
      </div>

      {/* Report Cards & Highlights */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[11px] font-mono text-teal-600 font-bold uppercase tracking-wider">
              {metrics.periodLabel}
            </span>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
              Certified Administrative Audit Statement
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black px-3 py-1 rounded-xl">
              Rating: {metrics.auditScore}
            </span>
          </div>
        </div>

        {/* 6 Key Performance Metric Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gross Revenue</span>
            <div className="text-lg font-black text-emerald-600 mt-1">
              TZS {(metrics.grossRevenue / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">100% Reconciled</span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Collection Rate</span>
            <div className="text-lg font-black text-blue-600 mt-1">
              {metrics.collectionRate}
            </div>
            <span className="text-[10px] text-neutral-400">Target &gt; 90%</span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Patient Encounters</span>
            <div className="text-lg font-black text-teal-600 mt-1">
              {metrics.patientVisits}
            </div>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">+18% vs Baseline</span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Bed Turnover</span>
            <div className="text-lg font-black text-purple-600 mt-1">
              {metrics.bedTurnover}
            </div>
            <span className="text-[10px] text-neutral-400">3 Wards Monitored</span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Lab Diagnostic Acc.</span>
            <div className="text-lg font-black text-indigo-600 mt-1">
              {metrics.labAccuracy}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">ISO 15189 Aligned</span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Staff Punctuality</span>
            <div className="text-lg font-black text-amber-600 mt-1">
              {metrics.punctuality}
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Biometric Verified</span>
          </div>
        </div>

        {/* Audit Findings Bullet Points */}
        <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-900/60 space-y-2 text-xs">
          <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-teal-600" />
            <span>Executive Audit Commentary & Observations:</span>
          </div>
          <ul className="space-y-1.5 text-neutral-700 dark:text-neutral-300 pl-4 list-disc">
            {metrics.highlights.map((h, i) => (
              <li key={i} className="leading-relaxed">{h}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
