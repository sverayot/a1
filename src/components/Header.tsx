import React from 'react';
import {
  FileText,
  FileCheck2,
  FolderArchive,
  GitBranch,
  LayoutDashboard,
  Cloud,
  FileSpreadsheet,
  LogOut,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetsSyncConfig } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'intake' | 'inspection' | 'batch' | 'tracking';
  setActiveTab: (tab: 'dashboard' | 'intake' | 'inspection' | 'batch' | 'tracking') => void;
  currentUser: User | null;
  hasSheetsToken: boolean;
  sheetsConfig: GoogleSheetsSyncConfig;
  onOpenSheetsModal: () => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  hasSheetsToken,
  sheetsConfig,
  onOpenSheetsModal,
  onGoogleSignIn,
  onGoogleSignOut,
  isSyncing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="app-header">
      {/* Top bar with government emblem and system branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-lg bg-linear-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  ระบบบริหารงบภัยพิบัติ
                </span>
                <span className="text-xs text-slate-500 font-medium">ระเบียบ ก.ค. เงินทดรองราชการ</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                ระบบรับเรื่องและติดตามเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบภัยพิบัติ
              </h1>
            </div>
          </div>

          {/* Right Action: Google Sheets Connection & Auth */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Google Sheets Status Pill */}
            <button
              onClick={onOpenSheetsModal}
              id="btn-google-sheets-modal"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="ตั้งค่าและซิงค์ข้อมูลกับ Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold flex items-center gap-1">
                  Google Sheets
                  {isSyncing ? (
                    <span className="animate-pulse text-emerald-600">● กำลังซิงค์...</span>
                  ) : sheetsConfig.spreadsheetId ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="text-slate-400 font-normal">(ยังไม่เชื่อม)</span>
                  )}
                </span>
                {sheetsConfig.lastSyncedAt && (
                  <span className="text-[10px] text-emerald-700">
                    ซิงค์ล่าสุด: {new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </span>
                )}
              </div>
            </button>

            {/* Google Direct Link if connected */}
            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="link-open-sheet"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                title="เปิดสเปรดชีตบน Google Drive ในแท็บใหม่"
              >
                <span>เปิดชีต</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Google Sign In / Account Status */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left text-xs">
                  <span className="font-medium text-slate-800 leading-tight truncate max-w-[130px]">
                    {currentUser.displayName || 'ผู้ใช้งาน'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onGoogleSignOut}
                  id="btn-sign-out"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                id="btn-google-sign-in"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" id="main-nav-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            id="tab-dashboard"
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-red-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ภาพรวมและสถิติ</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            id="tab-intake"
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'intake'
                ? 'bg-red-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. รับเรื่อง (Intake)</span>
          </button>

          <button
            onClick={() => setActiveTab('inspection')}
            id="tab-inspection"
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inspection'
                ? 'bg-red-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>2. บันทึกการตรวจเอกสาร</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            id="tab-batch"
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-red-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>3. การจัดชุดเอกสาร</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            id="tab-tracking"
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-red-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>4. ติดตามสถานะชุดเอกสาร</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
