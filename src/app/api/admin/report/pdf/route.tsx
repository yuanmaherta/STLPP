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
});

const COLS_1 = [
  { key: 'no', label: 'No', width: '3%' },
  { key: 'nama', label: 'Nama', width: '13%' },
  { key: 'jabatan', label: 'Jabatan/Posisi', width: '16%' },
  { key: 'divisi', label: 'Unit Kerja', width: '13%' },
  { key: 'usia', label: 'Usia', width: '6%' },
  { key: 'masaKerja', label: 'Masa Kerja', width: '9%' },
  { key: 'periodeAkhir', label: 'Periode Akhir Kontrak', width: '10%' },
  { key: 'rekomendasi', label: 'Keberlanjutan Kontrak Kerja', width: '14%' },
  { key: 'keterangan', label: 'Keterangan Rekomendasi', width: '16%' },
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

function ReportDocument({ rows, edits, title }: { rows: any[]; edits: any[]; title: string }) {
  const editMap = new Map(edits.map((e) => [e.id, e]));

  const rows1 = rows.map((r, i) => {
    const emp = r.assignment?.employee;
    const edit = editMap.get(r.id) ?? {};
    return {
      no: String(i + 1),
      nama: emp?.nama ?? '',
      jabatan: emp?.jabatan ?? '',
      divisi: emp?.divisi ?? '',
      usia: ageYearsOnly(emp?.tgl_lahir),
      masaKerja: emp?.masa_kerja ?? '',
      periodeAkhir: emp?.tgl_habis_kontrak ?? '',
      rekomendasi: edit.rekomendasi ?? '',
      keterangan: edit.keteranganRekomendasi ?? '',
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
      total: String(sumScores(r.scores)),
      rata: r.grand_avg?.toFixed?.(2) ?? '',
      kinerja: r.form_c_data?.kinerja ?? '',
      potensi: r.form_c_data?.potensi ?? '',
      pengembangan: r.form_c_data?.pengembangan ?? '',
      kesan: r.form_c_data?.kesanUmum ?? '',
      saran: r.form_c_data?.saranPengembangan ?? '',
      penilai: r.assignment?.evaluator?.name ?? '',
    };
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT</Text>
        <Text style={styles.subtitle}>{title.toUpperCase()}</Text>
        <ReportTable cols={COLS_1} rows={rows1} />

        <Text style={{ ...styles.subtitle, ...styles.sectionGap }}>PENILAIAN EVALUASI PKWT</Text>
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

  const buffer = await renderToBuffer(<ReportDocument rows={rows} edits={edits} title={title} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-stlpp.pdf"`,
    },
  });
}
