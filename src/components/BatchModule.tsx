import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  CheckSquare,
  Square,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  DisasterCase,
  DocumentBatch,
  BudgetTier,
  BatchTrackingStatus,
} from '../types';

interface BatchModuleProps {
  cases: DisasterCase[];
  batches: DocumentBatch[];
  onSaveBatch: (batch: DocumentBatch, affectedCaseIds: string[]) => void;
  onDeleteBatch: (batchId: string) => void;
  onNavigateToTracking: (batchId: string) => void;
}

export const BatchModule: React.FC<BatchModuleProps> = ({
  cases,
  batches,
  onSaveBatch,
  onDeleteBatch,
  onNavigateToTracking,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<DocumentBatch | null>(null);

  // Form State
  const [formBatchCode, setFormBatchCode] = useState('');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formBudgetTier, setFormBudgetTier] = useState<BudgetTier>('ปกติ');
  const [formSelectedCaseIds, setFormSelectedCaseIds] = useState<string[]>([]);
  const [formApprovalLetterNumber, setFormApprovalLetterNumber] = useState('');
  const [formApprovalLetterDate, setFormApprovalLetterDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [formNotes, setFormNotes] = useState('');

  // Unbatched cases (rule: เลือก เลขเรื่อง ที่ยังไม่มีชุดเอกสาร)
  // If editing an existing batch, also include the cases currently in that batch!
  const availableCases = cases.filter(
    (c) => !c.batchId || (editingBatch && editingBatch.caseIds.includes(c.id))
  );

  const openCreateModal = () => {
    setEditingBatch(null);
    const nextBatchNum = batches.length + 1;
    const year = new Date().getFullYear() + 543;
    setFormBatchCode(`SET-${year}-${String(nextBatchNum).padStart(3, '0')}`);
    setFormBatchNumber(`ครั้งที่ ${nextBatchNum}/${year}`);
    setFormBudgetTier('ปกติ');
    setFormSelectedCaseIds([]);
    setFormApprovalLetterNumber('');
    setFormApprovalLetterDate(new Date().toISOString().substring(0, 10));
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (batch: DocumentBatch) => {
    setEditingBatch(batch);
    setFormBatchCode(batch.batchCode);
    setFormBatchNumber(batch.batchNumber);
    setFormBudgetTier(batch.budgetTier);
    setFormSelectedCaseIds(batch.caseIds);
    setFormApprovalLetterNumber(batch.approvalLetterNumber);
    setFormApprovalLetterDate(batch.approvalLetterDate);
    setFormNotes(batch.notes || '');
    setIsModalOpen(true);
  };

  const toggleSelectCase = (caseId: string) => {
    if (formSelectedCaseIds.includes(caseId)) {
      setFormSelectedCaseIds(formSelectedCaseIds.filter((id) => id !== caseId));
    } else {
      setFormSelectedCaseIds([...formSelectedCaseIds, caseId]);
    }
  };

  const selectAllUnbatched = () => {
    setFormSelectedCaseIds(availableCases.map((c) => c.id));
  };

  const clearSelection = () => {
    setFormSelectedCaseIds([]);
  };

  // Selected cases calculation
  const selectedCasesList = cases.filter((c) => formSelectedCaseIds.includes(c.id));
  const autoCalculatedAmount = selectedCasesList.reduce(
    (sum, c) => sum + (c.disburseAmount || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formSelectedCaseIds.length === 0) {
      alert('กรุณาเลือก เลขเรื่อง ที่ยังไม่มีชุดเอกสาร อย่างน้อย 1 เรื่อง');
      return;
    }
    if (!formBatchNumber.trim()) {
      alert('กรุณากรอกครั้งที่ของชุดเอกสาร');
      return;
    }

    const now = new Date().toISOString();
    const batchToSave: DocumentBatch = {
      id: editingBatch ? editingBatch.id : `batch-${Date.now()}`,
      batchCode: formBatchCode.trim() || `SET-${Date.now()}`,
      batchNumber: formBatchNumber.trim(),
      budgetTier: formBudgetTier,
      caseIds: formSelectedCaseIds,
      caseCount: formSelectedCaseIds.length,
      totalAmount: autoCalculatedAmount,
      approvalLetterNumber: formApprovalLetterNumber.trim(),
      approvalLetterDate: formApprovalLetterDate,
      currentStatus: editingBatch ? editingBatch.currentStatus : 'รับเรื่อง',
      statusHistory: editingBatch
        ? editingBatch.statusHistory
        : [
            {
              status: 'รับเรื่อง',
              date: new Date().toISOString().substring(0, 10),
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              officer: 'กลุ่มงานการเงินและบัญชี ปภ.จังหวัด',
              letterNumber: formApprovalLetterNumber || undefined,
              remarks: `สร้างชุดเอกสาร รวม ${formSelectedCaseIds.length} เรื่อง วงเงิน ${autoCalculatedAmount.toLocaleString('th-TH')} บาท`,
            },
          ],
      createdAt: editingBatch ? editingBatch.createdAt : now,
      updatedAt: now,
      notes: formNotes,
    };

    onSaveBatch(batchToSave, formSelectedCaseIds);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="batch-module">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-50 text-red-700">
              <FolderArchive className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                3. การจัดชุดเอกสาร (Document Batching)
              </h2>
              <p className="text-xs text-slate-500">
                รวบรวมเลขเรื่องที่ยังไม่มีชุดเอกสาร จัดทำชุดเอกสารตามครั้งที่ วงเงินปกติ/ขยาย พร้อมบันทึกเลขหนังสือขอความเห็นชอบ
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          id="btn-create-batch"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ จัดชุดเอกสารใหม่</span>
        </button>
      </div>

      {/* Unbatched Cases Status Indicator */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold text-amber-900">
              มีเรื่องที่พร้อมจัดชุดเอกสาร: {cases.filter((c) => !c.batchId).length} เรื่อง
            </span>
            <span className="text-amber-800 ml-1">
              (จากเรื่องรับเข้าทั้งหมด {cases.length} เรื่อง, จัดชุดแล้ว{' '}
              {cases.filter((c) => !!c.batchId).length} เรื่อง)
            </span>
          </div>
        </div>

        {cases.some((c) => !c.batchId) && (
          <button
            onClick={openCreateModal}
            className="px-3 py-1.5 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
          >
            จัดชุดเรื่องคงค้างทันที →
          </button>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            รายการชุดเอกสารที่จัดทำแล้ว ({batches.length} ชุด)
          </h3>
          <span className="text-xs text-slate-500">
            ยอดเงินรวมทุกชุด:{' '}
            <strong className="text-slate-900 font-mono">
              {batches.reduce((s, b) => s + (b.totalAmount || 0), 0).toLocaleString('th-TH')}
            </strong>{' '}
            บาท
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสชุด / ครั้งที่</th>
                <th className="px-4 py-3">วงเงิน</th>
                <th className="px-4 py-3 text-center">จำนวนเรื่อง</th>
                <th className="px-4 py-3 text-right">จำนวนเงิน (บาท)</th>
                <th className="px-4 py-3">หนังสือขอความเห็นชอบ</th>
                <th className="px-4 py-3 text-center">สถานะติดตาม</th>
                <th className="px-4 py-3">รายการเลขเรื่องในชุด</th>
                <th className="px-4 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => {
                const includedCases = cases.filter((c) => b.caseIds.includes(c.id));
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Batch Number & Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">{b.batchNumber}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.batchCode}</div>
                    </td>

                    {/* Budget Tier */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.budgetTier === 'ขยาย'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        วงเงิน{b.budgetTier}
                      </span>
                    </td>

                    {/* Case Count */}
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {b.caseCount || b.caseIds.length} เรื่อง
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {b.totalAmount?.toLocaleString('th-TH')}
                    </td>

                    {/* Approval Letter */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-slate-800 font-mono">
                        {b.approvalLetterNumber || '-'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ลงวันที่: {b.approvalLetterDate || '-'}
                      </div>
                    </td>

                    {/* Current Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          b.currentStatus === 'อนุมัติ'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : b.currentStatus === 'ส่งกรมบัญชีกลาง'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : b.currentStatus === 'เห็นชอบ'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : b.currentStatus === 'เสนอขอความเห็นชอบ'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {b.currentStatus}
                      </span>
                    </td>

                    {/* Included Case Numbers */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {includedCases.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-700"
                            title={c.provinceLetter}
                          >
                            {c.caseNumber}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onNavigateToTracking(b.id)}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="ไปที่ขั้นตอนติดตามสถานะ"
                        >
                          <span>ติดตาม</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="แก้ไขชุดเอกสาร"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `ต้องการยกเลิกชุดเอกสาร "${b.batchNumber}" หรือไม่? (เรื่องที่อยู่ในชุดนี้จะกลับสู่สถานะรอจัดชุด)`
                              )
                            ) {
                              onDeleteBatch(b.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="ลบชุดเอกสาร"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {batches.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                    ยังไม่มีชุดเอกสาร คลิกปุ่ม "+ จัดชุดเอกสารใหม่" เพื่อรวมเรื่องและจัดชุดเอกสาร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {editingBatch ? `แก้ไขชุดเอกสาร: ${editingBatch.batchNumber}` : 'จัดชุดเอกสารใหม่'}
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Batch Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ครั้งที่ (เช่น ครั้งที่ 1, ครั้งที่ 2/2567) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    placeholder="เช่น ครั้งที่ 1/2567"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสชุดเอกสาร
                  </label>
                  <input
                    type="text"
                    value={formBatchCode}
                    onChange={(e) => setFormBatchCode(e.target.value)}
                    placeholder="เช่น SET-2567-001"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วงเงิน <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formBudgetTier}
                    onChange={(e) => setFormBudgetTier(e.target.value as BudgetTier)}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  >
                    <option value="ปกติ">วงเงินปกติ</option>
                    <option value="ขยาย">วงเงินขยาย (ขอความเห็นชอบกรมบัญชีกลาง)</option>
                  </select>
                </div>
              </div>

              {/* Approval Letter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขหนังสือขอความเห็นชอบ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formApprovalLetterNumber}
                    onChange={(e) => setFormApprovalLetterNumber(e.target.value)}
                    placeholder="เช่น ลย 0021/ว 5200"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันหนังสือขอความเห็นชอบ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formApprovalLetterDate}
                    onChange={(e) => setFormApprovalLetterDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Mandatory Requirement: เลือก เลขเรื่อง (ที่ยังไม่มีชุดเอกสาร) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      เลือก เลขเรื่อง (ที่ยังไม่มีชุดเอกสาร) <span className="text-red-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      ติ๊กเลือกเลขเรื่องที่ต้องการนำมาจัดชุดเอกสารนี้
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllUnbatched}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      เลือกทั้งหมด
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      ล้างที่เลือก
                    </button>
                  </div>
                </div>

                {/* List of cases to select */}
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {availableCases.map((c) => {
                    const isChecked = formSelectedCaseIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelectCase(c.id)}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-red-50/80 border-l-4 border-l-red-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-red-700">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{c.caseNumber}</span>
                              <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700">
                                ด้าน{c.department}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800">
                                {c.disasterType}
                              </span>
                            </div>
                            <div className="text-slate-600 mt-0.5 line-clamp-1">
                              {c.provinceLetter}
                            </div>
                          </div>
                        </div>

                        <div className="text-right pl-3 shrink-0">
                          <div className="font-bold font-mono text-slate-900">
                            {c.disburseAmount?.toLocaleString('th-TH')} บาท
                          </div>
                          <div className="text-[10px] text-slate-500">
                            รับเรื่อง: {c.receivedDate}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {availableCases.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      ไม่มีเรื่องที่ยังไม่ได้จัดชุดเอกสารในขณะนี้
                    </div>
                  )}
                </div>
              </div>

              {/* Summary of Selected Cases (จำนวนเรื่อง, จำนวนเงิน) */}
              <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600">สรุปการจัดชุด:</span>
                  <div className="text-sm font-bold text-slate-900">
                    จำนวนเรื่อง: <span className="text-red-700">{formSelectedCaseIds.length}</span> เรื่อง
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600">จำนวนเงินรวม:</span>
                  <div className="text-base font-bold font-mono text-emerald-900">
                    {autoCalculatedAmount.toLocaleString('th-TH')} บาท
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น เสนอขอความเห็นชอบรอบที่ 1/2567 เพื่อจัดสรรงบช่วยเหลือฉุกเฉิน..."
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
                  id="btn-submit-batch"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingBatch ? 'บันทึกการแก้ไขชุดเอกสาร' : 'บันทึกการจัดชุดเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
