import { FileEdit } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function TemplateFormPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Template Form Evaluasi</h1>
      <ComingSoon
        title="Form Builder Kompetensi"
        description="Editor untuk menambah/mengubah/menonaktifkan indikator kompetensi dengan sistem versi akan tampil di sini, tersambung ke tabel form_templates."
        icon={FileEdit}
      />
    </div>
  );
}
