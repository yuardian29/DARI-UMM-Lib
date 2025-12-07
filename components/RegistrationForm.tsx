import React, { useState } from 'react';
import { Button } from './Button';
import { Visitor } from '../types';
import { saveVisitorToSheet } from '../services/sheetService';
import { generateWelcomeMessage } from '../services/geminiService';
import { User, Mail, CreditCard, BookOpen, Phone, Building2 } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: (visitor: Visitor, greeting: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    memberId: '',
    purpose: 'Membaca',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Generate Greeting with Gemini (Parallel with save if you want, but sequential here for flow)
      const greeting = await generateWelcomeMessage(formData.name, formData.purpose);

      // 2. Construct Visitor Object with Auto-Generated ID
      const newVisitor: Visitor = {
        id: `LIB-${Date.now().toString().slice(-6)}`, // Simple auto-generated ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        school: formData.school,
        memberId: formData.memberId,
        purpose: formData.purpose,
        timestamp: new Date().toISOString(),
        aiGreeting: greeting
      };

      // 3. Save Data (Mock or Real Script)
      await saveVisitorToSheet(newVisitor);

      // 4. Callback
      onSuccess(newVisitor, greeting);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Terjadi kesalahan saat memproses data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "bg-white focus:ring-library-500 focus:border-library-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border text-gray-900 placeholder-gray-400 font-medium";

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-8 border border-gray-100">
      <div className="md:flex">
        <div className="p-8 w-full">
          <div className="uppercase tracking-wide text-sm text-library-500 font-semibold mb-6">Formulir Kunjungan</div>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className={inputClasses}
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor HP / WA</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className={inputClasses}
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700">Asal Sekolah / Instansi</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="school"
                    id="school"
                    className={inputClasses}
                    placeholder="Contoh: SMA 1..."
                    value={formData.school}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Opsional)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={inputClasses}
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">ID Anggota</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="memberId"
                    id="memberId"
                    className={inputClasses}
                    placeholder="Kosongkan jika tamu"
                    value={formData.memberId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Tujuan Kunjungan</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="purpose"
                    name="purpose"
                    className={inputClasses}
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    <option value="Membaca">Membaca di tempat</option>
                    <option value="Meminjam">Meminjam Buku</option>
                    <option value="Mengembalikan">Mengembalikan Buku</option>
                    <option value="Belajar">Belajar / Tugas</option>
                    <option value="Wifi">Akses Internet/Wifi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Check In & Dapatkan QR Masuk
              </Button>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Dengan check-in, Anda menyetujui tata tertib perpustakaan.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};