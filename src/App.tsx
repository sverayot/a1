/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  DisasterCase,
  DocumentInspection,
  DocumentBatch,
  GoogleSheetsSyncConfig,
  BatchTrackingStatus,
  StatusHistoryEntry,
} from './types';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
  setAccessToken,
} from './services/firebase';
import {
  createDisasterSpreadsheet,
  exportAllDataToGoogleSheets,
} from './services/sheets';
import {
  getStoredCases,
  saveStoredCases,
  getStoredInspections,
  saveStoredInspections,
  getStoredBatches,
  saveStoredBatches,
  getStoredAssistanceItems,
  saveStoredAssistanceItems,
  getStoredSheetsConfig,
  saveStoredSheetsConfig,
} from './services/storage';

import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { IntakeModule } from './components/IntakeModule';
import { InspectionModule } from './components/InspectionModule';
import { BatchModule } from './components/BatchModule';
import { TrackingModule } from './components/TrackingModule';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ItemManagerModal } from './components/ItemManagerModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'intake' | 'inspection' | 'batch' | 'tracking'
  >('dashboard');

  // Application Data States
  const [cases, setCases] = useState<DisasterCase[]>(getStoredCases);
  const [inspections, setInspections] = useState<DocumentInspection[]>(getStoredInspections);
  const [batches, setBatches] = useState<DocumentBatch[]>(getStoredBatches);
  const [assistanceItems, setAssistanceItems] = useState<string[]>(getStoredAssistanceItems);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsSyncConfig>(getStoredSheetsConfig);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasSheetsToken, setHasSheetsToken] = useState<boolean>(false);

  // Cross-Module Deep Linking State
  const [preselectedCaseId, setPreselectedCaseId] = useState<string | null>(null);
  const [preselectedBatchId, setPreselectedBatchId] = useState<string | null>(null);

  // Modals
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isItemManagerOpen, setIsItemManagerOpen] = useState(false);

  // Sync Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) {
          setHasSheetsToken(true);
        }
      },
      () => {
        setCurrentUser(null);
        setHasSheetsToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. LocalStorage Persistence
  useEffect(() => {
    saveStoredCases(cases);
  }, [cases]);

  useEffect(() => {
    saveStoredInspections(inspections);
  }, [inspections]);

  useEffect(() => {
    saveStoredBatches(batches);
  }, [batches]);

  useEffect(() => {
    saveStoredAssistanceItems(assistanceItems);
  }, [assistanceItems]);

  useEffect(() => {
    saveStoredSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  // Auth Handlers
  const handleGoogleSignIn = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setHasSheetsToken(true);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setSyncError(err.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleSignOut();
      setCurrentUser(null);
      setHasSheetsToken(false);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Google Sheets Handlers
  const handleCreateNewSpreadsheet = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncSuccess(null);

      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        token = authRes.accessToken;
      }

      if (!token) {
        throw new Error('ไม่พบ Access Token สำหรับ Google Sheets');
      }

      const title = 'ระบบรับเรื่องและติดตามเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบภัยพิบัติ';
      const created = await createDisasterSpreadsheet(token, title);

      const newConfig: GoogleSheetsSyncConfig = {
        spreadsheetId: created.spreadsheetId,
        spreadsheetUrl: created.spreadsheetUrl,
        spreadsheetTitle: title,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      };

      setSheetsConfig(newConfig);

      // Immediately export initial data
      await exportAllDataToGoogleSheets(
        token,
        created.spreadsheetId,
        cases,
        inspections,
        batches
      );

      setSyncSuccess('สร้าง Google Spreadsheet และบันทึกข้อมูลเรียบร้อยแล้ว!');
    } catch (err: any) {
      console.error('Failed to create spreadsheet:', err);
      setSyncError(err.message || 'เกิดข้อผิดพลาดในการสร้างสเปรดชีต');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportToSheets = async () => {
    if (!sheetsConfig.spreadsheetId) {
      setSyncError('กรุณาสร้างหรือระบุ Google Spreadsheet ปลายทางก่อน');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncSuccess(null);

      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        token = authRes.accessToken;
      }

      if (!token) {
        throw new Error('ไม่พบ Access Token สำหรับ Google Sheets');
      }

      await exportAllDataToGoogleSheets(
        token,
        sheetsConfig.spreadsheetId,
        cases,
        inspections,
        batches
      );

      const updatedConfig = {
        ...sheetsConfig,
        lastSyncedAt: new Date().toISOString(),
      };
      setSheetsConfig(updatedConfig);
      setSyncSuccess(
        `ซิงค์ข้อมูลทั้งหมดไปยัง Google Sheets สำเร็จ (${new Date().toLocaleTimeString('th-TH')} น.)`
      );
    } catch (err: any) {
      console.error('Export to sheets error:', err);
      setSyncError(err.message || 'ไม่สามารถส่งออกข้อมูลไปยัง Google Sheets ได้');
    } finally {
      setIsSyncing(false);
    }
  };

  // Case Actions
  const handleSaveCase = (caseData: DisasterCase) => {
    setCases((prev) => {
      const idx = prev.findIndex((c) => c.id === caseData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = caseData;
        return updated;
      } else {
        return [caseData, ...prev];
      }
    });
  };

  const handleDeleteCase = (caseId: string) => {
    // Also remove from any batch that referenced it
    setBatches((prev) =>
      prev.map((b) => {
        if (b.caseIds.includes(caseId)) {
          const newCaseIds = b.caseIds.filter((id) => id !== caseId);
          return {
            ...b,
            caseIds: newCaseIds,
            caseCount: newCaseIds.length,
          };
        }
        return b;
      })
    );

    // Remove case
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    // Remove associated inspection records
    setInspections((prev) => prev.filter((ins) => ins.caseId !== caseId));
  };

  // Inspection Actions
  const handleSaveInspection = (inspection: DocumentInspection) => {
    setInspections((prev) => {
      const idx = prev.findIndex((i) => i.id === inspection.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = inspection;
        return updated;
      } else {
        return [inspection, ...prev];
      }
    });
  };

  const handleDeleteInspection = (inspectionId: string) => {
    setInspections((prev) => prev.filter((i) => i.id !== inspectionId));
  };

  // Batch Actions
  const handleSaveBatch = (batch: DocumentBatch, affectedCaseIds: string[]) => {
    // 1. Update batches list
    setBatches((prev) => {
      const idx = prev.findIndex((b) => b.id === batch.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = batch;
        return updated;
      } else {
        return [batch, ...prev];
      }
    });

    // 2. Mark the selected cases with this batchId
    setCases((prev) =>
      prev.map((c) => {
        if (affectedCaseIds.includes(c.id)) {
          return { ...c, batchId: batch.id };
        } else if (c.batchId === batch.id && !affectedCaseIds.includes(c.id)) {
          // Unassigned from this batch
          return { ...c, batchId: null };
        }
        return c;
      })
    );
  };

  const handleDeleteBatch = (batchId: string) => {
    // Reset batchId on cases that belonged to this batch
    setCases((prev) =>
      prev.map((c) => (c.batchId === batchId ? { ...c, batchId: null } : c))
    );
    // Remove batch
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  const handleUpdateBatchStatus = (
    batchId: string,
    newStatus: BatchTrackingStatus,
    historyEntry: StatusHistoryEntry
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const updatedHistory = [historyEntry, ...(b.statusHistory || [])];
        return {
          ...b,
          currentStatus: newStatus,
          statusHistory: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Deep Navigation Helpers
  const handleNavigateToInspection = (caseId: string) => {
    setPreselectedCaseId(caseId);
    setActiveTab('inspection');
  };

  const handleNavigateToTracking = (batchId: string) => {
    setPreselectedBatchId(batchId);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-['Sarabun',sans-serif]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        hasSheetsToken={hasSheetsToken}
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            cases={cases}
            inspections={inspections}
            batches={batches}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'intake' && (
          <IntakeModule
            cases={cases}
            inspections={inspections}
            onSaveCase={handleSaveCase}
            onDeleteCase={handleDeleteCase}
            onNavigateToInspection={handleNavigateToInspection}
          />
        )}

        {activeTab === 'inspection' && (
          <InspectionModule
            cases={cases}
            inspections={inspections}
            assistanceItems={assistanceItems}
            onSaveInspection={handleSaveInspection}
            onDeleteInspection={handleDeleteInspection}
            onOpenItemManager={() => setIsItemManagerOpen(true)}
            preselectedCaseId={preselectedCaseId}
            onClearPreselectedCase={() => setPreselectedCaseId(null)}
          />
        )}

        {activeTab === 'batch' && (
          <BatchModule
            cases={cases}
            batches={batches}
            onSaveBatch={handleSaveBatch}
            onDeleteBatch={handleDeleteBatch}
            onNavigateToTracking={handleNavigateToTracking}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingModule
            batches={batches}
            cases={cases}
            onUpdateBatchStatus={handleUpdateBatchStatus}
            selectedBatchId={preselectedBatchId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ระบบรับเรื่องและติดตามเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉิน
          </span>
          <span className="text-[11px] text-slate-400">
            กรมป้องกันและบรรเทาสาธารณภัย กระทรวงมหาดไทย • รองรับการเชื่อมต่อ Google Sheets API
          </span>
        </div>
      </footer>

      {/* Modals */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        currentUser={currentUser}
        hasSheetsToken={hasSheetsToken}
        sheetsConfig={sheetsConfig}
        onSaveSheetsConfig={setSheetsConfig}
        onGoogleSignIn={handleGoogleSignIn}
        onCreateNewSpreadsheet={handleCreateNewSpreadsheet}
        onExportToSheets={handleExportToSheets}
        isSyncing={isSyncing}
        syncError={syncError}
        syncSuccess={syncSuccess}
      />

      <ItemManagerModal
        isOpen={isItemManagerOpen}
        onClose={() => setIsItemManagerOpen(false)}
        items={assistanceItems}
        onSaveItems={setAssistanceItems}
      />
    </div>
  );
}
