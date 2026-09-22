import {
  DisasterCase,
  DocumentInspection,
  DocumentBatch,
  GoogleSheetsSyncConfig,
} from '../types';

export const DEFAULT_ASSISTANCE_ITEMS = [
  '5.1.5 ค่าอาหารจัดเลี้ยง',
  '5.1.2 ค่าถุงยังชีพ',
  '5.1.1 ค่าจัดหาน้ำอุปโภคบริโภค',
  '5.1.3 ค่ากระสอบทราย/วัสดุป้องกันภัย',
  '5.1.4 ค่ายารักษาโรคและเวชภัณฑ์',
  '5.1.6 ค่าเช่าที่พักชั่วคราว',
  '5.1.7 ค่าใช้จ่ายในการดำรงชีพเบื้องต้น',
  '5.1.8 ค่าซ่อมแซมที่อยู่อาศัยประจำ',
  '5.1.9 ค่าเครื่องนุ่งห่ม',
  '5.1.10 ค่าพาหนะอพยพผู้ประสบภัย',
];

export const INITIAL_CASES: DisasterCase[] = [
  {
    id: 'case-001',
    caseNumber: '01/2567',
    receivedDate: '2026-08-15',
    provinceLetter: 'ขอรับการจัดสรรเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบอุทกภัย ด้านการดำรงชีพ',
    provinceLetterNumber: 'ลย 0021/ว 4520',
    provinceLetterDate: '2026-08-12',
    department: 'การดำรงชีพ',
    budgetTier: 'ปกติ',
    disasterType: 'อุทกภัย',
    gfDocNumber: '1000045812',
    postingDate: '2026-08-16',
    disburseAmount: 1850000,
    paidAmount: 1850000,
    refundAmount: 0,
    transferRequestAmount: 1850000,
    batchId: 'batch-001',
    notes: 'น้ำป่าไหลหลากเข้าท่วมเขตชุมชนและพื้นที่การเกษตร',
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'case-002',
    caseNumber: '02/2567',
    receivedDate: '2026-08-20',
    provinceLetter: 'รายงานความเสียหายและขออนุมัติค่าถุงยังชีพและอาหารจัดเลี้ยง อำเภอท่าลี่ และอำเภอภูเรือ',
    provinceLetterNumber: 'ลย 0021/ว 4601',
    provinceLetterDate: '2026-08-18',
    department: 'บรรเทาสาธารณภัย',
    budgetTier: 'ปกติ',
    disasterType: 'อุทกภัย',
    gfDocNumber: '1000045920',
    postingDate: '2026-08-22',
    disburseAmount: 940000,
    paidAmount: 920000,
    refundAmount: 20000,
    transferRequestAmount: 920000,
    batchId: 'batch-001',
    notes: 'จัดเลี้ยงอาหารผู้ประสบภัยและแจกถุงยังชีพฉุกเฉิน',
    createdAt: '2026-08-20T10:30:00.000Z',
    updatedAt: '2026-08-20T10:30:00.000Z',
  },
  {
    id: 'case-003',
    caseNumber: '03/2567',
    receivedDate: '2026-08-28',
    provinceLetter: 'ขอรับเงินทดรองราชการกรณีวาตภัยสร้างความเสียหายแก่สิ่งปลูกสร้างและพืชผลทางการเกษตร',
    provinceLetterNumber: 'ลย 0021/ว 4755',
    provinceLetterDate: '2026-08-25',
    department: 'พืช',
    budgetTier: 'ปกติ',
    disasterType: 'วาตภัย',
    gfDocNumber: '1000046102',
    postingDate: '2026-08-30',
    disburseAmount: 1450000,
    paidAmount: 1400000,
    refundAmount: 50000,
    transferRequestAmount: 1400000,
    batchId: null, // ยังไม่ได้จัดชุด เพื่อให้ผู้ใช้ทดสอบเลือกจัดชุดเอกสารได้ทันที
    notes: 'พายุพัดหลังคาเรือนเสียหายและสวนกล้วยหักโค่น',
    createdAt: '2026-08-28T14:15:00.000Z',
    updatedAt: '2026-08-28T14:15:00.000Z',
  },
  {
    id: 'case-004',
    caseNumber: '04/2567',
    receivedDate: '2026-09-05',
    provinceLetter: 'ขอรับความช่วยเหลือด้านการประมง กรณีบ่อปลาได้รับความเสียหายจากน้ำท่วมฉับพลัน',
    provinceLetterNumber: 'ลย 0021/ว 4890',
    provinceLetterDate: '2026-09-02',
    department: 'ประมง',
    budgetTier: 'ปกติ',
    disasterType: 'อุทกภัย',
    gfDocNumber: '1000046550',
    postingDate: '2026-09-06',
    disburseAmount: 680000,
    paidAmount: 680000,
    refundAmount: 0,
    transferRequestAmount: 680000,
    batchId: null, // รอจัดชุด
    notes: 'เกษตรกรผู้เพาะเลี้ยงปลานิลและปลาดุกในกระชัง',
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-09-05T11:00:00.000Z',
  },
  {
    id: 'case-005',
    caseNumber: '05/2567',
    receivedDate: '2026-09-12',
    provinceLetter: 'ขอขยายวงเงินทดรองราชการกรณีช้างป่าทำลายพืชผลและทรัพย์สินราษฎรเกินวงเงินปกติ',
    provinceLetterNumber: 'ลย 0021/ว 5012',
    provinceLetterDate: '2026-09-10',
    department: 'การปฏิบัติงานให้ความช่วยเหลือผู้ประสบภัย',
    budgetTier: 'ขยาย',
    disasterType: 'ภัยจากช้างป่า',
    gfDocNumber: '1000047210',
    postingDate: '2026-09-14',
    disburseAmount: 3200000,
    paidAmount: 3200000,
    refundAmount: 0,
    transferRequestAmount: 3200000,
    batchId: null, // รอจัดชุด
    notes: 'ขอขยายวงเงินไปยังกระทรวงการคลัง/กรมบัญชีกลาง',
    createdAt: '2026-09-12T13:45:00.000Z',
    updatedAt: '2026-09-12T13:45:00.000Z',
  },
];

