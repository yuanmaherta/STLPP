// ====================================================================
// STLPP - DIGITAL CONTRACT RENEWAL EVALUATION SYSTEM
// Central TypeScript Interfaces & Types Definitions
// ====================================================================

export type UserRole = 'ADMIN' | 'ATASAN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  division?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  nik: string;
  nama: string;
  tgl_lahir?: string;
  jabatan: string;
  divisi: string;
  bagian?: string;
  masa_kerja?: string;
  status_kontrak: string; // e.g., 'Kontrak 1', 'Kontrak 2'
  tgl_habis_kontrak: string;
  atasan_id?: string;
  atasan_nama?: string;
  created_at: string;
}

export type AssignmentStatus = 'UNASSIGNED' | 'PENDING' | 'COMPLETED';

export interface EvaluationAssignment {
  id: string;
  employee_id: string;
  evaluator_id: string;
  period: string; // e.g., '2026-08'
  deadline: string;
  status: AssignmentStatus;
  assigned_at: string;
  employee?: Employee;
  evaluator?: UserProfile;
}

export interface IndicatorScoreMap {
  [indicatorId: string]: number; // Scale: 10, 20, ..., 100
}

export type RecommendationType = 'DI PERPANJANG' | 'TIDAK DI PERPANJANG';

export interface FormCData {
  kinerja: 'Baik' | 'Sedang' | 'Kurang' | '';
  kinerjaCatatan?: string;
  potensi: 'Baik' | 'Sedang' | 'Kurang' | '';
  potensiCatatan?: string;
  pengembangan: 'Baik' | 'Sedang' | 'Kurang' | '';
  catatanKasus?: string;
  kesanUmum?: string;
  saranPengembangan?: string;
}

export interface EvaluationResult {
  id: string;
  assignment_id: string;
  template_version: string;
  scores: IndicatorScoreMap;
  grand_avg: number;
  recommendation: RecommendationType;
  duration?: string; // '12', '6', or custom
  form_c_data: FormCData;
  tna_categories?: string[];
  submitted_at: string;
}

export interface FormItem {
  id: string;
  no: string;
  label: string;
  active?: boolean; // default true kalau tidak diisi; false = dinonaktifkan admin
}

export interface FormSubgroup {
  label: string;
  items: FormItem[];
}

export interface FormGroup {
  group: string;
  no?: number;
  items?: FormItem[];
  subgroups?: FormSubgroup[];
}

export interface FormTemplateStructure {
  formA1: FormGroup[];
  formA2: FormGroup[];
  formB1: FormGroup[];
  formB2: FormGroup[];
}

export interface FormTemplate {
  id: string;
  version: string;
  title: string;
  is_active: boolean;
  structure: FormTemplateStructure;
  created_at: string;
}
