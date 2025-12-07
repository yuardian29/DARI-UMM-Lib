import React, { useState } from 'react';
import { Lock, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for better UX feel
    setTimeout(() => {
      if (username === 'admin' && password === 'DARI-UMM') {
        onLoginSuccess();
      } else {
        setError('Username atau Password salah!');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100 sm:px-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
          <div className="h-12 w-12 bg-library-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-library-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk untuk mengelola data pengunjung
          </p>
        </div>

        <form className="mb-0 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus:ring-library-500 focus:border-library-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:ring-library-500 focus:border-library-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-library-600 hover:bg-library-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-library-500"
            >
              Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
