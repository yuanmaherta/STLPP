'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, X, Loader2, AlertCircle, Search, CheckSquare, Square } from 'lucide-react';
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

const STATUS_STYLE: Record<AssignmentRow['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  UNASSIGNED: 'bg-navy-50 text-navy-600',
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // form modal state
  const [empSearch, setEmpSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [evaluatorId, setEvaluatorId] = useState('');
  const [period, setPeriod] = useState('');
  const [deadline, setDeadline] = useState('');

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

  const filteredEmployees = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.nama.toLowerCase().includes(q) || e.nik.toLowerCase().includes(q) || e.divisi.toLowerCase().includes(q));
  }, [employees, empSearch]);

  const allFilteredEmpSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmployeeIds.has(e.id));

  const toggleAllEmp = () => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (allFilteredEmpSelected) filteredEmployees.forEach((e) => next.delete(e.id));
      else filteredEmployees.forEach((e) => next.add(e.id));
      return next;
    });
  };

  const toggleEmp = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = () => {
    setEmpSearch('');
    setSelectedEmployeeIds(new Set());
    setEvaluatorId('');
    setPeriod('');
    setDeadline('');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeIds.size === 0) {
      setFormError('Pilih minimal 1 karyawan.');
      return;
    }
    setSaving(true);
    setFormError('');

    try {
      const supabase = createClient();
      const rowsToInsert = Array.from(selectedEmployeeIds).map((employee_id) => ({
        employee_id,
        evaluator_id: evaluatorId,
        period: period.trim(),
        deadline,
      }));

      const { data, error } = await supabase
        .from('assignments')
        .insert(rowsToInsert)
        .select(
          'id, period, deadline, status, assigned_at, employee:employees(id, nama, nik, jabatan, divisi), evaluator:users(id, name, email)'
        );

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('uq_assignment_employee_period')) {
          throw new Error('Salah satu karyawan yang dipilih sudah punya penugasan untuk periode yang sama. Batalkan dulu penugasan lamanya, atau hapus dari pilihan.');
        }
        throw new Error(error.message);
      }

      setAssignments((prev) => [...((data as any) ?? []), ...prev]);
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

      <div className="bg-white rounded-2xl shadow-card border border-navy-100 overflow-hidden">
        <div className="p-4 border-b border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karyawan / atasan / periode..."
              className="pl-9 pr-4 py-2 text-sm border border-navy-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            />
          </div>
          <button
            onClick={openAdd}
            disabled={employees.length === 0 || atasanList.length === 0}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Tugaskan Penilaian
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-navy-600 border-b border-navy-100 font-semibold">
              <tr>
                <th className="p-4">Karyawan</th>
                <th className="p-4">Atasan Penilai</th>
                <th className="p-4">Periode</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-canvas transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-navy-900">{a.employee?.nama ?? '-'}</p>
                    <p className="text-xs text-navy-300">{a.employee?.jabatan}</p>
                  </td>
                  <td className="p-4 text-navy-600">{a.evaluator?.name ?? '-'}</td>
                  <td className="p-4 text-navy-600">{a.period}</td>
                  <td className="p-4 text-navy-600">{a.deadline}</td>
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
                  <td colSpan={6} className="p-8 text-center text-navy-300">
                    {assignments.length === 0 ? 'Belum ada penugasan.' : 'Tidak ada hasil yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              <h2 className="font-bold text-navy-900">Tugaskan Penilaian</h2>
              <button onClick={() => !saving && setModalOpen(false)} className="text-navy-300 hover:text-navy-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{formError}</div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-sm text-navy-600">Karyawan * (bisa pilih beberapa sekaligus)</span>
                  <span className="text-xs text-navy-300">{selectedEmployeeIds.size} dipilih</span>
                </div>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                  <input
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Cari nama / NIK / divisi..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="border border-navy-100 rounded-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={toggleAllEmp}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-navy-400 bg-canvas border-b border-navy-100 sticky top-0"
                  >
                    {allFilteredEmpSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    Pilih semua ({filteredEmployees.length})
                  </button>
                  {filteredEmployees.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-canvas cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <input type="checkbox" checked={selectedEmployeeIds.has(emp.id)} onChange={() => toggleEmp(emp.id)} className="w-4 h-4 shrink-0" />
                      <span className="flex-1">
                        <span className="font-medium text-navy-900">{emp.nama}</span>{' '}
                        <span className="text-navy-300 text-xs">({emp.nik})</span>
                        <br />
                        <span className="text-xs text-navy-300">
                          {emp.jabatan} — {emp.divisi}
                        </span>
                      </span>
                    </label>
                  ))}
                  {filteredEmployees.length === 0 && <div className="px-3 py-6 text-center text-xs text-navy-300">Tidak ada hasil.</div>}
                </div>
              </div>

              <label className="block text-sm">
                <span className="block text-navy-600 mb-1">Atasan Penilai *</span>
                <select
                  required
                  value={evaluatorId}
                  onChange={(e) => setEvaluatorId(e.target.value)}
                  className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <span className="block text-navy-600 mb-1">Periode *</span>
                  <input
                    required
                    placeholder="cth: Agustus 2026"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-navy-600 mb-1">Deadline *</span>
                  <input
                    required
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tugaskan {selectedEmployeeIds.size > 0 ? `(${selectedEmployeeIds.size} karyawan)` : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
