import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EvaluasiFormClient } from '@/components/evaluasi/evaluasi-form-client';

export const dynamic = 'force-dynamic';

export default async function IsiFormEvaluasiPage({ params }: { params: { assignmentId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from('assignments')
    .select(
      'id, period, deadline, status, employee:employees(id, nik, nama, tgl_lahir, jabatan, divisi, bagian, masa_kerja, status_kontrak), evaluator:users(id, name, division)'
    )
    .eq('id', params.assignmentId)
    .single();

  // RLS sudah membatasi ini, tapi tetap validasi eksplisit supaya pesan errornya jelas
  if (!assignment || (assignment as any).evaluator?.id !== user?.id) {
    notFound();
  }

  let existingEvaluation = null;
  if ((assignment as any).status === 'COMPLETED') {
    const { data: evalData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('assignment_id', params.assignmentId)
      .single();
    existingEvaluation = evalData;
  }

  return (
    <EvaluasiFormClient
      assignment={assignment as any}
      existingEvaluation={existingEvaluation as any}
      evaluatorName={(assignment as any).evaluator?.name ?? ''}
    />
  );
}
