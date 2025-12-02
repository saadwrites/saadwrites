
import React, { useState, useEffect, useRef } from 'react';
import { PenTool, BookOpen, Mail, Download, Upload, User as UserIcon, Menu, X, PanelLeftClose, Eye, CheckCircle, AlertCircle, Info, Lock, Unlock, BarChart2, LogIn, LogOut, Image as ImageIcon, Database } from 'lucide-react';
import { ViewState, Toast, User, SiteConfig } from '../types';
import { EditableText, EditableImage } from './Editable';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadDemoData: () => void;
  totalVisits: number;
  toasts: Toast[];
  removeToast: (id: string) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  user: User | null;
  onLogout: () => void;
  config: SiteConfig;
  updateConfig: (c: Partial<SiteConfig>) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  theme, 
  toggleTheme,
  onExportData,
  onImportData,
  onLoadDemoData,
  totalVisits,
  toasts,
  removeToast,
  isAdmin,
  toggleAdmin,
  user,
  onLogout,
  config,
  updateConfig
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
    <div className="h-[100dvh] w-full bg-cream dark:bg-[#0f0f0f] text-charcoal dark:text-stone-200 font-sans flex transition-colors duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden relative selection:bg-gold/20">
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-lg shadow-premium animate-slide-up min-w-[320px] backdrop-blur-md border border-opacity-30 ${
              toast.type === 'success' ? 'bg-white/80 dark:bg-stone-900/80 border-green-500 text-charcoal dark:text-white' :
              toast.type === 'error' ? 'bg-white/80 dark:bg-stone-900/80 border-red-500 text-charcoal dark:text-white' :
              'bg-charcoal/90 text-white border-gold/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-gold" />}
            <p className="text-sm font-bold font-sans tracking-wide">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-auto text-stone-400 hover:text-charcoal dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-6 left-6 z-[60] text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-all duration-500 ${isSidebarOpen && !isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title="মেনু"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[40] backdrop-blur-sm transition-all duration-700 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          flex-shrink-0 z-[50] h-full
          bg-white/70 dark:bg-[#161413]/80 backdrop-blur-2xl
          text-charcoal dark:text-stone-300
          border-r border-stone-200/40 dark:border-stone-800/40
          flex flex-col transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isMobile ? 'fixed inset-y-0 left-0 shadow-premium' : 'relative'}
          ${isSidebarOpen 
            ? 'translate-x-0 w-80 opacity-100' 
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden md:opacity-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-8 pt-10 flex flex-col whitespace-nowrap overflow-hidden flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="animate-fade-in w-full">
              {/* Flexible Logo + Text Layout */}
              <div className="flex flex-col gap-4">
                 {/* Logo Container - Only occupies space if present or admin */}
                 {(config.logoUrl || isAdmin) && (
                   <div className="w-16 h-16 self-start">
                      <EditableImage 
                        src={config.logoUrl} 
                        onSave={(url) => updateConfig({ logoUrl: url })} 
                        isAdmin={isAdmin}
                        className="w-full h-full object-contain"
                        fallbackIcon={<ImageIcon className="w-6 h-6 text-stone-300"/>}
                      />
                   </div>
                 )}
                 
                 {/* Site Name and Tagline - Always visible */}
                 <div>
                    <EditableText 
                        value={config.siteName} 
                        onSave={(val) => updateConfig({ siteName: val })} 
                        isAdmin={isAdmin}
                        className="text-3xl font-kalpurush font-bold text-charcoal dark:text-stone-100 tracking-tight block"
                    />
                    <EditableText 
                      value={config.tagline} 
                      onSave={(val) => updateConfig({ tagline: val })} 
                      isAdmin={isAdmin}
                      className="text-[10px] uppercase tracking-[0.25em] text-gold/80 mt-1 font-medium block"
                    />
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-stone-400 hover:text-charcoal dark:hover:text-white hidden md:block transition-colors -mt-2"
              title="মেনু লুকান"
            >
              <PanelLeftClose className="w-5 h-5 opacity-60 hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* User Profile Section (If Logged In) */}
        {user && (
          <div className="px-6 py-6 flex items-center gap-4 mx-2 animate-fade-in bg-stone-50/50 dark:bg-stone-900/30 rounded-lg mb-2">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-charcoal dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate uppercase tracking-wider">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden whitespace-nowrap scrollbar-hide">
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
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-500 dark:text-stone-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all duration-300 group"
            >
              <span className="p-2 rounded-md bg-stone-100/50 dark:bg-stone-900/50 group-hover:bg-red-100/50 dark:group-hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </span>
              <div className="text-left">
                <span className="block text-sm font-bold font-kalpurush tracking-wide group-hover:text-red-500 transition-colors">লগআউট</span>
              </div>
            </button>
          )}

          {isAdmin && (
            <>
              <div className="my-6 border-t border-stone-100/50 dark:border-stone-800/30 mx-4"></div>
              
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
              <div className="pt-6 mt-6 border-t border-stone-100/50 dark:border-stone-800/30 mx-2 animate-fade-in">
                <p className="px-4 text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  সেটিংস
                </p>
                
                <button
                  onClick={() => { onExportData(); if(isMobile) setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all duration-300 group"
                >
                  <Download className="w-4 h-4 shrink-0 group-hover:text-gold transition-colors" />
                  <span className="text-sm font-medium">ব্যাকআপ নিন</span>
                </button>

                <button
                  onClick={handleImportClick}
                  className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all duration-300 group"
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

                <button
                  onClick={() => { onLoadDemoData(); if(isMobile) setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all duration-300 group"
                >
                  <Database className="w-4 h-4 shrink-0 group-hover:text-gold transition-colors" />
                  <span className="text-sm font-medium">ডেমো ডাটা লোড করুন</span>
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Footer with Stats */}
        <div className="p-8 border-t border-stone-100/50 dark:border-stone-800/30 whitespace-nowrap overflow-hidden flex-shrink-0 bg-stone-50/30 dark:bg-[#161413]/30 transition-colors duration-700 ease-in-out space-y-4 relative backdrop-blur-sm">
          {isAdmin && (
             <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-500 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3" /> মোট পাঠক
                </div>
                <span className="text-gold font-sans">{totalVisits.toLocaleString()}</span>
             </div>
          )}
          
          <div className="flex justify-between items-end">
             <div className="text-xs text-stone-400 dark:text-stone-600 font-serif italic">
               <EditableText 
                 value={config.footerText} 
                 onSave={(val) => updateConfig({ footerText: val })} 
                 isAdmin={isAdmin}
               />
             </div>
             <button 
               onClick={toggleAdmin}
               className="text-stone-300 hover:text-gold dark:text-stone-700 dark:hover:text-gold transition-colors p-1"
               title={isAdmin ? "রিডার মোড চালু করুন" : "এডিটর মোড চালু করুন"}
             >
               {isAdmin ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-cream dark:bg-[#0f0f0f] transition-colors duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] w-full min-w-0 relative scroll-smooth">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-24 md:py-24 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, subLabel }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, subLabel?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 ease-out group border border-transparent ${
      active
        ? 'bg-stone-100/60 dark:bg-stone-800/40 text-charcoal dark:text-white border-stone-200/30 dark:border-stone-700/30 shadow-soft'
        : 'text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white hover:bg-stone-50/50 dark:hover:bg-stone-800/20'
    }`}
  >
    <span className={`p-2 rounded-md transition-colors duration-500 ${active ? 'bg-gold/90 text-white' : 'bg-stone-100/50 dark:bg-stone-900/50 group-hover:bg-stone-200 dark:group-hover:bg-stone-800'}`}>
      {icon}
    </span>
    <div className="text-left">
      <span className={`block text-sm font-bold font-kalpurush tracking-wide transition-colors duration-500 ${active ? 'text-charcoal dark:text-white' : 'text-stone-600 dark:text-stone-300 group-hover:text-charcoal dark:group-hover:text-white'}`}>
        {label}
      </span>
      {subLabel && <span className="text-[10px] text-stone-400 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-500 transition-colors duration-500">{subLabel}</span>}
    </div>
  </button>
);
