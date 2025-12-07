export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school?: string; // Asal Sekolah / Instansi
  memberId?: string;
  purpose: string; // e.g., "Reading", "Borrowing", "Studying", "Event"
  timestamp: string;
  aiGreeting?: string;
}

export enum ViewState {
  REGISTER = 'REGISTER',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN'
}

export const SHEET_URL = "https://docs.google.com/spreadsheets/d/1nEz96GDO6x4UW-L05UI_aYoll5Zq8Xb2i5MP_zw8gKA/edit?usp=sharing";

// Default Script URL provided for UMM Library
export const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSFcS03qMt84t0g-MrYYBD1J05EdU3Ixwd5ga3MYC6-aqBl2LY8q0sXTx-tI8CyvfM/exec";

// Key for local storage
export const GOOGLE_SCRIPT_URL_KEY = "lib_script_url";