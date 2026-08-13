'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, X, Loader2, AlertCircle, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EmployeeOption {
  id: string;
  nama: string;
  nik: string;
  jabatan: string;
  divisi: string;
}

interface AtasanOption {
  id: string;
  name: string;
  email: string;
}

interface AssignmentRow {
  id: string;
  period: string;
  deadline: string;
  status: 'UNASSIGNED' | 'PENDING' | 'COMPLETED';
  assigned_at: string;
  employee: EmployeeOption | null;
  evaluator: { id: string; name: string; email: string } | null;
}

interface PenugasanClientProps {
  initialAssignments: AssignmentRow[];
  employees: EmployeeOption[];
  atasanList: AtasanOption[];
  loadError: string | null;
}

const EMPTY_FORM = { employee_id: '', evaluator_id: '', period: '', deadline: '' };

const STATUS_STYLE: Record<AssignmentRow['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  UNASSIGNED: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<AssignmentRow['status'], string> = {
  PENDING: 'Menunggu Penilaian',
  COMPLETED: 'Selesai Dinilai',
  UNASSIGNED: 'Belum Ditugaskan',
};

export function PenugasanClient({ initialAssignments, employees, atasanList, loadError }: PenugasanClientProps) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>(initialAssignments);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (a) =>
        a.employee?.nama.toLowerCase().includes(q) ||
        a.employee?.nik.toLowerCase().includes(q) ||
        a.evaluator?.name.toLowerCase().includes(q) ||
        a.period.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          employee_id: form.employee_id,
          evaluator_id: form.evaluator_id,
          period: form.period.trim(),
          deadline: form.deadline,
        })
        .select(
          'id, period, deadline, status, assigned_at, employee:employees(id, nama, nik, jabatan, divisi), evaluator:users(id, name, email)'
        )
        .single();

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('uq_assignment_employee_period')) {
          throw new Error('Karyawan ini sudah punya penugasan untuk periode yang sama.');
        }
        throw new Error(error.message);
      }

      setAssignments((prev) => [data as any, ...prev]);
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Gagal menyimpan penugasan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: AssignmentRow) => {
    if (!confirm(`Batalkan penugasan "${a.employee?.nama}" untuk periode ${a.period}?`)) return;
    setDeletingId(a.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('assignments').delete().eq('id', a.id);
      if (error) throw new Error(error.message);
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
    } catch (err: any) {
      alert(`Gagal membatalkan: ${err.message}`);
    } finally {
      setDeletingId(null);
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

      {(employees.length === 0 || atasanList.length === 0) && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          {employees.length === 0 && 'Belum ada data karyawan (isi dulu di Master Karyawan). '}
          {atasanList.length === 0 && 'Belum ada akun atasan (buat dulu di Manajemen Pengguna).'}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karyawan / atasan / periode..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
            />
          </div>
          <button
            onClick={openAdd}
            disabled={employees.length === 0 || atasanList.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Tugaskan Penilaian
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">Karyawan</th>
                <th className="p-4">Atasan Penilai</th>
                <th className="p-4">Periode</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{a.employee?.nama ?? '-'}</p>
                    <p className="text-xs text-slate-400">{a.employee?.jabatan}</p>
                  </td>
                  <td className="p-4 text-slate-600">{a.evaluator?.name ?? '-'}</td>
                  <td className="p-4 text-slate-600">{a.period}</td>
                  <td className="p-4 text-slate-600">{a.deadline}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={deletingId === a.id || a.status === 'COMPLETED'}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={a.status === 'COMPLETED' ? 'Tidak bisa membatalkan yang sudah selesai dinilai' : 'Batalkan'}
                    >
                      {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {assignments.length === 0 ? 'Belum ada penugasan.' : 'Tidak ada hasil yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Tugaskan Penilaian</h2>
              <button onClick={() => !saving && setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{formError}</div>
              )}

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Karyawan *</span>
                <select
                  required
                  value={form.employee_id}
                  onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">- Pilih karyawan -</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nama} ({e.nik}) — {e.jabatan}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Atasan Penilai *</span>
                <select
                  required
                  value={form.evaluator_id}
                  onChange={(e) => setForm((f) => ({ ...f, evaluator_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">- Pilih atasan -</option>
                  {atasanList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Periode *</span>
                  <input
                    required
                    placeholder="cth: Agustus 2026"
                    value={form.period}
                    onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Deadline *</span>
                  <input
                    required
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
