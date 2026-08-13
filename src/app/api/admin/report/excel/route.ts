import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { ageYearsOnly, sumScores } from '@/lib/utils/report-helpers';

// ====================================================================
// Warna & font ini dibaca LANGSUNG dari file RPPK-INFRA_II asli (bukan
// tebakan) — theme colors dihitung dari clrScheme + tint workbook itu:
//   accent1 (biru)  = 4472C4  |  accent4 (emas) = FFC000
//   accent6 (hijau) = 70AD47  |  lt1 (putih)     = FFFFFF
// ====================================================================
const FONT = 'Times New Roman';
const FONT_SIZE = 18;

const grayFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } }; // lt1 tint -0.25
const blueFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C7E7' } }; // accent1 tint +0.6
const brightGreenFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }; // literal, sama seperti file asli
const paleGreenFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }; // accent6 tint +0.8
const paleGoldFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; // accent4 tint +0.8
const darkBlueFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF335593' } }; // accent1 tint -0.25

const thin: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };
const wrapCenter: Partial<ExcelJS.Alignment> = { wrapText: true, vertical: 'middle', horizontal: 'center' };
const wrapLeft: Partial<ExcelJS.Alignment> = { wrapText: true, vertical: 'middle', horizontal: 'left' };

function styleHeaderCell(cell: ExcelJS.Cell, fill: ExcelJS.Fill, white = false) {
  cell.font = { name: FONT, bold: true, size: FONT_SIZE, color: white ? { argb: 'FFFFFFFF' } : undefined };
  cell.fill = fill;
  cell.alignment = wrapCenter;
  cell.border = allBorders;
}

function styleDataCell(cell: ExcelJS.Cell, align: Partial<ExcelJS.Alignment> = wrapCenter) {
  cell.font = { name: FONT, size: FONT_SIZE };
  cell.alignment = align;
  cell.border = allBorders;
  // Sengaja TANPA fill — file asli membiarkan baris data putih polos.
}

