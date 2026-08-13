'use client';

import { useMemo, useState } from 'react';
import { Search, Download, FileSpreadsheet, FileText, Loader2, AlertCircle } from 'lucide-react';

interface EvalRow {
  id: string;
  grand_avg: number;
  recommendation: string;
  duration: string | null;
  form_c_data: any;
  submitted_at: string;
  assignment: {
    id: string;
    period: string;
    employee: {
      id: string;
      nik: string;
      nama: string;
      jabatan: string;
      divisi: string;
      bagian: string | null;
      masa_kerja: string | null;
    } | null;
    evaluator: { name: string } | null;
  } | null;
}

interface LaporanClientProps {
  initialRows: EvalRow[];
  loadError: string | null;
}

export function LaporanClient({ initialRows, loadError }: LaporanClientProps) {
  const [search, setSearch] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState('');

  const divisions = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => r.assignment?.employee?.divisi && set.add(r.assignment.employee.divisi));
    return Array.from(set).sort();
  }, [initialRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialRows.filter((r) => {
      const emp = r.assignment?.employee;
      if (divisiFilter && emp?.divisi !== divisiFilter) return false;
      if (!q) return true;
      return emp?.nama.toLowerCase().includes(q) || emp?.nik.toLowerCase().includes(q);
    });
  }, [initialRows, search, divisiFilter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((r) => next.delete(r.id));
      } else {
        filtered.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRows = initialRows.filter((r) => selected.has(r.id));

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (selectedRows.length === 0) {
      setExportError('Pilih minimal 1 karyawan dulu (centang di kolom kiri tabel).');
      return;
    }
    setExporting(type);
    setExportError('');
    try {
      const res = await fetch(`/api/admin/report/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: selectedRows }),
      });
      if (!res.ok) {
        let msg = `Export gagal (status ${res.status}).`;
        try {
          const j = await res.json();
          msg = j.error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-stlpp-${new Date().toISOString().slice(0, 10)}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message ?? 'Gagal export.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      {loadError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Gagal memuat data: {loadError}
        </div>
      )}
      {exportError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {exportError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari NIK / Nama..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
            </div>
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Divisi</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-2">{selected.size} dipilih</span>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {exporting === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
            >
              {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4 w-10">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} className="w-4 h-4" />
                </th>
                <th className="p-4">NIK</th>
                <th className="p-4">Nama</th>
                <th className="p-4">Divisi / Jabatan</th>
                <th className="p-4">Periode</th>
                <th className="p-4 text-center">Skor</th>
                <th className="p-4">Rekomendasi</th>
                <th className="p-4">Penilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const emp = r.assignment?.employee;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="w-4 h-4" />
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-700">{emp?.nik}</td>
                    <td className="p-4 font-semibold text-slate-800">{emp?.nama}</td>
                    <td className="p-4">
                      <p className="text-slate-800">{emp?.divisi}</p>
                      <p className="text-xs text-slate-400">{emp?.jabatan}</p>
                    </td>
                    <td className="p-4 text-slate-600">{r.assignment?.period}</td>
                    <td className="p-4 text-center font-bold">{r.grand_avg?.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.recommendation === 'DI PERPANJANG' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.recommendation === 'DI PERPANJANG' ? `Diperpanjang${r.duration ? ` ${r.duration} Bln` : ''}` : 'Tidak Diperpanjang'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{r.assignment?.evaluator?.name}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {initialRows.length === 0 ? 'Belum ada evaluasi yang selesai.' : 'Tidak ada hasil yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
