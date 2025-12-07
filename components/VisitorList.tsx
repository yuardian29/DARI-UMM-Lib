import React, { useEffect, useState } from 'react';
import { Visitor, GOOGLE_SCRIPT_URL_KEY, SHEET_URL, DEFAULT_SCRIPT_URL } from '../types';
import { getLocalVisitors, fetchVisitorsFromSheet } from '../services/sheetService';
import { Search, Settings, Calendar, User, FileText, Download, HelpCircle, AlertCircle, Phone, Building2, LogOut, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';

interface VisitorListProps {
  onLogout?: () => void;
}

export const VisitorList: React.FC<VisitorListProps> = ({ onLogout }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [scriptUrl, setScriptUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Export State
  const [exportPeriod, setExportPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    setVisitors(getLocalVisitors());
    const storedUrl = localStorage.getItem(GOOGLE_SCRIPT_URL_KEY);
    // Use stored URL if available, otherwise use the default constant
    setScriptUrl(storedUrl || DEFAULT_SCRIPT_URL);
  }, []);

  const handleSaveScriptUrl = () => {
    localStorage.setItem(GOOGLE_SCRIPT_URL_KEY, scriptUrl);
    setShowSettings(false);
    alert('Google Apps Script URL disimpan!');
  };

  const handleSync = async () => {
    // If empty, it will fallback to DEFAULT_SCRIPT_URL inside the service, but let's ensure state is correct
    const urlToUse = scriptUrl || DEFAULT_SCRIPT_URL;

    setIsLoading(true);
    setError(null);
    try {
      const sheetData = await fetchVisitorsFromSheet(urlToUse);
      if (sheetData && sheetData.length > 0) {
        // Merge strategy: prioritize sheet data, fall back to local if sheet is empty (unlikely if connection works)
        setVisitors(sheetData.reverse()); // Usually sheet has oldest first, we want newest first
      } else {
        alert("Tidak ada data ditemukan di Sheet atau format data tidak sesuai.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data dari Google Sheet. Pastikan URL Script benar dan deployment sudah 'Anyone'.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocalData = () => {
    if (confirm("Apakah Anda yakin ingin menghapus cache data lokal? Ini tidak akan menghapus data di Google Sheet.")) {
      localStorage.removeItem('library_visitors');
      setVisitors([]);
    }
  };

  const filterVisitorsByPeriod = (data: Visitor[], period: string) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return data.filter(v => {
      const vDate = new Date(v.timestamp);
      
      if (isNaN(vDate.getTime())) return false;

      if (period === 'daily') {
        return vDate >= todayStart && vDate < new Date(todayStart.getTime() + 86400000);
      }
      if (period === 'weekly') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return vDate >= oneWeekAgo;
      }
      if (period === 'monthly') {
        return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  };

  const handleExportCSV = () => {
    const dataToExport = filterVisitorsByPeriod(visitors, exportPeriod);
    
    if (dataToExport.length === 0) {
        alert(`Tidak ada data untuk periode: ${exportPeriod}`);
        return;
    }

    const headers = ["ID", "Nama", "Email", "No HP", "Instansi", "ID Anggota", "Tujuan", "Waktu Check-in", "Pesan AI"];
    const rows = dataToExport.map(v => [
        v.id,
        `"${v.name.replace(/"/g, '""')}"`,
        v.email,
        `'${v.phone || ""}`, // Quote to prevent scientific notation
        `"${(v.school || "").replace(/"/g, '""')}"`,
        v.memberId,
        v.purpose,
        new Date(v.timestamp).toLocaleString('id-ID'),
        `"${(v.aiGreeting || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Pengunjung_${exportPeriod}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-gray-900 font-serif">Dashboard Admin</h2>
             <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-library-100 text-library-800">
               Logged in
             </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data pengunjung dan sinkronisasi spreadsheet.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {onLogout && (
            <Button variant="outline" onClick={onLogout} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-gray-500">Total Pengunjung</p>
                <p className="text-2xl font-bold text-gray-900">{visitors.length}</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <User className="w-6 h-6" />
             </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-gray-500">Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                    {filterVisitorsByPeriod(visitors, 'daily').length}
                </p>
             </div>
             <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                <Calendar className="w-6 h-6" />
             </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                <p className="text-sm text-gray-500">Koneksi Sheet</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                  {scriptUrl === DEFAULT_SCRIPT_URL ? 'Default Link' : 'Custom Link'}
                </p>
             </div>
             <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Settings className="w-6 h-6" />
             </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-start lg:items-center">
        
        {/* Sync & Config Group */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Button variant="secondary" onClick={handleSync} isLoading={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              Ambil dari Sheet
            </Button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Konfigurasi
            </button>
            <button 
              onClick={handleClearLocalData}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
            </button>
        </div>

        {/* Export Group */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="flex items-center px-2">
                <FileSpreadsheet className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Export:</span>
            </div>
            <select 
                value={exportPeriod} 
                onChange={(e) => setExportPeriod(e.target.value as any)}
                className="block w-full sm:w-auto pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-library-500 focus:border-library-500 sm:text-sm rounded-md"
            >
                <option value="all">Semua Data</option>
                <option value="daily">Harian (Hari Ini)</option>
                <option value="weekly">Mingguan (7 Hari)</option>
                <option value="monthly">Bulanan (Bulan Ini)</option>
            </select>
            <Button onClick={handleExportCSV} className="w-full sm:w-auto text-sm">
                Unduh CSV
            </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {showSettings && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-fade-in-up">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-library-600" />
            Integrasi Google Sheet
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Apps Script Web App URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder={DEFAULT_SCRIPT_URL}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-library-500 focus:ring-library-500 sm:text-sm p-2 border"
              />
              <Button onClick={handleSaveScriptUrl}>Simpan</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Default URL: {DEFAULT_SCRIPT_URL} <br/>
              Sheet URL: <a href={SHEET_URL} target="_blank" className="text-blue-600 hover:underline">{SHEET_URL}</a>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              Panduan Pembuatan Script (Jika menggunakan Sheet Baru)
            </h4>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1 ml-1 mb-3">
              <li>Buka Google Sheet Anda.</li>
              <li>Klik menu <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus kode yang ada, lalu salin & tempel kode di bawah ini.</li>
              <li>Klik <strong>Deploy</strong> &gt; <strong>New deployment</strong>.</li>
              <li>Pilih type <strong>Web app</strong>.</li>
              <li>Execute as: <strong>Me</strong>, Who has access: <strong>Anyone</strong> (Wajib).</li>
              <li>Klik <strong>Deploy</strong>, salin URL, dan tempel di atas.</li>
            </ol>
            <div className="bg-gray-800 rounded p-3 overflow-x-auto">
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
{`function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var data = rows.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(header, i) {
      // Create key from header
      var key = String(header).replace(/\\s+/g, '').replace(/^./, function(str){ return str.toLowerCase(); });
      obj[key] = row[i];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  // Order: ID, Name, Email, Phone, School, MemberID, Purpose, Timestamp, AI Greeting
  sheet.appendRow([
    data.id, 
    data.name, 
    data.email, 
    data.phone, 
    data.school, 
    data.memberId, 
    data.purpose, 
    data.timestamp, 
    data.aiGreeting
  ]);
  return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {visitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Data tidak ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">Belum ada data lokal. Coba klik "Ambil dari Sheet".</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {visitors.map((visitor, idx) => (
              <li key={visitor.id || idx} className="hover:bg-gray-50 transition duration-150">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-library-100 flex items-center justify-center text-library-600 font-bold text-lg">
                          {visitor.name ? visitor.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      </div>
                      <div className="ml-4 truncate">
                        <div className="flex items-center">
                             <div className="text-sm font-medium text-library-700 truncate">{visitor.name}</div>
                             <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 font-mono">#{visitor.id}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 gap-y-1 sm:gap-x-4">
                          <div className="flex items-center">
                            <User className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                            {visitor.memberId || 'Guest'}
                          </div>
                          
                          {visitor.school && (
                             <div className="flex items-center">
                                <Building2 className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate max-w-[150px]">{visitor.school}</span>
                             </div>
                          )}

                          {visitor.phone && (
                             <div className="flex items-center">
                                <Phone className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                                {visitor.phone}
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-1">
                        {visitor.purpose}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-3 w-3 text-gray-400" />
                        {visitor.timestamp ? new Date(visitor.timestamp).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </div>
                  {visitor.aiGreeting && (
                    <div className="mt-2 sm:flex sm:justify-between bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="sm:flex w-full">
                        <p className="flex items-start text-sm text-gray-600 italic w-full">
                          <FileText className="flex-shrink-0 mr-2 h-4 w-4 text-library-400 mt-0.5" />
                          "{visitor.aiGreeting}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};