export const INITIAL_INSPECTIONS: DocumentInspection[] = [
  {
    id: 'ins-001',
    caseId: 'case-001',
    districts: ['อำเภอเมือง', 'อำเภอเชียงคาน'],
    declaration: {
      disasterType: 'อุทกภัย',
      incidentDate: '2026-08-10',
      declaredDate: '2026-08-11',
      declarationNumber: 'ปภ. 01/2567',
    },
    items: [
      {
        id: 'sub-001',
        district: 'อำเภอเมือง',
        itemName: '5.1.5 ค่าอาหารจัดเลี้ยง',
        quantity: 3500,
        unit: 'มื้อ',
        unitPrice: 50,
        amount: 175000,
        remarks: 'อาหาร 3 มื้อ สำหรับผู้ประสบภัยในศูนย์พักพิง',
      },
      {
        id: 'sub-002',
        district: 'อำเภอเมือง',
        itemName: '5.1.2 ค่าถุงยังชีพ',
        quantity: 1200,
        unit: 'ชุด',
        unitPrice: 700,
        amount: 840000,
        remarks: 'แจกจ่ายผู้ประสบภัยใน 4 ตำบล',
      },
      {
        id: 'sub-003',
        district: 'อำเภอเชียงคาน',
        itemName: '5.1.2 ค่าถุงยังชีพ',
        quantity: 1192,
        unit: 'ชุด',
        unitPrice: 700,
        amount: 835000,
        remarks: 'แจกจ่ายราษฎรริมแม่น้ำโขง',
      },
    ],
    totalAmount: 1850000,
    inspectionStatus: 'ผ่านการตรวจสอบ',
    inspectionDate: '2026-08-14',
    inspectorName: 'นายพิพัฒน์ ตรวจเอกสารดี',
    notes: 'เอกสารใบเสร็จ บัญชีรายชื่อผู้รับการช่วยเหลือครบถ้วนถูกต้อง',
    createdAt: '2026-08-14T16:00:00.000Z',
    updatedAt: '2026-08-14T16:00:00.000Z',
  },
  {
    id: 'ins-002',
    caseId: 'case-002',
    districts: ['อำเภอท่าลี่', 'อำเภอภูเรือ'],
    declaration: {
      disasterType: 'อุทกภัย',
      incidentDate: '2026-08-15',
      declaredDate: '2026-08-16',
      declarationNumber: 'ปภ. 02/2567',
    },
    items: [
      {
        id: 'sub-004',
        district: 'อำเภอท่าลี่',
        itemName: '5.1.5 ค่าอาหารจัดเลี้ยง',
        quantity: 2400,
        unit: 'มื้อ',
        unitPrice: 50,
        amount: 120000,
        remarks: 'เลี้ยงอาหารระหว่างทำความสะอาดโคลน',
      },
      {
        id: 'sub-005',
        district: 'อำเภอภูเรือ',
        itemName: '5.1.2 ค่าถุงยังชีพ',
        quantity: 1142,
        unit: 'ชุด',
        unitPrice: 700,
        amount: 800000,
        remarks: 'แจกจ่ายราษฎรผู้ประสบภัย',
      },
    ],
    totalAmount: 920000,
    inspectionStatus: 'ผ่านการตรวจสอบ',
    inspectionDate: '2026-08-19',
    inspectorName: 'นางสาวกนกพร ตรวจสอบบัญชี',
    notes: 'ส่งเงินคืน 20,000 บาท เนื่องจากยอดจัดซื้อจริงต่ำกว่าที่ประมาณการ',
    createdAt: '2026-08-19T15:00:00.000Z',
    updatedAt: '2026-08-19T15:00:00.000Z',
  },
];

