import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModelSelector from './ModelSelector';
import { BarChart3, LogOut, Home, FileText, Upload, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/update-data', label: 'New Predictions', icon: Upload },
    { path: '/review-records', label: 'History', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-lg border-r fixed h-full flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-5 h-1 bg-red-500 absolute"></div>
                  <div className="w-1 h-5 bg-red-500 absolute"></div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">DiabetesPredict</h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">Risk Assessment</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === path
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{user?.firstName}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap">User Account</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center px-8">
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'History'}
            </h2>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <h3 className="text-base font-semibold text-gray-800">
              Model Used
            </h3>
            <ModelSelector />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 DiabetesPredict. Educational and informational use only.
            <br />
            Not intended as a substitute for professional medical advice.
          </p>
        </footer>
      </div>
    </div>
  );
}