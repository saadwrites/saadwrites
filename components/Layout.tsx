import React, { useState, useEffect, useRef } from 'react';
import { PenTool, BookOpen, Mail, Download, Upload, User as UserIcon, Menu, X, PanelLeftClose, Eye, CheckCircle, AlertCircle, Info, Lock, Unlock, BarChart2, LogIn, LogOut } from 'lucide-react';
import { ViewState, Toast, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalVisits: number;
  toasts: Toast[];
  removeToast: (id: string) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  theme, 
  toggleTheme,
  onExportData,
  onImportData,
  totalVisits,
  toasts,
  removeToast,
  isAdmin,
  toggleAdmin,
  user,
  onLogout
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
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl animate-slide-up min-w-[300px] border-l-4 ${
              toast.type === 'success' ? 'bg-white dark:bg-stone-900 border-green-500 text-charcoal dark:text-white' :
              toast.type === 'error' ? 'bg-white dark:bg-stone-900 border-red-500 text-charcoal dark:text-white' :
              'bg-charcoal text-white border-gold'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-gold" />}
            <p className="text-sm font-bold font-sans">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-auto text-stone-400 hover:text-charcoal dark:hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

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

      {/* Sidebar Navigation */}
      <aside 
        className={`
          flex-shrink-0 z-[50] h-full
          bg-white dark:bg-[#1c1917] 
          text-charcoal dark:text-stone-300
          border-r border-stone-200 dark:border-stone-800 shadow-2xl
          flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
          ${isSidebarOpen 
            ? 'translate-x-0 w-80' 
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-8 pt-10 flex items-center justify-between whitespace-nowrap overflow-hidden flex-shrink-0 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h1 className="text-3xl font-bold font-kalpurush tracking-wide text-charcoal dark:text-white">saadwrites</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold mt-1">শব্দ যেখানে কথা বলে</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-400 hover:text-charcoal dark:hover:text-white hidden md:block transition-colors"
            title="মেনু লুকান"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section (If Logged In) */}
        {user && (
          <div className="px-4 py-6 border-b border-stone-100 dark:border-stone-800 flex items-center gap-4 mx-2">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gold shadow-sm object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-charcoal dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

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
            active={currentView === ViewState.ABOUT} 
            onClick={() => handleNavClick(ViewState.ABOUT)} 
            icon={<UserIcon className="w-4 h-4" />} 
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

          {!user && !isAdmin && (
             <NavButton 
               active={currentView === ViewState.LOGIN} 
               onClick={() => handleNavClick(ViewState.LOGIN)} 
               icon={<LogIn className="w-4 h-4" />} 
               label="লগইন" 
               subLabel="যোগ দিন"
             />
          )}

          {user && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-500 dark:text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 group"
            >
              <span className="p-2 rounded-md bg-stone-200 dark:bg-stone-900 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                <LogOut className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="block text-sm font-bold font-kalpurush tracking-wide group-hover:text-red-500">লগআউট</span>
              </div>
            </button>
          )}

          {isAdmin && (
            <>
              <div className="my-6 border-t border-stone-100 dark:border-stone-800 mx-2"></div>
              
              <NavButton 
                active={currentView === ViewState.EDITOR} 
                onClick={() => handleNavClick(ViewState.EDITOR)} 
                icon={<PenTool className="w-4 h-4" />} 
                label="নুতন সৃষ্টি" 
                subLabel="লেখা শুরু করুন"
              />
              <NavButton 
                active={currentView === ViewState.INSIGHT} 
                onClick={() => handleNavClick(ViewState.INSIGHT)} 
                icon={<BarChart2 className="w-4 h-4" />} 
                label="ইনসাইট" 
                subLabel="পরিসংখ্যান"
              />

              {/* Settings Section */}
              <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800 mx-2">
                <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  সেটিংস
                </p>
                
                <button
                  onClick={() => { onExportData(); if(isMobile) setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 group"
                >
                  <Download className="w-4 h-4 shrink-0 group-hover:text-gold transition-colors" />
                  <span className="text-sm font-medium">ব্যাকআপ নিন</span>
                </button>

                <button
                  onClick={handleImportClick}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 group"
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
            </>
          )}
        </nav>

        {/* Footer with Stats */}
        <div className="p-8 border-t border-stone-100 dark:border-stone-800 whitespace-nowrap overflow-hidden flex-shrink-0 bg-stone-50 dark:bg-[#161413] transition-colors space-y-4 relative">
          {isAdmin && (
             <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-500 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3" /> মোট পাঠক
                </div>
                <span className="text-gold">{totalVisits.toLocaleString()}</span>
             </div>
          )}
          
          <div className="flex justify-between items-end">
             <p className="text-xs text-stone-400 dark:text-stone-600 font-serif italic">
               &copy; {new Date().getFullYear()} SaadWrites.<br/>All rights reserved.
             </p>
             <button 
               onClick={toggleAdmin}
               className="text-stone-300 hover:text-gold dark:text-stone-700 dark:hover:text-gold transition-colors"
               title={isAdmin ? "রিডার মোড চালু করুন" : "এডিটর মোড চালু করুন"}
             >
               {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
             </button>
          </div>
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
        ? 'bg-stone-100 dark:bg-stone-800 text-charcoal dark:text-white border-stone-200 dark:border-stone-700 shadow-sm'
        : 'text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800/50'
    }`}
  >
    <span className={`p-2 rounded-md transition-colors ${active ? 'bg-gold text-white' : 'bg-stone-200 dark:bg-stone-900 group-hover:bg-stone-300 dark:group-hover:bg-stone-700'}`}>
      {icon}
    </span>
    <div className="text-left">
      <span className={`block text-sm font-bold font-kalpurush tracking-wide ${active ? 'text-charcoal dark:text-white' : 'text-stone-600 dark:text-stone-300 group-hover:text-charcoal dark:group-hover:text-white'}`}>
        {label}
      </span>
      {subLabel && <span className="text-[10px] text-stone-400 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-500">{subLabel}</span>}
    </div>
  </button>
);