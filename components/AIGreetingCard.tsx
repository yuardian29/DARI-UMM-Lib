import React, { useState } from 'react';
import { Sparkles, ArrowRight, Download } from 'lucide-react';
import { Button } from './Button';
import { Visitor } from '../types';
import { jsPDF } from "jspdf";

interface AIGreetingCardProps {
  visitor: Visitor;
  greeting: string;
  onNewRegistration: () => void;
}

export const AIGreetingCard: React.FC<AIGreetingCardProps> = ({ visitor, greeting, onNewRegistration }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Use a reliable public API for QR generation. 
  const qrData = `UMMLIB:${visitor.id}|${visitor.name}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  const getDataUrl = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120] // Ukuran tiket custom (kurang lebih A7/A6 kecil)
      });

      // --- Background ---
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 80, 120, 'F');
      
      // --- Header Strip ---
      // Changed to Orange RGB (approximate for #ea580c)
      doc.setFillColor(234, 88, 12); 
      doc.rect(0, 0, 80, 15, 'F');

      // --- Header Title ---
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("TIKET PERPUSTAKAAN", 40, 6, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("UMM LIBRARY TICKET", 40, 11, { align: "center" });

      // --- Visitor Name ---
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      // Membatasi panjang nama jika terlalu panjang
      const splitName = doc.splitTextToSize(visitor.name, 70);
      doc.text(splitName, 40, 25, { align: "center" });

      // --- QR Code ---
      try {
        const qrDataUrl = await getDataUrl(qrUrl);
        doc.addImage(qrDataUrl, 'PNG', 20, 30, 40, 40);
      } catch (e) {
        console.error("QR Load Error", e);
        doc.setFontSize(8);
        doc.setTextColor(255, 0, 0);
        doc.text("[Gagal memuat QR]", 40, 50, { align: "center" });
      }

      // --- ID Box ---
      doc.setFillColor(240, 240, 240);
      doc.rect(15, 75, 50, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.text(visitor.id, 40, 80, { align: "center" });

      // --- Details ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      const startY = 92;
      const lineHeight = 5;
      
      doc.text(`Tanggal: ${new Date(visitor.timestamp).toLocaleDateString()}`, 10, startY);
      doc.text(`Tujuan: ${visitor.purpose}`, 10, startY + lineHeight);
      if (visitor.school) {
        doc.text(`Instansi: ${visitor.school.substring(0, 30)}`, 10, startY + (lineHeight * 2));
      }

      // --- Footer ---
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 110, 70, 110);
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text("Simpan tiket ini untuk scan masuk/keluar.", 40, 115, { align: "center" });

      doc.save(`Tiket-${visitor.id}.pdf`);

    } catch (e) {
      console.error(e);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row gap-6 animate-fade-in-up">
      
      {/* Left Card: Welcome Message */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-library-100 p-8 text-center md:text-left">
        <div className="inline-flex items-center justify-center p-3 bg-library-100 rounded-full mb-6">
          <Sparkles className="h-8 w-8 text-library-600" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Selamat Datang, {visitor.name}
        </h2>
        
        <div className="my-6 p-6 bg-library-50 rounded-xl border border-library-100">
          <p className="text-lg text-gray-700 italic font-serif leading-relaxed">
            "{greeting}"
          </p>
          <div className="mt-4 flex items-center justify-start text-xs text-library-500 uppercase tracking-wider font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            Disarankan oleh Gemini AI
          </div>
        </div>

        <p className="text-gray-500 mb-8">
          Data kunjungan Anda telah berhasil dicatat. Silakan unduh tiket masuk Anda di bawah ini.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onNewRegistration} className="w-full sm:w-auto">
            Registrasi Pengunjung Lain <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            variant="secondary" 
            isLoading={isDownloading}
            className="w-full sm:w-auto"
          >
            Simpan Tiket (PDF) <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Card: QR Pass Preview */}
      <div className="w-full md:w-80 bg-white rounded-2xl shadow-xl border border-library-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-library-600"></div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">TIKET MASUK</h3>
        <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">UMM Library</p>
        
        <div className="bg-white p-2 border-2 border-gray-900 rounded-lg mb-4">
          <img 
            src={qrUrl} 
            alt="QR Code Masuk" 
            className="w-40 h-40 object-contain"
          />
        </div>
        
        <div className="text-center w-full">
          <p className="text-xs text-gray-400 uppercase">ID Pengunjung</p>
          <p className="text-xl font-mono font-bold text-library-700 tracking-wider">{visitor.id}</p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 w-full">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium text-gray-900">{new Date(visitor.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Tujuan</span>
                <span className="font-medium text-gray-900">{visitor.purpose}</span>
            </div>
            {visitor.school && (
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Instansi</span>
                    <span className="font-medium text-gray-900 truncate max-w-[120px]">{visitor.school}</span>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};