interface CacheItem {
  count: number;
  expiresAt: number;
}

// In-memory cache map untuk menampung cache tiap model: { "user": {...}, "room": {...} }
const countCache = new Map<string, CacheItem>();

export interface CountableModel<TWhere = unknown> {
  count(args?: { where?: TWhere }): Promise<number>;
}

export interface CachedCountOptions<TWhere = unknown> {
  modelName: string;
  model: CountableModel<TWhere>;
  where?: TWhere;
  ttlSeconds?: number;
}

/**
 * Menghitung total data dengan in-memory cache jika tanpa filter.
 * Jika query memiliki filter (search, filter field, dll), query count dieksekusi langsung ke database.
 */
export async function getCachedCount<TWhere = unknown>({
  modelName,
  model,
  where,
  ttlSeconds = 60,
}: CachedCountOptions<TWhere>): Promise<number> {
  const hasFilter = where && Object.keys(where).length > 0;

  // 1. Jika ada filter, hitung langsung dari database (tidak di-cache)
  if (hasFilter) {
    return await model.count({ where });
  }

  // 2. Jika tanpa filter, cek apakah cache masih valid
  const now = Date.now();
  const cached = countCache.get(modelName);

  if (cached && cached.expiresAt > now) {
    return cached.count;
  }

  // 3. Cache miss atau sudah kadaluarsa -> ambil data dari database dan simpan di cache
  const count = await model.count();
  countCache.set(modelName, {
    count,
    expiresAt: now + ttlSeconds * 1000,
  });

  return count;
}

/**
 * Mereset cache count untuk model tertentu (misal setelah insert/delete)
 */
export function invalidateCountCache(modelName: string): void {
  countCache.delete(modelName);
}

/**
 * Mereset seluruh cache count yang ada
 */
export function clearAllCountCache(): void {
  countCache.clear();
}