export const INITIAL_BATCHES: DocumentBatch[] = [
  {
    id: 'batch-001',
    batchCode: 'SET-2567-001',
    batchNumber: 'ครั้งที่ 1/2567',
    budgetTier: 'ปกติ',
    caseIds: ['case-001', 'case-002'],
    caseCount: 2,
    totalAmount: 2770000,
    approvalLetterNumber: 'ลย 0021/ว 5120',
    approvalLetterDate: '2026-08-25',
    currentStatus: 'เห็นชอบ',
    statusHistory: [
      {
        status: 'รับเรื่อง',
        date: '2026-08-20',
        time: '10:00',
        officer: 'กลุ่มงานการเงินและบัญชี ปภ.จังหวัด',
        letterNumber: 'ลย 0021/ว 4601',
        remarks: 'รวบรวมเอกสารเบิกจ่ายกรณีอุทกภัย 2 เรื่อง',
      },
      {
        status: 'เสนอขอความเห็นชอบ',
        date: '2026-08-25',
        time: '14:30',
        officer: 'หัวหน้าสำนักงาน ปภ.จังหวัด',
        letterNumber: 'ลย 0021/ว 5120',
        remarks: 'เสนอผู้ว่าราชการจังหวัดเพื่อขอความเห็นชอบคณะกรรมการ ก.ช.ภ.จ.',
      },
      {
        status: 'เห็นชอบ',
        date: '2026-08-29',
        time: '11:00',
        officer: 'ประธานคณะกรรมการ ก.ช.ภ.จ. (ผู้ว่าฯ)',
        letterNumber: 'มท 0601/1042',
        remarks: 'คณะกรรมการมีมติเห็นชอบตามที่เสนอ วงเงิน 2,770,000 บาท',
      },
    ],
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-29T11:00:00.000Z',
    notes: 'ชุดเอกสารอุทกภัยระลอกแรก สรุปส่งให้คณะกรรมการฯ พิจารณาเรียบร้อย',
  },
];

const STORAGE_KEYS = {
  CASES: 'disaster_relief_cases_v1',
  INSPECTIONS: 'disaster_relief_inspections_v1',
  BATCHES: 'disaster_relief_batches_v1',
  ITEMS: 'disaster_relief_custom_items_v1',
  SHEETS_CONFIG: 'disaster_relief_sheets_config_v1',
};

export const getStoredCases = (): DisasterCase[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    return raw ? JSON.parse(raw) : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
};

export const saveStoredCases = (cases: DisasterCase[]): void => {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
};

export const getStoredInspections = (): DocumentInspection[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
    return raw ? JSON.parse(raw) : INITIAL_INSPECTIONS;
  } catch {
    return INITIAL_INSPECTIONS;
  }
};

export const saveStoredInspections = (inspections: DocumentInspection[]): void => {
  localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
};

export const getStoredBatches = (): DocumentBatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    return raw ? JSON.parse(raw) : INITIAL_BATCHES;
  } catch {
    return INITIAL_BATCHES;
  }
};

export const saveStoredBatches = (batches: DocumentBatch[]): void => {
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
};

export const getStoredAssistanceItems = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return raw ? JSON.parse(raw) : DEFAULT_ASSISTANCE_ITEMS;
  } catch {
    return DEFAULT_ASSISTANCE_ITEMS;
  }
};

export const saveStoredAssistanceItems = (items: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
};

export const getStoredSheetsConfig = (): GoogleSheetsSyncConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    return raw
      ? JSON.parse(raw)
      : {
          spreadsheetId: null,
          spreadsheetUrl: null,
          spreadsheetTitle: 'บันทึกเงินทดรองราชการช่วยผู้ประสบภัยพิบัติ',
          lastSyncedAt: null,
          autoSync: false,
        };
  } catch {
    return {
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetTitle: 'บันทึกเงินทดรองราชการช่วยผู้ประสบภัยพิบัติ',
      lastSyncedAt: null,
      autoSync: false,
    };
  }
};

export const saveStoredSheetsConfig = (config: GoogleSheetsSyncConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
};
