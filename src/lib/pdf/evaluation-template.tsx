// ====================================================================
// STLPP - EVALUATION PDF REPORT TEMPLATE
// PDF Document Generator using @react-pdf/renderer
// ====================================================================

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Employee, EvaluationResult, UserProfile } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  companyTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoTable: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: 120,
    fontFamily: 'Helvetica-Bold',
  },
  infoColon: {
    width: 10,
  },
  infoValue: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 5,
  },
  summaryBox: {
    border: '1pt solid #000',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  summaryTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  essayBox: {
    border: '1pt solid #000',
    padding: 6,
    marginBottom: 8,
    minHeight: 40,
  },
  essayTitle: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 3,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureSpace: {
    height: 45,
  },
  signatureLine: {
    borderTop: '1pt solid #000',
    paddingTop: 3,
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
  },
});

interface EvaluationPDFProps {
  employee: Employee;
  evaluator: UserProfile;
  evaluation: EvaluationResult;
  tempatTanggal?: string;
}

export const EvaluationPDFDocument: React.FC<EvaluationPDFProps> = ({
  employee,
  evaluator,
  evaluation,
  tempatTanggal = 'Jakarta, 8 Agustus 2026',
}) => {
  const { form_c_data, grand_avg, recommendation, duration } = evaluation;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Title */}
        <Text style={styles.headerTitle}>FORM EVALUASI PENILAIAN KARYAWAN PKWT</Text>
        <Text style={styles.companyTitle}>PT HUTAMA KARYA (PERSERO)</Text>

        {/* Employee Info Header Table */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Karyawan</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{employee.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIK</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{employee.nik}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jabatan / Divisi</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>
              {employee.jabatan} - {employee.divisi}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Masa Kerja / Status</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>
              {employee.masa_kerja || '-'} ({employee.status_kontrak})
            </Text>
          </View>
        </View>

        {/* Conclusion Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>
            KESIMPULAN PERPANJANGAN KONTRAK (Berdasarkan Nilai Akhir)
          </Text>
          <View style={styles.summaryRow}>
            <Text>Rata-Rata Nilai Akhir Keseluruhan (Form A + B):</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{grand_avg.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Rekomendasi Status Kontrak:</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              {recommendation} {duration ? `(${duration} Bulan)` : ''}
            </Text>
          </View>
        </View>

        {/* Form C Essay Responses */}
        <Text style={styles.sectionHeader}>FORM C - EVALUASI KUALITATIF & SARAN PENGEMBANGAN</Text>

        <View style={styles.essayBox}>
          <Text style={styles.essayTitle}>C.2. Catatan Kasus (Jika ada)</Text>
          <Text>{form_c_data.catatanKasus || '-'}</Text>
        </View>

        <View style={styles.essayBox}>
          <Text style={styles.essayTitle}>C.3. Kesan-kesan Umum</Text>
          <Text>{form_c_data.kesanUmum || '-'}</Text>
        </View>

        <View style={styles.essayBox}>
          <Text style={styles.essayTitle}>C.4. Saran dan Pengembangan (Training Needs Analysis)</Text>
          <Text>{form_c_data.saranPengembangan || '-'}</Text>
        </View>

        {/* Signatures */}
        <View style={{ marginTop: 15 }}>
          <Text>{tempatTanggal}</Text>
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text>{employee.divisi}</Text>
              <View style={styles.signatureSpace} />
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>{evaluator.name}</Text>
                <Text>Penilai / Atasan Direct</Text>
              </View>
            </View>

            <View style={styles.signatureBox}>
              <Text>Human Capital Management</Text>
              <View style={styles.signatureSpace} />
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>( ..................................... )</Text>
                <Text>Atasan / Vice President HC</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
