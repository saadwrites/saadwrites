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

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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
    <div className="h-[100dvh] w-full bg-cream dark:bg-[#0f0f0f] text-charcoal dark:text-stone-200 font-sans flex transition-colors duration-500 overflow-hidden relative">
      
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-6 left-6 z-[60] text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-all duration-300 ${isSidebarOpen && !isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title="মেনু"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[40] backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Premium Dark Style */}
      <aside 
        className={`
          flex-shrink-0 z-[50] h-full
          bg-[#1c1917] text-stone-300
          border-r border-stone-800 shadow-2xl
          flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
          ${isSidebarOpen 
            ? 'translate-x-0 w-80' 
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-8 pt-10 flex items-center justify-between whitespace-nowrap overflow-hidden flex-shrink-0 border-b border-stone-800">
          <div>
            <h1 className="text-3xl font-bold font-kalpurush tracking-wide text-white">saadwrites</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold mt-1">শব্দ যেখানে কথা বলে</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-500 hover:text-white hidden md:block transition-colors"
            title="মেনু লুকান"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden whitespace-nowrap scrollbar-hide">
          <NavButton 
            active={currentView === ViewState.HOME} 
            onClick={() => handleNavClick(ViewState.HOME)} 
            icon={<BookOpen className="w-4 h-4" />} 
            label="পাঠাগার" 
            subLabel="আমার রচনাবলী"
          />
          <NavButton 
            active={currentView === ViewState.EDITOR} 
            onClick={() => handleNavClick(ViewState.EDITOR)} 
            icon={<PenTool className="w-4 h-4" />} 
            label="নুতন সৃষ্টি" 
            subLabel="লেখা শুরু করুন"
          />
          <NavButton 
            active={currentView === ViewState.ABOUT} 
            onClick={() => handleNavClick(ViewState.ABOUT)} 
            icon={<User className="w-4 h-4" />} 
            label="লেখক পরিচিতি" 
            subLabel="আমার সম্পর্কে"
          />
          <NavButton 
            active={currentView === ViewState.CONTACT} 
            onClick={() => handleNavClick(ViewState.CONTACT)} 
            icon={<Mail className="w-4 h-4" />} 
            label="যোগাযোগ" 
            subLabel="বার্তা পাঠান"
          />

          {/* Settings Section */}
          <div className="pt-8 mt-8 border-t border-stone-800 mx-2">
            <p className="px-4 text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              সেটিংস
            </p>
            
            <button
              onClick={() => { onExportData(); if(isMobile) setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all duration-300 group"
            >
              <Download className="w-4 h-4 shrink-0 group-hover:text-gold transition-colors" />
              <span className="text-sm font-medium">ব্যাকআপ নিন</span>
            </button>

            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all duration-300 group"
            >
              <Upload className="w-4 h-4 shrink-0 group-hover:text-gold transition-colors" />
              <span className="text-sm font-medium">রিস্টোর করুন</span>
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

        {/* Footer */}
        <div className="p-8 border-t border-stone-800 whitespace-nowrap overflow-hidden flex-shrink-0 bg-[#161413]">
          <p className="text-xs text-stone-600 font-serif italic">
            &copy; {new Date().getFullYear()} SaadWrites.<br/>All rights reserved.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-cream dark:bg-[#0f0f0f] transition-colors duration-500 w-full min-w-0 relative scroll-smooth">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-24 md:py-24">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, subLabel }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, subLabel?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group border border-transparent ${
      active
        ? 'bg-stone-800 text-white border-stone-700 shadow-lg'
        : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
    }`}
  >
    <span className={`p-2 rounded-md transition-colors ${active ? 'bg-gold text-white' : 'bg-stone-900 group-hover:bg-stone-700'}`}>
      {icon}
    </span>
    <div className="text-left">
      <span className={`block text-sm font-bold font-kalpurush tracking-wide ${active ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>
        {label}
      </span>
      {subLabel && <span className="text-[10px] text-stone-600 group-hover:text-stone-500">{subLabel}</span>}
    </div>
  </button>
);