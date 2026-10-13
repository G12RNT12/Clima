interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * Caché genérico en memoria con tiempo de expiración (TTL).
 * Reduce la latencia y protege contra límites de tasa de APIs externas.
 */
export class MemoryCache {
  private store = new Map<string, CacheItem<unknown>>();
  private readonly defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(defaultTtlSeconds = 600) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  /**
   * Obtiene un valor del caché si existe y no ha expirado.
   */
  public get<T>(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return item.value as T;
  }

  /**
   * Almacena un valor en el caché con un TTL opcional en segundos.
   */
  public set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Limpia todas las entradas almacenadas y reinicia contadores.
   */
  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Devuelve estadísticas actuales del caché.
   */
  public stats(): { size: number; hits: number; misses: number } {
    // Limpiar expirados antes de reportar el tamaño
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
      }
    }
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}
