'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DIVISI_LIST, ANAK_PERUSAHAAN_LIST } from '@/lib/data/organisasi';
import { STATUS_KONTRAK_LIST } from '@/lib/data/kontrak';
import type { Employee } from '@/types';

interface KaryawanClientProps {
  initialEmployees: Employee[];
  loadError: string | null;
}

type FormState = {
  id?: string;
  nik: string;
  nama: string;
  tgl_lahir: string;
  jabatan: string;
  divisi: string;
  bagian: string;
  masa_kerja: string;
  status_kontrak: string;
  tgl_habis_kontrak: string;
};

const EMPTY_FORM: FormState = {
  nik: '',
  nama: '',
  tgl_lahir: '',
  jabatan: '',
  divisi: '',
  bagian: '',
  masa_kerja: '',
  status_kontrak: STATUS_KONTRAK_LIST[0],
  tgl_habis_kontrak: '',
};

export function KaryawanClient({ initialEmployees, loadError }: KaryawanClientProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.nama.toLowerCase().includes(q) ||
        e.nik.toLowerCase().includes(q) ||
        e.divisi.toLowerCase().includes(q) ||
        e.jabatan.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setForm({
      id: emp.id,
      nik: emp.nik,
      nama: emp.nama,
      tgl_lahir: emp.tgl_lahir ?? '',
      jabatan: emp.jabatan,
      divisi: emp.divisi,
      bagian: emp.bagian ?? '',
      masa_kerja: emp.masa_kerja ?? '',
      status_kontrak: emp.status_kontrak || STATUS_KONTRAK_LIST[0],
      tgl_habis_kontrak: emp.tgl_habis_kontrak,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const supabase = createClient();
    const payload = {
      nik: form.nik.trim(),
      nama: form.nama.trim(),
      tgl_lahir: form.tgl_lahir || null,
      jabatan: form.jabatan.trim(),
      divisi: form.divisi,
      bagian: form.bagian.trim() || null,
      masa_kerja: form.masa_kerja.trim() || null,
      status_kontrak: form.status_kontrak,
      tgl_habis_kontrak: form.tgl_habis_kontrak,
    };

    if (form.id) {
      const { data, error } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', form.id)
        .select()
        .single();
      if (error) {
        setFormError(error.message.includes('duplicate') ? 'NIK ini sudah terdaftar.' : error.message);
        setSaving(false);
        return;
      }
      setEmployees((prev) => prev.map((emp) => (emp.id === form.id ? (data as Employee) : emp)));
    } else {
      const { data, error } = await supabase.from('employees').insert(payload).select().single();
      if (error) {
        setFormError(error.message.includes('duplicate') ? 'NIK ini sudah terdaftar.' : error.message);
        setSaving(false);
        return;
      }
      setEmployees((prev) => [...prev, data as Employee].sort((a, b) => a.nama.localeCompare(b.nama)));
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Hapus data karyawan "${emp.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(emp.id);
    const supabase = createClient();
    const { error } = await supabase.from('employees').delete().eq('id', emp.id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
    }
    setDeletingId(null);
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
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIK / Nama / Divisi..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Karyawan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">NIK</th>
                <th className="p-4">Nama</th>
                <th className="p-4">Jabatan / Divisi</th>
                <th className="p-4">Status Kontrak</th>
                <th className="p-4">Akhir Kontrak</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-slate-700">{emp.nik}</td>
                  <td className="p-4 font-semibold text-slate-800">{emp.nama}</td>
                  <td className="p-4">
                    <p className="text-slate-800">{emp.jabatan}</p>
                    <p className="text-xs text-slate-400">{emp.divisi}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {emp.status_kontrak}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{emp.tgl_habis_kontrak}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(emp)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        disabled={deletingId === emp.id}
                        className="text-rose-500 hover:text-rose-700 disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === emp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {employees.length === 0 ? 'Belum ada data karyawan.' : 'Tidak ada hasil yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">{form.id ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm col-span-1">
                  <span className="block text-slate-600 mb-1">NIK *</span>
                  <input
                    required
                    value={form.nik}
                    onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm col-span-1">
                  <span className="block text-slate-600 mb-1">Tanggal Lahir</span>
                  <input
                    type="date"
                    value={form.tgl_lahir}
                    onChange={(e) => setForm((f) => ({ ...f, tgl_lahir: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Nama Lengkap *</span>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Jabatan *</span>
                  <input
                    required
                    value={form.jabatan}
                    onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Divisi / Unit Kerja *</span>
                  <select
                    required
                    value={form.divisi}
                    onChange={(e) => setForm((f) => ({ ...f, divisi: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">- Pilih -</option>
                    <optgroup label="Divisi (Kantor Pusat)">
                      {DIVISI_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Anak Perusahaan / Entitas">
                      {ANAK_PERUSAHAAN_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Bagian</span>
                <input
                  value={form.bagian}
                  onChange={(e) => setForm((f) => ({ ...f, bagian: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Masa Kerja</span>
                  <input
                    placeholder="cth: 2 Tahun 3 Bulan"
                    value={form.masa_kerja}
                    onChange={(e) => setForm((f) => ({ ...f, masa_kerja: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-slate-600 mb-1">Status Kontrak *</span>
                  <select
                    required
                    value={form.status_kontrak}
                    onChange={(e) => setForm((f) => ({ ...f, status_kontrak: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_KONTRAK_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="block text-slate-600 mb-1">Akhir Kontrak *</span>
                <input
                  required
                  type="date"
                  value={form.tgl_habis_kontrak}
                  onChange={(e) => setForm((f) => ({ ...f, tgl_habis_kontrak: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <p className="text-xs text-slate-400 -mt-2">
                Atasan penilai diatur dari menu <b>Penugasan</b>, bukan di sini.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
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
