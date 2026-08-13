import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';

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

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Laporan STLPP');

  sheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'NIK', key: 'nik', width: 14 },
    { header: 'Nama', key: 'nama', width: 24 },
    { header: 'Jabatan', key: 'jabatan', width: 22 },
    { header: 'Divisi', key: 'divisi', width: 22 },
    { header: 'Periode', key: 'periode', width: 14 },
    { header: 'Rata-Rata Nilai', key: 'rata', width: 14 },
    { header: 'Kinerja Karyawan', key: 'kinerja', width: 14 },
    { header: 'Potensi Karyawan', key: 'potensi', width: 14 },
    { header: 'Pengembangan Karyawan', key: 'pengembangan', width: 16 },
    { header: 'Catatan Kasus', key: 'catatanKasus', width: 20 },
    { header: 'Kesan-kesan Umum', key: 'kesanUmum', width: 30 },
    { header: 'Saran & Pengembangan', key: 'saran', width: 30 },
    { header: 'Rekomendasi', key: 'rekomendasi', width: 16 },
    { header: 'Durasi', key: 'durasi', width: 10 },
    { header: 'Penilai', key: 'penilai', width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };

  rows.forEach((r, i) => {
    const emp = r.assignment?.employee;
    sheet.addRow({
      no: i + 1,
      nik: emp?.nik ?? '',
      nama: emp?.nama ?? '',
      jabatan: emp?.jabatan ?? '',
      divisi: emp?.divisi ?? '',
      periode: r.assignment?.period ?? '',
      rata: r.grand_avg ?? '',
      kinerja: r.form_c_data?.kinerja ?? '',
      potensi: r.form_c_data?.potensi ?? '',
      pengembangan: r.form_c_data?.pengembangan ?? '',
      catatanKasus: r.form_c_data?.catatanKasus ?? '',
      kesanUmum: r.form_c_data?.kesanUmum ?? '',
      saran: r.form_c_data?.saranPengembangan ?? '',
      rekomendasi: r.recommendation ?? '',
      durasi: r.duration ?? '',
      penilai: r.assignment?.evaluator?.name ?? '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-stlpp.xlsx"`,
    },
  });
}
