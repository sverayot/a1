import { DisasterCase, DocumentInspection, DocumentBatch } from '../types';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

interface CreateSpreadsheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function createDisasterSpreadsheet(
  accessToken: string,
  title: string = 'ระบบรับเรื่องและติดตามเงินทดรองราชการผู้ประสบภัยพิบัติ'
): Promise<CreateSpreadsheetResponse> {
  const requestBody = {
    properties: {
      title: `${title} (${new Date().toLocaleDateString('th-TH')})`,
    },
    sheets: [
      { properties: { title: 'สรุปภาพรวม', index: 0 } },
      { properties: { title: 'รายการรับเรื่อง', index: 1 } },
      { properties: { title: 'บันทึกการตรวจเอกสาร', index: 2 } },
      { properties: { title: 'การจัดชุดเอกสารและการติดตาม', index: 3 } },
    ],
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `ไม่สามารถสร้าง Google Sheet ได้ (รหัสข้อผิดพลาด ${response.status})`
    );
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

export async function exportAllDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  cases: DisasterCase[],
  inspections: DocumentInspection[],
  batches: DocumentBatch[]
): Promise<void> {
  // 1. Prepare Overview Data
  const totalCases = cases.length;
  const totalDisburse = cases.reduce((sum, c) => sum + (c.disburseAmount || 0), 0);
  const totalPaid = cases.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalRefund = cases.reduce((sum, c) => sum + (c.refundAmount || 0), 0);
  const totalTransfer = cases.reduce((sum, c) => sum + (c.transferRequestAmount || 0), 0);

  const overviewRows = [
    ['สรุปรายงานระบบรับเรื่องและติดตามเงินทดรองราชการเพื่อช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉิน'],
    ['วันที่ปรับปรุงข้อมูลล่าสุด', new Date().toLocaleString('th-TH')],
    [''],
    ['ตัวชี้วัดสำคัญ (Key Metrics)', 'จำนวน / มูลค่า (บาท)'],
    ['จำนวนเรื่องรับเข้าทั้งหมด', totalCases],
    ['ยอดเบิกเงินรวม (บาท)', totalDisburse],
    ['ยอดจ่ายเงินรวม (บาท)', totalPaid],
    ['ยอดคืนเงินรวม (บาท)', totalRefund],
    ['ยอดขอรับโอนรวม (บาท)', totalTransfer],
    ['จำนวนชุดเอกสารทั้งหมด', batches.length],
    ['จำนวนเรื่องที่จัดชุดแล้ว', cases.filter(c => c.batchId).length],
    ['จำนวนเรื่องคงค้างรอจัดชุด', cases.filter(c => !c.batchId).length],
    [''],
    ['สถานะการติดตามชุดเอกสาร', 'จำนวนชุด'],
    ['1. รับเรื่อง', batches.filter(b => b.currentStatus === 'รับเรื่อง').length],
    ['2. เสนอขอความเห็นชอบ', batches.filter(b => b.currentStatus === 'เสนอขอความเห็นชอบ').length],
    ['3. เห็นชอบ', batches.filter(b => b.currentStatus === 'เห็นชอบ').length],
    ['4. ส่งกรมบัญชีกลาง', batches.filter(b => b.currentStatus === 'ส่งกรมบัญชีกลาง').length],
    ['5. อนุมัติ', batches.filter(b => b.currentStatus === 'อนุมัติ').length],
  ];

  // 2. Prepare Intake Cases Data
  const caseHeader = [
    'ลำดับ',
    'เลขเรื่อง',
    'วันรับเรื่อง',
    'หนังสือจังหวัด (ชื่อเรื่อง)',
    'เลขหนังสือจังหวัด',
    'วันหนังสือจังหวัด',
    'ด้าน',
    'วงเงิน',
    'ประเภทภัยพิบัติ',
    'เลขเอกสารGF',
    'วันผ่านรายการ',
    'เบิกเงิน (บาท)',
    'จ่ายเงิน (บาท)',
    'คืนเงิน (บาท)',
    'ขอรับโอน (บาท)',
    'รหัสชุดเอกสาร',
    'หมายเหตุ',
  ];

  const caseRows = cases.map((item, idx) => [
    idx + 1,
    item.caseNumber || '',
    item.receivedDate || '',
    item.provinceLetter || '',
    item.provinceLetterNumber || '',
    item.provinceLetterDate || '',
    item.department || '',
    item.budgetTier || '',
    item.disasterType || '',
    item.gfDocNumber || '',
    item.postingDate || '',
    item.disburseAmount || 0,
    item.paidAmount || 0,
    item.refundAmount || 0,
    item.transferRequestAmount || 0,
    item.batchId || 'ยังไม่ได้จัดชุด',
    item.notes || '',
  ]);

  // 3. Prepare Inspection Records Data
  const inspectionHeader = [
    'ลำดับ',
    'เลขเรื่องที่อ้างอิง',
    'อำเภอในพื้นที่',
    'ประเภทภัย (ประกาศเขต)',
    'วันเกิดภัย',
    'วันประกาศภัย',
    'รายการให้ความช่วยเหลือ',
    'จำนวน',
    'หน่วย',
    'จำนวนเงิน (บาท)',
    'สถานะตรวจเอกสาร',
    'วันที่ตรวจเอกสาร',
    'ผู้ตรวจเอกสาร',
    'หมายเหตุ',
  ];

  const inspectionRows: any[][] = [];
  let insIdx = 1;
  inspections.forEach((ins) => {
    const parentCase = cases.find((c) => c.id === ins.caseId);
    const caseNumber = parentCase ? parentCase.caseNumber : ins.caseId;
    const districtsStr = (ins.districts || []).join(', ');

    if (ins.items && ins.items.length > 0) {
      ins.items.forEach((subItem) => {
        inspectionRows.push([
          insIdx++,
          caseNumber,
          subItem.district || districtsStr,
          ins.declaration?.disasterType || '',
          ins.declaration?.incidentDate || '',
          ins.declaration?.declaredDate || '',
          subItem.itemName || '',
          subItem.quantity || 0,
          subItem.unit || '',
          subItem.amount || 0,
          ins.inspectionStatus || '',
          ins.inspectionDate || '',
          ins.inspectorName || '',
          subItem.remarks || ins.notes || '',
        ]);
      });
    } else {
      inspectionRows.push([
        insIdx++,
        caseNumber,
        districtsStr,
        ins.declaration?.disasterType || '',
        ins.declaration?.incidentDate || '',
        ins.declaration?.declaredDate || '',
        '-',
        0,
        '',
        ins.totalAmount || 0,
        ins.inspectionStatus || '',
        ins.inspectionDate || '',
        ins.inspectorName || '',
        ins.notes || '',
      ]);
    }
  });

  // 4. Prepare Batches & Tracking Data
  const batchHeader = [
    'ลำดับ',
    'รหัสชุดเอกสาร',
    'ครั้งที่',
    'วงเงิน',
    'จำนวนเรื่อง',
    'จำนวนเงินรวม (บาท)',
    'เลขหนังสือขอความเห็นชอบ',
    'วันหนังสือขอความเห็นชอบ',
    'สถานะติดตามปัจจุบัน',
    'รายการเลขเรื่องที่รวมในชุด',
    'หมายเหตุ',
    'วันที่สร้างชุด',
  ];

  const batchRows = batches.map((b, idx) => {
    const includedCases = cases
      .filter((c) => b.caseIds.includes(c.id))
      .map((c) => c.caseNumber)
      .join(', ');

    return [
      idx + 1,
      b.batchCode || '',
      b.batchNumber || '',
      b.budgetTier || '',
      b.caseCount || b.caseIds.length,
      b.totalAmount || 0,
      b.approvalLetterNumber || '',
      b.approvalLetterDate || '',
      b.currentStatus || 'รับเรื่อง',
      includedCases || b.caseIds.join(', '),
      b.notes || '',
      b.createdAt?.substring(0, 10) || '',
    ];
  });

  // Batch update values
  const payload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'สรุปภาพรวม'!A1",
        values: overviewRows,
      },
      {
        range: "'รายการรับเรื่อง'!A1",
        values: [caseHeader, ...caseRows],
      },
      {
        range: "'บันทึกการตรวจเอกสาร'!A1",
        values: [inspectionHeader, ...inspectionRows],
      },
      {
        range: "'การจัดชุดเอกสารและการติดตาม'!A1",
        values: [batchHeader, ...batchRows],
      },
    ],
  };

  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `เกิดข้อผิดพลาดในการอัปเดตข้อมูลลง Google Sheets (${response.status})`
    );
  }
}
