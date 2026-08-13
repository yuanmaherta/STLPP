'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Printer,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_FORM_STRUCTURE, getAllFormItemIds } from '@/lib/data/form-default';
import { calculateEvaluationStats, SCALE_VALUES, getScaleLabel, getScaleBadgeColor } from '@/lib/utils/scoring';
import type { FormGroup, FormItem, IndicatorScoreMap, FormCData } from '@/types';

const { formAItemIds, formBItemIds } = getAllFormItemIds(DEFAULT_FORM_STRUCTURE);

interface EmployeeInfo {
  id: string;
  nik: string;
  nama: string;
  tgl_lahir?: string;
  jabatan: string;
  divisi: string;
  bagian?: string;
  masa_kerja?: string;
  status_kontrak: string;
}

interface AssignmentInfo {
  id: string;
  period: string;
  deadline: string;
  status: 'UNASSIGNED' | 'PENDING' | 'COMPLETED';
  employee: EmployeeInfo;
}

interface SignatureData {
  tempatTanggal: string;
  penilaiNama: string;
  penilaiJabatan: string;
  needBod1: boolean;
  bod1Nama: string;
  bod1Jabatan: string;
}

interface ExistingEvaluation {
  scores: IndicatorScoreMap;
  grand_avg: number;
  recommendation: string;
  duration: string | null;
  form_c_data: FormCData;
  signature_data: SignatureData;
}

interface EvaluasiFormClientProps {
  assignment: AssignmentInfo;
  existingEvaluation: ExistingEvaluation | null;
  evaluatorName: string;
}

