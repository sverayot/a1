import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle,
  FilePlus,
  Link,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetsSyncConfig } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  hasSheetsToken: boolean;
  sheetsConfig: GoogleSheetsSyncConfig;
  onSaveSheetsConfig: (config: GoogleSheetsSyncConfig) => void;
  onGoogleSignIn: () => void;
  onCreateNewSpreadsheet: () => Promise<void>;
  onExportToSheets: () => Promise<void>;
  isSyncing: boolean;
  syncError: string | null;
  syncSuccess: string | null;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hasSheetsToken,
  sheetsConfig,
  onSaveSheetsConfig,
  onGoogleSignIn,
  onCreateNewSpreadsheet,
  onExportToSheets,
  isSyncing,
  syncError,
  syncSuccess,
}) => {
  const [customSheetInput, setCustomSheetInput] = useState(
    sheetsConfig.spreadsheetUrl || sheetsConfig.spreadsheetId || ''
  );

  if (!isOpen) return null;

  // Extract ID if user pastes full URL
  const handleSaveCustomId = () => {
    let input = customSheetInput.trim();
    if (!input) return;

    let extractedId = input;
    // If URL like https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    onSaveSheetsConfig({
      ...sheetsConfig,
      spreadsheetId: extractedId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${extractedId}/edit`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                เชื่อมต่อและซิงค์ข้อมูลกับ Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                ส่งออกข้อมูลรับเรื่อง ตรวจเอกสาร และจัดชุดเอกสารไปยัง Google Drive อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step 1: Google Account Authentication */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  1. สถานะบัญชี Google (Google Workspace)
                </span>
              </div>
              {currentUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>เข้าสู่ระบบแล้ว</span>
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                  ยังไม่ได้เข้าสู่ระบบ
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 truncate">
                  เชื่อมโยงกับ: <strong className="text-slate-800">{currentUser.email}</strong>
                </span>
                {!hasSheetsToken && (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    ยืนยันสิทธิ์ Google Sheets อีกครั้ง
                  </button>
                )}
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  เข้าสู่ระบบด้วย Google เพื่อให้สิทธิ์สร้างและบันทึกไฟล์สเปรดชีต
                </p>
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>ลงชื่อเข้าใช้ Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Spreadsheet Selection / Creation */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                2. ไฟล์ Google Spreadsheet ปลายทาง
              </span>
              {sheetsConfig.spreadsheetId && (
                <span className="text-[11px] font-mono text-slate-500">
                  ID: {sheetsConfig.spreadsheetId.substring(0, 12)}...
                </span>
              )}
            </div>

            {/* If has existing sheet */}
            {sheetsConfig.spreadsheetUrl ? (
              <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {sheetsConfig.spreadsheetTitle}
                      </div>
                      <a
                        href={sheetsConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>เปิดสเปรดชีตบน Google Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {sheetsConfig.lastSyncedAt && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    อัปเดตข้อมูลล่าสุดเมื่อ:{' '}
                    <strong className="text-slate-700">
                      {new Date(sheetsConfig.lastSyncedAt).toLocaleString('th-TH')}
                    </strong>
                  </div>
                )}
              </div>
            ) : null}

            {/* Actions: Create New or Connect Existing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={!currentUser || isSyncing}
                onClick={onCreateNewSpreadsheet}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  !currentUser
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                <FilePlus className="w-4 h-4" />
                <span>+ สร้างชีตใหม่บน Drive</span>
              </button>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customSheetInput}
                  onChange={(e) => setCustomSheetInput(e.target.value)}
                  placeholder="หรือวาง URL / ID ของชีต..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomId}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
                >
                  ผูกชีต
                </button>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {syncSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccess}</span>
            </div>
          )}

          {syncError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {/* Step 3: Trigger Sync */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!currentUser || !sheetsConfig.spreadsheetId || isSyncing}
              onClick={onExportToSheets}
              id="btn-sync-all-to-sheets"
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                !currentUser || !sheetsConfig.spreadsheetId || isSyncing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'กำลังส่งออกข้อมูลไปยัง Google Sheets...'
                  : 'ส่งออกข้อมูลทั้งหมดไปยัง Google Sheets ตอนนี้'}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              ระบบจะเขียนข้อมูลลงใน 4 ชีต: สรุปภาพรวม, รายการรับเรื่อง, บันทึกการตรวจเอกสาร และ
              การจัดชุดเอกสารและการติดตาม
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
