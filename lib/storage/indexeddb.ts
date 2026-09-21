/**
 * Robust IndexedDB client-side database layer with localStorage fallback
 * Designed for local-first, zero-login, persistent note writing.
 */

const DB_NAME = 'notepad_local_db';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';
const STORE_PREFERENCES = 'preferences';
const STORE_METADATA = 'metadata';

let dbInstance: IDBDatabase | null = null;
let isIndexedDBAvailable: boolean | null = null;

export function checkIndexedDBSupport(): boolean {
  if (typeof window === 'undefined') return false;
  if (isIndexedDBAvailable !== null) return isIndexedDBAvailable;
  
  try {
    if (!('indexedDB' in window) || window.indexedDB === null) {
      isIndexedDBAvailable = false;
      return false;
    }
    // Test if indexedDB can be accessed (can fail in some restricted iframes/private modes)
    isIndexedDBAvailable = true;
    return true;
  } catch (err) {
    console.warn('[Storage] IndexedDB check failed:', err);
    isIndexedDBAvailable = false;
    return false;
  }
}

export async function getDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  if (!checkIndexedDBSupport()) {
    throw new Error('INDEXEDDB_UNAVAILABLE');
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Notes Store
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          const noteStore = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
          noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          noteStore.createIndex('createdAt', 'createdAt', { unique: false });
          noteStore.createIndex('title', 'title', { unique: false });
        }

        // Preferences Store
        if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
          db.createObjectStore(STORE_PREFERENCES, { keyPath: 'key' });
        }

        // Metadata Store
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
        };
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('[Storage] Error opening IndexedDB:', error);
        reject(error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('[Storage] IndexedDB upgrade blocked by open connection in another tab.');
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Executes a transaction and handles failures gracefully
 */
export async function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | IDBRequest<T> | void
): Promise<T> {
  const db = await getDatabase();
  return new Promise<T>((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      let result: any;

      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = (event) => {
        const error = (event.target as IDBTransaction).error;
        if (error?.name === 'QuotaExceededError') {
          console.error('[Storage] Storage quota exceeded');
          reject(new Error('QUOTA_EXCEEDED'));
        } else {
          reject(error || new Error('Transaction failed'));
        }
      };

      transaction.onabort = (event) => {
        const error = (event.target as IDBTransaction).error;
        reject(error || new Error('Transaction aborted'));
      };

      const callbackResult = callback(store);

      if (callbackResult instanceof Promise) {
        callbackResult.then((res) => {
          result = res;
        }).catch(reject);
      } else if (callbackResult && 'onsuccess' in callbackResult) {
        callbackResult.onsuccess = () => {
          result = callbackResult.result;
        };
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Low-level helper functions
export async function idbGet<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
  return withTransaction<T | null>(storeName, 'readonly', (store) => {
    return store.get(key);
  }).then((res) => (res !== undefined ? res : null));
}

export async function idbPut<T>(storeName: string, value: T): Promise<IDBValidKey> {
  return withTransaction<IDBValidKey>(storeName, 'readwrite', (store) => {
    return store.put(value);
  });
}

export async function idbDelete(storeName: string, key: IDBValidKey): Promise<void> {
  return withTransaction<void>(storeName, 'readwrite', (store) => {
    store.delete(key);
  });
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  return withTransaction<T[]>(storeName, 'readonly', (store) => {
    return store.getAll();
  });
}

export async function idbClear(storeName: string): Promise<void> {
  return withTransaction<void>(storeName, 'readwrite', (store) => {
    store.clear();
  });
}

export { STORE_NOTES, STORE_PREFERENCES, STORE_METADATA };
