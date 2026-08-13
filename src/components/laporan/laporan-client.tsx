'use client';

import { useMemo, useState } from 'react';
import { Search, FileSpreadsheet, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { durasiLabel } from '@/lib/utils/report-helpers';

interface EvalRow {
  id: string;
  scores: Record<string, number>;
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
      tgl_lahir: string | null;
      tgl_habis_kontrak: string | null;
    } | null;
    evaluator: { name: string } | null;
  } | null;
}

interface LaporanClientProps {
  initialRows: EvalRow[];
  loadError: string | null;
}

interface EditEntry {
  rekomendasi: string;
  keteranganRekomendasi: string;
  keterangan: string;
}

export function LaporanClient({ initialRows, loadError }: LaporanClientProps) {
  const [search, setSearch] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportError, setExportError] = useState('');

  const [modalType, setModalType] = useState<'excel' | 'pdf' | null>(null);
  const [editState, setEditState] = useState<Record<string, EditEntry>>({});
  const [downloading, setDownloading] = useState(false);

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
      if (allFilteredSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
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

  // Judul laporan mengikuti divisi yang difilter; kalau tidak difilter tapi semua baris
  // terpilih kebetulan 1 divisi yang sama, pakai itu juga. Kalau campur, tandai "Berbagai Divisi".
  const reportTitle = useMemo(() => {
    if (divisiFilter) return divisiFilter;
    const divisiSet = new Set(selectedRows.map((r) => r.assignment?.employee?.divisi).filter(Boolean));
    if (divisiSet.size === 1) return Array.from(divisiSet)[0] as string;
    if (divisiSet.size > 1) return 'Berbagai Divisi';
    return 'Semua Divisi';
  }, [divisiFilter, selectedRows]);

  const openExportModal = (type: 'excel' | 'pdf') => {
    if (selectedRows.length === 0) {
      setExportError('Pilih minimal 1 karyawan dulu (centang di kolom kiri tabel).');
      return;
    }
    setExportError('');
    // Siapkan draft edit untuk tiap baris terpilih, pre-fill dari data otomatis
    setEditState((prev) => {
      const next = { ...prev };
      selectedRows.forEach((r) => {
        if (!next[r.id]) {
          next[r.id] = {
            rekomendasi: durasiLabel(r.recommendation, r.duration),
            keteranganRekomendasi: r.recommendation === 'DI PERPANJANG' ? 'Hasil evaluasi memenuhi minimal standard.' : '',
            keterangan: '',
          };
        }
      });
      return next;
    });
    setModalType(type);
  };

  const updateEdit = (id: string, field: keyof EditEntry, value: string) => {
    setEditState((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleDownload = async () => {
    if (!modalType) return;
    setDownloading(true);
    setExportError('');
    try {
      const res = await fetch(`/api/admin/report/${modalType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: selectedRows,
          edits: selectedRows.map((r) => ({ id: r.id, ...editState[r.id] })),
          title: reportTitle,
        }),
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
      a.download = `laporan-stlpp-${reportTitle.replace(/\s+/g, '-').toLowerCase()}.${modalType === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setModalType(null);
    } catch (err: any) {
      setExportError(err.message ?? 'Gagal export.');
    } finally {
      setDownloading(false);
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
      {exportError && !modalType && (
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
              onClick={() => openExportModal('excel')}
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
              onClick={() => openExportModal('pdf')}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700"
            >
              <FileText className="w-4 h-4" /> PDF
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

      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-800">Lengkapi sebelum export {modalType === 'excel' ? 'Excel' : 'PDF'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Judul laporan: <span className="font-semibold">{reportTitle}</span> — {selectedRows.length} karyawan
                </p>
              </div>
              <button onClick={() => !downloading && setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {exportError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{exportError}</div>
              )}
              {selectedRows.map((r) => {
                const emp = r.assignment?.employee;
                const edit = editState[r.id] ?? { rekomendasi: '', keteranganRekomendasi: '', keterangan: '' };
                return (
                  <div key={r.id} className="border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-sm text-slate-800 mb-3">{emp?.nama}</p>
                    <label className="block text-xs mb-2">
                      <span className="block text-slate-500 mb-1">Rekomendasi</span>
                      <input
                        value={edit.rekomendasi}
                        onChange={(e) => updateEdit(r.id, 'rekomendasi', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="block text-xs mb-2">
                      <span className="block text-slate-500 mb-1">Keterangan Rekomendasi</span>
                      <textarea
                        rows={3}
                        value={edit.keteranganRekomendasi}
                        onChange={(e) => updateEdit(r.id, 'keteranganRekomendasi', e.target.value)}
                        placeholder="cth: 1. Hasil evaluasi memenuhi minimal standard. 2. Dilakukan perpanjangan sesuai Nota Dinas Nomor ..."
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="block text-xs">
                      <span className="block text-slate-500 mb-1">Keterangan</span>
                      <input
                        value={edit.keterangan}
                        onChange={(e) => updateEdit(r.id, 'keterangan', e.target.value)}
                        placeholder="cth: Kontrak Pusat"
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setModalType(null)}
                disabled={downloading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {downloading && <Loader2 className="w-4 h-4 animate-spin" />}
                Download {modalType === 'excel' ? 'Excel' : 'PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
