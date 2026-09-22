import React, { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Building2,
  FileCheck,
  Plus,
  History,
  X,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  DocumentBatch,
  DisasterCase,
  BatchTrackingStatus,
  StatusHistoryEntry,
} from '../types';

interface TrackingModuleProps {
  batches: DocumentBatch[];
  cases: DisasterCase[];
  onUpdateBatchStatus: (
    batchId: string,
    newStatus: BatchTrackingStatus,
    historyEntry: StatusHistoryEntry
  ) => void;
  selectedBatchId?: string | null;
}

const STAGES: {
  key: BatchTrackingStatus;
  label: string;
  order: number;
  description: string;
  badgeClass: string;
  headerClass: string;
}[] = [
  {
    key: 'รับเรื่อง',
    label: '1. รับเรื่อง',
    order: 1,
    description: 'รวบรวมเอกสารและจัดทำชุด',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    headerClass: 'border-t-4 border-t-slate-500 bg-slate-50',
  },
  {
    key: 'เสนอขอความเห็นชอบ',
    label: '2. เสนอขอความเห็นชอบ',
    order: 2,
    description: 'เสนอผู้ว่าฯ / คณะกรรมการ ก.ช.ภ.จ.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    headerClass: 'border-t-4 border-t-blue-500 bg-blue-50/50',
  },
  {
    key: 'เห็นชอบ',
    label: '3. เห็นชอบ',
    order: 3,
    description: 'คณะกรรมการ ก.ช.ภ.จ. มีมติเห็นชอบ',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    headerClass: 'border-t-4 border-t-purple-500 bg-purple-50/50',
  },
  {
    key: 'ส่งกรมบัญชีกลาง',
    label: '4. ส่งกรมบัญชีกลาง',
    order: 4,
    description: 'ส่งเรื่องไปยังกรมบัญชีกลาง/ก.ค.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    headerClass: 'border-t-4 border-t-amber-500 bg-amber-50/50',
  },
  {
    key: 'อนุมัติ',
    label: '5. อนุมัติ',
    order: 5,
    description: 'อนุมัติวงเงินเบิกจ่ายเรียบร้อย',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    headerClass: 'border-t-4 border-t-emerald-500 bg-emerald-50/50',
  },
];

