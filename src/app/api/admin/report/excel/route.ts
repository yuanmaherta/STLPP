import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { ageYearsOnly, sumScores } from '@/lib/utils/report-helpers';

const FONT = 'Arial';
const grayFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
const lightGreenFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
const blueFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
const greenFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
const amberFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };
const navyFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
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

const fmtInt = (n: number) => n.toLocaleString('id-ID');
const fmtDec = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  // SHEET 1: Rekap Hal. 1 - status kontrak & approval (abu-abu + hijau muda)
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
    styleHeaderCell(ws1.getCell(`${col}4`), grayFill);
    ws1.getCell(`${col}4`).value = label;
  });

  ws1.mergeCells('H4:M4');
  styleHeaderCell(ws1.getCell('H4'), grayFill);
  ws1.getCell('H4').value = 'Keberlanjutan Kontrak Kerja';

  const groupLabels: [string, string, string][] = [
    ['H5', 'I5', 'Tidak dilakukan perpanjangan\nkontrak'],
    ['J5', 'K5', 'Dilakukan perpanjangan kontrak\nselama 6 Bulan'],
    ['L5', 'M5', 'Dilakukan perpanjangan kontrak\nselama 1 Tahun'],
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

  const widths1: Record<string, number> = { A: 5, B: 20, C: 26, D: 20, E: 9, F: 12, G: 13, H: 9, I: 9, J: 9, K: 9, L: 9, M: 9, N: 32, O: 14 };
  Object.entries(widths1).forEach(([col, w]) => (ws1.getColumn(col).width = w));
  ws1.getRow(4).height = 20;
  ws1.getRow(5).height = 30;
  ws1.getRow(6).height = 16;

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
      const cell = ws1.getCell(`${col}${r1}`);
      cell.value = val;
      cell.font = { name: FONT, size: 9 };
      cell.alignment = ['B', 'C', 'D', 'N'].includes(col) ? wrapLeft : wrapCenter;
      cell.fill = lightGreenFill;
      cell.border = allBorders;
    });

    // Isi status + checkbox di pasangan kolom EVP HC/DHCL yang sesuai; sisanya kosong (tetap hijau muda)
    ['H', 'I', 'J', 'K', 'L', 'M'].forEach((col) => {
      const cell = ws1.getCell(`${col}${r1}`);
      cell.fill = lightGreenFill;
      cell.border = allBorders;
      cell.font = { name: FONT, size: 9 };
      cell.alignment = wrapCenter;
    });

    const lulus = row.recommendation === 'DI PERPANJANG' ? 'Lulus Evaluasi' : 'Tidak Lulus Evaluasi';
    const statusText = `${lulus}\n\n${edit.rekomendasi ?? ''}`;
    const checkboxText = '\u2610 Disetujui\n\u2610 Tidak Disetujui';

    const [evpCol, dhclCol] =
      row.recommendation !== 'DI PERPANJANG' ? ['H', 'I'] : row.duration === '6' ? ['J', 'K'] : ['L', 'M'];

    ws1.getCell(`${evpCol}${r1}`).value = statusText;
    ws1.getCell(`${evpCol}${r1}`).font = { name: FONT, bold: true, size: 9 };
    ws1.getCell(`${dhclCol}${r1}`).value = checkboxText;

    ws1.getRow(r1).height = 90;
    r1++;
  });

  // Blok tanda tangan Menyetujui / Mengajukan
  r1 += 2;
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.tempatTanggal || '';
  ws1.getCell(`I${r1}`).font = { name: FONT, size: 10 };
  r1 += 2;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = 'Menyetujui,';
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = 'Mengajukan,';
  [`B${r1}`, `I${r1}`].forEach((addr) => (ws1.getCell(addr).font = { name: FONT, size: 10 }));
  r1 += 4;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = sign.namaMenyetujui || '( ..................................... )';
  ws1.getCell(`B${r1}`).font = { name: FONT, bold: true, size: 10, underline: true };
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.namaMengajukan || '( ..................................... )';
  ws1.getCell(`I${r1}`).font = { name: FONT, bold: true, size: 10, underline: true };
  r1 += 1;
  ws1.mergeCells(`B${r1}:D${r1}`);
  ws1.getCell(`B${r1}`).value = sign.jabatanMenyetujui || '';
  ws1.mergeCells(`I${r1}:O${r1}`);
  ws1.getCell(`I${r1}`).value = sign.jabatanMengajukan || '';
  [`B${r1}`, `I${r1}`].forEach((addr) => (ws1.getCell(addr).font = { name: FONT, size: 10 }));

  // =========================================================
  // SHEET 2: Rekap Hal. 2 - hasil penilaian (biru/hijau/navy)
  // =========================================================
  const ws2 = workbook.addWorksheet('Rekap Hal. 2');
  ws2.mergeCells('A1:P1');
  ws2.getCell('A1').value = 'EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT';
  ws2.getCell('A1').font = { name: FONT, bold: true, size: 14 };
  ws2.getCell('A1').alignment = { horizontal: 'center' };

  ws2.mergeCells('A2:P2');
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
    styleHeaderCell(cell, amberFill);
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
      H: fmtInt(total),
      I: fmtDec(row.grand_avg ?? 0),
      J: row.form_c_data?.kinerja ?? '',
      K: row.form_c_data?.potensi ?? '',
      L: row.form_c_data?.pengembangan ?? '',
      M: orDash(row.form_c_data?.catatanKasus),
      N: orDash(row.form_c_data?.kesanUmum),
      O: orDash(row.form_c_data?.saranPengembangan),
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
