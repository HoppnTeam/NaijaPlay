interface CacheItem<T> {
  data: T
  timestamp: number
}

const DEFAULT_CACHE_DURATION = 1000 * 60 * 5 // 5 minutes

export class Cache {
  private prefix: string
  private cacheDuration: number

  constructor(prefix = 'naija_plays_', cacheDuration = DEFAULT_CACHE_DURATION) {
    this.prefix = prefix
    this.cacheDuration = cacheDuration

    // Listen for storage events to sync across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this))
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key?.startsWith(this.prefix)) {
      // Trigger any necessary UI updates
      window.dispatchEvent(new CustomEvent('cache-update', {
        detail: {
          key: event.key,
          newValue: event.newValue
        }
      }))
    }
  }

  set<T>(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(item))
      // Notify other tabs
      window.dispatchEvent(new CustomEvent('cache-update', {
        detail: {
          key: this.getKey(key),
          newValue: JSON.stringify(item)
        }
      }))
    } catch (error) {
      console.warn('Cache write failed:', error)
      this.clearOldItems() // Try to free up space
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const { data, timestamp } = JSON.parse(item) as CacheItem<T>
      if (Date.now() - timestamp > this.cacheDuration) {
        this.remove(key)
        return null
      }

      return data
    } catch (error) {
      console.warn('Cache read failed:', error)
      return null
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
    // Notify other tabs
    window.dispatchEvent(new CustomEvent('cache-update', {
      detail: {
        key: this.getKey(key),
        newValue: null
      }
    }))
  }

  clearAll(): void {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
    
    keys.forEach(key => localStorage.removeItem(key))
    
    // Notify other tabs
    window.dispatchEvent(new CustomEvent('cache-update', {
      detail: {
        key: this.prefix,
        newValue: null,
        clearAll: true
      }
    }))
  }

  private clearOldItems(): void {
    const now = Date.now()
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '')
          if (now - item.timestamp > this.cacheDuration) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          localStorage.removeItem(key) // Remove invalid items
        }
      })
  }
}

// Create default cache instance
export const cache = new Cache()

// Helper functions for common cache durations
export const createShortCache = () => new Cache('naija_plays_short_', 1000 * 60) // 1 minute
export const createLongCache = () => new Cache('naija_plays_long_', 1000 * 60 * 60) // 1 hour 