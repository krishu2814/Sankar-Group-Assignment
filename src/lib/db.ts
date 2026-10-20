import { CallRecord } from "@/types";

const DB_NAME = "salespulse_db";
const DB_VERSION = 1;
const STORE_NAME = "calls";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCallRecord(record: CallRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // If audioBlob is present, store it directly in IndexedDB.
    // Strip audioBlobUrl before persisting because object URLs are transient and expire after page unload.
    const recordToSave = {
      ...record,
      audioBlobUrl: undefined,
    };

    const req = store.put(recordToSave);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCallRecords(): Promise<CallRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const records: CallRecord[] = req.result || [];
      // Re-hydrate audioBlobUrl from audioBlob
      const hydratedRecords = records.map((r) => {
        if (r.audioBlob && !r.audioBlobUrl) {
          return {
            ...r,
            audioBlobUrl: URL.createObjectURL(r.audioBlob),
          };
        }
        return r;
      });

      // Sort newest first
      hydratedRecords.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      resolve(hydratedRecords);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function deleteCallRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllCalls(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
