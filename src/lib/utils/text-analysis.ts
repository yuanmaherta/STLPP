// ====================================================================
// STLPP - TEXT ANALYSIS UTILITIES
// Word-frequency helper for the "kata kunci tersering" dashboard widget.
// ====================================================================

const STOPWORDS_ID = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'adalah', 'ini', 'itu',
  'dengan', 'atau', 'dalam', 'akan', 'juga', 'tidak', 'ada', 'sudah', 'saya',
  'kita', 'kami', 'mereka', 'dia', 'ia', 'nya', 'se', 'para', 'oleh', 'agar',
  'supaya', 'karena', 'jika', 'maka', 'sebagai', 'dapat', 'bisa', 'harus',
  'perlu', 'lebih', 'sangat', 'masih', 'belum', 'saat', 'ketika', 'serta',
  'antara', 'tersebut', 'tentang', 'tanpa', 'tetap', 'terus', 'sama',
  'beberapa', 'banyak', 'sedikit', 'sering', 'selalu', 'pernah', 'hanya',
  'saja', 'yaitu', 'yakni', 'agar', 'bagi', 'sudah', 'telah', 'sedang',
  'para', 'nya', 'kepada', 'terhadap', 'seperti', 'yg', 'dgn', 'utk',
]);

export interface KeywordCount {
  word: string;
  count: number;
}

export function topKeywords(texts: (string | null | undefined)[], limit = 10): KeywordCount[] {
  const freq = new Map<string, number>();

  for (const text of texts) {
    if (!text) continue;
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS_ID.has(w));

    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
