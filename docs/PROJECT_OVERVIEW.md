# 🏢 STLPP – Digital Contract Renewal Evaluation System
> **Aplikasi Berbasis Web untuk Digitalisasi Evaluasi & Perpanjangan Kontrak Karyawan (PKWT)**

---

## 📌 1. Latar Belakang & Konteks Proyek

Proses evaluasi perpanjangan Perjanjian Kerja Waktu Tertentu (**PKWT**) merupakan salah satu alur kerja paling kritis dalam *Human Capital Management* (HCM). Sebelum hadirnya sistem **STLPP**, proses evaluasi kinerja karyawan kontrak masih mengandalkan dokumen fisik (kertas) serta lembar kerja terpisah (*Excel*).

Pendekatan manual tersebut menimbulkan beberapa kendala operasional yang signifikan:

* ⚠️ **Risiko *Human Error* & Terlewat *Deadline*:** Keterlambatan evaluasi mendekati batas akhir kontrak (H-60 / H-30) berisiko mengganggu kepatuhan regulasi ketenagakerjaan.
* 🔒 **Tidak Adanya *Audit Trail* & Masalah Keamanan Data:** Berkas fisik atau *spreadsheet* rentan rusak/terhapus, sulit dilacak jejak perubahannya, dan tidak memiliki batasan hak akses yang tegas antara Admin HC dan Atasan.
* 📊 **Kesulitan Analisis Data Mikro & Makro:** Manajemen HC kesulitan melihat tren kinerja kolektif, memetakan kebutuhan pelatihan (*Training Needs Analysis* / TNA), serta merekapitulasi usulan pengangkatan Karyawan Tetap (PKWTT).

> **Solusi:** **STLPP** *(System Digital Contract Renewal Evaluation)* hadir sebagai solusi transformasi digital berstandar *enterprise* untuk mengotomatisasi, mengamankan, dan mempercepat seluruh siklus evaluasi kontrak secara terstruktur.

---

## 🎯 2. Masalah Utama yang Diselesaikan *(Problem Statement)*

1. **Infrastruktur Data Terpisah (*Silo Data*):** Penyimpanan hasil penilaian terdahulu tidak terintegrasi secara terpusat, sehingga histori nilai evaluasi dari Kontrak Ke-1 hingga Ke-5 sulit diakses kembali.
2. **Proses *Assignment* & *Monitoring* Manual:** Admin HC harus mengingatkan para Atasan/Evaluator secara satu per satu melalui aplikasi pesan instan untuk menyelesaikan penilaian.
3. **Keterbatasan Fleksibilitas Indikator Penilaian:** Perubahan item atau kriteria kompetensi di masa mendatang berisiko merusak format dokumen lama jika tidak didukung mekanisme *Form Versioning*.

---

## 🚀 3. Tujuan Strategis Proyek *(Project Objectives)*

* ⚙️ **Mendigitalisasi & Mengotomatisasi Alur Kerja (*Workflow Automation*):** Mengubah pengisian form berbasis kertas/Excel menjadi aplikasi web interaktif yang terhubung langsung ke basis data terpusat (PostgreSQL/Supabase).
* 🔐 **Transparansi & Akuntabilitas (*Role-Based Access Control*):** Memisahkan hak akses secara tegas antara **Admin HC** (pengelola master data, penugasan, *form builder*, analitik) dan **Atasan/Evaluator** (pengisi form evaluasi & cetak riwayat).
* 📈 **Keakuratan Pengambilan Keputusan (*Data-Driven Insights*):** Menyediakan *Dashboard Analitik* visual untuk memantau Distribusi Kontrak (1–5), Pola Kata Kunci Saran Pengembangan (TNA), serta Kalkulasi Otomatis Kelayakan Perpanjangan/Pengangkatan Karyawan Tetap.
* 📄 **Laporan Multi-Format (*Multi-Format Reporting*):** Mengintegrasikan mesin *export* dokumen otomatis untuk mencetak rekap data ke dalam format Excel (`.xlsx`) dan dokumen fisik resmi PDF.

---

## 🛠️ 4. Lingkup Fitur Utama *(Scope of Features)*

```text
                                  ┌────────────────────────────────────────┐
                                  │   STLPP DIGITAL CONTRACT SYSTEM        │
                                  └───────────────────┬────────────────────┘
                                                      │
                  ┌───────────────────────────────────┴───────────────────────────────────┐
                  │                                                                       │
                  ▼                                                                       ▼
     [ ADMIN HC MODULES ]                                                    [ EVALUATOR / ATASAN MODULES ]
  • Executive Dashboard Analytics                                          • Personal Task Inbox (Pending Assignments)
  • Master Data Karyawan (Kontrak 1-5)                                     • Interactive Evaluation Form (Form A, B, C)
  • Task Assignment System (Auto-Mail & PDF)                               • Auto-Scoring Engine & Eligibility Status
  • Dynamic Form Builder (Versioning v1.0, v2.0)                           • Evaluation History & Re-print PDF
  • Multi-Filter Reports & Excel/PDF Export
  • User Management & Parameter Config (H-60 / H-14)

----


## 5. Ringkasan Tech Stack & Arsitektur

Arsitektur aplikasi **STLPP** dibangun menggunakan fondasi *modern web stack* yang tangguh, aman, dan dapat diandalkan untuk skala *enterprise*:

* 🚀 **Frontend Framework — Next.js (App Router, TypeScript):** Framework utama untuk pembuatan antarmuka responsif, *Server-Side Rendering* (SSR), serta sistem navigasi halaman yang aman berbasis *type safety*.
* 🎨 **Styling & UI Theme — Tailwind CSS + Shadcn UI:** Perancangan tata letak antarmuka yang bersih (*clean layout*) dengan estetika ala **Atlassian / Jira** (*Slate Blue Theme*).
* 🗄️ **Backend & Database — Supabase (PostgreSQL, RLS, Auth):** Basis data relasional terpusat, otentikasi peran pengguna (*Admin vs Atasan*), serta pengamanan data berbasis *Row Level Security* (RLS).
* 📄 **Report Engines — `exceljs` & `@react-pdf/renderer`:** Mesin pemroses data untuk menghasilkan rekapitulasi data ke format Excel (`.xlsx`) dan pembuatan dokumen cetak fisik resmi PDF.
* 🔔 **Notification System — Resend API & Supabase Realtime:** Layanan pengiriman email pengingat otomatis (H-14 *Critical Reminder*) serta lonceng notifikasi *in-app* secara *real-time*.

---

### 🧱 Diagram Arsitektur Sistem (High-Level Architecture)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT / BROWSER                              │
│         [ Admin Portal ]                   [ Evaluator Portal ]        │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │                                  │
                    ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER (Vercel)                     │
│  • App Layouts & UI Components (Tailwind / Shadcn)                     │
│  • Middleware Security (Role Guard: Admin / Atasan)                    │
│  • API Routes (Excel & PDF Generation Engine)                          │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │                                  │
                    ▼                                  ▼
┌──────────────────────────────────────┐    ┌────────────────────────────┐
│          SUPABASE BACKEND            │    │      EXTERNAL SERVICES     │
│  • PostgreSQL Database (Relational)  │    │  • Resend Email API        │
│  • Supabase Auth & RLS Policies      │    │    (Auto-mail & PDF Attach)│
│  • Realtime Notification Engine      │    └────────────────────────────┘
└──────────────────────────────────────┘
