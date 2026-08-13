import { NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica' },
  title: { fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 2 },
  subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 12, color: '#444' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row' },
  headerRow: { flexDirection: 'row', backgroundColor: '#e2e8f0' },
  cell: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3 },
  headerCell: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontWeight: 700 },
});

const COLS = [
  { key: 'no', label: 'No', width: '3%' },
  { key: 'nik', label: 'NIK', width: '9%' },
  { key: 'nama', label: 'Nama', width: '13%' },
  { key: 'divisi', label: 'Divisi', width: '14%' },
  { key: 'periode', label: 'Periode', width: '8%' },
  { key: 'rata', label: 'Rata-Rata', width: '7%' },
  { key: 'rekomendasi', label: 'Rekomendasi', width: '13%' },
  { key: 'durasi', label: 'Durasi', width: '6%' },
  { key: 'penilai', label: 'Penilai', width: '12%' },
  { key: 'saran', label: 'Saran & Pengembangan', width: '15%' },
];

function ReportDocument({ rows }: { rows: any[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>LAPORAN EVALUASI PKWT</Text>
        <Text style={styles.subtitle}>PT Hutama Karya (Persero) — Dicetak {new Date().toLocaleDateString('id-ID')}</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {COLS.map((c) => (
              <Text key={c.key} style={{ ...styles.headerCell, width: c.width as any }}>
                {c.label}
              </Text>
            ))}
          </View>
          {rows.map((r, i) => {
            const emp = r.assignment?.employee;
            const values: Record<string, string> = {
              no: String(i + 1),
              nik: emp?.nik ?? '',
              nama: emp?.nama ?? '',
              divisi: emp?.divisi ?? '',
              periode: r.assignment?.period ?? '',
              rata: r.grand_avg?.toFixed?.(2) ?? String(r.grand_avg ?? ''),
              rekomendasi: r.recommendation === 'DI PERPANJANG' ? `Diperpanjang${r.duration ? ' ' + r.duration + ' Bln' : ''}` : 'Tidak Diperpanjang',
              durasi: r.duration ?? '-',
              penilai: r.assignment?.evaluator?.name ?? '',
              saran: r.form_c_data?.saranPengembangan ?? '',
            };
            return (
              <View key={i} style={styles.row}>
                {COLS.map((c) => (
                  <Text key={c.key} style={{ ...styles.cell, width: c.width as any }}>
                    {values[c.key]}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
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

  const buffer = await renderToBuffer(<ReportDocument rows={rows} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-stlpp.pdf"`,
    },
  });
}