const orDash = (v: string | null | undefined) => (v && v.trim() ? v : '-');

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
  const sign = body.sign ?? {};
  const editMap = new Map(edits.map((e) => [e.id, e]));

  const workbook = new ExcelJS.Workbook();

  // =========================================================
  // SHEET 1: Rekap Hal. 1
  // =========================================================
  const ws1 = workbook.addWorksheet('Rekap Hal. 1');
  ws1.mergeCells('A1:O1');
  ws1.getCell('A1').value = 'EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT';
  ws1.getCell('A1').font = { name: FONT, bold: true, size: FONT_SIZE };
  ws1.getCell('A1').alignment = { horizontal: 'center' };

  ws1.mergeCells('A2:O2');
  ws1.getCell('A2').value = title.toUpperCase();
  ws1.getCell('A2').font = { name: FONT, bold: true, size: FONT_SIZE };
  ws1.getCell('A2').alignment = { horizontal: 'center' };

  const h1Simple: [string, string][] = [
    ['A', 'No'], ['B', 'Nama'], ['C', 'Jabatan/Posisi'], ['D', 'Unit Kerja'],
    ['E', 'Usia'], ['F', 'Masa Kerja dari kontrak I (th)'], ['G', 'Periode Akhir Kontrak'],
  ];
  h1Simple.forEach(([col, label]) => {
    ws1.mergeCells(`${col}4:${col}6`);
    styleHeaderCell(ws1.getCell(`${col}4`), grayFill);
    ws1.getCell(`${col}4`).value = label;
  });

  ws1.mergeCells('H4:M4');
  styleHeaderCell(ws1.getCell('H4'), grayFill);
  ws1.getCell('H4').value = 'Keberlanjutan Kontrak Kerja';

  const groupLabels: [string, string, string][] = [
    ['H5', 'I5', 'Tidak dilakukan perpanjangan kontrak'],
    ['J5', 'K5', 'Dilakukan perpanjangan kontrak selama 6 Bulan'],
    ['L5', 'M5', 'Dilakukan perpanjangan kontrak selama 1 Tahun'],
  ];
  groupLabels.forEach(([start, end, label]) => {
    ws1.mergeCells(`${start}:${end}`);
    styleHeaderCell(ws1.getCell(start), grayFill);
    ws1.getCell(start).value = label;
  });
  ['H', 'I', 'J', 'K', 'L', 'M'].forEach((col) => {
    const cell = ws1.getCell(`${col}6`);
    cell.value = col === 'H' || col === 'J' || col === 'L' ? 'EVP HC' : 'DHCL';
    styleHeaderCell(cell, grayFill);
  });

  ws1.mergeCells('N4:N6');
  styleHeaderCell(ws1.getCell('N4'), grayFill);
  ws1.getCell('N4').value = 'Keterangan Rekomendasi';

  ws1.mergeCells('O4:O6');
  styleHeaderCell(ws1.getCell('O4'), grayFill);
  ws1.getCell('O4').value = 'Keterangan';

  // Lebar kolom persis dari file RPPK-INFRA_II asli
  const widths1: Record<string, number> = { A: 8.6, B: 39.6, C: 39.3, D: 32.7, E: 18.4, F: 28.4, G: 20, H: 28.7, I: 28.6, J: 35.3, K: 25.4, L: 36.3, M: 27.6, N: 63.3, O: 25.6 };
  Object.entries(widths1).forEach(([col, w]) => (ws1.getColumn(col).width = w));
  ws1.getRow(1).height = 34;
  ws1.getRow(2).height = 22;
  ws1.getRow(4).height = 44;
  ws1.getRow(5).height = 50;
  ws1.getRow(6).height = 35;

  let r1 = 7;
  rows.forEach((row: any, i: number) => {
    const emp = row.assignment?.employee;
    const edit = editMap.get(row.id) ?? {};

    const baseValues: Record<string, any> = {
      A: i + 1,
      B: emp?.nama ?? '',
      C: emp?.jabatan ?? '',
      D: emp?.divisi ?? '',
      E: ageYearsOnly(emp?.tgl_lahir),
      F: emp?.masa_kerja ?? '',
      G: emp?.tgl_habis_kontrak ?? '',
      N: orDash(edit.keteranganRekomendasi),
      O: orDash(edit.keterangan),
    };
    Object.entries(baseValues).forEach(([col, val]) => {
      styleDataCell(ws1.getCell(`${col}${r1}`), col === 'N' ? wrapLeft : wrapCenter);
      ws1.getCell(`${col}${r1}`).value = val;
    });
    if (emp?.tgl_habis_kontrak) {
      const gCell = ws1.getCell(`G${r1}`);
      gCell.value = new Date(emp.tgl_habis_kontrak);
      gCell.numFmt = 'dd mmm yyyy';
    }

    ['H', 'I', 'J', 'K', 'L', 'M'].forEach((col) => styleDataCell(ws1.getCell(`${col}${r1}`)));

    const lulus = row.recommendation === 'DI PERPANJANG' ? 'Lulus Evaluasi' : 'Tidak Lulus Evaluasi';
    const statusText = `${lulus}\n\n${edit.rekomendasi ?? ''}`;
    const checkboxText = '\u2610 Disetujui\n\u2610 Tidak Disetujui';

    const [evpCol, dhclCol] =
      row.recommendation !== 'DI PERPANJANG' ? ['H', 'I'] : row.duration === '6' ? ['J', 'K'] : ['L', 'M'];

    ws1.getCell(`${evpCol}${r1}`).value = statusText;
    ws1.getCell(`${dhclCol}${r1}`).value = checkboxText;
    ws1.getCell(`${dhclCol}${r1}`).alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };

    ws1.getRow(r1).height = 240;
    r1++;
  });

  // Blok tanda tangan Menyetujui / Mengajukan
  r1 += 2;
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.tempatTanggal || '';
  ws1.getCell(`I${r1}`).font = { name: FONT, size: 12 };
  r1 += 2;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = 'Menyetujui,';
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = 'Mengajukan,';
  [`B${r1}`, `I${r1}`].forEach((addr) => (ws1.getCell(addr).font = { name: FONT, size: 12 }));
  r1 += 4;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = sign.namaMenyetujui || '( ..................................... )';
  ws1.getCell(`B${r1}`).font = { name: FONT, bold: true, size: 12, underline: true };
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.namaMengajukan || '( ..................................... )';
  ws1.getCell(`I${r1}`).font = { name: FONT, bold: true, size: 12, underline: true };
  r1 += 1;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = sign.jabatanMenyetujui || '';
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.jabatanMengajukan || '';
  [`B${r1}`, `I${r1}`].forEach((addr) => (ws1.getCell(addr).font = { name: FONT, size: 12 }));

  // =========================================================
  // SHEET 2: Rekap Hal. 2
  // =========================================================
  const ws2 = workbook.addWorksheet('Rekap Hal. 2');
  ws2.mergeCells('A1:P1');
  ws2.getCell('A1').value = 'EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT';
  ws2.getCell('A1').font = { name: FONT, bold: true, size: FONT_SIZE };
  ws2.getCell('A1').alignment = { horizontal: 'center' };

  ws2.mergeCells('A2:P2');
  ws2.getCell('A2').value = title.toUpperCase();
  ws2.getCell('A2').font = { name: FONT, bold: true, size: FONT_SIZE };
  ws2.getCell('A2').alignment = { horizontal: 'center' };

  const h2Simple: [string, string][] = [
    ['A', 'No'], ['B', 'Nama'], ['C', 'Jabatan/Posisi'], ['D', 'Unit Kerja'], ['E', 'Usia'],
    ['F', 'Masa Kerja dari kontrak I (th)'], ['G', 'Periode Akhir Kontrak'],
  ];
  h2Simple.forEach(([col, label]) => {
    ws2.mergeCells(`${col}4:${col}6`);
    styleHeaderCell(ws2.getCell(`${col}4`), blueFill);
    ws2.getCell(`${col}4`).value = label;
  });

  ws2.mergeCells('H4:O4');
  styleHeaderCell(ws2.getCell('H4'), brightGreenFill);
  ws2.getCell('H4').value = 'Penilaian Evaluasi PKWT';

  ws2.mergeCells('H5:H6');
  styleHeaderCell(ws2.getCell('H5'), paleGreenFill);
  ws2.getCell('H5').value = 'Total Nilai';
  ws2.mergeCells('I5:I6');
  styleHeaderCell(ws2.getCell('I5'), paleGreenFill);
  ws2.getCell('I5').value = 'Rata-Rata Nilai';
  ws2.mergeCells('J5:L5');
  styleHeaderCell(ws2.getCell('J5'), paleGreenFill);
  ws2.getCell('J5').value = 'Pengembangan, Potensi & Kinerja';
  ['J', 'K', 'L'].forEach((col, idx) => {
    const cell = ws2.getCell(`${col}6`);
    cell.value = ['Kinerja Karyawan', 'Potensi Karyawan', 'Pengembangan Karyawan'][idx];
    styleHeaderCell(cell, paleGoldFill);
  });

  ws2.mergeCells('M5:M6');
  styleHeaderCell(ws2.getCell('M5'), paleGreenFill);
  ws2.getCell('M5').value = 'Catatan Kasus';
  ws2.mergeCells('N5:N6');
  styleHeaderCell(ws2.getCell('N5'), paleGreenFill);
  ws2.getCell('N5').value = 'Kesan-kesan Umum';
  ws2.mergeCells('O5:O6');
  styleHeaderCell(ws2.getCell('O5'), paleGreenFill);
  ws2.getCell('O5').value = 'Saran & Pengembangan';

  ws2.mergeCells('P4:P6');
  styleHeaderCell(ws2.getCell('P4'), darkBlueFill, true);
  ws2.getCell('P4').value = 'Penilai';

  // Lebar kolom persis dari file asli (kolom Gaji & Kontrak Ke sengaja
  // tidak dimasukkan, sesuai keputusan sebelumnya)
  const widths2: Record<string, number> = { A: 7.4, B: 28.4, C: 64.6, D: 22.4, E: 19.7, F: 24.4, G: 23.4, H: 21.4, I: 17.4, J: 22.6, K: 22.6, L: 23.3, M: 29.3, N: 80.6, O: 58.7, P: 30 };
  Object.entries(widths2).forEach(([col, w]) => (ws2.getColumn(col).width = w));
  ws2.getRow(1).height = 24;
  ws2.getRow(2).height = 24;
  ws2.getRow(4).height = 40;
  ws2.getRow(5).height = 36;
  ws2.getRow(6).height = 58;

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
      H: total,
      I: Number((row.grand_avg ?? 0).toFixed(2)),
      J: row.form_c_data?.kinerja ?? '',
      K: row.form_c_data?.potensi ?? '',
      L: row.form_c_data?.pengembangan ?? '',
      M: orDash(row.form_c_data?.catatanKasus),
      N: orDash(row.form_c_data?.kesanUmum),
      O: orDash(row.form_c_data?.saranPengembangan),
      P: row.assignment?.evaluator?.name ?? '',
    };
    Object.entries(values).forEach(([col, val]) => {
      styleDataCell(ws2.getCell(`${col}${r2}`), ['B', 'C', 'D', 'M', 'N', 'O'].includes(col) ? wrapLeft : wrapCenter);
      ws2.getCell(`${col}${r2}`).value = val;
    });
    if (emp?.tgl_habis_kontrak) {
      const gCell = ws2.getCell(`G${r2}`);
      gCell.value = new Date(emp.tgl_habis_kontrak);
      gCell.numFmt = 'dd mmm yyyy';
      gCell.border = allBorders;
      gCell.font = { name: FONT, size: FONT_SIZE };
      gCell.alignment = wrapCenter;
    }
    ws2.getCell(`H${r2}`).numFmt = '#,##0';
    ws2.getCell(`I${r2}`).numFmt = '#,##0.00';
    ws2.getRow(r2).height = 140;
    r2++;
  });

  [ws1, ws2].forEach((ws) => {
    ws.pageSetup.orientation = 'landscape';
    ws.pageSetup.fitToPage = false;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-stlpp.xlsx"`,
    },
  });
}
