'use client';

import React from 'react';
import { Users, FileText, CheckCircle2, AlertCircle, BarChart3, Search } from 'lucide-react';

export default function DashboardPreview() {
  const mockEmployees = [
    { nik: 'HK-2024-001', nama: 'Budi Santoso', jabatan: 'Officer Human Capital', divisi: 'Human Capital Management', status: 'Kontrak 1', masaKerja: '12 Bulan', skor: 88.5, rekomendasi: 'DI PERPANJANG' },
    { nik: 'HK-2024-002', nama: 'Siti Rahma', jabatan: 'Junior Engineer', divisi: 'Divisi Operasi Gedung', status: 'Kontrak 2', masaKerja: '24 Bulan', skor: 91.2, rekomendasi: 'DI PERPANJANG' },
    { nik: 'HK-2024-003', nama: 'Ahmad Fauzi', jabatan: 'Staff Keuangan', divisi: 'Divisi Keuangan & Akuntansi', status: 'Kontrak 1', masaKerja: '12 Bulan', skor: 78.0, rekomendasi: 'TIDAK DI PERPANJANG' },
    { nik: 'HK-2024-004', nama: 'Dewi Lestari', jabatan: 'Legal Analyst', divisi: 'Divisi Hukum', status: 'Kontrak 1', masaKerja: '6 Bulan', skor: 86.4, rekomendasi: 'DI PERPANJANG' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header Bar */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            STLPP — Digital Contract Renewal Evaluation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            PT Hutama Karya (Persero) — Portal Evaluasi Perpanjangan Kontrak PKWT
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Ready (Local Preview)
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Karyawan PKWT</p>
            <p className="text-2xl font-bold text-slate-800">248</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Evaluasi Pending</p>
            <p className="text-2xl font-bold text-slate-800">12</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rekomendasi Lanjut</p>
            <p className="text-2xl font-bold text-slate-800">218</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tidak Diperpanjang</p>
            <p className="text-2xl font-bold text-slate-800">18</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Daftar Evaluasi Karyawan PKWT</h2>
            <p className="text-xs text-slate-500">Monitoring rekapitulasi nilai Form A + B dan kelayakan perpanjangan (Skor &ge; 85)</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIK / Nama..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">NIK</th>
                <th className="p-4">Nama Karyawan</th>
                <th className="p-4">Divisi / Jabatan</th>
                <th className="p-4">Status Kontrak</th>
                <th className="p-4 text-center">Skor Akhir</th>
                <th className="p-4 text-center">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockEmployees.map((emp) => (
                <tr key={emp.nik} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-slate-700">{emp.nik}</td>
                  <td className="p-4 font-semibold text-slate-800">{emp.nama}</td>
                  <td className="p-4">
                    <p className="text-slate-800">{emp.jabatan}</p>
                    <p className="text-xs text-slate-400">{emp.divisi}</p>
                  </td>
                  <td className="p-4 text-slate-600">{emp.status} ({emp.masaKerja})</td>
                  <td className="p-4 text-center font-bold text-slate-800">{emp.skor}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        emp.rekomendasi === 'DI PERPANJANG'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {emp.rekomendasi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
