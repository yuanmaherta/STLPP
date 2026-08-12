# 📋 Spesifikasi Kebutuhan & Aturan Bisnis (System Requirements)

---

## 1. Identitas Karyawan (6 Field Utama)
Saat penugasan dikirimkan ke Atasan, sistem secara otomatis mengambil 6 field identitas utama dari basis data untuk ditampilkan di bagian atas Form Evaluasi:

1. **Nama Karyawan**
2. **NIK** (Nomor Induk Karyawan)
3. **Jabatan**
4. **Divisi / Bagian**
5. **Masa Kerja Akumulatif**
6. **Status Kontrak Berjalan** (misal: *Kontrak Ke-2* beserta durasi & riwayat nilai sebelumnya)

---

## 2. Rumus & Ambang Batas Evaluasi (Scoring Logic)

Penilaian dibagi menjadi 3 bagian utama:

### A. Komposisi Form
* **Form A (Capacity & Learning Agility):**
  * A1. Penilaian Kompetensi Teknis & Inti
  * A2. Penilaian *Learning Agility*
* **Form B (Performance & AKHLAK):**
  * B1. Penilaian Kinerja Unit Kerja
  * B2. Penilaian Nilai-Nilai AKHLAK (18 Indikator)
* **Form C (Kualitatif & TNA):**
  * Checklist Kinerja, Potensi, & Pengembangan (Baik / Sedang / Kurang)
  * Catatan Kasus, Kesan Umum, & Area Kebutuhan Pelatihan (*Training Needs Analysis* / TNA)

### B. Formula Perhitungan Nilai
$$\text{Skor Akhir} = \frac{\text{Total Nilai Form A} + \text{Total Nilai Form B}}{\text{Jumlah Total Indikator Form A \& B}}$$

### C. Kriteria Kelayakan Perpanjangan (Eligibility Criteria)
* **Skor Akhir $\ge$ 85.00:** Diusulkan **Diperpanjang** (Pilihan durasi: 12 Bulan, 6 Bulan, atau *Custom* Bulan).
* **Skor Akhir $<$ 85.00:** Diusulkan **Tidak Diperpanjang**.

---

## 3. Timeline Pengingat Otomatis (Reminder Rules)

1. **Inisiasi Penugasan (H-60 s.d. H-30 Sebelum Kontrak Habis):**
   * Karyawan yang masa kontraknya tersisa $\le$ 60 hari otomatis masuk ke antrean *Expiring Soon* Admin HC untuk di-*assign* ke Atasan Direct.
2. **Critical Reminder Trigger (H-14 Sebelum Kontrak Habis):**
   * Jika penugasan evaluasi masih berstatus `PENDING` atau `UNASSIGNED` pada H-14 sebelum tanggal kontrak berakhir, sistem otomatis:
     * Mengirimkan email pengingat berprioritas tinggi ke Atasan terkait.
     * Mengubah badge status di UI menjadi `🔴 Critical: H-14 Deadline`.
     * Memunculkan notifikasi lonceng *in-app* real-time.

---

## 4. Manajemen Versi Form (Form Versioning)

* Perubahan indikator, bobot, atau pertanyaan pada form oleh Admin HC **tidak boleh menimpa (overwrite)** struktur data lama.
* Setiap perubahan akan menerbitkan versi baru (misal: `v1.0` $\rightarrow$ `v2.0`).
* Evaluasi periode terdahulu tetap mengacu pada versi *template* yang berlaku saat evaluasi tersebut dibuat.

---

## 5. Spesifikasi Laporan & Ekspor Data

1. **Ekspor Rekapitulasi Excel (`.xlsx`):**
   * Menyediakan rekap data lengkap seluruh karyawan yang dipilih (NIK, Nama, Divisi, Kontrak Ke-N, Skor Akhir, Rekomendasi, Catatan TNA, Tanggal Simpan).
2. **Ekspor Dokumentasi PDF (`.pdf`):**
   * **PDF Surat Penugasan:** Dokumen rekap daftar karyawan yang ditugaskan ke Atasan beserta tanggal batas waktu.
   * **PDF Form Evaluasi Individual:** Dokumen fisik resmi hasil evaluasi per karyawan (lengkap dengan kop surat, rincian skor, catatan kualitatif, dan area tanda tangan).
