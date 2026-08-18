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
  return `Dilakukan Perpanjangan Kontrak ${duration ?? '-'} Bulan`;
}

/**
 * Kolom mana di matriks "Keberlanjutan Kontrak Kerja" (Tidak diperpanjang /
 * 6 Bulan / 1 Tahun) yang harus ditandai. Durasi custom < 6 bulan tetap
 * masuk grup "6 Bulan" (bukan otomatis ke "1 Tahun"), custom > 6 bulan
 * (termasuk yang bukan tepat 12) masuk grup "1 Tahun".
 */
export function getDurationGroup(recommendation: string, duration: string | null): 'tidak' | 'enam' | 'setahun' {
  if (recommendation !== 'DI PERPANJANG') return 'tidak';
  if (duration === '6') return 'enam';
  if (duration === '12') return 'setahun';
  const num = duration ? parseInt(duration, 10) : NaN;
  if (!isNaN(num) && num < 6) return 'enam';
  return 'setahun';
}
