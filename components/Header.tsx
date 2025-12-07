import React from 'react';
import { BookOpen, Table, UserPlus } from 'lucide-react';
import { ViewState, SHEET_URL } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate(ViewState.REGISTER)}
          >
            <BookOpen className="h-8 w-8 text-library-600" />
            <h1 className="ml-3 text-xl font-serif font-bold text-gray-900 tracking-tight">
              UMM Library
            </h1>
          </div>
          <nav className="flex space-x-4">
            <button
              onClick={() => onNavigate(ViewState.REGISTER)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === ViewState.REGISTER 
                  ? 'text-library-700 bg-library-50' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserPlus size={16} />
                <span>Registrasi</span>
              </div>
            </button>
            <button
              onClick={() => onNavigate(ViewState.ADMIN)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === ViewState.ADMIN 
                  ? 'text-library-700 bg-library-50' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Table size={16} />
                <span>Data Pengunjung</span>
              </div>
            </button>
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              <span>Google Sheet</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};