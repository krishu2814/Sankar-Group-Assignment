export type SalesStatus =
  | "Converted"
  | "Interested"
  | "Follow-up Required"
  | "Not Interested"
  | "Demo Requested"
  | "No Response";

export type CallState = "idle" | "connecting" | "in-call" | "processing" | "completed";

export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export interface AISummary {
  overview: string;
  customerRequirements: string[];
  objections: string[];
  nextSteps: string;
  salesStatus: SalesStatus;
}

export interface CallRecord {
  id: string;
  timestamp: string; // ISO string
  durationSeconds: number;
  status: SalesStatus;
  transcripts: Message[];
  summary: AISummary | null;
  audioBlobUrl?: string; // in-memory or indexedDB reference
  audioBlob?: Blob;
}
