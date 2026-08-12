// ====================================================================
// STLPP - EVALUATION SCORING UTILITIES
// Logic for score calculation, averages, and contract eligibility
// ====================================================================

import { IndicatorScoreMap, RecommendationType } from '@/types';

export const SCALE_VALUES = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

export function getScaleLabel(value: number): string {
  if (value === 100) return 'Sangat Baik';
  if (value === 90) return 'Baik';
  if (value >= 60) return 'Sedang';
  return 'Kurang';
}

export function getScaleBadgeColor(value: number): string {
  if (value === 100) return 'bg-emerald-600 text-white border-emerald-600';
  if (value === 90) return 'bg-green-600 text-white border-green-600';
  if (value >= 60) return 'bg-amber-500 text-white border-amber-500';
  return 'bg-red-600 text-white border-red-600';
}

export interface SectionStats {
  total: number;
  count: number;
  filledCount: number;
  avg: number;
}

export interface ScoringStats {
  formA: SectionStats;
  formB: SectionStats;
  grandTotal: number;
  grandCount: number;
  grandAvg: number;
  allFilled: boolean;
  eligible: boolean;
  recommendation: RecommendationType;
}

/**
 * Calculates total scores, section averages, and overall contract renewal eligibility.
 */
export function calculateEvaluationStats(
  scores: IndicatorScoreMap,
  aItemIds: string[],
  bItemIds: string[]
): ScoringStats {
  const calcSection = (itemIds: string[]): SectionStats => {
    const filled = itemIds.filter((id) => scores[id] !== undefined && scores[id] > 0);
    const total = filled.reduce((sum, id) => sum + (scores[id] || 0), 0);
    const count = itemIds.length;
    const filledCount = filled.length;
    const avg = count ? total / count : 0;
    return { total, count, filledCount, avg };
  };

  const formA = calcSection(aItemIds);
  const formB = calcSection(bItemIds);

  const grandTotal = formA.total + formB.total;
  const grandCount = formA.count + formB.count;
  const grandAvg = grandCount ? grandTotal / grandCount : 0;
  const allFilled =
    formA.count > 0 &&
    formB.count > 0 &&
    formA.filledCount === formA.count &&
    formB.filledCount === formB.count;

  // Ambang kelayakan perpanjangan kontrak (Skor >= 85)
  const eligible = grandAvg >= 85.0;

  return {
    formA,
    formB,
    grandTotal,
    grandCount,
    grandAvg: Number(grandAvg.toFixed(2)),
    allFilled,
    eligible,
    recommendation: eligible ? 'DI PERPANJANG' : 'TIDAK DI PERPANJANG',
  };
}
