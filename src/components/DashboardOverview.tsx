import React from 'react';
import {
  FileText,
  DollarSign,
  TrendingDown,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  FolderArchive,
  BarChart3,
  Layers,
} from 'lucide-react';
import { DisasterCase, DocumentInspection, DocumentBatch } from '../types';

interface DashboardOverviewProps {
  cases: DisasterCase[];
  inspections: DocumentInspection[];
  batches: DocumentBatch[];
  onNavigateTab: (tab: 'intake' | 'inspection' | 'batch' | 'tracking') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  cases,
  inspections,
  batches,
  onNavigateTab,
}) => {
  const totalCases = cases.length;
  const totalDisburse = cases.reduce((sum, c) => sum + (c.disburseAmount || 0), 0);
  const totalPaid = cases.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalRefund = cases.reduce((sum, c) => sum + (c.refundAmount || 0), 0);
  const totalTransferRequest = cases.reduce((sum, c) => sum + (c.transferRequestAmount || 0), 0);

  const unbatchedCases = cases.filter((c) => !c.batchId);
  const batchedCases = cases.filter((c) => !!c.batchId);

  // Group by Department
  const departmentCounts: Record<string, { count: number; amount: number }> = {};
  cases.forEach((c) => {
    const dept = c.department || 'อื่นๆ';
    if (!departmentCounts[dept]) {
      departmentCounts[dept] = { count: 0, amount: 0 };
    }
    departmentCounts[dept].count += 1;
    departmentCounts[dept].amount += c.disburseAmount || 0;
  });

  // Group by Disaster Type
  const disasterCounts: Record<string, { count: number; amount: number }> = {};
  cases.forEach((c) => {
    const dType = c.disasterType || 'ทั่วไป';
    if (!disasterCounts[dType]) {
      disasterCounts[dType] = { count: 0, amount: 0 };
    }
    disasterCounts[dType].count += 1;
    disasterCounts[dType].amount += c.disburseAmount || 0;
  });

  // Batch Status breakdown
  const statusCounts = {
    รับเรื่อง: batches.filter((b) => b.currentStatus === 'รับเรื่อง').length,
    เสนอขอความเห็นชอบ: batches.filter((b) => b.currentStatus === 'เสนอขอความเห็นชอบ').length,
    เห็นชอบ: batches.filter((b) => b.currentStatus === 'เห็นชอบ').length,
    ส่งกรมบัญชีกลาง: batches.filter((b) => b.currentStatus === 'ส่งกรมบัญชีกลาง').length,
    อนุมัติ: batches.filter((b) => b.currentStatus === 'อนุมัติ').length,
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <span>สำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัด</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            ระบบติดตามเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉิน
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            บริหารจัดการข้อมูลรับเรื่อง ตรวจสอบเอกสารความช่วยเหลือ จัดทำชุดเอกสาร และติดตามสถานะการขอความเห็นชอบ/อนุมัติวงเงินปกติและขยาย
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('intake')}
            id="quick-btn-add-case"
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>+ บันทึกรับเรื่องใหม่</span>
          </button>
          <button
            onClick={() => onNavigateTab('batch')}
            id="quick-btn-create-batch"
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-medium rounded-lg border border-slate-600 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4" />
            <span>จัดชุดเอกสาร ({unbatchedCases.length} รอจัดชุด)</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">เรื่องรับเข้าทั้งหมด</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalCases}</span>
            <span className="text-xs text-slate-500">เรื่อง</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>จัดชุดแล้ว {batchedCases.length} เรื่อง</span>
            <span className="text-amber-700 font-medium">รอจัดชุด {unbatchedCases.length} เรื่อง</span>
          </div>
        </div>

        {/* Total Disburse */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ยอดเบิกเงินรวม</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-800">
              {totalDisburse.toLocaleString('th-TH')}
            </span>
            <span className="text-xs text-slate-500">บาท</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>ยอดจ่ายจริง:</span>
            <span className="font-semibold text-slate-800">{totalPaid.toLocaleString('th-TH')} บาท</span>
          </div>
        </div>

        {/* Refund & Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ยอดคืนเงิน / ปรับลด</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-800">
              {totalRefund.toLocaleString('th-TH')}
            </span>
            <span className="text-xs text-slate-500">บาท</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>ร้อยละของเบิกจ่าย:</span>
            <span className="font-semibold text-slate-800">
              {totalDisburse > 0 ? ((totalRefund / totalDisburse) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Transfer Request */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ยอดขอรับโอน</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-900">
              {totalTransferRequest.toLocaleString('th-TH')}
            </span>
            <span className="text-xs text-slate-500">บาท</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>ชุดเอกสารทั้งหมด:</span>
            <span className="font-semibold text-slate-800">{batches.length} ชุด</span>
          </div>
        </div>
      </div>

      {/* Document Batch Tracking Status Pipeline Stage */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-700" />
              <span>ความคืบหน้าการติดตามชุดเอกสาร (5 ขั้นตอนหลัก)</span>
            </h3>
            <p className="text-xs text-slate-500">กระบวนการพิจารณาตามระเบียบเงินทดรองราชการฯ</p>
          </div>
          <button
            onClick={() => onNavigateTab('tracking')}
            className="text-xs text-red-700 font-semibold hover:text-red-800 flex items-center gap-1 cursor-pointer"
          >
            <span>ดูบอร์ดติดตาม</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>ขั้นตอนที่ 1</span>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div className="text-sm font-bold text-slate-800">1. รับเรื่อง</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{statusCounts['รับเรื่อง']}</span>
              <span className="text-xs text-slate-500">ชุดเอกสาร</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
              <span>ขั้นตอนที่ 2</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="text-sm font-bold text-blue-900">2. เสนอขอความเห็นชอบ</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-blue-700">{statusCounts['เสนอขอความเห็นชอบ']}</span>
              <span className="text-xs text-slate-500">ชุดเอกสาร</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50">
            <div className="flex items-center justify-between text-xs text-purple-600 mb-1">
              <span>ขั้นตอนที่ 3</span>
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            </div>
            <div className="text-sm font-bold text-purple-900">3. เห็นชอบ (ก.ช.ภ.จ.)</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-purple-700">{statusCounts['เห็นชอบ']}</span>
              <span className="text-xs text-slate-500">ชุดเอกสาร</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
              <span>ขั้นตอนที่ 4</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-sm font-bold text-amber-900">4. ส่งกรมบัญชีกลาง</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-amber-800">{statusCounts['ส่งกรมบัญชีกลาง']}</span>
              <span className="text-xs text-slate-500">ชุดเอกสาร</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
              <span>ขั้นตอนที่ 5</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-emerald-900">5. อนุมัติเรียบร้อย</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-700">{statusCounts['อนุมัติ']}</span>
              <span className="text-xs text-slate-500">ชุดเอกสาร</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Breakdown by Department & Disaster Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>สรุปจำแนกตาม ด้าน (6 ด้าน)</span>
            </h3>
            <span className="text-xs text-slate-400">ระเบียบ ก.ช.ภ.</span>
          </div>

          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, data]) => {
              const pct = totalDisburse > 0 ? (data.amount / totalDisburse) * 100 : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept} ({data.count} เรื่อง)</span>
                    <span className="text-slate-600 font-mono font-medium">
                      {data.amount.toLocaleString('th-TH')} บาท ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(departmentCounts).length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">ยังไม่มีข้อมูลด้านความช่วยเหลือ</div>
            )}
          </div>
        </div>

        {/* Disaster Type Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>สรุปจำแนกตาม ประเภทภัยพิบัติ</span>
            </h3>
            <span className="text-xs text-slate-400">ตามประกาศเขตฯ</span>
          </div>

          <div className="space-y-3">
            {Object.entries(disasterCounts).map(([disaster, data]) => {
              const pct = totalDisburse > 0 ? (data.amount / totalDisburse) * 100 : 0;
              return (
                <div key={disaster} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{disaster} ({data.count} เรื่อง)</span>
                    <span className="text-slate-600 font-mono font-medium">
                      {data.amount.toLocaleString('th-TH')} บาท ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(disasterCounts).length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">ยังไม่มีข้อมูลประเภทภัยพิบัติ</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary of Recent Activity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>รายการรับเรื่องล่าสุด</span>
          <button
            onClick={() => onNavigateTab('intake')}
            className="text-xs text-red-700 font-medium hover:underline cursor-pointer"
          >
            ดูทั้งหมด ({cases.length})
          </button>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
              <tr>
                <th className="px-3 py-2 font-semibold">เลขเรื่อง</th>
                <th className="px-3 py-2 font-semibold">วันรับเรื่อง</th>
                <th className="px-3 py-2 font-semibold">หนังสือจังหวัด</th>
                <th className="px-3 py-2 font-semibold">ด้าน</th>
                <th className="px-3 py-2 font-semibold">วงเงิน</th>
                <th className="px-3 py-2 font-semibold">ประเภทภัย</th>
                <th className="px-3 py-2 font-semibold text-right">ยอดเบิกเงิน</th>
                <th className="px-3 py-2 font-semibold text-center">ชุดเอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-slate-900">{c.caseNumber}</td>
                  <td className="px-3 py-2.5 text-slate-600">{c.receivedDate}</td>
                  <td className="px-3 py-2.5 text-slate-800 max-w-[200px] truncate" title={c.provinceLetter}>
                    {c.provinceLetter}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                      {c.department}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c.budgetTier === 'ขยาย'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {c.budgetTier}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{c.disasterType}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">
                    {c.disburseAmount?.toLocaleString('th-TH')}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {c.batchId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        จัดชุดแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        รอจัดชุด
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
