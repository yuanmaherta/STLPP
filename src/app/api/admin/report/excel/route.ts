import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { ageYearsOnly, sumScores, durasiLabel } from '@/lib/utils/report-helpers';

const FONT = 'Arial';
const blueFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
const greenFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
const navyFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
const yellowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
const thin: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };
const wrapCenter: Partial<ExcelJS.Alignment> = { wrapText: true, vertical: 'middle', horizontal: 'center' };
const wrapLeft: Partial<ExcelJS.Alignment> = { wrapText: true, vertical: 'middle', horizontal: 'left' };

function styleHeaderCell(cell: ExcelJS.Cell, fill: ExcelJS.Fill, white = false) {
  cell.font = { name: FONT, bold: true, size: 9, color: white ? { argb: 'FFFFFFFF' } : undefined };
  cell.fill = fill;
  cell.alignment = wrapCenter;
  cell.border = allBorders;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: hanya admin yang boleh export laporan' }, { status: 403 });
  }

  const body = await request.json();
  const rows = (body.rows ?? []) as any[];
  const edits = (body.edits ?? []) as any[];
  const title: string = body.title ?? 'Semua Divisi';
  const editMap = new Map(edits.map((e) => [e.id, e]));

  const workbook = new ExcelJS.Workbook();

  // =========================================================
  // SHEET 1: Rekap Hal. 1 - status kontrak & approval
  // =========================================================
  const ws1 = workbook.addWorksheet('Rekap Hal. 1');
  ws1.mergeCells('A1:N1');
  ws1.getCell('A1').value = 'EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT';
  ws1.getCell('A1').font = { name: FONT, bold: true, size: 14 };
  ws1.getCell('A1').alignment = { horizontal: 'center' };

  ws1.mergeCells('A2:N2');
  ws1.getCell('A2').value = title.toUpperCase();
  ws1.getCell('A2').font = { name: FONT, bold: true, size: 12 };
  ws1.getCell('A2').alignment = { horizontal: 'center' };

  const h1Simple: [string, string][] = [
    ['A', 'No'], ['B', 'Nama'], ['C', 'Jabatan/Posisi'], ['D', 'Unit Kerja'],
    ['E', 'Usia'], ['F', 'Masa Kerja dari\nkontrak I (th)'], ['G', 'Periode Akhir\nKontrak'],
  ];
  h1Simple.forEach(([col, label]) => {
    ws1.mergeCells(`${col}4:${col}6`);
    styleHeaderCell(ws1.getCell(`${col}4`), blueFill);
    ws1.getCell(`${col}4`).value = label;
  });

  ws1.mergeCells('H4:M4');
  styleHeaderCell(ws1.getCell('H4'), greenFill);
  ws1.getCell('H4').value = 'Keberlanjutan Kontrak Kerja';

  const groupLabels: [string, string, string][] = [
    ['H5', 'I5', 'Tidak dilakukan\nperpanjangan kontrak'],
    ['J5', 'K5', 'Dilakukan perpanjangan\nkontrak selama 6 Bulan'],
    ['L5', 'M5', 'Dilakukan perpanjangan\nkontrak selama 1 Tahun'],
  ];
  groupLabels.forEach(([start, end, label]) => {
    ws1.mergeCells(`${start}:${end}`);
    styleHeaderCell(ws1.getCell(start), greenFill);
    ws1.getCell(start).value = label;
  });
  ['H', 'I', 'J', 'K', 'L', 'M'].forEach((col) => {
    const cell = ws1.getCell(`${col}6`);
    cell.value = col === 'H' || col === 'J' || col === 'L' ? 'EVP HC' : 'DHCL';
    styleHeaderCell(cell, greenFill);
  });

  ws1.mergeCells('N4:N6');
  styleHeaderCell(ws1.getCell('N4'), navyFill, true);
  ws1.getCell('N4').value = 'Keterangan Rekomendasi';

  const widths1: Record<string, number> = { A: 5, B: 20, C: 26, D: 20, E: 9, F: 12, G: 13, H: 8, I: 8, J: 8, K: 8, L: 8, M: 8, N: 36 };
  Object.entries(widths1).forEach(([col, w]) => (ws1.getColumn(col).width = w));
  ws1.getRow(4).height = 24;
  ws1.getRow(5).height = 40;
  ws1.getRow(6).height = 16;

  let r1 = 7;
  rows.forEach((row: any, i: number) => {
    const emp = row.assignment?.employee;
    const edit = editMap.get(row.id) ?? {};
    const values: Record<string, any> = {
      A: i + 1,
      B: emp?.nama ?? '',
      C: emp?.jabatan ?? '',
      D: emp?.divisi ?? '',
      E: ageYearsOnly(emp?.tgl_lahir),
      F: emp?.masa_kerja ?? '',
      G: emp?.tgl_habis_kontrak ?? '',
      N: edit.keteranganRekomendasi ?? '',
    };
    Object.entries(values).forEach(([col, val]) => {
      const cell = ws1.getCell(`${col}${r1}`);
      cell.value = val;
      cell.font = { name: FONT, size: 9 };
      cell.alignment = ['B', 'C', 'D', 'N'].includes(col) ? wrapLeft : wrapCenter;
      cell.border = allBorders;
    });
    ['H', 'I', 'J', 'K', 'L', 'M'].forEach((col) => {
      const cell = ws1.getCell(`${col}${r1}`);
      cell.border = allBorders;
    });
    // Tandai kolom EVP HC sesuai rekomendasi (kolom DHCL sengaja dikosongkan untuk tanda tangan manual)
    const markCol = row.recommendation !== 'DI PERPANJANG' ? 'H' : row.duration === '6' ? 'J' : 'L';
    ws1.getCell(`${markCol}${r1}`).value = 'V';
    ws1.getCell(`${markCol}${r1}`).font = { name: FONT, bold: true, size: 10 };
    ws1.getCell(`${markCol}${r1}`).alignment = wrapCenter;
    ws1.getRow(r1).height = 45;
    r1++;
  });

  // =========================================================
  // SHEET 2: Rekap Hal. 2 - hasil penilaian
  // =========================================================
  const ws2 = workbook.addWorksheet('Rekap Hal. 2');
  ws2.mergeCells('A1:Q1');
  ws2.getCell('A1').value = 'EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT';
  ws2.getCell('A1').font = { name: FONT, bold: true, size: 14 };
  ws2.getCell('A1').alignment = { horizontal: 'center' };

  ws2.mergeCells('A2:Q2');
  ws2.getCell('A2').value = title.toUpperCase();
  ws2.getCell('A2').font = { name: FONT, bold: true, size: 12 };
  ws2.getCell('A2').alignment = { horizontal: 'center' };

  const h2Simple: [string, string][] = [
    ['A', 'No'], ['B', 'Nama'], ['C', 'Jabatan/Posisi'], ['D', 'Unit Kerja'], ['E', 'Usia'],
    ['F', 'Masa Kerja dari\nkontrak I (th)'], ['G', 'Periode Akhir\nKontrak'],
  ];
  h2Simple.forEach(([col, label]) => {
    ws2.mergeCells(`${col}4:${col}6`);
    styleHeaderCell(ws2.getCell(`${col}4`), blueFill);
    ws2.getCell(`${col}4`).value = label;
  });

  ws2.mergeCells('H4:O4');
  styleHeaderCell(ws2.getCell('H4'), greenFill);
  ws2.getCell('H4').value = 'Penilaian Evaluasi PKWT';

  ws2.mergeCells('H5:H6');
  styleHeaderCell(ws2.getCell('H5'), greenFill);
  ws2.getCell('H5').value = 'Total Nilai';
  ws2.mergeCells('I5:I6');
  styleHeaderCell(ws2.getCell('I5'), greenFill);
  ws2.getCell('I5').value = 'Rata-Rata Nilai';
  ws2.mergeCells('J5:L5');
  styleHeaderCell(ws2.getCell('J5'), greenFill);
  ws2.getCell('J5').value = 'Pengembangan, Potensi & Kinerja';
  ['J', 'K', 'L'].forEach((col, idx) => {
    const cell = ws2.getCell(`${col}6`);
    cell.value = ['Kinerja Karyawan', 'Potensi Karyawan', 'Pengembangan Karyawan'][idx];
    styleHeaderCell(cell, greenFill);
  });

  ws2.mergeCells('M5:M6');
  styleHeaderCell(ws2.getCell('M5'), greenFill);
  ws2.getCell('M5').value = 'Catatan Kasus';
  ws2.mergeCells('N5:N6');
  styleHeaderCell(ws2.getCell('N5'), greenFill);
  ws2.getCell('N5').value = 'Kesan-kesan Umum';
  ws2.mergeCells('O5:O6');
  styleHeaderCell(ws2.getCell('O5'), greenFill);
  ws2.getCell('O5').value = 'Saran & Pengembangan';

  ws2.mergeCells('P4:P6');
  styleHeaderCell(ws2.getCell('P4'), navyFill, true);
  ws2.getCell('P4').value = 'Penilai';

  const widths2: Record<string, number> = { A: 5, B: 20, C: 24, D: 18, E: 9, F: 12, G: 13, H: 9, I: 10, J: 12, K: 12, L: 14, M: 18, N: 26, O: 26, P: 18 };
  Object.entries(widths2).forEach(([col, w]) => (ws2.getColumn(col).width = w));
  ws2.getRow(4).height = 20;
  ws2.getRow(5).height = 22;
  ws2.getRow(6).height = 16;

  let r2 = 7;
  rows.forEach((row: any, i: number) => {
    const emp = row.assignment?.employee;
    const total = sumScores(row.scores);
    const values: Record<string, any> = {
      A: i + 1,
      B: emp?.nama ?? '',
      C: emp?.jabatan ?? '',
      D: emp?.divisi ?? '',
      E: ageYearsOnly(emp?.tgl_lahir),
      F: emp?.masa_kerja ?? '',
      G: emp?.tgl_habis_kontrak ?? '',
      H: total,
      I: row.grand_avg,
      J: row.form_c_data?.kinerja ?? '',
      K: row.form_c_data?.potensi ?? '',
      L: row.form_c_data?.pengembangan ?? '',
      M: row.form_c_data?.catatanKasus ?? '',
      N: row.form_c_data?.kesanUmum ?? '',
      O: row.form_c_data?.saranPengembangan ?? '',
      P: row.assignment?.evaluator?.name ?? '',
    };
    Object.entries(values).forEach(([col, val]) => {
      const cell = ws2.getCell(`${col}${r2}`);
      cell.value = val;
      cell.font = { name: FONT, size: 9 };
      cell.alignment = ['B', 'C', 'D', 'M', 'N', 'O'].includes(col) ? wrapLeft : wrapCenter;
      cell.border = allBorders;
    });
    ws2.getRow(r2).height = 45;
    r2++;
  });

  [ws1, ws2].forEach((ws) => {
    ws.pageSetup.orientation = 'landscape';
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.pageSetup.fitToHeight = 0;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-stlpp.xlsx"`,
    },
  });
}
