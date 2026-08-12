# 🗄️ Skema Basis Data PostgreSQL / Supabase (STLPP System)

Dokumentasi ini menjelaskan struktur tabel relasional, tipe data, serta batasan (*constraints*) yang digunakan dalam basis data Supabase.

---

## 1. Tabel `users` (Manajemen Pengguna & Auth)
Menyimpan data pengguna yang terintegrasi dengan Supabase Auth.

| Nama Kolom | Tipe Data | Keterangan / Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (references `auth.users.id`) |
| `email` | VARCHAR(255) | Unique, Not Null |
| `name` | VARCHAR(255) | Nama Lengkap |
| `role` | VARCHAR(50) | Enum: `'ADMIN'`, `'ATASAN'` |
| `division` | VARCHAR(100) | Unit kerja / Divisi atasan |
| `created_at` | TIMESTAMP | Default `NOW()` |

---

## 2. Tabel `employees` (Master Data Karyawan)
Menyimpan profil karyawan PKWT beserta riwayat kontraknya.

| Nama Kolom | Tipe Data | Keterangan / Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key, Default `gen_random_uuid()` |
| `nik` | VARCHAR(50) | Unique, Not Null |
| `nama` | VARCHAR(255) | Not Null |
| `tgl_lahir` | DATE | Tanggal lahir |
| `jabatan` | VARCHAR(100) | Posisi / Role |
| `divisi` | VARCHAR(100) | Divisi utama |
| `bagian` | VARCHAR(100) | Sub-divisi / Unit kerja |
| `masa_kerja` | VARCHAR(100) | Teks deskriptif (misal: "1 Tahun 6 Bulan") |
| `status_kontrak` | VARCHAR(50) | Status berjalan (misal: "Kontrak 2") |
| `tgl_habis_kontrak` | DATE | Digunakan untuk kalkulasi H-60 dan H-14 |
| `atasan_id` | UUID | Foreign Key $\rightarrow$ `users.id` (Atasan Direct) |
| `created_at` | TIMESTAMP | Default `NOW()` |

---

## 3. Tabel `form_templates` (Master Template Form Builder)
Menyimpan struktur indikator penilaian beserta kustomisasi versinya.

| Nama Kolom | Tipe Data | Keterangan / Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key, Default `gen_random_uuid()` |
| `version` | VARCHAR(20) | Unique (misal: "v1.0", "v2.0") |
| `title` | VARCHAR(255) | Judul template form |
| `is_active` | BOOLEAN | Default `false` (Hanya 1 template yang aktif) |
| `structure` | JSONB | Menyimpan array Kategori, Indikator, & Bobot |
| `created_at` | TIMESTAMP | Default `NOW()` |

---

## 4. Tabel `assignments` (Transaksi Penugasan)
Menghubungkan karyawan yang akan dievaluasi dengan Atasan yang ditugaskan.

| Nama Kolom | Tipe Data | Keterangan / Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key, Default `gen_random_uuid()` |
| `employee_id` | UUID | Foreign Key $\rightarrow$ `employees.id` |
| `evaluator_id` | UUID | Foreign Key $\rightarrow$ `users.id` |
| `period` | VARCHAR(20) | Periode evaluasi (misal: "2026-08") |
| `deadline` | DATE | Batas waktu pengisian form |
| `status` | VARCHAR(50) | Enum: `'UNASSIGNED'`, `'PENDING'`, `'COMPLETED'` |
| `assigned_at` | TIMESTAMP | Waktu penugasan dikirim oleh Admin |

---

## 5. Tabel `evaluations` (Hasil Evaluasi Penilaian)
Menyimpan hasil pengisian Form A, B, dan C oleh Atasan.

| Nama Kolom | Tipe Data | Keterangan / Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key, Default `gen_random_uuid()` |
| `assignment_id` | UUID | Foreign Key $\rightarrow$ `assignments.id` (Unique) |
| `template_version` | VARCHAR(20) | Mengacu ke `form_templates.version` |
| `scores` | JSONB | Map key-value skor per indikator (misal: `{"a1-1-1": 90}`) |
| `grand_avg` | DECIMAL(5,2) | Nilai rata-rata akumulatif akhir |
| `recommendation` | VARCHAR(50) | Enum: `'DI PERPANJANG'`, `'TIDAK DI PERPANJANG'` |
| `duration` | VARCHAR(20) | Durasi usulan (12 Bln, 6 Bln, atau Custom) |
| `form_c_data` | JSONB | Menyimpan Kinerja, Potensi, & Catatan Kasus |
| `tna_categories` | JSONB | Array kata kunci/kategori kebutuhan pelatihan |
| `submitted_at` | TIMESTAMP | Default `NOW()` |

---

## 6. Relasi Antar Tabel (ERD Summary)

```text
users (1) ───────< (Many) employees (Atasan Direct)
users (1) ───────< (Many) assignments (Evaluator)
employees (1) ───< (Many) assignments
assignments (1) ── (1) evaluations
form_templates (1) ──< (Many) evaluations (by version)