function ScoreRow({ item, value, onChange, readOnly }: { item: FormItem; value?: number; onChange: (id: string, v: number) => void; readOnly: boolean }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 flex gap-2 text-sm text-gray-700">
          <span className="text-gray-400 font-medium shrink-0 w-10">{item.no}</span>
          <span>{item.label}</span>
        </div>
        <div className="flex flex-wrap gap-1 print:hidden">
          {SCALE_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(item.id, v)}
              title={`${v} - ${getScaleLabel(v)}`}
              className={`w-9 h-9 rounded-md border text-xs font-semibold transition ${
                value === v ? getScaleBadgeColor(v) : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
              } disabled:cursor-not-allowed`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupBlock({
  group,
  scores,
  onChange,
  readOnly,
}: {
  group: FormGroup;
  scores: IndicatorScoreMap;
  onChange: (id: string, v: number) => void;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(true);
  const allItems: FormItem[] = group.items ?? (group.subgroups ? group.subgroups.flatMap((sg) => sg.items) : []);
  const filled = allItems.filter((it) => scores[it.id]).length;
  const total = allItems.reduce((s, it) => s + (scores[it.id] || 0), 0);
  const avg = filled ? (total / allItems.length).toFixed(2) : '—';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3 print:break-inside-avoid">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 print:hidden">
        <span className="font-semibold text-gray-800 text-sm text-left">
          {group.no ? `${group.no}. ` : ''}
          {group.group}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{filled}/{allItems.length} terisi</span>
          <span className="font-semibold text-gray-700">{avg !== '—' ? `Avg ${avg}` : ''}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      <div className="hidden print:block bg-gray-50 px-4 py-2 font-semibold text-sm">
        {group.no ? `${group.no}. ` : ''}
        {group.group}
      </div>
      {open && (
        <div className="px-4 py-1">
          {group.items && group.items.map((it) => <ScoreRow key={it.id} item={it} value={scores[it.id]} onChange={onChange} readOnly={readOnly} />)}
          {group.subgroups &&
            group.subgroups.map((sg) => (
              <div key={sg.label} className="mt-2">
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-3 mb-1">{sg.label}</div>
                {sg.items.map((it) => (
                  <ScoreRow key={it.id} item={it} value={scores[it.id]} onChange={onChange} readOnly={readOnly} />
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function PrintScoreTable({ formLabel, sectionLabel, subLabel, groups, scores }: { formLabel?: string; sectionLabel?: string; subLabel?: string; groups: FormGroup[]; scores: IndicatorScoreMap }) {
  const rows: Array<{ type: 'group' | 'subgroup' | 'item'; no?: number | string; label?: string; item?: FormItem }> = [];
  groups.forEach((g) => {
    rows.push({ type: 'group', no: g.no, label: g.group });
    if (g.items) g.items.forEach((it) => rows.push({ type: 'item', item: it }));
    if (g.subgroups)
      g.subgroups.forEach((sg) => {
        rows.push({ type: 'subgroup', label: sg.label });
        sg.items.forEach((it) => rows.push({ type: 'item', item: it }));
      });
  });

  return (
    <div className="hidden print:block mb-6">
      {formLabel && <div className="font-bold text-sm mb-1">{formLabel}</div>}
      {sectionLabel && <div className="font-semibold text-sm mb-2 underline">{sectionLabel}</div>}
      {subLabel && <div className="text-xs font-semibold mb-1">{subLabel}</div>}
      <table className="w-full border-collapse border border-black text-[9px]">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-black w-6 p-1 bg-gray-100">No.</th>
            <th rowSpan={2} className="border border-black p-1 bg-gray-100">Unsur Penilaian</th>
            <th colSpan={10} className="border border-black p-1 bg-gray-100">Skor Nilai</th>
          </tr>
          <tr>
            <th className="border border-black p-1 bg-gray-100">Sangat Baik</th>
            <th className="border border-black p-1 bg-gray-100">Baik</th>
            <th colSpan={3} className="border border-black p-1 bg-gray-100">Sedang</th>
            <th colSpan={5} className="border border-black p-1 bg-gray-100">Kurang</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            if (r.type === 'group')
              return (
                <tr key={i} className="font-bold bg-gray-200">
                  <td className="border border-black p-1 text-center">{r.no}</td>
                  <td colSpan={11} className="border border-black p-1">{r.label}</td>
                </tr>
              );
            if (r.type === 'subgroup')
              return (
                <tr key={i} className="font-semibold italic bg-gray-100">
                  <td className="border border-black p-1"></td>
                  <td colSpan={11} className="border border-black p-1">{r.label}</td>
                </tr>
              );
            const it = r.item!;
            return (
              <tr key={it.id}>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 text-left">{it.no}. {it.label}</td>
                {SCALE_VALUES.map((v) => (
                  <td key={v} className="border border-black p-1 text-center align-middle">
                    {scores[it.id] === v ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-black font-bold">{v}</span>
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RadioTriple({ label, value, onChange, readOnly }: { label: string; value: string; onChange: (v: string) => void; readOnly: boolean }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="font-semibold text-sm text-gray-800 mb-2">{label}</div>
      <div className="flex gap-4">
        {['Baik', 'Sedang', 'Kurang'].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" disabled={readOnly} checked={value === opt} onChange={() => onChange(opt)} className="w-4 h-4" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function EvaluasiFormClient({ assignment, existingEvaluation, evaluatorName }: EvaluasiFormClientProps) {
  const router = useRouter();
  const readOnly = assignment.status === 'COMPLETED';
  const emp = assignment.employee;

  const [scores, setScores] = useState<IndicatorScoreMap>(existingEvaluation?.scores ?? {});
  const [durasi, setDurasi] = useState(existingEvaluation?.duration && ['12', '6'].includes(existingEvaluation.duration) ? existingEvaluation.duration : '12');
  const [customBulan, setCustomBulan] = useState(
    existingEvaluation?.duration && !['12', '6'].includes(existingEvaluation.duration) ? existingEvaluation.duration : ''
  );
  const [formC, setFormC] = useState<FormCData>(
    existingEvaluation?.form_c_data ?? { kinerja: '', potensi: '', pengembangan: '', catatanKasus: '', kesanUmum: '', saranPengembangan: '' }
  );
  const [sig, setSig] = useState<SignatureData>(
    existingEvaluation?.signature_data ?? {
      tempatTanggal: '',
      penilaiNama: evaluatorName,
      penilaiJabatan: '',
      needBod1: false,
      bod1Nama: '',
      bod1Jabatan: '',
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setScore = (id: string, v: number) => {
    if (readOnly) return;
    setScores((s) => ({ ...s, [id]: v }));
  };

  const stats = useMemo(() => calculateEvaluationStats(scores, formAItemIds, formBItemIds), [scores]);
  const eligible = existingEvaluation ? existingEvaluation.recommendation === 'DI PERPANJANG' : stats.eligible;

  const handlePrint = () => window.print();

  const handleSubmit = async () => {
    if (!stats.allFilled) {
      setSubmitError('Semua unsur penilaian (Form A & B) harus diisi sebelum submit.');
      return;
    }
    if (!formC.kinerja || !formC.potensi || !formC.pengembangan) {
      setSubmitError('Form C (Kinerja/Potensi/Pengembangan Karyawan) harus diisi semua.');
      return;
    }
    if (!sig.penilaiNama || !sig.penilaiJabatan) {
      setSubmitError('Nama dan jabatan penilai wajib diisi untuk tanda tangan.');
      return;
    }
    if (!confirm('Kirim penilaian ini? Setelah dikirim, jawaban tidak bisa diubah lagi.')) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const supabase = createClient();
      const duration = stats.eligible ? (durasi === 'custom' ? customBulan : durasi) : null;

      const { error: insertError } = await supabase.from('evaluations').insert({
        assignment_id: assignment.id,
        template_version: 'v1.0',
        scores,
        grand_avg: stats.grandAvg,
        recommendation: stats.recommendation,
        duration,
        form_c_data: formC,
        signature_data: sig,
      });
      if (insertError) throw new Error(insertError.message);

      const { error: updateError } = await supabase.from('assignments').update({ status: 'COMPLETED' }).eq('id', assignment.id);
      if (updateError) throw new Error(updateError.message);

      router.push('/atasan/riwayat');
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message ?? 'Gagal mengirim penilaian.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 print:bg-white -m-6 print:m-0">
      <div className="sticky top-0 z-10 bg-blue-900 text-white px-4 py-3 print:hidden shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-200 hover:text-white text-xs">
              <ArrowLeft size={14} /> Kembali
            </button>
            <div>
              <div className="text-xs text-blue-200">{readOnly ? 'Riwayat Penilaian' : 'Form Evaluasi Penilaian Karyawan PKWT'}</div>
              <div className="font-semibold text-sm">{emp.nama}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-xs text-blue-200">Keseluruhan</div>
              <div className="font-bold text-lg">{existingEvaluation ? existingEvaluation.grand_avg.toFixed(2) : stats.grandAvg ? stats.grandAvg.toFixed(2) : '—'}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${eligible ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {eligible ? 'Diperpanjang' : 'Tidak Diperpanjang'}
            </div>
            {!readOnly && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kirim Penilaian
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-1 bg-white text-blue-900 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-50">
              <Printer size={14} /> Cetak
            </button>
          </div>
        </div>
        {submitError && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-2 text-xs bg-rose-100 text-rose-800 px-3 py-2 rounded-md">
            <AlertCircle size={14} /> {submitError}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <div className="text-center mb-6 print:mb-4">
          <h1 className="font-bold text-lg">FORM EVALUASI PENILAIAN</h1>
          <h1 className="font-bold text-lg">KARYAWAN PKWT</h1>
          <h2 className="font-semibold">PT HUTAMA KARYA (PERSERO)</h2>
        </div>

        {/* Print-only header info, mirrors the original PDF's plain "Label : Value" list */}
        <table className="w-full mb-6 print:mb-3 bg-white border border-gray-200 rounded-lg p-4 print:border-0 print:p-0 print:bg-transparent">
          <tbody>
            {[
              ['Nama Karyawan', emp.nama],
              ['NIK', emp.nik],
              ['Tanggal Lahir', emp.tgl_lahir ?? '-'],
              ['Jabatan', emp.jabatan],
              ['Divisi', emp.divisi],
              ['Bagian', emp.bagian ?? '-'],
              ['Masa Kerja', emp.masa_kerja ?? '-'],
              ['Status Kontrak', emp.status_kontrak],
              ['Periode Evaluasi', assignment.period],
            ].map(([label, val]) => (
              <tr key={label}>
                <td className="font-bold w-40 align-top py-1 print:py-0.5 px-4 print:px-0">{label}</td>
                <td className="align-top py-1 print:py-0.5">: {val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FORM A - interaktif */}
        <div className="print:hidden">
          <h2 className="font-bold text-blue-900 mb-1">FORM A</h2>
          <h3 className="font-semibold text-blue-800 mb-2 text-sm underline">A. Penilaian Capacity Kompetensi</h3>
          <div className="text-xs text-gray-500 mb-2">A1. Penilaian Kompetensi</div>
          {DEFAULT_FORM_STRUCTURE.formA1.map((g) => (
            <GroupBlock key={g.group} group={g} scores={scores} onChange={setScore} readOnly={readOnly} />
          ))}
          <div className="text-xs text-gray-500 mb-2 mt-4">A2. Penilaian Learning Agility</div>
          {DEFAULT_FORM_STRUCTURE.formA2.map((g) => (
            <GroupBlock key={g.group} group={g} scores={scores} onChange={setScore} readOnly={readOnly} />
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between text-sm font-semibold text-blue-900 mb-6">
            <span>Total / Rata-Rata Nilai (A1+A2)</span>
            <span>{stats.formA.total} / {stats.formA.filledCount ? stats.formA.avg.toFixed(2) : '—'}</span>
          </div>

          <h2 className="font-bold text-blue-900 mb-1">FORM B</h2>
          <h3 className="font-semibold text-blue-800 mb-2 text-sm underline">B. Penilaian Performance</h3>
          {DEFAULT_FORM_STRUCTURE.formB1.map((g) => (
            <GroupBlock key={g.group} group={g} scores={scores} onChange={setScore} readOnly={readOnly} />
          ))}
          {DEFAULT_FORM_STRUCTURE.formB2.map((g) => (
            <GroupBlock key={g.group} group={g} scores={scores} onChange={setScore} readOnly={readOnly} />
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between text-sm font-semibold text-blue-900 mb-2">
            <span>Total / Rata-Rata Nilai (B1+B2)</span>
            <span>{stats.formB.total} / {stats.formB.filledCount ? stats.formB.avg.toFixed(2) : '—'}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex justify-between text-sm font-bold text-emerald-900 mb-6">
            <span>Total / Rata-Rata Nilai Keseluruhan (A+B)</span>
            <span>{stats.grandTotal} / {stats.grandAvg ? stats.grandAvg.toFixed(2) : '—'}</span>
          </div>
        </div>

        {/* Print-only tables */}
        <PrintScoreTable formLabel="FORM A" sectionLabel="A. Penilaian Capacity Kompetensi" subLabel="A1. Penilaian Kompetensi" groups={DEFAULT_FORM_STRUCTURE.formA1} scores={scores} />
        <PrintScoreTable subLabel="A2. Penilaian Learning Agility" groups={DEFAULT_FORM_STRUCTURE.formA2} scores={scores} />
        <div className="hidden print:flex justify-between text-xs font-bold border border-black p-2 -mt-6 mb-6">
          <span>Total Nilai (A1+A2)</span>
          <span>{stats.formA.total}</span>
          <span>Rata-Rata Nilai (A1+A2)</span>
          <span>{stats.formA.avg.toFixed(2)}</span>
        </div>
        <PrintScoreTable formLabel="FORM B" sectionLabel="B. Penilaian Performance" groups={[...DEFAULT_FORM_STRUCTURE.formB1, ...DEFAULT_FORM_STRUCTURE.formB2]} scores={scores} />
        <div className="hidden print:flex justify-between text-xs font-bold border border-black p-2 -mt-6 mb-2">
          <span>Total Nilai (B1+B2)</span>
          <span>{stats.formB.total}</span>
          <span>Rata-Rata Nilai (B1+B2)</span>
          <span>{stats.formB.avg.toFixed(2)}</span>
        </div>
        <div className="hidden print:flex justify-between text-xs font-bold border-2 border-black bg-green-100 p-2 mb-6">
          <span>Total Nilai Keseluruhan (A+B)</span>
          <span>{stats.grandTotal}</span>
          <span>Rata-Rata Nilai Keseluruhan (A+B)</span>
          <span>{stats.grandAvg.toFixed(2)}</span>
        </div>

        {/* Kesimpulan */}
        <div className="border-2 border-gray-800 rounded-lg p-4 mb-6 print:break-inside-avoid">
          <div className="font-bold text-sm mb-3">Kesimpulan Perpanjangan Kontrak (berdasarkan Rata-Rata Nilai Keseluruhan)</div>
          <div className="flex items-center gap-2 mb-2">
            {eligible ? <CheckCircle2 className="text-emerald-600" size={20} /> : <Circle className="text-gray-300" size={20} />}
            <span className={`font-semibold text-sm ${eligible ? 'text-emerald-700' : 'text-gray-400'}`}>Diperpanjang (Skor ≥ 85)</span>
          </div>
          {eligible && (
            <div className="ml-7 flex flex-wrap gap-4 mb-2">
              {[['12', '12 Bulan'], ['6', '6 Bulan'], ['custom', 'Custom']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-sm">
                  <input type="radio" disabled={readOnly} checked={durasi === val} onChange={() => setDurasi(val)} className="w-4 h-4" />
                  {label}
                  {val === 'custom' && durasi === 'custom' && (
                    <input
                      type="number"
                      disabled={readOnly}
                      value={customBulan}
                      onChange={(e) => setCustomBulan(e.target.value)}
                      placeholder="jumlah bulan"
                      className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  )}
                </label>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            {!eligible ? <CheckCircle2 className="text-red-600" size={20} /> : <Circle className="text-gray-300" size={20} />}
            <span className={`font-semibold text-sm ${!eligible ? 'text-red-700' : 'text-gray-400'}`}>Tidak Diperpanjang (Skor &lt; 85)</span>
          </div>
          {!readOnly && !stats.allFilled && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2 print:hidden">
              <AlertCircle size={14} /> Masih ada unsur penilaian yang belum diisi — status di atas bisa berubah.
            </div>
          )}
        </div>

        {/* FORM C */}
        <h2 className="font-bold text-blue-900 mb-1">FORM C</h2>
        <h3 className="font-semibold text-blue-800 mb-3 text-sm underline">Pengembangan, Potensi, dan Kinerja</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-4 print:hidden">
          <RadioTriple label="Kinerja Karyawan" value={formC.kinerja} onChange={(v) => setFormC((f) => ({ ...f, kinerja: v as any }))} readOnly={readOnly} />
          <RadioTriple label="Potensi Karyawan" value={formC.potensi} onChange={(v) => setFormC((f) => ({ ...f, potensi: v as any }))} readOnly={readOnly} />
          <RadioTriple label="Pengembangan Karyawan" value={formC.pengembangan} onChange={(v) => setFormC((f) => ({ ...f, pengembangan: v as any }))} readOnly={readOnly} />
        </div>
        <div className="hidden print:flex gap-2 mb-4 text-xs">
          {[['Kinerja Karyawan', formC.kinerja], ['Potensi Karyawan', formC.potensi], ['Pengembangan Karyawan', formC.pengembangan]].map(([label, val]) => (
            <div key={label} className="flex-1 border border-black p-2">
              <div className="font-bold mb-1">{label}</div>
              {['Baik', 'Sedang', 'Kurang'].map((opt) => (
                <div key={opt}>
                  <span className="inline-flex items-center justify-center w-3 h-3 border border-black text-[8px] font-bold mr-1">{val === opt ? 'V' : ''}</span> {opt}
                </div>
              ))}
            </div>
          ))}
        </div>

        {[
          ['C.2. Catatan Kasus (Jika ada)', formC.catatanKasus ?? '', (v: string) => setFormC((f) => ({ ...f, catatanKasus: v }))],
          ['C.3. Kesan-kesan Umum', formC.kesanUmum ?? '', (v: string) => setFormC((f) => ({ ...f, kesanUmum: v }))],
          ['C.4. Saran dan Pengembangan', formC.saranPengembangan ?? '', (v: string) => setFormC((f) => ({ ...f, saranPengembangan: v }))],
        ].map(([label, val, setter]) => (
          <div key={label as string} className="mb-4 print:break-inside-avoid">
            <label className="block text-sm font-semibold text-gray-800 mb-1 print:hidden">{label as string}</label>
            <textarea
              disabled={readOnly}
              value={val as string}
              onChange={(e) => (setter as any)(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden disabled:bg-gray-50"
            />
            <div className="hidden print:block border border-black p-2 text-xs min-h-[50px]">
              <div className="font-bold underline mb-1">{label as string}</div>
              {(val as string) || '-'}
            </div>
          </div>
        ))}

        {/* Tanda tangan */}
        <div className="border-t border-gray-300 pt-5 mt-6 print:hidden">
          <label className="block text-sm mb-4">
            <span className="text-gray-500">Tempat, Tanggal</span>
            <input
              disabled={readOnly}
              value={sig.tempatTanggal}
              onChange={(e) => setSig((s) => ({ ...s, tempatTanggal: e.target.value }))}
              placeholder="Jakarta, 13 Agustus 2026"
              className="w-full sm:w-64 block mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:bg-gray-50"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3 cursor-pointer">
                <input type="checkbox" disabled={readOnly} checked={sig.needBod1} onChange={(e) => setSig((s) => ({ ...s, needBod1: e.target.checked }))} className="w-4 h-4" />
                Perlu tanda tangan Atasan (BOD 1)?
              </label>
              {sig.needBod1 ? (
                <>
                  <input
                    disabled={readOnly}
                    value={sig.bod1Nama}
                    onChange={(e) => setSig((s) => ({ ...s, bod1Nama: e.target.value }))}
                    placeholder="Nama BOD 1"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm mb-2 disabled:bg-gray-50"
                  />
                  <input
                    disabled={readOnly}
                    value={sig.bod1Jabatan}
                    onChange={(e) => setSig((s) => ({ ...s, bod1Jabatan: e.target.value }))}
                    placeholder="Jabatan BOD 1"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:bg-gray-50"
                  />
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">Tidak diperlukan untuk evaluasi ini (tidak akan muncul di cetakan).</div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">Tanda Tangan Penilai (wajib)</div>
              <input
                disabled={readOnly}
                value={sig.penilaiNama}
                onChange={(e) => setSig((s) => ({ ...s, penilaiNama: e.target.value }))}
                placeholder="Nama Penilai"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm mb-2 disabled:bg-gray-50"
              />
              <input
                disabled={readOnly}
                value={sig.penilaiJabatan}
                onChange={(e) => setSig((s) => ({ ...s, penilaiJabatan: e.target.value }))}
                placeholder="Jabatan (contoh: Manager Divisi X)"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="hidden print:block mt-8 text-xs">
          <div className="mb-8 text-right">{sig.tempatTanggal || '.....................'}</div>
          {sig.needBod1 ? (
            <div className="flex justify-between">
              <div className="w-[48%] text-center">
                <div>&nbsp;</div>
                <div className="h-14"></div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">{sig.bod1Nama || '( ..................................... )'}</div>
                  <div>{sig.bod1Jabatan}</div>
                </div>
                <div className="text-[9px] mt-1 italic">(Tanda Tangan Atasan / BOD 1)</div>
              </div>
              <div className="w-[48%] text-center">
                <div>{emp.divisi}</div>
                <div className="h-14"></div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">{sig.penilaiNama || '( ..................................... )'}</div>
                  <div>{sig.penilaiJabatan}</div>
                </div>
                <div className="text-[9px] mt-1 italic">(Tanda Tangan Penilai)</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <div className="w-[48%] text-center">
                <div>{emp.divisi}</div>
                <div className="h-14"></div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold">{sig.penilaiNama || '( ..................................... )'}</div>
                  <div>{sig.penilaiJabatan}</div>
                </div>
                <div className="text-[9px] mt-1 italic">(Tanda Tangan Penilai)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
