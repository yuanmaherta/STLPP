export function ageYearsOnly(birthDateStr?: string | null): string {
  if (!birthDateStr) return '-';
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return `${age} Tahun`;
}

export function sumScores(scores: Record<string, number> | null | undefined): number {
  if (!scores) return 0;
  return Object.values(scores).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
}

export function durasiLabel(recommendation: string, duration: string | null): string {
  if (recommendation !== 'DI PERPANJANG') return 'Tidak Diperpanjang';
  if (duration === '12') return 'Dilakukan Perpanjangan Kontrak 1 Tahun';
  if (duration === '6') return 'Dilakukan Perpanjangan Kontrak 6 Bulan';
  return `Dilakukan Perpanjangan Kontrak ${duration ?? '-'} Bulan (custom)`;
}
