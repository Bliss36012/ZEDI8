import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertOctagon,
  FileSpreadsheet,
  FileText,
  Presentation,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Send,
  Bell,
  AlertTriangle,
  PackageCheck,
  Check,
  X,
  Printer,
  Edit3,
  Trash2,
  Undo2,
  MessageSquare,
  Phone,
  Video,
} from 'lucide-react';
import { StoreItem, Department, StoreRequisition } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { PrintModal } from '../common/PrintModal';

export const StoreKeepingView: React.FC = () => {
  const {
    storeItems,
    storeTransactions,
    storeRequisitions,
    recordStoreStockIn,
    recordStoreStockOut,
    recordStoreSpoiledItem,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem,
    updateStoreItemThreshold,
    createStoreRequisition,
    managerApproveStoreRequisition,
    transferStoreStockToPharmacy,
    undoStack,
    undoLastAction,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
    triggerDirectWhatsAppWeb,
    triggerDirectWhatsAppVoiceCall,
    triggerDirectWhatsAppVideoCall,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Store Keeping');

  const [activeTab, setActiveTab] = useState<'catalog' | 'requisitions' | 'alerts' | 'transactions'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeActionModal, setActiveActionModal] = useState<'stock-in' | 'stock-out' | 'spoiled' | 'new-item' | null>(null);

  // Form states
  const [selectedItemId, setSelectedItemId] = useState(storeItems[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [recipientDept, setRecipientDept] = useState<Department>('Pharmacy');
  const [reason, setReason] = useState('Routine bi-weekly department replenishment');

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<StoreItem['category']>('Medicines');
  const [newItemUnit, setNewItemUnit] = useState('Boxes (100 tabs)');
  const [newItemCost, setNewItemCost] = useState(1500);
  const [newItemPrice, setNewItemPrice] = useState(2500);
  const [newItemThreshold, setNewItemThreshold] = useState(10);
  const [newItemAisle, setNewItemAisle] = useState('Shelf A');
  const [newItemBatch, setNewItemBatch] = useState(`BAT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newItemExpiry, setNewItemExpiry] = useState('2028-12-31');

  // New Requisition Form State
  const [isNewRequisitionOpen, setIsNewRequisitionOpen] = useState(false);
  const [reqType, setReqType] = useState<StoreRequisition['type']>('Distribute to Pharmacy');
  const [reqItemName, setReqItemName] = useState(storeItems[0]?.name || 'Coartem 80/480mg');
  const [reqQty, setReqQty] = useState(50);
  const [reqTargetDept, setReqTargetDept] = useState<Department>('Pharmacy');
  const [reqReason, setReqReason] = useState('Uhitaji wa dharura wa dawa kwa ajili ya wagonjwa wa nje na wodi');
  const [managerApprovalNotes, setManagerApprovalNotes] = useState('');
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  // Edit item state
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<StoreItem['category']>('Medicines');
  const [editUnit, setEditUnit] = useState('Boxes (100 tabs)');
  const [editQty, setEditQty] = useState(10);
  const [editCost, setEditCost] = useState(1500);
  const [editPrice, setEditPrice] = useState(2500);
  const [editThreshold, setEditThreshold] = useState(10);
  const [editAisle, setEditAisle] = useState('Shelf A');
  const [editExpiry, setEditExpiry] = useState('2028-12-31');

  // Print Modals State
  const [isPrintInventoryOpen, setIsPrintInventoryOpen] = useState(false);
  const [printRequisitionItem, setPrintRequisitionItem] = useState<StoreRequisition | null>(null);

  const handleOpenEditItem = (item: StoreItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditQty(item.quantityOnHand);
    setEditCost(item.unitCost);
    setEditPrice(item.sellingPrice);
    setEditThreshold(item.minimumThreshold);
    setEditAisle(item.locationAisle);
    setEditExpiry(item.expiryDate);
    setIsEditItemOpen(true);
  };

  const handleUpdateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateStoreItem({
      ...editingItem,
      name: editName,
      category: editCategory,
      unit: editUnit,
      quantityOnHand: Number(editQty),
      unitCost: Number(editCost),
      sellingPrice: Number(editPrice),
      minimumThreshold: Number(editThreshold),
      locationAisle: editAisle,
      expiryDate: editExpiry,
      status: Number(editQty) <= Number(editThreshold) ? 'Low Stock' : 'Optimal',
    });
    setIsEditItemOpen(false);
    setEditingItem(null);
    setAlertFeedback(`Taarifa za bidhaa '${editName}' zimehifadhiwa kikamilifu.`);
    setTimeout(() => setAlertFeedback(null), 3000);
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Store Keeping & Logistics Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Umeingia kama <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Idara ya Stoo Kuu na Ugavi inahitaji kibali cha Mweka Hazina wa Stoo (Storekeeper), Mganga Mkuu au CEO.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Store Keeping', 'Attempted unauthorized warehouse inventory modification')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Omba Kibali cha Uongozi
        </button>
      </div>
    );
  }

  // Deficiency calculation (items <= threshold)
  const deficiencyItems = storeItems.filter((it) => it.quantityOnHand <= it.minimumThreshold);

  // Expiry calculation (items expiring within 90 days or expired)
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const expiryAlertItems = storeItems.filter((it) => {
    const exp = new Date(it.expiryDate);
    return exp <= ninetyDaysFromNow;
  });

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordStoreStockIn(selectedItemId, Number(quantity), reason);
    setActiveActionModal(null);
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientDept === 'Pharmacy') {
      const success = transferStoreStockToPharmacy(selectedItemId, Number(quantity), reason);
      if (!success) {
        alert('Kiasi cha dawa au kifaa hiki hakitoshi ghalani.');
        return;
      }
    } else {
      const success = recordStoreStockOut(selectedItemId, Number(quantity), recipientDept, reason);
      if (!success) {
        alert('Kiasi cha dawa au kifaa hiki hakitoshi ghalani.');
        return;
      }
    }
    setActiveActionModal(null);
  };

  const handleSpoiledSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordStoreSpoiledItem(selectedItemId, Number(quantity), reason);
    setActiveActionModal(null);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    addStoreItem({
      name: newItemName,
      category: newItemCategory,
      unit: newItemUnit,
      quantityOnHand: Number(quantity),
      minimumThreshold: Number(newItemThreshold),
      unitCost: Number(newItemCost),
      sellingPrice: Number(newItemPrice),
      locationAisle: newItemAisle,
      batchNumber: newItemBatch,
      expiryDate: newItemExpiry,
      status: 'Optimal',
    });
    setActiveActionModal(null);
    setNewItemName('');
  };

  const handleCreateRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStoreRequisition({
      type: reqType,
      itemsRequested: [{ itemId: `it-${Date.now()}`, itemName: reqItemName, quantity: Number(reqQty), unit: 'Packs' }],
      targetDepartment: reqType === 'Distribute to Pharmacy' ? 'Pharmacy' : reqTargetDept,
      requestedBy: currentUser.name,
      reason: reqReason,
    });
    setIsNewRequisitionOpen(false);
    setAlertFeedback(`Ombi la kibali limetumwa kwa Mganga Mkuu (Hospital Manager) Dkt. Joseph Mrema kupitia WhatsApp.`);
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  const handleSendDeficiencyExpiryAlert = () => {
    const defCount = deficiencyItems.length;
    const expCount = expiryAlertItems.length;
    setAlertFeedback(
      `Taarifa ya dharura ya Uhaba (${defCount} madawa/vifaa) na Upumuaji wa Muda (${expCount} madawa) imetumwa mara moja kwa WhatsApp ya Mganga Mkuu Dkt. Joseph Mrema.`
    );
    setTimeout(() => setAlertFeedback(null), 4500);
  };

  // STORE AUDITING EXPORTS IN EXCEL, WORD/PDF, AND PPT
  const handleExportStoreExcel = () => {
    const headers = ['Item Code', 'Item Description', 'Category', 'Quantity on Hand', 'Unit', 'Threshold', 'Unit Cost (TZS)', 'Total Value (TZS)', 'Status', 'Expiry Date'];
    const rows = storeItems.map((item) => [
      item.itemCode,
      item.name,
      item.category,
      item.quantityOnHand,
      item.unit,
      item.minimumThreshold,
      item.unitCost,
      item.quantityOnHand * item.unitCost,
      item.status,
      item.expiryDate,
    ]);
    exportToExcel(`Neema_Store_Audit_${new Date().toISOString().split('T')[0]}`, 'Store Keeping & Warehouse Inventory Audit (Tanzania)', headers, rows);
  };

  const handleExportStoreWord = () => {
    const tableHeaders = ['Item Code', 'Description', 'Category', 'Stock Qty', 'Unit Cost (TZS)', 'Status'];
    const tableRows = storeItems.map((i) => [i.itemCode, i.name, i.category, `${i.quantityOnHand} ${i.unit}`, i.unitCost.toLocaleString(), i.status]);

    exportToWord(
      `Neema_Store_Warehouse_Report_${new Date().toISOString().split('T')[0]}`,
      'Warehouse Inventory & Stock-Out Auditing Statement',
      'Neema Dispensary Store Keeping & Logistics Directorate - Nyamongo, Tarime, Tanzania',
      [
        {
          heading: 'Executive Inventory & Cold Chain Summary',
          paragraphs: [
            `Neema Dispensary Central Store maintains ${storeItems.length} active SKUs.`,
            `Total inventory valuation stands at TZS ${storeItems.reduce((acc, it) => acc + it.quantityOnHand * it.unitCost, 0).toLocaleString()}.`,
            `Inspected and certified by Dennis Mtui (Storekeeper) and Dkt. Joseph Mrema (Hospital Manager).`,
          ],
          table: {
            headers: tableHeaders,
            rows: tableRows,
          },
        },
      ]
    );
  };


  const filteredItems = storeItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalInventoryValuation = storeItems.reduce((acc, it) => acc + it.quantityOnHand * it.unitCost, 0);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {alertFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{alertFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertFeedback(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-teal-950 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Warehouse & Logistics Directorate
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Boxes className="h-3 w-3" /> Storekeeper: Dennis Mtui
            </span>
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-400/40">
              Manager Permission Protocol
            </span>
          </div>
          <h1 className="text-2xl font-bold">Store Keeping, Manager Stock Permissions & Auditing</h1>
          <p className="text-xs text-amber-200 mt-1 max-w-xl">
            Mweka stoo anapokea idhini rasmi kutoka kwa Meneja kabla ya kuagiza au kusambaza dawa famasia. Meneja anapokea tahadhari za dharura za uhaba na upumuaji wa muda wa madawa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {undoStack.length > 0 && (currentUser.role === 'ceo' || currentUser.role === 'manager') && (
            <button
              type="button"
              onClick={undoLastAction}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition animate-pulse"
              title={`Tengua kitendo cha mwisho: ${undoStack[0]?.description}`}
            >
              <Undo2 className="h-4 w-4" />
              <span>Tengua ({undoStack.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPrintInventoryOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
            title="Chapisha Orodha Kamili ya Madawa na Vifaa vya Stoo"
          >
            <Printer className="h-4 w-4" />
            <span>Chapisha Ripoti (Print)</span>
          </button>

          <button
            type="button"
            onClick={handleExportStoreExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (.xls)</span>
          </button>
          <button
            type="button"
            onClick={handleExportStoreWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Word/PDF (.doc)</span>
          </button>
        </div>
      </div>

      {/* MEDICAL SUPPLIES THRESHOLD QUANTITY ALERT NOTIFICATION BANNER */}
      {deficiencyItems.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white animate-pulse shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                  TAHADHARI YA UHABA WA DAWA / THRESHOLD ALERT
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  {deficiencyItems.length} Bidhaa za matibabu zimepungua chini ya kiwango cha usalama!
                </span>
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-100 mt-1 font-medium leading-relaxed">
                Vifaa/Dawa zifuatazo ziko chini ya kiwango cha chini kilichowekwa (Threshold Quantity):{' '}
                <span className="font-bold underline">
                  {deficiencyItems.map((d) => `${d.name} (Zilizopo: ${d.quantityOnHand} ${d.unit} / Kiwango cha Chini: ${d.minimumThreshold})`).join('; ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const list = deficiencyItems
                  .map((d) => `• ${d.name}: Zilizopo ${d.quantityOnHand} ${d.unit} (Kiwango cha chini cha tahadhari: ${d.minimumThreshold})`)
                  .join('\n');
                triggerDirectWhatsAppWeb(
                  '+255754345678',
                  `🚨 [TAHADHARI YA UHABA WA DAWA - NEEMA DISPENSARY]\nHabari Dkt. Joseph Mrema (Hospital Manager),\nDawa na vifaa vifuatavyo vimepungua chini ya kiwango cha usalama (Threshold Quantity):\n\n${list}\n\nTafadhali idhinisha ombi la dharura la bohari ya MSD.`
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              title="Tuma ripoti ya dharura kupitia WhatsApp Web"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Web Alert</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewRequisitionOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Agiza Upya (Requisition)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap bg-white dark:bg-neutral-900 rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800 text-xs font-bold gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'catalog'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Katalogi ya Madawa & Vifaa ({storeItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requisitions')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'requisitions'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <PackageCheck className="h-4 w-4 text-emerald-500" />
          <span>Idhini ya Meneja (Requisitions)</span>
          {storeRequisitions.filter((r) => r.status === 'Pending Approval').length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full font-black">
              {storeRequisitions.filter((r) => r.status === 'Pending Approval').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'alerts'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Bell className="h-4 w-4 text-red-500" />
          <span>Tahadhari za Uhaba & Muda ({deficiencyItems.length + expiryAlertItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'transactions'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <RotateCcw className="h-4 w-4 text-blue-500" />
          <span>Miamala ya Stoo ({storeTransactions.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Fast Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setActiveActionModal('stock-in')}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-emerald-500 transition text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <ArrowDownRight className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Pokea Mzigo</span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">Stock In (Pokea)</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Pokea mzigo kutoka bohari (MSD)</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveActionModal('stock-out')}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-blue-500 transition text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Sambaza</span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">Sambaza Famasia / Wodi</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Kutoa dawa kwa idara za zahanati</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveActionModal('spoiled')}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-red-500 transition text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600">
                  <AlertOctagon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold text-red-600 uppercase">Tenga</span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">Dawa Zilizoharibika</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Kutenga na kurekodi hasara ya dawa</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveActionModal('new-item')}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-teal-500 transition text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold text-teal-600 uppercase">Sajili</span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">Ongeza Dawa Mpya</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Sajili SKU mpya ya dawa au kifaa</div>
            </button>
          </div>

          {/* Inventory Table Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search inventory, batch #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-3 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="All">All Categories ({storeItems.length})</option>
                  <option value="Medicines">Medicines</option>
                  <option value="Surgical & Consumables">Surgical & Consumables</option>
                  <option value="Lab Reagents">Lab Reagents</option>
                </select>
              </div>

              <div className="text-xs font-semibold text-neutral-500">
                Thamani ya Stoo: <strong className="text-emerald-600 font-mono text-sm">TZS {totalInventoryValuation.toLocaleString()}</strong>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">SKU Code</th>
                    <th className="pb-2">Jina la Bidhaa</th>
                    <th className="pb-2">Kundi</th>
                    <th className="pb-2">Idadi Ghalani</th>
                    <th className="pb-2">Kiwango cha Tahadhari (Threshold)</th>
                    <th className="pb-2">Gharama (TZS)</th>
                    <th className="pb-2">Hali (Status)</th>
                    <th className="pb-2">Tarehe ya Kuisha</th>
                    <th className="pb-2 text-right">Vitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {filteredItems.map((item) => {
                    const isBelowThreshold = item.quantityOnHand <= item.minimumThreshold;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition ${
                          isBelowThreshold ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                          {item.itemCode}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isBelowThreshold && (
                              <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                                CHINI YA KIWANGO
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            Shelf: {item.locationAisle} • Batch: {item.batchNumber}
                          </div>
                        </td>
                        <td className="py-3 font-medium">{item.category}</td>
                        <td className="py-3 font-mono font-black text-neutral-900 dark:text-white">
                          <span className={isBelowThreshold ? 'text-rose-600 font-extrabold' : ''}>
                            {item.quantityOnHand}
                          </span>{' '}
                          <span className="text-[10px] text-neutral-400 font-normal">{item.unit}</span>
                        </td>
                        <td className="py-3">
                          {/* Defined Threshold Modifier */}
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={item.minimumThreshold}
                              onChange={(e) => updateStoreItemThreshold(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                              title="Badilisha kiwango cha tahadhari cha bidhaa hii"
                            />
                            <span className="text-[10px] text-neutral-400">{item.unit}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono">
                          TZS {item.unitCost.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Optimal'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'Low Stock'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-neutral-500">
                          {item.expiryDate}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs transition"
                              title="Hariri taarifa za bidhaa hii"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {(currentUser.role === 'ceo' || currentUser.role === 'manager') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Je, una uhakika unataka kufuta bidhaa hii ya stoo: '${item.name}'?`)) {
                                    deleteStoreItem(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-300/40"
                                title="Futa bidhaa (CEO/Manager)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER REQUISITION APPROVAL */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-emerald-500" />
                  <span>Maombi ya Kibali cha Meneja: Kuagiza au Kusambaza Mzigo Famasia</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Mweka stoo anaomba kibali rasmi kutoka kwa Mganga Mkuu (Hospital Manager) kabla ya kuagiza dawa mpya au kusambaza mzigo kwenye Famasia.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewRequisitionOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Omba Kibali Kipya cha Mzigo</span>
              </button>
            </div>

            {/* Requisitions List */}
            <div className="space-y-3">
              {storeRequisitions.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                        {req.requisitionNumber}
                      </span>
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        {req.type}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        • {req.requestedAt}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : req.status === 'Declined'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {req.status === 'Approved'
                        ? '✅ Imeidhinishwa na Meneja'
                        : req.status === 'Declined'
                        ? '❌ Imekataliwa na Meneja'
                        : '⏳ Inasubiri Kibali cha Meneja'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Bidhaa Zilizoombwa:</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {req.itemsRequested?.map((it) => `${it.quantity}x ${it.itemName}`).join(', ') || `${req.quantity || 1}x ${req.itemName || 'Item'}`}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Idara Inayopelekewa:</span>
                      <span className="font-bold text-teal-600">{req.targetDepartment}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Imeombwa Na:</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{req.requestedBy}</span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    <strong>Sababu / Maelezo:</strong> {req.reason}
                  </div>

                  {req.managerNotes && (
                    <div className="text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <strong>Maoni ya Meneja ({req.approvedBy || 'Dkt. Joseph Mrema'}):</strong> {req.managerNotes}
                    </div>
                  )}

                  {/* Manager Approval Actions for Manager or CEO */}
                  {req.status === 'Pending Approval' && (currentUser.role === 'manager' || currentUser.role === 'ceo') && (
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt('Andika maelezo ya kukataa ombi hili:');
                          managerApproveStoreRequisition(req.id, false, note || 'Ombi limekataliwa kulingana na ukaguzi wa bajeti.');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Kataa Ombi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt('Andika maoni ya idhini ya Mganga Mkuu (Si lazima):');
                          managerApproveStoreRequisition(req.id, true, note || 'Kibali kimetolewa rasmi na Mganga Mkuu.');
                        }}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Idhinisha (Meneja Idhini)</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFICIENCY & EXPIRY ALERTS FOR MANAGER */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Manager Alert Dispatch Header */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                  Usimamizi wa Tahadhari za Uhaba na Upumuaji wa Muda (Deficiency & Expiry)
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Madawa yenye uhaba: <strong className="text-red-600">{deficiencyItems.length}</strong> • Madawa yanayokaribia kuisha muda: <strong className="text-amber-600">{expiryAlertItems.length}</strong>.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendDeficiencyExpiryAlert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition"
            >
              <Send className="h-4 w-4" />
              <span>Tuma Tahadhari kwa WhatsApp ya Meneja</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deficiencies (Low Stock) List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-red-200 dark:border-red-900/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Uhaba wa Madawa Ghalani (Low Stock Deficiencies)</span>
                </h4>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {deficiencyItems.length} SKUs
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {deficiencyItems.map((item) => (
                  <div key={item.id} className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Kiwango cha Chini: {item.minimumThreshold} {item.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-red-600">{item.quantityOnHand} {item.unit}</div>
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 rounded">Critical</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Alerts List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-amber-600 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Upumuaji wa Muda (Expiry Date Proximity)</span>
                </h4>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {expiryAlertItems.length} SKUs
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {expiryAlertItems.map((item) => (
                  <div key={item.id} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Batch: {item.batchNumber} • Zilizobaki: {item.quantityOnHand} {item.unit}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-amber-700 dark:text-amber-300">{item.expiryDate}</div>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 rounded">Near Expiry</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORE TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-500" />
              <span>Daftari la Miamala ya Stoo (Stock In / Out Ledger)</span>
            </h3>
            <span className="text-xs text-neutral-500 font-semibold">
              Miamala: {storeTransactions.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Namba ya Muamala</th>
                  <th className="pb-2">Aina ya Muamala</th>
                  <th className="pb-2">Dawa / Bidhaa</th>
                  <th className="pb-2">Idadi</th>
                  <th className="pb-2">Idara Inayohusika</th>
                  <th className="pb-2">Imeidhinishwa Na</th>
                  <th className="pb-2">Tarehe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                {storeTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                      {tx.transactionNumber}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === 'Stock In / Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'Stock Out / Issued'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-neutral-900 dark:text-white">{tx.itemName}</td>
                    <td className="py-3 font-mono font-bold">{tx.quantity}</td>
                    <td className="py-3 font-medium text-teal-600">{tx.departmentRecipient || 'Bohari / Supplier'}</td>
                    <td className="py-3 text-neutral-500">{tx.authorizedBy}</td>
                    <td className="py-3 font-mono text-[11px] text-neutral-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NEW REQUISITION (STOREKEEPER TO MANAGER) */}
      {isNewRequisitionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-amber-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Omba Kibali cha Mzigo kwa Meneja</h3>
                <p className="text-xs text-amber-200">Kibali cha kuagiza au kusambaza mzigo famasia</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequisitionOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequisitionSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Aina ya Ombi</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                >
                  <option value="Distribute to Pharmacy">Kusambaza Dawa Kwenye Famasia (Distribute to Pharmacy)</option>
                  <option value="Import New Stock">Kuagiza Mzigo Mpya kutoka Bohari (Import from MSD)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Dawa au Kifaa</label>
                <select
                  value={reqItemName}
                  onChange={(e) => setReqItemName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                >
                  {storeItems.map((it) => (
                    <option key={it.id} value={it.name}>
                      {it.name} (Zilizopo: {it.quantityOnHand} {it.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Idadi Inayoombwa</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={reqQty}
                  onChange={(e) => setReqQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Sababu ya Ombi Hili</label>
                <textarea
                  rows={3}
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewRequisitionOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow"
                >
                  Wasilisha Ombi kwa Meneja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL: STOCK IN */}
      {activeActionModal === 'stock-in' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Pokea Mzigo Ghalani (Stock In)</h3>
                <p className="text-xs text-emerald-200">Mapokezi ya bidhaa kutoka Bohari ya Dawa (MSD)</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Chagua Dawa / Kifaa</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                >
                  {storeItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.itemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Idadi Iliyopokelewa</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Maelezo ya Mapokezi</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                >
                  Thibitisha Mapokezi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL: STOCK OUT */}
      {activeActionModal === 'stock-out' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Sambaza Mzigo kwa Idara (Stock Out)</h3>
                <p className="text-xs text-blue-200">Kutoa dawa kwa ajili ya Famasia au Wodi</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Chagua Dawa / Kifaa</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                >
                  {storeItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (Zilizopo: {it.quantityOnHand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Idara Inayopelekewa</label>
                <select
                  value={recipientDept}
                  onChange={(e) => setRecipientDept(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                >
                  <option value="Pharmacy">Pharmacy Dispensary</option>
                  <option value="Women Ward">Women Ward</option>
                  <option value="Children Ward">Children Ward</option>
                  <option value="Men Ward">Men Ward</option>
                  <option value="Laboratory">Laboratory</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Idadi Inayotolewa</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
                >
                  Thibitisha Kutoa Mzigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL: SPOILED */}
      {activeActionModal === 'spoiled' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-red-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Tenga Dawa Zilizoharibika (Quarantine)</h3>
                <p className="text-xs text-red-200">Rekodi ya ukaguzi wa hasara na utupaji salama</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSpoiledSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Chagua Dawa / Kifaa</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                >
                  {storeItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (Zilizopo: {it.quantityOnHand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Idadi Iliyoharibika</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Sababu ya Uharibifu</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Imevunjika chupa wakati wa kusafirisha au muda umepita"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
                >
                  Tenga Ghalani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL: NEW ITEM */}
      {activeActionModal === 'new-item' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Sajili SKU Mpya ya Ghalani</h3>
                <p className="text-xs text-teal-200">Uingizaji wa bidhaa mpya kwenye orodha kuu</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Jina la Dawa au Kifaa</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Ceftriaxone 1g Injection"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kundi</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Medicines">Medicines</option>
                    <option value="Surgical & Consumables">Surgical & Consumables</option>
                    <option value="Lab Reagents">Lab Reagents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kipimo (Unit)</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Gharama ya Kununua (TZS)</label>
                  <input
                    type="number"
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kiwango cha Chini (Alert)</label>
                  <input
                    type="number"
                    required
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={newItemBatch}
                    onChange={(e) => setNewItemBatch(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Tarehe ya Kuisha</label>
                  <input
                    type="date"
                    required
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow"
                >
                  Sajili Kwenye Stoo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STORE ITEM */}
      {isEditItemOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-amber-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Hariri Taarifa za Bidhaa ya Stoo</h3>
                <p className="text-xs text-amber-200">{editName} ({editingItem.itemCode})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditItemOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateItemSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Jina la Bidhaa</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kundi (Category)</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Medicines">Medicines</option>
                    <option value="Surgical & Consumables">Surgical & Consumables</option>
                    <option value="Lab Reagents">Lab Reagents</option>
                    <option value="PPE & Sanitizers">PPE & Sanitizers</option>
                    <option value="Linens & Ward Supplies">Linens & Ward Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kipimo (Unit)</label>
                  <input
                    type="text"
                    required
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kiasi Kilichopo (Quantity)</label>
                  <input
                    type="number"
                    required
                    value={editQty}
                    onChange={(e) => setEditQty(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kiwango cha Tahadhari (Threshold)</label>
                  <input
                    type="number"
                    required
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Gharama ya Ununuzi (Unit Cost TZS)</label>
                  <input
                    type="number"
                    required
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Bei ya Kuuza / Famasia (Selling TZS)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Rafu (Aisle / Shelf)</label>
                  <input
                    type="text"
                    required
                    value={editAisle}
                    onChange={(e) => setEditAisle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Tarehe ya Kuisha (Expiry)</label>
                  <input
                    type="date"
                    required
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditItemOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow"
                >
                  Hifadhi Mabadiliko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: WAREHOUSE INVENTORY AUDIT */}
      <PrintModal
        isOpen={isPrintInventoryOpen}
        onClose={() => setIsPrintInventoryOpen(false)}
        title="ORODHA NA UKAGUZI WA MADAWA NA VIFAA VYA AFYA GHALANI (CENTRAL MEDICAL STORE AUDIT)"
        documentNumber="STR-INV-2026-AUDIT"
        category="Stoo Kuu ya Madawa na Vifaa Tiba (Medical Store Directorate)"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500 block">Jumla ya Aina za Dawa (SKUs):</span>
              <strong>{storeItems.length} Bidhaa</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Thamani ya Thamani ya Stoo:</span>
              <strong className="font-mono text-emerald-700">TZS {totalInventoryValuation.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Bidhaa Zenye Uhaba (Below Threshold):</span>
              <strong className="text-rose-600">{deficiencyItems.length} Bidhaa</strong>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-neutral-300 text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="p-2 border-r border-neutral-300">SKU Code</th>
                <th className="p-2 border-r border-neutral-300">Maelezo ya Dawa / Kifaa</th>
                <th className="p-2 border-r border-neutral-300">Kundi</th>
                <th className="p-2 border-r border-neutral-300 font-mono">Kiasi Ghalani</th>
                <th className="p-2 border-r border-neutral-300 font-mono">Kiwango cha Chini</th>
                <th className="p-2 border-r border-neutral-300 font-mono">Bei ya Ununuzi (TZS)</th>
                <th className="p-2 border-r border-neutral-300 font-mono">Thamani ya Jumla (TZS)</th>
                <th className="p-2">Hali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {storeItems.map((it) => (
                <tr key={it.id} className="border-b border-neutral-200">
                  <td className="p-2 font-mono font-bold border-r border-neutral-300">{it.itemCode}</td>
                  <td className="p-2 border-r border-neutral-300">
                    <div className="font-bold">{it.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">Batch: {it.batchNumber} • Rafu: {it.locationAisle}</div>
                  </td>
                  <td className="p-2 border-r border-neutral-300">{it.category}</td>
                  <td className="p-2 font-mono font-bold border-r border-neutral-300">{it.quantityOnHand} {it.unit}</td>
                  <td className="p-2 font-mono border-r border-neutral-300">{it.minimumThreshold} {it.unit}</td>
                  <td className="p-2 font-mono border-r border-neutral-300">{it.unitCost.toLocaleString()}</td>
                  <td className="p-2 font-mono font-bold border-r border-neutral-300">{(it.quantityOnHand * it.unitCost).toLocaleString()}</td>
                  <td className="p-2 font-bold">{it.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* PRINT MODAL: REQUISITION SLIP */}
      {printRequisitionItem && (
        <PrintModal
          isOpen={!!printRequisitionItem}
          onClose={() => setPrintRequisitionItem(null)}
          title={`HATI YA KIBALI CHA OMBI LA GHALA: ${printRequisitionItem.requisitionNumber}`}
          documentNumber={printRequisitionItem.requisitionNumber}
          category="Idhini ya Mganga Mkuu ya Ugavi (Hospital Management Clearance)"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">Aina ya Ombi:</span>
                <strong>{printRequisitionItem.type}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Tarehe ya Ombi:</span>
                <strong className="font-mono">{printRequisitionItem.requestedAt}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Aliyeomba (Storekeeper):</span>
                <strong>{printRequisitionItem.requestedBy}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Idara Inayolengwa:</span>
                <strong>{printRequisitionItem.targetDepartment}</strong>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-neutral-300 text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300">
                  <th className="p-2 border-r border-neutral-300">Jina la Bidhaa</th>
                  <th className="p-2 border-r border-neutral-300 font-mono">Kiasi Kilichoombwa</th>
                  <th className="p-2 border-r border-neutral-300">Kipimo</th>
                  <th className="p-2">Sababu ya Uhitaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr className="border-b border-neutral-200">
                  <td className="p-2 font-bold border-r border-neutral-300">{printRequisitionItem.itemName}</td>
                  <td className="p-2 font-mono font-bold border-r border-neutral-300">{printRequisitionItem.quantity}</td>
                  <td className="p-2 border-r border-neutral-300">{printRequisitionItem.unit}</td>
                  <td className="p-2 text-neutral-600">{printRequisitionItem.reason}</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span className="text-neutral-500 block">Maelezo ya Mganga Mkuu (Hospital Manager):</span>
              <p className="mt-1 font-semibold text-neutral-800">{printRequisitionItem.managerNotes || 'Ombi lililopitishwa kwa miongozo ya bohari.'}</p>
              <div className="mt-2 text-right font-bold text-emerald-700">
                Hali ya Kibali: {printRequisitionItem.status.toUpperCase()}
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
