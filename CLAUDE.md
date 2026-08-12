# STLPP – Digital Contract Renewal Evaluation System

## Overview
Aplikasi enterprise berbasis Next.js (App Router) & Supabase untuk mendigitalisasi proses evaluasi dan perpanjangan kontrak kerja karyawan (PKWT) PT Hutama Karya.

## Tech Stack & Libraries
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn UI (Atlassian / Jira Aesthetic - Slate Neutral theme)
- **Backend / Database:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Icons:** Lucide React
- **Export Engines:** `exceljs` (Excel) & `@react-pdf/renderer` (PDF)

## System Roles & Permissions
1. **Admin (HC/HR):** Akses ke Dashboard Analitik, Master Data Karyawan, Assignment, Form Builder, Reports/Export, dan Settings User.
2. **Atasan (Evaluator):** Akses ke Inbox Tugas Penilaian, Form Evaluasi (Form A, B, C), dan History/Cetak PDF.

## Coding & UI Standards
- Gunakan TypeScript secara ketat (*strict mode*).
- Komponen UI dipisah rapi di `/components` dan halaman di `/app`.
- Bahasa pengantar antarmuka (UI) menggunakan Bahasa Indonesia formal.
- Gunakan penanggalan & kalkulasi otomatis untuk status kelayakan perpanjangan (Skor >= 85).
- Terapkan pemicu *Critical Reminder* pada H-14 sebelum tanggal kontrak berakhir.
