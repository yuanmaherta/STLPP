import { NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { ageYearsOnly, sumScores } from '@/lib/utils/report-helpers';

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 7, fontFamily: 'Helvetica' },
  title: { fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 2 },
  subtitle: { fontSize: 10, fontWeight: 700, textAlign: 'center', marginBottom: 10 },
  sectionGap: { marginTop: 16 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row' },
  headerRow: { flexDirection: 'row', backgroundColor: '#dbeafe' },
  cell: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3 },
  headerCell: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontWeight: 700 },
  signRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  signBlock: { width: '40%', textAlign: 'center' },
  signName: { fontWeight: 700, textDecoration: 'underline', marginTop: 30 },
});

const orDash = (v?: string | null) => (v && v.trim() ? v : '-');
const fmtInt = (n: number) => n.toLocaleString('id-ID');
const fmtDec = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLS_1 = [
  { key: 'no', label: 'No', width: '3%' },
  { key: 'nama', label: 'Nama', width: '11%' },
  { key: 'jabatan', label: 'Jabatan/Posisi', width: '15%' },
  { key: 'divisi', label: 'Unit Kerja', width: '11%' },
  { key: 'usia', label: 'Usia', width: '5%' },
  { key: 'masaKerja', label: 'Masa Kerja', width: '8%' },
  { key: 'periodeAkhir', label: 'Periode Akhir Kontrak', width: '9%' },
  { key: 'keberlanjutan', label: 'Keberlanjutan Kontrak Kerja', width: '16%' },
  { key: 'ketReko', label: 'Keterangan Rekomendasi', width: '15%' },
  { key: 'keterangan', label: 'Keterangan', width: '7%' },
];

const COLS_2 = [
  { key: 'no', label: 'No', width: '3%' },
  { key: 'nama', label: 'Nama', width: '11%' },
  { key: 'jabatan', label: 'Jabatan/Posisi', width: '13%' },
  { key: 'divisi', label: 'Unit Kerja', width: '11%' },
  { key: 'usia', label: 'Usia', width: '5%' },
  { key: 'total', label: 'Total Nilai', width: '6%' },
  { key: 'rata', label: 'Rata-Rata', width: '6%' },
  { key: 'kinerja', label: 'Kinerja', width: '6%' },
  { key: 'potensi', label: 'Potensi', width: '6%' },
  { key: 'pengembangan', label: 'Pengembangan', width: '7%' },
  { key: 'kesan', label: 'Kesan-kesan Umum', width: '12%' },
  { key: 'saran', label: 'Saran & Pengembangan', width: '9%' },
  { key: 'penilai', label: 'Penilai', width: '5%' },
];

function ReportTable({ cols, rows }: { cols: typeof COLS_1; rows: Record<string, string>[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {cols.map((c) => (
          <Text key={c.key} style={{ ...styles.headerCell, width: c.width as any }}>
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.row}>
          {cols.map((c) => (
            <Text key={c.key} style={{ ...styles.cell, width: c.width as any }}>
              {r[c.key] ?? ''}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function ReportDocument({ rows, edits, title, sign }: { rows: any[]; edits: any[]; title: string; sign: any }) {
  const editMap = new Map(edits.map((e) => [e.id, e]));

  const rows1 = rows.map((r, i) => {
    const emp = r.assignment?.employee;
    const edit = editMap.get(r.id) ?? {};
    const lulus = r.recommendation === 'DI PERPANJANG' ? 'Lulus Evaluasi' : 'Tidak Lulus Evaluasi';
    return {
      no: String(i + 1),
      nama: emp?.nama ?? '',
      jabatan: emp?.jabatan ?? '',
      divisi: emp?.divisi ?? '',
      usia: ageYearsOnly(emp?.tgl_lahir),
      masaKerja: emp?.masa_kerja ?? '',
      periodeAkhir: emp?.tgl_habis_kontrak ?? '',
      keberlanjutan: `${lulus}\n${edit.rekomendasi ?? ''}\n\n[ ] Disetujui\n[ ] Tidak Disetujui`,
      ketReko: orDash(edit.keteranganRekomendasi),
      keterangan: orDash(edit.keterangan),
    };
  });

  const rows2 = rows.map((r, i) => {
    const emp = r.assignment?.employee;
    return {
      no: String(i + 1),
      nama: emp?.nama ?? '',
      jabatan: emp?.jabatan ?? '',
      divisi: emp?.divisi ?? '',
      usia: ageYearsOnly(emp?.tgl_lahir),
      total: fmtInt(sumScores(r.scores)),
      rata: fmtDec(r.grand_avg ?? 0),
      kinerja: r.form_c_data?.kinerja ?? '',
      potensi: r.form_c_data?.potensi ?? '',
      pengembangan: r.form_c_data?.pengembangan ?? '',
      kesan: orDash(r.form_c_data?.kesanUmum),
      saran: orDash(r.form_c_data?.saranPengembangan),
      penilai: r.assignment?.evaluator?.name ?? '',
    };
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT</Text>
        <Text style={styles.subtitle}>{title.toUpperCase()}</Text>
        <ReportTable cols={COLS_1} rows={rows1} />

        <View style={styles.signRow}>
          <View style={styles.signBlock}>
            <Text>Menyetujui,</Text>
            <Text style={styles.signName}>{sign?.namaMenyetujui || '( ..................................... )'}</Text>
            <Text>{sign?.jabatanMenyetujui || ''}</Text>
          </View>
          <View style={styles.signBlock}>
            <Text>{sign?.tempatTanggal || ''}</Text>
            <Text style={{ marginTop: 4 }}>Mengajukan,</Text>
            <Text style={styles.signName}>{sign?.namaMengajukan || '( ..................................... )'}</Text>
            <Text>{sign?.jabatanMengajukan || ''}</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT</Text>
        <Text style={styles.subtitle}>{title.toUpperCase()} — PENILAIAN EVALUASI PKWT</Text>
        <ReportTable cols={COLS_2} rows={rows2} />
      </Page>
    </Document>
  );
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
  const sign = body.sign ?? {};

  const buffer = await renderToBuffer(<ReportDocument rows={rows} edits={edits} title={title} sign={sign} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-stlpp.pdf"`,
    },
  });
}
