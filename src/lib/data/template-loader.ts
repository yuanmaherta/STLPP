import { DEFAULT_FORM_STRUCTURE } from './form-default';
import type { FormTemplateStructure } from '@/types';

const FALLBACK_VERSION = 'v1.0';

export async function getActiveTemplate(
  supabase: any
): Promise<{ id: string | null; version: string; title: string; structure: FormTemplateStructure }> {
  const { data } = await supabase
    .from('form_templates')
    .select('id, version, title, structure')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    return { id: data.id, version: data.version, title: data.title, structure: data.structure };
  }
  return { id: null, version: FALLBACK_VERSION, title: 'Form Evaluasi PKWT (bawaan sistem)', structure: DEFAULT_FORM_STRUCTURE };
}

export async function getTemplateByVersion(supabase: any, version: string): Promise<FormTemplateStructure> {
  const { data } = await supabase.from('form_templates').select('structure').eq('version', version).maybeSingle();
  if (data) return data.structure;
  // Versi lama sebelum fitur Template Form ada, atau belum pernah di-seed ke DB
  return DEFAULT_FORM_STRUCTURE;
}
