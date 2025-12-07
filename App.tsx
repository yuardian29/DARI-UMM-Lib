import React, { useState } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { VisitorList } from './components/VisitorList';
import { AIGreetingCard } from './components/AIGreetingCard';
import { AdminLogin } from './components/AdminLogin';
import { Visitor, ViewState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.REGISTER);
  const [lastVisitor, setLastVisitor] = useState<Visitor | null>(null);
  const [lastGreeting, setLastGreeting] = useState<string>('');
  
  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleRegistrationSuccess = (visitor: Visitor, greeting: string) => {
    setLastVisitor(visitor);
    setLastGreeting(greeting);
    setCurrentView(ViewState.SUCCESS);
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView(ViewState.REGISTER);
  };

  return (
    <div className="min-h-screen bg-library-50">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {currentView === ViewState.REGISTER && (
          <div className="flex flex-col items-center animate-fade-in-up">
             <div className="text-center mb-8 max-w-2xl">
                <h2 className="text-4xl font-serif font-bold text-library-900 mb-4">
                  Selamat Datang di UMM Library
                </h2>
                <p className="text-lg text-gray-600">
                  Silakan isi buku tamu digital kami. 
                  Sistem AI kami akan memberikan rekomendasi bacaan singkat untuk menemani kunjungan Anda.
                </p>
             </div>
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
          </div>
        )}

        {currentView === ViewState.SUCCESS && lastVisitor && (
          <AIGreetingCard 
            visitor={lastVisitor} 
            greeting={lastGreeting} 
            onNewRegistration={() => setCurrentView(ViewState.REGISTER)}
          />
        )}

        {currentView === ViewState.ADMIN && (
          <>
            {!isAdminLoggedIn ? (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            ) : (
              <VisitorList onLogout={handleLogout} />
            )}
          </>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} UMM Library System. Powered by React & Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;