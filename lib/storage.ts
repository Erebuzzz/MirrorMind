import type { JournalEntry } from "./types";

const STORAGE_KEY = "mirrormind_reflections";
const USE_API_KEY = "mirrormind_use_api";

export function shouldUseAPI(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(USE_API_KEY);
  return stored === "true";
}

export function setUseAPI(useAPI: boolean): void {
  localStorage.setItem(USE_API_KEY, useAPI.toString());
}

export async function saveReflection(entry: Omit<JournalEntry, "id" | "date">): Promise<JournalEntry> {
  const newEntry: JournalEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...entry,
  };

  if (shouldUseAPI()) {
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: entry.text,
          userId: "anonymous",
          useHuggingFace: false,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        console.error("API save failed, falling back to localStorage");
        saveToLocalStorage(newEntry);
        return newEntry;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
      saveToLocalStorage(newEntry);
      return newEntry;
    }
  } else {
    saveToLocalStorage(newEntry);
    return newEntry;
  }
}

function saveToLocalStorage(entry: JournalEntry): void {
  const entries = getLocalStorageReflections();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getLocalStorageReflections(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function getReflections(): Promise<JournalEntry[]> {
  if (shouldUseAPI()) {
    try {
      const response = await fetch("/api/entries?userId=anonymous");
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        console.error("API fetch failed, falling back to localStorage");
        return getLocalStorageReflections();
      }
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
      return getLocalStorageReflections();
    }
  } else {
    return getLocalStorageReflections();
  }
}

export async function clearAllReflections(): Promise<void> {
  if (shouldUseAPI()) {
    try {
      await fetch("/api/entries?userId=anonymous&deleteAll=true", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("API delete error:", error);
    }
  }
  
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncLocalToAPI(): Promise<void> {
  const localEntries = getLocalStorageReflections();
  
  if (localEntries.length === 0) return;

  try {
    for (const entry of localEntries) {
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: entry.text,
          summary: entry.summary,
          mood: entry.mood,
          reflection: entry.reflection,
          userId: "anonymous",
          useHuggingFace: false,
        }),
      });
    }
    
    console.log(`Synced ${localEntries.length} entries to API`);
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}
