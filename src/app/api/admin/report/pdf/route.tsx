import { NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { ageYearsOnly, sumScores } from '@/lib/utils/report-helpers';

const styles = StyleSheet.create({
  page: { padding: 18, fontSize: 6.5, fontFamily: 'Times-Roman' },
  title: { fontSize: 13, fontFamily: 'Times-Bold', textAlign: 'center', marginBottom: 2 },
  subtitle: { fontSize: 11, fontFamily: 'Times-Bold', textAlign: 'center', marginBottom: 10 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row' },
  // Sel data TANPA warna latar (putih polos) — sesuai file Excel asli
  cell: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Roman' },
  // Warna header persis sama dengan Excel (dibaca dari theme file asli)
  headerCellGray: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#BFBFBF' },
  headerCellBlue: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#B4C7E7' },
  headerCellBrightGreen: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#92D050' },
  headerCellPaleGreen: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#E2EFDA' },
  headerCellPaleGold: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#FFF2CC' },
  headerCellNavy: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold', backgroundColor: '#335593', color: '#FFFFFF' },
  dataCellBold: { borderStyle: 'solid', borderWidth: 0.5, borderColor: '#000', padding: 3, fontFamily: 'Times-Bold' },
  signRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  signBlock: { width: '40%', textAlign: 'center' },
  signName: { fontFamily: 'Times-Bold', textDecoration: 'underline', marginTop: 30 },
});

const orDash = (v?: string | null) => (v && v.trim() ? v : '-');
const fmtInt = (n: number) => n.toLocaleString('id-ID');
const fmtDec = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Table1({ rows, edits }: { rows: any[]; edits: any[] }) {
  const editMap = new Map(edits.map((e) => [e.id, e]));
  // Lebar total harus pas 100%. EVP HC lebih lebar dari DHCL karena isinya
  // teks status ("Lulus Evaluasi..."), sedangkan DHCL cuma checkbox singkat.
  const simpleCols = [
    { key: 'no', label: 'No', width: '2%' },
    { key: 'nama', label: 'Nama', width: '8%' },
    { key: 'jabatan', label: 'Jabatan/Posisi', width: '11%' },
    { key: 'divisi', label: 'Unit Kerja', width: '8%' },
    { key: 'usia', label: 'Usia', width: '3.5%' },
    { key: 'masaKerja', label: 'Masa Kerja dari kontrak I (th)', width: '6%' },
    { key: 'periodeAkhir', label: 'Periode Akhir Kontrak', width: '6%' },
  ];
  const evpWidth = '7%';
  const dhclWidth = '4%';
  const ketRekoWidth = '16%';
  const keteranganWidth = '6.5%';

  return (
    <View style={styles.table}>
      {/* Header row 1 */}
      <View style={styles.row}>
        {simpleCols.map((c) => (
          <Text key={c.key} style={{ ...styles.headerCellGray, width: c.width as any }} />
        ))}
        <Text style={{ ...styles.headerCellGray, width: '33%' as any }}>Keberlanjutan Kontrak Kerja</Text>
        <Text style={{ ...styles.headerCellGray, width: ketRekoWidth as any }} />
        <Text style={{ ...styles.headerCellGray, width: keteranganWidth as any }} />
      </View>
      {/* Header row 2 */}
      <View style={styles.row}>
        {simpleCols.map((c) => (
          <Text key={c.key} style={{ ...styles.headerCellGray, width: c.width as any }}>
            {c.label}
          </Text>
        ))}
        <Text style={{ ...styles.headerCellGray, width: '11%' as any }}>Tidak dilakukan perpanjangan kontrak</Text>
        <Text style={{ ...styles.headerCellGray, width: '11%' as any }}>Dilakukan perpanjangan kontrak selama 6 Bulan</Text>
        <Text style={{ ...styles.headerCellGray, width: '11%' as any }}>Dilakukan perpanjangan kontrak selama 1 Tahun</Text>
        <Text style={{ ...styles.headerCellGray, width: ketRekoWidth as any }}>Keterangan Rekomendasi</Text>
        <Text style={{ ...styles.headerCellGray, width: keteranganWidth as any }}>Keterangan</Text>
      </View>
      {/* Header row 3 - EVP HC / DHCL */}
      <View style={styles.row}>
        {simpleCols.map((c) => (
          <Text key={c.key} style={{ ...styles.headerCellGray, width: c.width as any }} />
        ))}
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <Text style={{ ...styles.headerCellGray, width: evpWidth as any }}>EVP HC</Text>
            <Text style={{ ...styles.headerCellGray, width: dhclWidth as any }}>DHCL</Text>
          </React.Fragment>
        ))}
        <Text style={{ ...styles.headerCellGray, width: ketRekoWidth as any }} />
        <Text style={{ ...styles.headerCellGray, width: keteranganWidth as any }} />
      </View>

      {rows.map((r, i) => {
        const emp = r.assignment?.employee;
        const edit = editMap.get(r.id) ?? {};
        const lulus = r.recommendation === 'DI PERPANJANG' ? 'Lulus Evaluasi' : 'Tidak Lulus Evaluasi';
        const statusText = `${lulus}\n\n${edit.rekomendasi ?? ''}`;
        const checkboxText = '[ ] Disetujui\n[ ] Tidak Disetujui';
        const groupIdx = r.recommendation !== 'DI PERPANJANG' ? 0 : r.duration === '6' ? 1 : 2;

        return (
          <View key={i} style={styles.row}>
            <Text style={{ ...styles.cell, width: simpleCols[0].width as any }}>{i + 1}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[1].width as any }}>{emp?.nama ?? ''}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[2].width as any }}>{emp?.jabatan ?? ''}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[3].width as any }}>{emp?.divisi ?? ''}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[4].width as any }}>{ageYearsOnly(emp?.tgl_lahir)}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[5].width as any }}>{emp?.masa_kerja ?? ''}</Text>
            <Text style={{ ...styles.cell, width: simpleCols[6].width as any }}>{emp?.tgl_habis_kontrak ?? ''}</Text>
            {[0, 1, 2].map((g) => (
              <React.Fragment key={g}>
                <Text style={{ ...styles.cell, width: evpWidth as any, fontFamily: g === groupIdx ? 'Times-Bold' : 'Times-Roman' }}>
                  {g === groupIdx ? statusText : ''}
                </Text>
                <Text style={{ ...styles.cell, width: dhclWidth as any }}>{g === groupIdx ? checkboxText : ''}</Text>
              </React.Fragment>
            ))}
            <Text style={{ ...styles.cell, width: ketRekoWidth as any }}>{orDash(edit.keteranganRekomendasi)}</Text>
            <Text style={{ ...styles.cell, width: keteranganWidth as any }}>{orDash(edit.keterangan)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const COLS_2 = [
  { key: 'no', label: 'No', width: '2%', style: 'blue' },
  { key: 'nama', label: 'Nama', width: '8%', style: 'blue' },
  { key: 'jabatan', label: 'Jabatan/Posisi', width: '10%', style: 'blue' },
  { key: 'divisi', label: 'Unit Kerja', width: '8%', style: 'blue' },
  { key: 'usia', label: 'Usia', width: '3.5%', style: 'blue' },
  { key: 'masaKerja', label: 'Masa Kerja dari kontrak I (th)', width: '6%', style: 'blue' },
  { key: 'periodeAkhir', label: 'Periode Akhir Kontrak', width: '5.5%', style: 'blue' },
  { key: 'total', label: 'Total Nilai', width: '4.5%', style: 'green' },
  { key: 'rata', label: 'Rata-Rata Nilai', width: '4.5%', style: 'green' },
  { key: 'kinerja', label: 'Kinerja Karyawan', width: '5%', style: 'amber' },
  { key: 'potensi', label: 'Potensi Karyawan', width: '5%', style: 'amber' },
  { key: 'pengembangan', label: 'Pengembangan Karyawan', width: '6%', style: 'amber' },
  { key: 'catatan', label: 'Catatan Kasus', width: '5%', style: 'green' },
  { key: 'kesan', label: 'Kesan-kesan Umum', width: '12%', style: 'green' },
  { key: 'saran', label: 'Saran & Pengembangan', width: '10%', style: 'green' },
  { key: 'penilai', label: 'Penilai', width: '5%', style: 'navy' },
];

function headerStyleFor(kind: string) {
  if (kind === 'green') return styles.headerCellPaleGreen;
  if (kind === 'amber') return styles.headerCellPaleGold;
  if (kind === 'navy') return styles.headerCellNavy;
  return styles.headerCellBlue;
}

function Table2({ rows }: { rows: any[] }) {
  const identityWidth = COLS_2.slice(0, 7).reduce((sum, c) => sum + parseFloat(c.width), 0);
  const restWidth = 100 - identityWidth;

  return (
    <View style={styles.table}>
      {/* Baris judul grup "Penilaian Evaluasi PKWT" (hijau terang), sejajar dengan Excel */}
      <View style={styles.row}>
        <Text style={{ ...styles.headerCellBlue, width: `${identityWidth}%` as any, backgroundColor: 'transparent', borderColor: 'transparent' }} />
        <Text style={{ ...styles.headerCellBrightGreen, width: `${restWidth}%` as any }}>Penilaian Evaluasi PKWT</Text>
      </View>
      <View style={styles.row}>
        {COLS_2.map((c) => (
          <Text key={c.key} style={{ ...headerStyleFor(c.style), width: c.width as any }}>
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => {
        const emp = r.assignment?.employee;
        const values: Record<string, string> = {
          no: String(i + 1),
          nama: emp?.nama ?? '',
          jabatan: emp?.jabatan ?? '',
          divisi: emp?.divisi ?? '',
          usia: ageYearsOnly(emp?.tgl_lahir),
          masaKerja: emp?.masa_kerja ?? '',
          periodeAkhir: emp?.tgl_habis_kontrak ?? '',
          total: fmtInt(sumScores(r.scores)),
          rata: fmtDec(r.grand_avg ?? 0),
          kinerja: r.form_c_data?.kinerja ?? '',
          potensi: r.form_c_data?.potensi ?? '',
          pengembangan: r.form_c_data?.pengembangan ?? '',
          catatan: orDash(r.form_c_data?.catatanKasus),
          kesan: orDash(r.form_c_data?.kesanUmum),
          saran: orDash(r.form_c_data?.saranPengembangan),
          penilai: r.assignment?.evaluator?.name ?? '',
        };
        return (
          <View key={i} style={styles.row}>
            {COLS_2.map((c) => (
              <Text key={c.key} style={{ ...styles.cell, width: c.width as any }}>
                {values[c.key]}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function ReportDocument({ rows, edits, title, sign }: { rows: any[]; edits: any[]; title: string; sign: any }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>EVALUASI USULAN PERPANJANGAN KONTRAK KERJA KARYAWAN PKWT</Text>
        <Text style={styles.subtitle}>{title.toUpperCase()}</Text>
        <Table1 rows={rows} edits={edits} />

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
        <Table2 rows={rows} />
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
