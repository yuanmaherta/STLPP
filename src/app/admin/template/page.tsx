import { createClient } from '@/lib/supabase/server';
import { getActiveTemplate } from '@/lib/data/template-loader';
import { TemplateEditorClient } from '@/components/template/template-editor-client';

export const dynamic = 'force-dynamic';

export default async function TemplateFormPage() {
  const supabase = createClient();
  const active = await getActiveTemplate(supabase);

  const { data: history } = await supabase
    .from('form_templates')
    .select('id, version, title, is_active, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Template Form Evaluasi</h1>
      <TemplateEditorClient initialStructure={active.structure} activeVersion={active.version} history={history ?? []} />
    </div>
  );
}