export const TrackingModule: React.FC<TrackingModuleProps> = ({
  batches,
  cases,
  onUpdateBatchStatus,
  selectedBatchId,
}) => {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [activeBatchModal, setActiveBatchModal] = useState<DocumentBatch | null>(null);
  const [viewHistoryBatch, setViewHistoryBatch] = useState<DocumentBatch | null>(null);

  // Status Update Form State
  const [targetStatus, setTargetStatus] = useState<BatchTrackingStatus>('เสนอขอความเห็นชอบ');
  const [statusDate, setStatusDate] = useState(new Date().toISOString().substring(0, 10));
  const [statusTime, setStatusTime] = useState(
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  );
  const [statusOfficer, setStatusOfficer] = useState('เจ้าหน้าที่ ปภ.จังหวัด');
  const [statusLetterNumber, setStatusLetterNumber] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  const openStatusUpdateModal = (batch: DocumentBatch, prefillTarget?: BatchTrackingStatus) => {
    setActiveBatchModal(batch);
    const currentIndex = STAGES.findIndex((s) => s.key === batch.currentStatus);
    const nextStatus =
      prefillTarget ||
      (currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1].key : batch.currentStatus);

    setTargetStatus(nextStatus);
    setStatusDate(new Date().toISOString().substring(0, 10));
    setStatusTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    setStatusOfficer('เจ้าหน้าที่กลุ่มงานการเงินและบัญชี ปภ.');
    setStatusLetterNumber(batch.approvalLetterNumber || '');
    setStatusRemarks('');
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatchModal) return;

    const historyEntry: StatusHistoryEntry = {
      status: targetStatus,
      date: statusDate,
      time: statusTime,
      officer: statusOfficer.trim() || 'เจ้าหน้าที่ผู้รับผิดชอบ',
      letterNumber: statusLetterNumber.trim() || undefined,
      remarks: statusRemarks.trim() || undefined,
    };

    onUpdateBatchStatus(activeBatchModal.id, targetStatus, historyEntry);
    setActiveBatchModal(null);
  };

  const filteredBatches = batches.filter((b) => {
    return filterTier === 'all' || b.budgetTier === filterTier;
  });

  return (
    <div className="space-y-6" id="tracking-module">
      {/* Title & Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-50 text-red-700">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                4. การติดตามสถานะชุดเอกสาร (Status Tracking Pipeline)
              </h2>
              <p className="text-xs text-slate-500">
                กระบวนการติดตาม 5 ขั้นตอน: รับเรื่อง → เสนอขอความเห็นชอบ → เห็นชอบ → ส่งกรมบัญชีกลาง → อนุมัติ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-600">กรองวงเงิน:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
          >
            <option value="all">วงเงินทั้งหมด (ปกติ/ขยาย)</option>
            <option value="ปกติ">วงเงินปกติ</option>
            <option value="ขยาย">วงเงินขยาย</option>
          </select>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const stageBatches = filteredBatches.filter((b) => b.currentStatus === stage.key);
          const stageTotal = stageBatches.reduce((s, b) => s + (b.totalAmount || 0), 0);

          return (
            <div
              key={stage.key}
              className={`rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-[480px] bg-slate-50/70 overflow-hidden ${
                stage.key === 'อนุมัติ' ? 'ring-1 ring-emerald-300' : ''
              }`}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b border-slate-200 ${stage.headerClass}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{stage.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                    {stageBatches.length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{stage.description}</div>
                <div className="text-[11px] font-mono font-semibold text-slate-700 mt-1">
                  รวม: {stageTotal.toLocaleString('th-TH')} บ.
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                {stageBatches.map((batch) => {
                  const includedCases = cases.filter((c) => batch.caseIds.includes(c.id));
                  const isHighlighted = selectedBatchId === batch.id;
                  const currentIdx = STAGES.findIndex((s) => s.key === batch.currentStatus);
                  const canAdvance = currentIdx < STAGES.length - 1;

                  return (
                    <div
                      key={batch.id}
                      className={`p-3.5 rounded-lg border bg-white shadow-xs transition-all space-y-2.5 ${
                        isHighlighted
                          ? 'border-red-500 ring-2 ring-red-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Bar of Card */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          {batch.batchNumber}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            batch.budgetTier === 'ขยาย'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          วงเงิน{batch.budgetTier}
                        </span>
                      </div>

                      {/* Financial & Cases Count */}
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">
                          {batch.caseCount || batch.caseIds.length} เรื่อง
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {batch.totalAmount?.toLocaleString('th-TH')} <span className="text-[10px]">บาท</span>
                        </span>
                      </div>

                      {/* Approval Letter Info */}
                      {batch.approvalLetterNumber && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 font-mono">
                          <span className="text-slate-400">เลขขอความเห็นชอบ:</span>{' '}
                          {batch.approvalLetterNumber}
                        </div>
                      )}

                      {/* Case Badges */}
                      <div className="flex flex-wrap gap-1">
                        {includedCases.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-700"
                          >
                            {c.caseNumber}
                          </span>
                        ))}
                        {includedCases.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{includedCases.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* View History Button */}
                        <button
                          type="button"
                          onClick={() => setViewHistoryBatch(batch)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          title="ดูประวัติไทม์ไลน์การดำเนินงาน"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>ไทม์ไลน์</span>
                        </button>

                        {/* Move / Update Status Button */}
                        <button
                          type="button"
                          onClick={() => openStatusUpdateModal(batch)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>เปลี่ยนสถานะ</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {stageBatches.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    ไม่มีชุดเอกสารในขั้นตอนนี้
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Update Status */}
      {activeBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  อัปเดตสถานะชุดเอกสาร: {activeBatchModal.batchNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBatchModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกสถานะใหม่ <span className="text-red-600">*</span>
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as BatchTrackingStatus)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ดำเนินการ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={statusDate}
                    onChange={(e) => setStatusDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เวลา <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={statusTime}
                    onChange={(e) => setStatusTime(e.target.value)}
                    placeholder="เช่น 14:30"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผู้ปฏิบัติงาน / เจ้าหน้าที่บันทึก <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={statusOfficer}
                  onChange={(e) => setStatusOfficer(e.target.value)}
                  placeholder="เช่น หัวหน้ากลุ่มงานการเงินและบัญชี ปภ."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขที่หนังสือ / มติที่เกี่ยวข้อง
                </label>
                <input
                  type="text"
                  value={statusLetterNumber}
                  onChange={(e) => setStatusLetterNumber(e.target.value)}
                  placeholder="เช่น มติ ก.ช.ภ.จ. ครั้งที่ 1/2567 หรือ ลย 0021/ว..."
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียด / บันทึกความคืบหน้า
                </label>
                <textarea
                  rows={2}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="เช่น คณะกรรมการฯ มีมติเห็นชอบตามที่เสนอ เสนอผู้ว่าฯ ลงนามส่งกรมบัญชีกลาง..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveBatchModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-confirm-status-update"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกสถานะใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Batch Timeline History */}
      {viewHistoryBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-red-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ประวัติการดำเนินงาน: {viewHistoryBatch.batchNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    สถานะปัจจุบัน: <strong className="text-slate-800">{viewHistoryBatch.currentStatus}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryBatch(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {/* Timeline Items */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {viewHistoryBatch.statusHistory && viewHistoryBatch.statusHistory.length > 0 ? (
                  viewHistoryBatch.statusHistory.map((entry, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-xs"></div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {entry.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {entry.date} {entry.time}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          โดย: <span className="font-medium text-slate-800">{entry.officer}</span>
                        </div>

                        {entry.letterNumber && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            เลขที่หนังสือ: {entry.letterNumber}
                          </div>
                        )}

                        {entry.remarks && (
                          <div className="text-xs text-slate-700 pt-1 border-t border-slate-200 mt-1">
                            {entry.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">
                    ยังไม่มีประวัติการเปลี่ยนสถานะ
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewHistoryBatch(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 cursor-pointer"
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
