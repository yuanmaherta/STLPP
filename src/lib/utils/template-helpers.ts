import type { FormGroup, FormTemplateStructure } from '@/types';

export function nextVersion(current: string): string {
  const m = current.match(/^v(\d+)\.(\d+)$/i);
  if (!m) return 'v1.1';
  const major = parseInt(m[1], 10);
  const minor = parseInt(m[2], 10) + 1;
  return `v${major}.${minor}`;
}

function filterGroup(g: FormGroup): FormGroup | null {
  if (g.items) {
    const items = g.items.filter((it) => it.active !== false);
    if (items.length === 0) return null;
    return { ...g, items };
  }
  if (g.subgroups) {
    const subgroups = g.subgroups
      .map((sg) => ({ ...sg, items: sg.items.filter((it) => it.active !== false) }))
      .filter((sg) => sg.items.length > 0);
    if (subgroups.length === 0) return null;
    return { ...g, subgroups };
  }
  return g;
}

/** Buang unsur yang dinonaktifkan admin — dipakai saat mengisi evaluasi BARU saja. */
export function filterActiveGroups(groups: FormGroup[]): FormGroup[] {
  return groups.map(filterGroup).filter((g): g is FormGroup => g !== null);
}

export function filterActiveStructure(structure: FormTemplateStructure): FormTemplateStructure {
  return {
    formA1: filterActiveGroups(structure.formA1),
    formA2: filterActiveGroups(structure.formA2),
    formB1: filterActiveGroups(structure.formB1),
    formB2: filterActiveGroups(structure.formB2),
  };
}

/** Nomor unsur berikutnya dalam satu daftar item, berdasarkan angka terakhir. */
export function nextItemNo(items: { no: string }[]): string {
  if (items.length === 0) return '1';
  const last = items[items.length - 1].no;
  const parts = last.split('.');
  const lastNum = parseInt(parts[parts.length - 1], 10);
  if (isNaN(lastNum)) return `${last}-baru`;
  parts[parts.length - 1] = String(lastNum + 1);
  return parts.join('.');
}
