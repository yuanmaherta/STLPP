'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Loader2, AlertCircle, CheckCircle2, History, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { nextVersion, nextItemNo } from '@/lib/utils/template-helpers';
import type { FormTemplateStructure, FormGroup, FormItem } from '@/types';

interface HistoryRow {
  id: string;
  version: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

interface TemplateEditorClientProps {
  initialStructure: FormTemplateStructure;
  activeVersion: string;
  history: HistoryRow[];
}

const BUCKET_LABELS: Record<keyof FormTemplateStructure, string> = {
  formA1: 'Form A1 — Penilaian Kompetensi',
  formA2: 'Form A2 — Penilaian Learning Agility',
  formB1: 'Form B1 — Penilaian Kinerja',
  formB2: 'Form B2 — AKHLAK',
};

function generateItemId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function TemplateEditorClient({ initialStructure, activeVersion, history }: TemplateEditorClientProps) {
  const [structure, setStructure] = useState<FormTemplateStructure>(initialStructure);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const updateItems = (bucket: keyof FormTemplateStructure, groupIdx: number, updater: (items: FormItem[]) => FormItem[], subIdx?: number) => {
    setStructure((prev) => {
      const groups = [...prev[bucket]];
      const g = { ...groups[groupIdx] };
      if (subIdx !== undefined && g.subgroups) {
        const subgroups = [...g.subgroups];
        subgroups[subIdx] = { ...subgroups[subIdx], items: updater(subgroups[subIdx].items) };
        g.subgroups = subgroups;
      } else if (g.items) {
        g.items = updater(g.items);
      }
      groups[groupIdx] = g;
      return { ...prev, [bucket]: groups };
    });
  };

  const editLabel = (bucket: keyof FormTemplateStructure, groupIdx: number, itemId: string, label: string, subIdx?: number) => {
    updateItems(bucket, groupIdx, (items) => items.map((it) => (it.id === itemId ? { ...it, label } : it)), subIdx);
  };

  const toggleActive = (bucket: keyof FormTemplateStructure, groupIdx: number, itemId: string, subIdx?: number) => {
    updateItems(bucket, groupIdx, (items) => items.map((it) => (it.id === itemId ? { ...it, active: it.active === false ? true : false } : it)), subIdx);
  };

  const deleteItem = (bucket: keyof FormTemplateStructure, groupIdx: number, itemId: string, subIdx?: number) => {
    if (!confirm('Hapus unsur penilaian ini secara permanen? (Penilaian yang sudah pernah disubmit tidak akan terpengaruh, karena tersimpan sebagai snapshot versi lama.)')) return;
    updateItems(bucket, groupIdx, (items) => items.filter((it) => it.id !== itemId), subIdx);
  };

  const addItem = (bucket: keyof FormTemplateStructure, groupIdx: number, subIdx?: number) => {
    const label = prompt('Tulis unsur penilaian baru:');
    if (!label || !label.trim()) return;
    updateItems(
      bucket,
      groupIdx,
      (items) => [...items, { id: generateItemId(bucket), no: nextItemNo(items), label: label.trim(), active: true }],
      subIdx
    );
  };

  const handleSave = async () => {
    if (!confirm(`Simpan sebagai versi baru (${nextVersion(activeVersion)})? Form penilaian yang sedang berjalan tetap memakai versi lama sampai selesai; hanya evaluasi BARU yang akan memakai versi ini.`)) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const supabase = createClient();
      const newVersion = nextVersion(activeVersion);

      const { error: insertError } = await supabase.from('form_templates').insert({
        version: newVersion,
        title: `Form Evaluasi PKWT (${newVersion})`,
        is_active: true,
        structure,
      });
      if (insertError) throw new Error(insertError.message);

      // Nonaktifkan semua versi lain (kalau ada baris versi lama di DB)
      const { error: updateError } = await supabase.from('form_templates').update({ is_active: false }).neq('version', newVersion);
      if (updateError) throw new Error(updateError.message);

      setSaveSuccess(`Tersimpan sebagai ${newVersion}. Muat ulang halaman untuk lihat riwayat terbaru.`);
    } catch (err: any) {
      setSaveError(err.message ?? 'Gagal menyimpan template.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (bucket: keyof FormTemplateStructure, groupIdx: number, item: FormItem, subIdx?: number) => (
    <div key={item.id} className={`flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0 ${item.active === false ? 'opacity-50' : ''}`}>
      <span className="text-xs text-gray-400 w-10 shrink-0">{item.no}</span>
      <input
        value={item.label}
        onChange={(e) => editLabel(bucket, groupIdx, item.id, e.target.value, subIdx)}
        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={() => toggleActive(bucket, groupIdx, item.id, subIdx)}
        title={item.active === false ? 'Aktifkan lagi' : 'Nonaktifkan'}
        className="text-slate-400 hover:text-slate-700 shrink-0"
      >
        {item.active === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button onClick={() => deleteItem(bucket, groupIdx, item.id, subIdx)} title="Hapus" className="text-rose-400 hover:text-rose-600 shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            Versi aktif saat ini: <span className="font-bold text-slate-800">{activeVersion}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Perubahan baru tersimpan sebagai versi terpisah — evaluasi yang sudah selesai tetap memakai versi lama.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory((s) => !s)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 px-3 py-2">
            <History className="w-4 h-4" /> Riwayat Versi
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan sebagai Versi Baru
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {saveSuccess}
        </div>
      )}

      {showHistory && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <p className="font-semibold text-sm text-slate-800 mb-2">Riwayat Versi</p>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada versi tersimpan di database — form saat ini masih memakai bawaan sistem ({activeVersion}).</p>
          ) : (
            <div className="space-y-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span>
                    <span className="font-semibold">{h.version}</span> — {h.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {h.is_active && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Aktif</span>}
                    <span className="text-slate-400">{new Date(h.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(Object.keys(BUCKET_LABELS) as Array<keyof FormTemplateStructure>).map((bucket) => (
        <div key={bucket} className="mb-6">
          <h2 className="font-bold text-blue-900 text-sm mb-3">{BUCKET_LABELS[bucket]}</h2>
          {structure[bucket].map((group: FormGroup, groupIdx: number) => (
            <div key={group.group} className="bg-white rounded-lg border border-slate-200 mb-3 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-sm text-slate-700">
                {group.no ? `${group.no}. ` : ''}
                {group.group}
              </div>
              <div className="px-4 py-2">
                {group.items && (
                  <>
                    {group.items.map((item) => renderItem(bucket, groupIdx, item))}
                    <button
                      onClick={() => addItem(bucket, groupIdx)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah unsur
                    </button>
                  </>
                )}
                {group.subgroups &&
                  group.subgroups.map((sg, subIdx) => (
                    <div key={sg.label} className="mt-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-2 mb-1">{sg.label}</div>
                      {sg.items.map((item) => renderItem(bucket, groupIdx, item, subIdx))}
                      <button
                        onClick={() => addItem(bucket, groupIdx, subIdx)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah unsur
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
