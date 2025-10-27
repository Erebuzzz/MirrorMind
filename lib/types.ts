export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  summary: string;
  mood: string;
  reflection: string;
}

export interface AnalysisResult {
  summary: string;
  mood: string;
  reflection: string;
}
