'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Loader2, AlertCircle, ShieldCheck, ClipboardCheck } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ATASAN';
  division: string | null;
  created_at: string;
}

interface PenggunaClientProps {
  initialUsers: UserRow[];
  loadError: string | null;
  currentUserId: string;
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'ATASAN' as 'ADMIN' | 'ATASAN' };

export function PenggunaClient({ initialUsers, loadError, currentUserId }: PenggunaClientProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

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
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let result: any = null;
      try {
        result = await res.json();
      } catch {
        throw new Error(`Server merespons tidak sesuai (status ${res.status}). Cek log server / Vercel.`);
      }

      if (!res.ok) {
        throw new Error(result?.error ?? `Gagal membuat akun (status ${res.status}).`);
      }

      setUsers((prev) => [
        ...prev,
        {
          id: result.id,
          name: form.name,
          email: form.email,
          role: form.role,
          division: null,
          created_at: new Date().toISOString(),
        },
      ]);
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Gagal membuat akun. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserRow) => {
    if (u.id === currentUserId) {
      alert('Kamu tidak bisa menghapus akunmu sendiri.');
      return;
    }
    if (!confirm(`Hapus akun "${u.name}" (${u.email})? Tindakan ini tidak bisa dibatalkan.`)) return;

    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      let result: any = null;
      try {
        result = await res.json();
      } catch {
        throw new Error(`Server merespons tidak sesuai (status ${res.status}).`);
      }
      if (!res.ok) {
        throw new Error(result?.error ?? `Gagal menghapus (status ${res.status}).`);
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">{users.length} akun terdaftar</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Akun
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">
                    {u.name} {u.id === currentUserId && <span className="text-xs text-slate-400 font-normal">(kamu)</span>}
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {u.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={deletingId === u.id || u.id === currentUserId}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={u.id === currentUserId ? 'Tidak bisa hapus diri sendiri' : 'Hapus'}
                    >
                      {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Tambah Akun</h2>
              <button onClick={() => !saving && setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{formError}</div>
              )}

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Nama *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Email *</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Password Awal *</span>
                <input
                  required
                  minLength={6}
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">Beritahu password ini ke user secara langsung/aman.</span>
              </label>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Role *</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'ATASAN' }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ATASAN">Atasan (evaluator)</option>
                  <option value="ADMIN">Admin HC</option>
                </select>
              </label>

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
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
