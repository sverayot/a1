import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Trash2,
  Edit2,
  Settings2,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DisasterCase,
  DocumentInspection,
  InspectionSubItem,
  ZoneDeclaration,
} from '../types';

interface InspectionModuleProps {
  cases: DisasterCase[];
  inspections: DocumentInspection[];
  assistanceItems: string[];
  onSaveInspection: (inspection: DocumentInspection) => void;
  onDeleteInspection: (inspectionId: string) => void;
  onOpenItemManager: () => void;
  preselectedCaseId?: string | null;
  onClearPreselectedCase?: () => void;
}

export const InspectionModule: React.FC<InspectionModuleProps> = ({
  cases,
  inspections,
  assistanceItems,
  onSaveInspection,
  onDeleteInspection,
  onOpenItemManager,
  preselectedCaseId,
  onClearPreselectedCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedInspectionId, setExpandedInspectionId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<DocumentInspection | null>(null);

  // Form State
  const [formCaseId, setFormCaseId] = useState(preselectedCaseId || (cases[0]?.id ?? ''));
  const [formDistrictsInput, setFormDistrictsInput] = useState('');
  const [formDistrictsList, setFormDistrictsList] = useState<string[]>([]);

  // Zone declaration fields
  const [formDeclaration, setFormDeclaration] = useState<ZoneDeclaration>({
    disasterType: 'อุทกภัย',
    incidentDate: new Date().toISOString().substring(0, 10),
    declaredDate: new Date().toISOString().substring(0, 10),
    declarationNumber: '',
  });

  // Multiple assistance items
  const [formItems, setFormItems] = useState<InspectionSubItem[]>([
    {
      id: 'item-1',
      district: '',
      itemName: assistanceItems[0] || '5.1.5 ค่าอาหารจัดเลี้ยง',
      quantity: 100,
      unit: 'มื้อ',
      unitPrice: 50,
      amount: 5000,
      remarks: '',
    },
  ]);

  const [formInspectionStatus, setFormInspectionStatus] = useState<
    'ผ่านการตรวจสอบ' | 'มีข้อท้วงติง/แก้ไข' | 'รอตรวจเอกสาร'
  >('ผ่านการตรวจสอบ');
  const [formInspectorName, setFormInspectorName] = useState('เจ้าหน้าที่ตรวจเอกสาร ปภ.');
  const [formInspectionDate, setFormInspectionDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [formNotes, setFormNotes] = useState('');

  // Auto-fill disaster type when case is chosen
  const handleCaseChange = (caseId: string) => {
    setFormCaseId(caseId);
    const chosenCase = cases.find((c) => c.id === caseId);
    if (chosenCase) {
      setFormDeclaration((prev) => ({
        ...prev,
        disasterType: chosenCase.disasterType,
      }));
    }
  };

  // District Tag Helpers
  const addDistrict = () => {
    const trimmed = formDistrictsInput.trim();
    if (trimmed && !formDistrictsList.includes(trimmed)) {
      setFormDistrictsList([...formDistrictsList, trimmed]);
      setFormDistrictsInput('');
    }
  };

  const removeDistrict = (dToRemove: string) => {
    setFormDistrictsList(formDistrictsList.filter((d) => d !== dToRemove));
  };

  // Add assistance sub-item row
  const addSubItemRow = () => {
    const newItem: InspectionSubItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      district: formDistrictsList[0] || '',
      itemName: assistanceItems[0] || '5.1.5 ค่าอาหารจัดเลี้ยง',
      quantity: 1,
      unit: 'ชุด',
      unitPrice: 0,
      amount: 0,
      remarks: '',
    };
    setFormItems([...formItems, newItem]);
  };

  const removeSubItemRow = (itemId: string) => {
    if (formItems.length === 1) {
      alert('ต้องมีรายการให้ความช่วยเหลืออย่างน้อย 1 รายการ');
      return;
    }
    setFormItems(formItems.filter((i) => i.id !== itemId));
  };

  const updateSubItem = (
    itemId: string,
    field: keyof InspectionSubItem,
    value: any
  ) => {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };
        // Auto-calculate amount when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice || 0;
          if (price > 0) {
            updated.amount = qty * price;
          }
        }
        return updated;
      })
    );
  };

  // Calculate total amount of inspection
  const totalInspectionAmount = formItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Open modal for add
  const openAddModal = (targetCaseId?: string) => {
    setEditingInspection(null);
    const cId = targetCaseId || preselectedCaseId || (cases[0]?.id ?? '');
    setFormCaseId(cId);

    const targetCase = cases.find((c) => c.id === cId);
    setFormDistrictsList(['อำเภอเมือง']);
    setFormDistrictsInput('');
    setFormDeclaration({
      disasterType: targetCase ? targetCase.disasterType : 'อุทกภัย',
      incidentDate: targetCase ? targetCase.receivedDate : new Date().toISOString().substring(0, 10),
      declaredDate: targetCase ? targetCase.provinceLetterDate : new Date().toISOString().substring(0, 10),
      declarationNumber: '',
    });
    setFormItems([
      {
        id: `sub-${Date.now()}`,
        district: 'อำเภอเมือง',
        itemName: assistanceItems[0] || '5.1.5 ค่าอาหารจัดเลี้ยง',
        quantity: 500,
        unit: 'มื้อ',
        unitPrice: 50,
        amount: 25000,
        remarks: '',
      },
    ]);
    setFormInspectionStatus('ผ่านการตรวจสอบ');
    setFormInspectorName('เจ้าหน้าที่ตรวจเอกสาร ปภ.');
    setFormInspectionDate(new Date().toISOString().substring(0, 10));
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (ins: DocumentInspection) => {
    setEditingInspection(ins);
    setFormCaseId(ins.caseId);
    setFormDistrictsList(ins.districts || []);
    setFormDistrictsInput('');
    setFormDeclaration(
      ins.declaration || {
        disasterType: 'อุทกภัย',
        incidentDate: '',
        declaredDate: '',
        declarationNumber: '',
      }
    );
    setFormItems(
      ins.items && ins.items.length > 0
        ? ins.items
        : [
            {
              id: `item-${Date.now()}`,
              itemName: assistanceItems[0] || '5.1.5 ค่าอาหารจัดเลี้ยง',
              quantity: 1,
              unit: 'ชุด',
              unitPrice: 0,
              amount: ins.totalAmount || 0,
            },
          ]
    );
    setFormInspectionStatus(ins.inspectionStatus || 'ผ่านการตรวจสอบ');
    setFormInspectorName(ins.inspectorName || '');
    setFormInspectionDate(ins.inspectionDate || new Date().toISOString().substring(0, 10));
    setFormNotes(ins.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCaseId) {
      alert('กรุณาเลือกเลขเรื่อง');
      return;
    }
    if (formDistrictsList.length === 0) {
      alert('กรุณาระบุอำเภออย่างน้อย 1 อำเภอ');
      return;
    }

    const now = new Date().toISOString();
    const inspectionToSave: DocumentInspection = {
      id: editingInspection ? editingInspection.id : `ins-${Date.now()}`,
      caseId: formCaseId,
      districts: formDistrictsList,
      declaration: formDeclaration,
      items: formItems,
      totalAmount: totalInspectionAmount,
      inspectionStatus: formInspectionStatus,
      inspectionDate: formInspectionDate,
      inspectorName: formInspectorName,
      notes: formNotes,
      createdAt: editingInspection ? editingInspection.createdAt : now,
      updatedAt: now,
    };

    onSaveInspection(inspectionToSave);
    setIsModalOpen(false);
    if (onClearPreselectedCase) onClearPreselectedCase();
  };

  // Filter inspection records
  const filteredInspections = inspections.filter((ins) => {
    const parentCase = cases.find((c) => c.id === ins.caseId);
    const caseNumber = parentCase ? parentCase.caseNumber : '';
    const districtStr = (ins.districts || []).join(' ');
    const itemsStr = (ins.items || []).map((i) => i.itemName).join(' ');

    const matchesSearch =
      caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      districtStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ins.declaration?.disasterType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ins.inspectionStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="inspection-module">
      {/* Header and Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-50 text-red-700">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                2. บันทึกการตรวจเอกสาร (Document Audit & Verification)
              </h2>
              <p className="text-xs text-slate-500">
                บันทึกการตรวจสอบความถูกต้องของเอกสารขอรับความช่วยเหลือ ผูกกับเลขเรื่อง ประกาศเขตภัย และจำแนกตามอำเภอ/รายการค่าใช้จ่าย
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Manage custom assistance items */}
          <button
            onClick={onOpenItemManager}
            id="btn-manage-items"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="เพิ่ม/แก้ไขรายการให้ความช่วยเหลือ (5.1.5 ค่าอาหารจัดเลี้ยง, 5.1.2 ค่าถุงยังชีพ...)"
          >
            <Settings2 className="w-4 h-4 text-slate-600" />
            <span>จัดการรายการความช่วยเหลือ ({assistanceItems.length})</span>
          </button>

          {/* New inspection button */}
          <button
            onClick={() => openAddModal()}
            id="btn-add-inspection"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกการตรวจเอกสาร</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเลขเรื่อง, อำเภอ, รายการความช่วยเหลือ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">ผลการตรวจ:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
          >
            <option value="all">ผลการตรวจทั้งหมด</option>
            <option value="ผ่านการตรวจสอบ">ผ่านการตรวจสอบ</option>
            <option value="มีข้อท้วงติง/แก้ไข">มีข้อท้วงติง/แก้ไข</option>
            <option value="รอตรวจเอกสาร">รอตรวจเอกสาร</option>
          </select>
        </div>
      </div>

      {/* List of Inspection Records */}
      <div className="space-y-4">
        {filteredInspections.map((ins) => {
          const parentCase = cases.find((c) => c.id === ins.caseId);
          const isExpanded = expandedInspectionId === ins.id;

          return (
            <div
              key={ins.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header Bar */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white">
                      เลขเรื่อง: {parentCase?.caseNumber || ins.caseId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ins.inspectionStatus === 'ผ่านการตรวจสอบ'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ins.inspectionStatus === 'มีข้อท้วงติง/แก้ไข'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {ins.inspectionStatus}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      ตรวจเมื่อ: {ins.inspectionDate} โดย {ins.inspectorName}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium">
                    {parentCase?.provinceLetter || 'เรื่องขอรับเงินทดรองราชการ'}
                  </div>

                  {/* Declaration Info Pill */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200/60">
                    <span className="font-semibold text-amber-900">ประกาศเขตภัย:</span>
                    <span>ประเภท: <strong className="text-slate-800">{ins.declaration?.disasterType}</strong></span>
                    <span>•</span>
                    <span>วันเกิดภัย: {ins.declaration?.incidentDate || '-'}</span>
                    <span>•</span>
                    <span>วันประกาศภัย: {ins.declaration?.declaredDate || '-'}</span>
                    {ins.declaration?.declarationNumber && (
                      <>
                        <span>•</span>
                        <span>เลขประกาศ: {ins.declaration.declarationNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-500">ยอดเงินตรวจผ่าน</div>
                    <div className="text-lg font-bold font-mono text-emerald-800">
                      {ins.totalAmount?.toLocaleString('th-TH')} <span className="text-xs">บาท</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setExpandedInspectionId(isExpanded ? null : ins.id)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <span>{isExpanded ? 'ย่อ' : 'ดูรายการ'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(ins)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="แก้ไขบันทึกตรวจเอกสาร"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบบันทึกการตรวจเอกสารนี้หรือไม่?')) {
                          onDeleteInspection(ins.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบบันทึก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* District Tags */}
              <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center flex-wrap gap-2 text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  พื้นที่ประสบภัย ({ins.districts?.length || 0} อำเภอ):
                </span>
                {(ins.districts || []).map((district, dIdx) => (
                  <span
                    key={dIdx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-800 border border-slate-300 shadow-2xs"
                  >
                    {district}
                  </span>
                ))}
              </div>

              {/* Sub-Items Table (Collapsible or Shown) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-white">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    รายละเอียดรายการให้ความช่วยเหลือ ({ins.items?.length || 0} รายการ)
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">ลำดับ</th>
                          <th className="px-3 py-2">อำเภอ</th>
                          <th className="px-3 py-2">รายการให้ความช่วยเหลือ</th>
                          <th className="px-3 py-2 text-right">จำนวน</th>
                          <th className="px-3 py-2">หน่วย</th>
                          <th className="px-3 py-2 text-right">ราคา/หน่วย (บาท)</th>
                          <th className="px-3 py-2 text-right">จำนวนเงิน (บาท)</th>
                          <th className="px-3 py-2">หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(ins.items || []).map((sub, idx) => (
                          <tr key={sub.id || idx} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 text-slate-700 font-medium">
                              {sub.district || ins.districts?.[0] || '-'}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{sub.itemName}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-800 font-medium">
                              {sub.quantity?.toLocaleString('th-TH')}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{sub.unit}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600">
                              {sub.unitPrice ? sub.unitPrice.toLocaleString('th-TH') : '-'}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-800">
                              {sub.amount?.toLocaleString('th-TH')}
                            </td>
                            <td className="px-3 py-2 text-slate-500">{sub.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={6} className="px-3 py-2 text-right text-slate-700">
                            ยอดรวมทั้งสิ้น:
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-900 font-bold">
                            {ins.totalAmount?.toLocaleString('th-TH')} บาท
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {ins.notes && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                      <strong>หมายเหตุการตรวจสอบ:</strong> {ins.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredInspections.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">ยังไม่มีบันทึกการตรวจเอกสาร</p>
            <p className="text-xs text-slate-400">
              คลิกปุ่ม "+ บันทึกการตรวจเอกสาร" เพื่อเริ่มต้นตรวจเอกสารและผูกกับเลขเรื่อง
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden my-6 border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {editingInspection ? 'แก้ไขบันทึกการตรวจเอกสาร' : 'เพิ่มบันทึกการตรวจเอกสารใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Choose Case */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-700" />
                    <span>เลือก เลขเรื่อง (Case Intake) *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    ดึงข้อมูลหนังสือจังหวัดและประเภทภัยอัตโนมัติ
                  </span>
                </div>

                <select
                  required
                  value={formCaseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                >
                  <option value="">-- กรุณาเลือกเลขเรื่อง --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.provinceLetter} (ด้าน{c.department} / {c.disasterType} / ยอดเบิก: {c.disburseAmount?.toLocaleString('th-TH')} บ.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Section 2: Zone Declaration (ประกาศเขต) */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>ข้อมูลประกาศเขต (Zone Declaration)</span>
                  </h4>
                  <span className="text-[11px] text-amber-700">ตามประกาศจังหวัด</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ประเภทภัยพิบัติ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDeclaration.disasterType}
                      onChange={(e) =>
                        setFormDeclaration({ ...formDeclaration, disasterType: e.target.value })
                      }
                      placeholder="เช่น อุทกภัย, วาตภัย..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      วันเกิดภัย *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDeclaration.incidentDate}
                      onChange={(e) =>
                        setFormDeclaration({ ...formDeclaration, incidentDate: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      วันประกาศภัย *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDeclaration.declaredDate}
                      onChange={(e) =>
                        setFormDeclaration({ ...formDeclaration, declaredDate: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Multiple Districts (อำเภอ หลายอำเภอ) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-700" />
                    <span>บันทึก อำเภอ (รองรับหลายอำเภอ) *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">พิมพ์ชื่ออำเภอแล้วกด "เพิ่มอำเภอ"</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formDistrictsInput}
                    onChange={(e) => setFormDistrictsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDistrict();
                      }
                    }}
                    placeholder="เช่น อำเภอเมือง, อำเภอท่าลี่, อำเภอภูเรือ..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={addDistrict}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    + เพิ่มอำเภอ
                  </button>
                </div>

                {/* District Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {formDistrictsList.map((district) => (
                    <span
                      key={district}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{district}</span>
                      <button
                        type="button"
                        onClick={() => removeDistrict(district)}
                        className="hover:text-red-900 p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formDistrictsList.length === 0 && (
                    <span className="text-xs text-red-600 font-medium">
                      * กรุณาเพิ่มอำเภออย่างน้อย 1 อำเภอ
                    </span>
                  )}
                </div>
              </div>

              {/* Section 4: Assistance Items (หลายรายการ, จำนวน, เงิน) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      รายการให้ความช่วยเหลือ (หลายรายการ) *
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ค่าอาหารจัดเลี้ยง (5.1.5), ถุงยังชีพ (5.1.2) และรายการอื่นๆ ตามระเบียบ ก.ช.ภ.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenItemManager}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>เพิ่มรายการในระบบ</span>
                    </button>
                    <button
                      type="button"
                      onClick={addSubItemRow}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-md shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มรายการ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
                    >
                      {/* District for this item */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          อำเภอ
                        </label>
                        <select
                          value={item.district || formDistrictsList[0] || ''}
                          onChange={(e) => updateSubItem(item.id, 'district', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                        >
                          {formDistrictsList.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                          <option value="ทุกอำเภอ">ทุกอำเภอ</option>
                        </select>
                      </div>

                      {/* Assistance Item Select */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          รายการให้ความช่วยเหลือ
                        </label>
                        <select
                          value={item.itemName}
                          onChange={(e) => updateSubItem(item.id, 'itemName', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
                        >
                          {assistanceItems.map((ai) => (
                            <option key={ai} value={ai}>
                              {ai}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          จำนวน
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateSubItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono font-semibold"
                        />
                      </div>

                      {/* Unit */}
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          หน่วย
                        </label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateSubItem(item.id, 'unit', e.target.value)}
                          placeholder="ชุด/มื้อ"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                        />
                      </div>

                      {/* Amount (เงิน) */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          จำนวนเงิน (บาท)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.amount}
                          onChange={(e) =>
                            updateSubItem(item.id, 'amount', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono font-bold text-emerald-800"
                        />
                      </div>

                      {/* Delete item button */}
                      <div className="sm:col-span-1 flex justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => removeSubItemRow(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Inspection Amount Calculation */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900">
                    ยอดรวมตรวจเอกสารทั้งสิ้น ({formItems.length} รายการ):
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-950">
                    {totalInspectionAmount.toLocaleString('th-TH')} บาท
                  </span>
                </div>
              </div>

              {/* Section 5: Inspection Result & Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผลการตรวจเอกสาร *
                  </label>
                  <select
                    value={formInspectionStatus}
                    onChange={(e: any) => setFormInspectionStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  >
                    <option value="ผ่านการตรวจสอบ">ผ่านการตรวจสอบ</option>
                    <option value="มีข้อท้วงติง/แก้ไข">มีข้อท้วงติง/แก้ไข</option>
                    <option value="รอตรวจเอกสาร">รอตรวจเอกสาร</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ตรวจเอกสาร *
                  </label>
                  <input
                    type="date"
                    required
                    value={formInspectionDate}
                    onChange={(e) => setFormInspectionDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ตรวจเอกสาร *
                  </label>
                  <input
                    type="text"
                    required
                    value={formInspectorName}
                    onChange={(e) => setFormInspectorName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล ตำแหน่ง"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเหตุ / ผลสรุปการตรวจเอกสาร
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น เอกสารใบเสร็จครบถ้วน มีภาพถ่ายประกอบการแจกจ่าย..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-submit-inspection"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกผลการตรวจเอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
