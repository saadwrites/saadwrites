import React, { useState, useEffect, useRef } from 'react';
import { PenTool, BookOpen, Mail, Settings, Download, Upload, User, Menu, X, PanelLeftClose } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  theme, 
  toggleTheme,
  onExportData,
  onImportData
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle responsive sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile, auto-open on desktop initially
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleNavClick = (view: ViewState) => {
    onChangeView(view);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    // Main Container: Fixed height (100dvh for mobile address bar support), hidden overflow to prevent body scroll
    <div className="h-[100dvh] w-full bg-paper text-ink font-sans flex transition-colors duration-300 overflow-hidden relative">
      
      {/* Floating Toggle Button (Visible when sidebar is closed or on mobile) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-[60] p-2.5 rounded-full bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-accent transition-all duration-300 ${isSidebarOpen && !isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title="মেনু খুলুন/বন্ধ করুন"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          flex-shrink-0 z-[50] h-full
          bg-white/95 dark:bg-stone-900/95 backdrop-blur-md
          border-r border-stone-200 dark:border-stone-800 
          flex flex-col transition-all duration-300 ease-in-out
          ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
          ${isSidebarOpen 
            ? 'translate-x-0 w-72 shadow-2xl md:shadow-none' 
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        {/* Sidebar Header - Sticky/Fixed within sidebar */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between whitespace-nowrap overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif tracking-tight text-stone-800 dark:text-stone-100 pl-1">saadwrites</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hidden md:block"
            title="মেনু লুকান"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items - Scrollable area */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden whitespace-nowrap">
          <button
            onClick={() => handleNavClick(ViewState.HOME)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.HOME
                ? 'bg-stone-800 text-white shadow-md dark:bg-stone-200 dark:text-stone-900'
                : 'hover:bg-stone-100 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="font-medium">ব্লগ</span>
          </button>

          <button
            onClick={() => handleNavClick(ViewState.EDITOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.EDITOR
                ? 'bg-stone-800 text-white shadow-md dark:bg-stone-200 dark:text-stone-900'
                : 'hover:bg-stone-100 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            <PenTool className="w-5 h-5 shrink-0" />
            <span className="font-medium">নতুন লেখা</span>
          </button>

          <button
            onClick={() => handleNavClick(ViewState.ABOUT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.ABOUT
                ? 'bg-stone-800 text-white shadow-md dark:bg-stone-200 dark:text-stone-900'
                : 'hover:bg-stone-100 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="font-medium">আমার পরিচিতি</span>
          </button>

          <button
            onClick={() => handleNavClick(ViewState.CONTACT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.CONTACT
                ? 'bg-stone-800 text-white shadow-md dark:bg-stone-200 dark:text-stone-900'
                : 'hover:bg-stone-100 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            <Mail className="w-5 h-5 shrink-0" />
            <span className="font-medium">যোগাযোগ</span>
          </button>

          {/* Settings Section */}
          <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800">
            <p className="px-4 text-xs font-bold text-stone-400 uppercase mb-2 flex items-center gap-2">
              <Settings className="w-3 h-3" /> সেটিংস ও ব্যাকআপ
            </p>
            
            <button
              onClick={() => { onExportData(); if(isMobile) setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 text-sm"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>ব্যাকআপ নিন</span>
            </button>

            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 text-sm"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>রিস্টোর করুন</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => { onImportData(e); if(isMobile) setIsSidebarOpen(false); }} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </nav>

        {/* Footer - Fixed at bottom of sidebar */}
        <div className="p-6 border-t border-stone-200 dark:border-stone-800 whitespace-nowrap overflow-hidden flex-shrink-0">
          <p className="text-xs text-stone-400 text-center truncate">
            &copy; {new Date().getFullYear()} saadwrites
          </p>
        </div>
      </aside>

      {/* Main Content Area - Scrollable independently */}
      <main className="flex-1 h-full overflow-y-auto bg-paper dark:bg-[#1a1a1a] transition-colors duration-300 w-full min-w-0 relative scroll-smooth">
        {/* Content container */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 pt-20 md:pt-12">
          {children}
        </div>
      </main>
    </div>
  );
};