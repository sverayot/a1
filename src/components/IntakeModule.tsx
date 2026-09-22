import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  FileCheck2,
  DollarSign,
  Calendar,
  X,
  Building,
} from 'lucide-react';
import {
  DisasterCase,
  AssistanceDepartment,
  BudgetTier,
  DisasterType,
  DocumentInspection,
} from '../types';

interface IntakeModuleProps {
  cases: DisasterCase[];
  inspections: DocumentInspection[];
  onSaveCase: (caseData: DisasterCase) => void;
  onDeleteCase: (caseId: string) => void;
  onNavigateToInspection: (caseId: string) => void;
}

const DEPARTMENTS: AssistanceDepartment[] = [
  'การดำรงชีพ',
  'พืช',
  'ประมง',
  'ปศุสัตว์',
  'บรรเทาสาธารณภัย',
  'การปฏิบัติงานให้ความช่วยเหลือผู้ประสบภัย',
];

const DISASTER_TYPES: DisasterType[] = [
  'ก่อการร้าย',
  'ก่อความไม่สงบ',
  'ภัยจากช้างป่า',
  'ภัยแล้ง',
  'วาตภัย',
  'อัคคีภัย',
  'อุทกภัย',
];

export const IntakeModule: React.FC<IntakeModuleProps> = ({
  cases,
  inspections,
  onSaveCase,
  onDeleteCase,
  onNavigateToInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedDisaster, setSelectedDisaster] = useState<string>('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<DisasterCase | null>(null);
  const [editingCase, setEditingCase] = useState<DisasterCase | null>(null);

  // Form State
  const defaultFormData: Omit<DisasterCase, 'id' | 'createdAt' | 'updatedAt'> = {
    caseNumber: '',
    receivedDate: new Date().toISOString().substring(0, 10),
    provinceLetter: '',
    provinceLetterNumber: '',
    provinceLetterDate: new Date().toISOString().substring(0, 10),
    department: 'การดำรงชีพ',
    budgetTier: 'ปกติ',
    disasterType: 'อุทกภัย',
    gfDocNumber: '',
    postingDate: new Date().toISOString().substring(0, 10),
    disburseAmount: 0,
    paidAmount: 0,
    refundAmount: 0,
    transferRequestAmount: 0,
    batchId: null,
    notes: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [customDisasterInput, setCustomDisasterInput] = useState('');

  const openAddModal = () => {
    setEditingCase(null);
    setFormData(defaultFormData);
    setCustomDisasterInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: DisasterCase) => {
    setEditingCase(c);
    setFormData({
      caseNumber: c.caseNumber,
      receivedDate: c.receivedDate,
      provinceLetter: c.provinceLetter,
      provinceLetterNumber: c.provinceLetterNumber,
      provinceLetterDate: c.provinceLetterDate,
      department: c.department,
      budgetTier: c.budgetTier,
      disasterType: c.disasterType,
      gfDocNumber: c.gfDocNumber,
      postingDate: c.postingDate,
      disburseAmount: c.disburseAmount,
      paidAmount: c.paidAmount,
      refundAmount: c.refundAmount,
      transferRequestAmount: c.transferRequestAmount,
      batchId: c.batchId,
      notes: c.notes || '',
    });
    if (!DISASTER_TYPES.includes(c.disasterType as any)) {
      setCustomDisasterInput(c.disasterType);
    } else {
      setCustomDisasterInput('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseNumber.trim()) {
      alert('กรุณากรอกเลขเรื่อง');
      return;
    }

    const disasterToSave = customDisasterInput.trim()
      ? customDisasterInput.trim()
      : formData.disasterType;

    const now = new Date().toISOString();
    const caseToSave: DisasterCase = {
      id: editingCase ? editingCase.id : `case-${Date.now()}`,
      ...formData,
      disasterType: disasterToSave,
      createdAt: editingCase ? editingCase.createdAt : now,
      updatedAt: now,
    };

    onSaveCase(caseToSave);
    setIsModalOpen(false);
  };

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.provinceLetter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.provinceLetterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gfDocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.disasterType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || c.department === selectedDept;
    const matchesTier = selectedTier === 'all' || c.budgetTier === selectedTier;
    const matchesDisaster =
      selectedDisaster === 'all' || c.disasterType === selectedDisaster;
    const matchesBatch =
      selectedBatchFilter === 'all'
        ? true
        : selectedBatchFilter === 'batched'
        ? !!c.batchId
        : !c.batchId;

    return matchesSearch && matchesDept && matchesTier && matchesDisaster && matchesBatch;
  });

  // Calculate sum of filtered
  const sumDisburse = filteredCases.reduce((s, c) => s + (c.disburseAmount || 0), 0);
  const sumPaid = filteredCases.reduce((s, c) => s + (c.paidAmount || 0), 0);
  const sumRefund = filteredCases.reduce((s, c) => s + (c.refundAmount || 0), 0);
  const sumTransfer = filteredCases.reduce((s, c) => s + (c.transferRequestAmount || 0), 0);

  return (
    <div className="space-y-6" id="intake-module">
      {/* Module Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-50 text-red-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                1. งานรับเรื่องเงินทดรองราชการ (Intake Cases)
              </h2>
              <p className="text-xs text-slate-500">
                บันทึกข้อมูลการรับเรื่อง หนังสือจังหวัด ด้านความช่วยเหลือ วงเงิน ประเภทภัยพิบัติ และข้อมูลบัญชี GFMIS
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          id="btn-add-intake-case"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ บันทึกรับเรื่องใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขเรื่อง, หนังสือจังหวัด, เลขหนังสือ, เลขGF..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              <option value="all">ด้านทั้งหมด (6 ด้าน)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              <option value="all">วงเงินทั้งหมด (ปกติ/ขยาย)</option>
              <option value="ปกติ">วงเงินปกติ</option>
              <option value="ขยาย">วงเงินขยาย</option>
            </select>
          </div>

          {/* Disaster Type Filter */}
          <div>
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              <option value="all">ประเภทภัยพิบัติทั้งหมด</option>
              {DISASTER_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second row: Batch filter & summary counters */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">สถานะชุดเอกสาร:</span>
            <div className="inline-flex rounded-md shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedBatchFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-l-md border ${
                  selectedBatchFilter === 'all'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ทั้งหมด ({cases.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatchFilter('unbatched')}
                className={`px-2.5 py-1 text-xs font-medium border-y border-r ${
                  selectedBatchFilter === 'unbatched'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ยังไม่จัดชุด ({cases.filter((c) => !c.batchId).length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatchFilter('batched')}
                className={`px-2.5 py-1 text-xs font-medium rounded-r-md border-y border-r ${
                  selectedBatchFilter === 'batched'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                จัดชุดแล้ว ({cases.filter((c) => !!c.batchId).length})
              </button>
            </div>
          </div>

          <div className="text-slate-500">
            แสดง <span className="font-semibold text-slate-900">{filteredCases.length}</span> จากทั้งหมด{' '}
            <span className="font-semibold text-slate-900">{cases.length}</span> รายการ
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3">เลขเรื่อง / วันรับเรื่อง</th>
                <th className="px-3.5 py-3">หนังสือจังหวัด</th>
                <th className="px-3.5 py-3">ด้านความช่วยเหลือ</th>
                <th className="px-3.5 py-3">วงเงิน</th>
                <th className="px-3.5 py-3">ประเภทภัย</th>
                <th className="px-3.5 py-3">เลขGF / วันผ่าน</th>
                <th className="px-3.5 py-3 text-right">เบิกเงิน (บาท)</th>
                <th className="px-3.5 py-3 text-right">จ่ายจริง (บาท)</th>
                <th className="px-3.5 py-3 text-right">คืนเงิน (บาท)</th>
                <th className="px-3.5 py-3 text-right">ขอรับโอน (บาท)</th>
                <th className="px-3.5 py-3 text-center">ชุดเอกสาร</th>
                <th className="px-3.5 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const hasInspection = inspections.some((ins) => ins.caseId === c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Case Number & Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">{c.caseNumber}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>รับ: {c.receivedDate}</span>
                      </div>
                    </td>

                    {/* Province Letter */}
                    <td className="px-3.5 py-3 max-w-[220px]">
                      <div className="font-medium text-slate-900 line-clamp-1" title={c.provinceLetter}>
                        {c.provinceLetter}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {c.provinceLetterNumber} ({c.provinceLetterDate})
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {c.department}
                      </span>
                    </td>

                    {/* Budget Tier */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.budgetTier === 'ขยาย'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {c.budgetTier}
                      </span>
                    </td>

                    {/* Disaster Type */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="text-slate-800 font-medium">{c.disasterType}</span>
                    </td>

                    {/* GF Doc & Posting Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-slate-900 font-medium">{c.gfDocNumber || '-'}</div>
                      <div className="text-slate-500">{c.postingDate}</div>
                    </td>

                    {/* Disburse */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-slate-900">
                      {c.disburseAmount?.toLocaleString('th-TH')}
                    </td>

                    {/* Paid */}
                    <td className="px-3.5 py-3 text-right font-mono text-emerald-800 font-medium">
                      {c.paidAmount?.toLocaleString('th-TH')}
                    </td>

                    {/* Refund */}
                    <td className="px-3.5 py-3 text-right font-mono text-amber-700">
                      {c.refundAmount ? c.refundAmount.toLocaleString('th-TH') : '-'}
                    </td>

                    {/* Transfer Request */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold text-indigo-900">
                      {c.transferRequestAmount?.toLocaleString('th-TH')}
                    </td>

                    {/* Batch Status */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      {c.batchId ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          จัดชุดแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          รอจัดชุด
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onNavigateToInspection(c.id)}
                          title={hasInspection ? 'ดู/แก้ไขบันทึกตรวจเอกสาร' : 'เพิ่มบันทึกตรวจเอกสาร'}
                          className={`p-1.5 rounded transition-colors ${
                            hasInspection
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingCase(c)}
                          title="ดูรายละเอียดฉบับเต็ม"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          title="แก้ไขข้อมูล"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบเรื่อง "${c.caseNumber}" หรือไม่?`)) {
                              onDeleteCase(c.id);
                            }
                          }}
                          title="ลบเรื่อง"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลเรื่องที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer with Summary */}
            {filteredCases.length > 0 && (
              <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={6} className="px-3.5 py-2.5 text-right uppercase">
                    รวมทั้งสิ้น ({filteredCases.length} เรื่อง):
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-emerald-900">
                    {sumDisburse.toLocaleString('th-TH')}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-emerald-900">
                    {sumPaid.toLocaleString('th-TH')}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-amber-900">
                    {sumRefund.toLocaleString('th-TH')}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-indigo-900">
                    {sumTransfer.toLocaleString('th-TH')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add / Edit Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {editingCase ? `แก้ไขข้อมูลเรื่อง: ${editingCase.caseNumber}` : 'บันทึกรับเรื่องใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Row 1: Case Number & Received Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขเรื่อง <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="เช่น 06/2567 หรือ ปภ.06/2567"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันรับเรื่อง <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Provincial Letter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หนังสือจังหวัด (ชื่อเรื่อง/หัวข้อหนังสือ) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.provinceLetter}
                    onChange={(e) => setFormData({ ...formData, provinceLetter: e.target.value })}
                    placeholder="เช่น ขอรับการสนับสนุนงบประมาณเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบอุทกภัย"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขหนังสือจังหวัด <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.provinceLetterNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, provinceLetterNumber: e.target.value })
                    }
                    placeholder="เช่น ลย 0021/ว 1234"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันหนังสือจังหวัด <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.provinceLetterDate}
                    onChange={(e) =>
                      setFormData({ ...formData, provinceLetterDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ด้าน (ประเภทความช่วยเหลือ) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value as AssistanceDepartment,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Budget Tier & Disaster Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วงเงิน <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-4 items-center mt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="budgetTier"
                        value="ปกติ"
                        checked={formData.budgetTier === 'ปกติ'}
                        onChange={() => setFormData({ ...formData, budgetTier: 'ปกติ' })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>ปกติ (วงเงินในอำนาจผู้ว่าฯ)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="budgetTier"
                        value="ขยาย"
                        checked={formData.budgetTier === 'ขยาย'}
                        onChange={() => setFormData({ ...formData, budgetTier: 'ขยาย' })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>ขยาย (ขอความเห็นชอบกระทรวงการคลัง)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทภัยพิบัติ <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={
                      DISASTER_TYPES.includes(formData.disasterType as any)
                        ? formData.disasterType
                        : 'อื่นๆ'
                    }
                    onChange={(e) => {
                      if (e.target.value === 'อื่นๆ') {
                        setCustomDisasterInput('');
                      } else {
                        setFormData({ ...formData, disasterType: e.target.value });
                        setCustomDisasterInput('');
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  >
                    {DISASTER_TYPES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
                  </select>

                  {(!DISASTER_TYPES.includes(formData.disasterType as any) ||
                    customDisasterInput !== '') && (
                    <input
                      type="text"
                      placeholder="ระบุประเภทภัยพิบัติเพิ่มเติม..."
                      value={customDisasterInput}
                      onChange={(e) => setCustomDisasterInput(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs border border-amber-300 bg-amber-50/50 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* Row 4: GFMIS and Posting Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขเอกสารGF (GFMIS Document No.)
                  </label>
                  <input
                    type="text"
                    value={formData.gfDocNumber}
                    onChange={(e) => setFormData({ ...formData, gfDocNumber: e.target.value })}
                    placeholder="เช่น 1000045812"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันผ่านรายการ (Posting Date)
                  </label>
                  <input
                    type="date"
                    value={formData.postingDate}
                    onChange={(e) => setFormData({ ...formData, postingDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Financial Amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบิกเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.disburseAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, disburseAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จ่ายเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-emerald-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คืนเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.refundAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-amber-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ขอรับโอน (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.transferRequestAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transferRequestAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-900 border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม ผลการช่วยเหลือ ข้อสังเกต..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-submit-case"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingCase ? 'บันทึกการแก้ไข' : 'บันทึกรับเรื่อง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Drawer / Modal */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-100 text-red-700 font-bold">
                  {viewingCase.caseNumber}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">รายละเอียดเรื่องรับเข้า</h3>
                  <p className="text-xs text-slate-500">วันรับเรื่อง: {viewingCase.receivedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500">หนังสือจังหวัด</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {viewingCase.provinceLetter}
                </div>
                <div className="text-slate-600 mt-1">
                  เลขที่: <span className="font-mono font-medium">{viewingCase.provinceLetterNumber}</span> | วันที่:{' '}
                  <span>{viewingCase.provinceLetterDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">ด้าน</div>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingCase.department}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">วงเงิน</div>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingCase.budgetTier}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">ประเภทภัยพิบัติ</div>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingCase.disasterType}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">เลขเอกสารGF</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    {viewingCase.gfDocNumber || '-'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">วันผ่านรายการ</div>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingCase.postingDate || '-'}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">สถานะชุดเอกสาร</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {viewingCase.batchId ? 'จัดชุดแล้ว' : 'ยังไม่ได้จัดชุด'}
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                <div>
                  <span className="text-[11px] text-slate-500">เบิกเงิน</span>
                  <div className="font-bold font-mono text-slate-900 text-sm">
                    {viewingCase.disburseAmount?.toLocaleString('th-TH')} บาท
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">จ่ายเงิน</span>
                  <div className="font-bold font-mono text-emerald-800 text-sm">
                    {viewingCase.paidAmount?.toLocaleString('th-TH')} บาท
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">คืนเงิน</span>
                  <div className="font-bold font-mono text-amber-800 text-sm">
                    {viewingCase.refundAmount?.toLocaleString('th-TH')} บาท
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">ขอรับโอน</span>
                  <div className="font-bold font-mono text-indigo-900 text-sm">
                    {viewingCase.transferRequestAmount?.toLocaleString('th-TH')} บาท
                  </div>
                </div>
              </div>

              {viewingCase.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold">หมายเหตุ:</span>
                  <p className="text-slate-700 mt-0.5">{viewingCase.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setViewingCase(null);
                    onNavigateToInspection(viewingCase.id);
                  }}
                  className="px-3.5 py-1.5 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>ไปที่บันทึกตรวจเอกสารของเรื่องนี้</span>
                </button>
                <button
                  onClick={() => setViewingCase(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
