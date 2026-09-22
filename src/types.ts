export type AssistanceDepartment =
  | 'การดำรงชีพ'
  | 'พืช'
  | 'ประมง'
  | 'ปศุสัตว์'
  | 'บรรเทาสาธารณภัย'
  | 'การปฏิบัติงานให้ความช่วยเหลือผู้ประสบภัย';

export type BudgetTier = 'ปกติ' | 'ขยาย';

export type DisasterType =
  | 'ก่อการร้าย'
  | 'ก่อความไม่สงบ'
  | 'ภัยจากช้างป่า'
  | 'ภัยแล้ง'
  | 'วาตภัย'
  | 'อัคคีภัย'
  | 'อุทกภัย'
  | string;

export type BatchTrackingStatus =
  | 'รับเรื่อง'
  | 'เสนอขอความเห็นชอบ'
  | 'เห็นชอบ'
  | 'ส่งกรมบัญชีกลาง'
  | 'อนุมัติ';

export interface DisasterCase {
  id: string;
  caseNumber: string;               // เลขเรื่อง
  receivedDate: string;             // วันรับเรื่อง (YYYY-MM-DD)
  provinceLetter: string;           // หนังสือจังหวัด (ชื่อเรื่อง/หัวข้อ)
  provinceLetterNumber: string;     // เลขหนังสือจังหวัด
  provinceLetterDate: string;       // วันหนังสือจังหวัด (YYYY-MM-DD)
  department: AssistanceDepartment; // ด้าน
  budgetTier: BudgetTier;           // วงเงิน
  disasterType: DisasterType;       // ประเภทภัยพิบัติ
  gfDocNumber: string;              // เลขเอกสารGF
  postingDate: string;              // วันผ่านรายการ (YYYY-MM-DD)
  disburseAmount: number;           // เบิกเงิน (บาท)
  paidAmount: number;               // จ่ายเงิน (บาท)
  refundAmount: number;             // คืนเงิน (บาท)
  transferRequestAmount: number;    // ขอรับโอน (บาท)
  batchId?: string | null;          // รหัสชุดเอกสาร (ถ้ามี)
  notes?: string;                   // หมายเหตุ
  createdAt: string;
  updatedAt: string;
}

export interface InspectionSubItem {
  id: string;
  district?: string;                // อำเภอของรายการนี้
  itemName: string;                 // รายการให้ความช่วยเหลือ เช่น 5.1.5 ค่าอาหารจัดเลี้ยง
  quantity: number;                 // จำนวน
  unit: string;                     // หน่วย เช่น คน, ชุด, ครัวเรือน, มื้อ
  unitPrice?: number;               // ราคาต่อหน่วย
  amount: number;                   // จำนวนเงิน (บาท)
  remarks?: string;                 // หมายเหตุ
}

export interface ZoneDeclaration {
  disasterType: string;             // ประเภทภัยพิบัติ
  incidentDate: string;             // วันเกิดภัย
  declaredDate: string;             // วันประกาศภัย
  declarationNumber?: string;       // เลขที่ประกาศเขตฯ (ถ้ามี)
}

export interface DocumentInspection {
  id: string;
  caseId: string;                   // เชื่อมกับ เลขเรื่อง
  districts: string[];              // อำเภอ (หลายอำเภอ)
  declaration: ZoneDeclaration;     // ประกาศเขต
  items: InspectionSubItem[];       // รายการให้ความช่วยเหลือ (หลายรายการ)
  totalAmount: number;              // ยอดเงินรวม
  inspectionStatus: 'ผ่านการตรวจสอบ' | 'มีข้อท้วงติง/แก้ไข' | 'รอตรวจเอกสาร';
  inspectionDate: string;           // วันที่ตรวจเอกสาร
  inspectorName: string;            // ผู้ตรวจเอกสาร
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: BatchTrackingStatus;
  date: string;                     // YYYY-MM-DD
  time: string;
  officer: string;
  letterNumber?: string;
  remarks?: string;
}

export interface DocumentBatch {
  id: string;
  batchNumber: string;              // ครั้งที่ (เช่น ครั้งที่ 1, ครั้งที่ 2/2567)
  batchCode: string;                // รหัสชุดเอกสาร (เช่น SET-2567-001)
  budgetTier: BudgetTier;           // วงเงิน (ปกติ/ขยาย)
  caseIds: string[];                // รายการเลขเรื่องที่จัดชุด
  caseCount: number;                // จำนวนเรื่อง
  totalAmount: number;              // จำนวนเงิน
  approvalLetterNumber: string;     // เลขหนังสือขอความเห็นชอบ
  approvalLetterDate: string;       // วันหนังสือขอความเห็นชอบ
  currentStatus: BatchTrackingStatus;// สถานะปัจจุบัน (รับเรื่อง -> เสนอขอความเห็นชอบ -> เห็นชอบ -> ส่งกรมบัญชีกลาง -> อนุมัติ)
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface GoogleSheetsSyncConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
}
