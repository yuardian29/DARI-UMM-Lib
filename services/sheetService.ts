import { Visitor, GOOGLE_SCRIPT_URL_KEY, DEFAULT_SCRIPT_URL } from '../types';

// Function to read visitors from the Google Sheet via Apps Script
export const fetchVisitorsFromSheet = async (scriptUrl: string): Promise<Visitor[]> => {
  // Use provided URL or fallback to default
  const targetUrl = scriptUrl || DEFAULT_SCRIPT_URL;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Map the raw sheet data to our Visitor type
    // Handles various casing scenarios in the JSON response
    return data.map((item: any) => ({
      id: item.id || item.ID || String(Math.random()),
      name: item.name || item.Name || 'Unknown',
      email: item.email || item.Email || '',
      phone: item.phone || item.Phone || '',
      school: item.school || item.School || '',
      memberId: item.memberId || item['Member ID'] || item.memberid || '',
      purpose: item.purpose || item.Purpose || 'Membaca',
      timestamp: item.timestamp || item.Timestamp || new Date().toISOString(),
      aiGreeting: item.aiGreeting || item['AI Greeting'] || item.aigreeting || ''
    }));
  } catch (error) {
    console.error("Error fetching from sheet", error);
    throw error;
  }
};

export const saveVisitorToSheet = async (visitor: Visitor): Promise<boolean> => {
  // 1. Save to LocalStorage for immediate UI persistence demo
  try {
    const existingData = localStorage.getItem('library_visitors');
    const visitors: Visitor[] = existingData ? JSON.parse(existingData) : [];
    visitors.unshift(visitor); // Add to top
    localStorage.setItem('library_visitors', JSON.stringify(visitors));
  } catch (e) {
    console.error("Local storage error", e);
  }

  // 2. Attempt to send to Google Sheets via Apps Script (using Default or Configured)
  const scriptUrl = localStorage.getItem(GOOGLE_SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
  
  if (scriptUrl) {
    try {
      // Using 'no-cors' mode is required for simple POST requests to Apps Script
      // without preflight checks, unless the script explicitly handles OPTIONS.
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitor),
      });
      console.log("Sent to Google Sheet Script");
      return true;
    } catch (error) {
      console.error("Failed to send to sheet", error);
      // We return true anyway because we saved locally and don't want to block the user
      return true;
    }
  }

  // If no script URL, just resolve
  return new Promise((resolve) => resolve(true));
};

export const getLocalVisitors = (): Visitor[] => {
  try {
    const data = localStorage.getItem('library_visitors');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};