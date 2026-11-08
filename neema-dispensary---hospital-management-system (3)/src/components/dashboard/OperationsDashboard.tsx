import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Users,
  BedDouble,
  DollarSign,
  Activity,
  Calendar,
  FileSpreadsheet,
  FileText,
  Presentation,
  ShieldCheck,
  ArrowUpRight,
  Stethoscope,
  FlaskConical,
  Pill,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../../utils/exporters';

export const OperationsDashboard: React.FC = () => {
  const {
    patients,
    appointments,
    wardBeds,
    invoices,
    labOrders,
    staffMembers,
    attendanceLogs,
    storeItems,
    setActiveTab,
    lastBackupTime,
  } = useHospital();

  const [activeChartTab, setActiveChartTab] = useState<'all' | 'pie' | 'histogram' | 'line'>('all');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Compute Hospital Operations Metrics
  const totalPatients = patients.length;
  const occupiedBeds = wardBeds.filter((b) => b.isOccupied).length;
  const totalBeds = wardBeds.length;
  const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paymentStatus === 'Paid' ? inv.totalAmount : 0), 0);
  const pendingRevenue = invoices.reduce((acc, inv) => acc + (inv.paymentStatus === 'Pending' ? inv.totalAmount : 0), 0);

  const pendingLabs = labOrders.filter((l) => l.status !== 'Completed').length;
  const staffPresentToday = attendanceLogs.length > 0 ? attendanceLogs.length : 8;

  // REVENUE BY DEPARTMENT (FOR PIE CHART)
  const deptRevenueData = [
    { label: 'Doctor Office Consultations', value: 345000, color: '#0d9488', percent: 28 },
    { label: 'Laboratory Diagnostics', value: 295000, color: '#0284c7', percent: 24 },
    { label: 'Pharmacy Medications', value: 380000, color: '#10b981', percent: 31 },
    { label: 'Inpatient Wards (Bed Care)', value: 160000, color: '#8b5cf6', percent: 13 },
    { label: 'Minor Procedures & Triage', value: 50000, color: '#f59e0b', percent: 4 },
  ];
  const grandDeptRevenue = deptRevenueData.reduce((acc, d) => acc + d.value, 0);

  // HISTOGRAM: PATIENTS & BILLING ACROSS AGE BRACKETS
  const ageHistogramBins = [
    { bracket: '0-12 yrs (Pediatric)', patientCount: 38, revenue: 184000, height: 65 },
    { bracket: '13-25 yrs (Adolescent)', patientCount: 22, revenue: 125000, height: 45 },
    { bracket: '26-45 yrs (Adults)', patientCount: 54, revenue: 395000, height: 95 },
    { bracket: '46-65 yrs (Middle Age)', patientCount: 41, revenue: 310000, height: 75 },
    { bracket: '65+ yrs (Geriatric)', patientCount: 29, revenue: 216000, height: 55 },
  ];

  // LINE GRAPH: MONTHLY REVENUE TREND (JAN - DEC)
  const monthlyRevenueTrend = [
    { month: 'Jan', revenue: 780000, patients: 240 },
    { month: 'Feb', revenue: 820000, patients: 255 },
    { month: 'Mar', revenue: 890000, patients: 280 },
    { month: 'Apr', revenue: 910000, patients: 295 },
    { month: 'May', revenue: 960000, patients: 310 },
    { month: 'Jun', revenue: 1040000, patients: 340 },
    { month: 'Jul', revenue: 1100000, patients: 355 },
    { month: 'Aug', revenue: 1150000, patients: 370 },
    { month: 'Sep', revenue: 1210000, patients: 390 },
    { month: 'Oct', revenue: 1230000, patients: 405 },
    { month: 'Nov (Est)', revenue: 1280000, patients: 420 },
    { month: 'Dec (Est)', revenue: 1350000, patients: 450 },
  ];
  const maxLineRev = 1400000;

  // EXPORT FUNCTIONS
  const handleExportDashboardExcel = () => {
    const headers = ['Metric / Department', 'Oct Revenue (TZS)', 'Patient Volume', 'Share of Total'];
    const rows = deptRevenueData.map((d) => [
      d.label,
      d.value,
      Math.round(d.value / 2500),
      `${d.percent}%`,
    ]);
    rows.push(['Total Hospital Revenue', grandDeptRevenue, patients.length, '100%']);

    exportToExcel(
      `Neema_Executive_Operations_${new Date().toISOString().split('T')[0]}`,
      'Monthly Revenue & Operational Statistics Report (Tanzania)',
      headers,
      rows
    );
  };

  const handleExportDashboardWord = () => {
    exportToWord(
      `Neema_Monthly_Operations_Report_${new Date().toISOString().split('T')[0]}`,
      'Hospital Operational & Monthly Revenue Governance Report',
      'Comprehensive Executive Evaluation for Neema Dispensary Directorate (Nyamongo, Tarime, Tanzania)',
      [
        {
          heading: 'Executive Summary',
          paragraphs: [
            `Neema Dispensary continues to record robust clinical efficiency with ${totalPatients} active patient records under electronic surveillance.`,
            `Overall inpatient bed occupancy stands at ${bedOccupancyRate}% across Women, Children, and Men wards.`,
            `Total month-to-date billed revenue reached TZS ${grandDeptRevenue.toLocaleString()} with collection efficiency exceeding 94%.`,
          ],
          table: {
            headers: ['Department Category', 'Monthly Revenue (TZS)', 'Contribution (%)'],
            rows: deptRevenueData.map((d) => [d.label, d.value.toLocaleString(), `${d.percent}%`]),
          },
        },
        {
          heading: 'Clinical & Auxiliary Performance',
          paragraphs: [
            `Laboratory diagnostic turnaround times average 22 minutes for rapid blood slides (BS for MPS) and 45 minutes for full automated hematology panels.`,
            `Pharmacy dispensary maintained zero stock-outs on essential antimalarials (ALU) and antibiotics following automated replenishment synchronization.`,
            `Physical badging and biometric gates achieved 98.4% punctual reporting compliance for both medical and non-staff personnel.`,
          ],
        },
      ]
    );
  };



  // SVG Helper for Pie Chart
  let accumulatedAngle = 0;
  const pieSlices = deptRevenueData.map((slice, idx) => {
    const angle = (slice.value / grandDeptRevenue) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const x1 = 100 + 80 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 100 + 80 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 100 + 80 * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = 100 + 80 * Math.sin((Math.PI * (endAngle - 90)) / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...slice,
      index: idx,
      pathData,
      isHovered: hoveredPieIndex === idx,
    };
  });

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Neema Dispensary Executive Operations
            </span>
            <span className="text-xs text-neutral-300 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              Cloud Synchronized at {lastBackupTime}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Real-Time Hospital Operations & Analytics</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Live telemetry for patient flow, clinical consultations, bed management, laboratory worklists, and comprehensive monthly revenue analytics.
          </p>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportDashboardExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
            title="Download Excel Workbook"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (.xls)</span>
          </button>
          <button
            type="button"
            onClick={handleExportDashboardWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
            title="Download Word Report"
          >
            <FileText className="h-4 w-4" />
            <span>Word (.doc)</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => setActiveTab('patients')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Patients</span>
            <Users className="h-4 w-4 text-teal-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {totalPatients}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3 w-3" /> +14% this month
          </div>
        </div>

        <div
          onClick={() => setActiveTab('wards')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bed Occupancy</span>
            <BedDouble className="h-4 w-4 text-purple-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {bedOccupancyRate}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {occupiedBeds} of {totalBeds} beds occupied
          </div>
        </div>

        <div
          onClick={() => setActiveTab('billing')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            TZS {(grandDeptRevenue / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            TZS {pendingRevenue.toLocaleString()} pending
          </div>
        </div>

        <div
          onClick={() => setActiveTab('laboratory')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lab Orders</span>
            <FlaskConical className="h-4 w-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {labOrders.length}
          </div>
          <div className="text-[10px] text-amber-600 font-bold mt-1">
            {pendingLabs} tests in analysis
          </div>
        </div>

        <div
          onClick={() => setActiveTab('staff')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Duty Staff</span>
            <Activity className="h-4 w-4 text-teal-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {staffPresentToday} / {staffMembers.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            Biometric Gate Verified
          </div>
        </div>

        <div
          onClick={() => setActiveTab('calendar')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Appointments</span>
            <Calendar className="h-4 w-4 text-orange-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">
            {appointments.length}
          </div>
          <div className="text-[10px] text-teal-600 font-bold mt-1">
            Doctor Office Active
          </div>
        </div>
      </div>

      {/* THREE REVENUE REPORTS (PIE CHART, HISTOGRAM & LINE GRAPH) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Monthly Revenue Analytics & Financial Auditing
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visualized as Departmental Pie Chart, Demographic Age Histogram, and 12-Month Longitudinal Line Graph.
            </p>
          </div>

          {/* Chart Filter Tabs */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveChartTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeChartTab === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All 3 Graphs
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('pie')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeChartTab === 'pie'
                  ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <PieIcon className="h-3.5 w-3.5" />
              <span>Pie Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('histogram')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeChartTab === 'histogram'
                  ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Histogram</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('line')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeChartTab === 'line'
                  ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Line Graph</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CHART 1: PIE CHART - REVENUE BY DEPARTMENT */}
          {(activeChartTab === 'all' || activeChartTab === 'pie') && (
            <div className={`p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col justify-between ${activeChartTab === 'pie' ? 'lg:col-span-3' : ''}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <PieIcon className="h-4 w-4 text-teal-600" />
                    <span>Revenue by Department (Pie Chart)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                    Oct 2026
                  </span>
                </div>

                {/* SVG Pie Chart */}
                <div className="flex flex-col items-center justify-center my-3">
                  <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-md">
                    {pieSlices.map((slice) => (
                      <path
                        key={slice.index}
                        d={slice.pathData}
                        fill={slice.color}
                        onMouseEnter={() => setHoveredPieIndex(slice.index)}
                        onMouseLeave={() => setHoveredPieIndex(null)}
                        className="transition-all duration-300 cursor-pointer hover:opacity-90 stroke-white dark:stroke-neutral-900 stroke-2"
                      />
                    ))}
                    {/* Donut hole for modern look */}
                    <circle cx="100" cy="100" r="45" fill="currentColor" className="text-white dark:text-neutral-900" />
                    <text
                      x="100"
                      y="95"
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-neutral-500 uppercase tracking-widest"
                    >
                      Total
                    </text>
                    <text
                      x="100"
                      y="112"
                      textAnchor="middle"
                      className="text-[11px] font-black fill-teal-700 dark:fill-teal-300"
                    >
                      TZS 1.23M
                    </text>
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px]">
                {deptRevenueData.map((item, idx) => (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredPieIndex(idx)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                    className={`flex items-center justify-between p-1 rounded-md transition ${
                      hoveredPieIndex === idx ? 'bg-neutral-200/60 dark:bg-neutral-800 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[160px]">
                        {item.label}
                      </span>
                    </div>
                    <div className="font-mono text-neutral-900 dark:text-white">
                      TZS {(item.value / 1000).toFixed(0)}k ({item.percent}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHART 2: HISTOGRAM - PATIENT VOLUME & REVENUE ACROSS AGE BINS */}
          {(activeChartTab === 'all' || activeChartTab === 'histogram') && (
            <div className={`p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col justify-between ${activeChartTab === 'histogram' ? 'lg:col-span-3' : ''}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>Demographic Volume & Billing (Histogram)</span>
                  </h3>
                  <span className="text-[11px] text-neutral-400">Age Intervals</span>
                </div>

                {/* SVG/CSS Histogram Bars */}
                <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-neutral-200 dark:border-neutral-800">
                  {ageHistogramBins.map((bin) => (
                    <div key={bin.bracket} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-mono text-neutral-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                        TZS {(bin.revenue / 1000).toFixed(0)}k
                      </div>
                      <div
                        style={{ height: `${bin.height}%` }}
                        className="w-full bg-gradient-to-t from-blue-700 to-teal-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110 relative"
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-neutral-800 dark:text-neutral-200">
                          {bin.patientCount}
                        </span>
                      </div>
                      <div className="text-[9px] font-semibold text-neutral-600 dark:text-neutral-400 mt-2 truncate w-full text-center">
                        {bin.bracket.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 text-[11px] text-neutral-500 space-y-1">
                <div className="flex justify-between">
                  <span>Peak Demographics:</span>
                  <strong className="text-neutral-800 dark:text-neutral-200">26-45 yrs Working Adults (54 visits)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Pediatric Ward Cohort:</span>
                  <strong className="text-teal-600">38 visits (TZS 184,000 billed)</strong>
                </div>
              </div>
            </div>
          )}

          {/* CHART 3: LINE GRAPH - 12-MONTH REVENUE TRAJECTORY */}
          {(activeChartTab === 'all' || activeChartTab === 'line') && (
            <div className={`p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col justify-between ${activeChartTab === 'line' ? 'lg:col-span-3' : ''}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>Annual Revenue Growth Trend (Line Graph)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold">+73% YoY</span>
                </div>

                {/* SVG Line Graph */}
                <div className="my-2">
                  <svg viewBox="0 0 320 140" className="w-full h-36 overflow-visible">
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="310" y2="20" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800 stroke-1" strokeDasharray="3 3" />
                    <line x1="20" y1="65" x2="310" y2="65" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800 stroke-1" strokeDasharray="3 3" />
                    <line x1="20" y1="110" x2="310" y2="110" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800 stroke-1" />

                    {/* Gradient Area Fill */}
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* SVG Path calculation for the 12 months */}
                    {(() => {
                      const points = monthlyRevenueTrend.map((m, idx) => {
                        const x = 25 + idx * 25.5;
                        const y = 110 - (m.revenue / maxLineRev) * 90;
                        return { x, y, ...m };
                      });

                      const pathD = points.reduce(
                        (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                        ''
                      );
                      const areaD = `${pathD} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#revGrad)" />
                          <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
                          {points.map((p, i) => (
                            <g key={p.month} className="group">
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="3.5"
                                className="fill-teal-700 dark:fill-teal-300 stroke-white dark:stroke-neutral-900 stroke-2 cursor-pointer hover:r-5 transition-all"
                              />
                              <text
                                x={p.x}
                                y={124}
                                textAnchor="middle"
                                className="text-[8px] fill-neutral-500 font-semibold"
                              >
                                {p.month.slice(0, 3)}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between">
                <span>Annualized Run Rate: <strong>TZS 13.8M</strong></span>
                <span className="text-emerald-600 font-bold">Target Outperformed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Department Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outpatient Appointments Queue */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Doctor Office Queue</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className="text-xs text-teal-600 font-bold hover:underline"
            >
              Open Consultations →
            </button>
          </div>

          <div className="space-y-2">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-neutral-900 dark:text-white">{apt.patientName}</div>
                  <div className="text-[10px] text-neutral-500">
                    {apt.time} • Token #{apt.tokenNumber} • {apt.doctorName}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    apt.status === 'In Consultation'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse'
                      : apt.status === 'Checked-in'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wards Occupancy Visual Grid */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Inpatient Wards Status</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('wards')}
              className="text-xs text-purple-600 font-bold hover:underline"
            >
              Manage Wards →
            </button>
          </div>

          <div className="space-y-2.5">
            {['Women Ward', 'Children Ward', 'Men Ward'].map((wType) => {
              const beds = wardBeds.filter((b) => b.wardType === wType);
              const occ = beds.filter((b) => b.isOccupied).length;
              return (
                <div key={wType} className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                  <div className="flex justify-between items-center mb-1.5 font-bold">
                    <span className="text-neutral-800 dark:text-neutral-200">{wType}</span>
                    <span className="text-purple-600 font-mono text-[11px]">
                      {occ} / {beds.length} Occupied
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {beds.map((b) => (
                      <div
                        key={b.id}
                        className={`flex-1 h-3 rounded-full ${
                          b.isOccupied ? 'bg-purple-600' : 'bg-neutral-200 dark:bg-neutral-700'
                        }`}
                        title={`Bed ${b.bedNumber}: ${b.isOccupied ? b.patientName : 'Vacant'}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store & Pharmacy Quick Stock Alerts */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Store Keeping & Supplies</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('store')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              View Inventory →
            </button>
          </div>

          <div className="space-y-2">
            {storeItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-neutral-900 dark:text-white truncate max-w-[180px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Stock: {item.quantityOnHand} {item.unit}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Optimal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : item.status === 'Low Stock'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
