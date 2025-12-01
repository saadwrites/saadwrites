import React from 'react';
import { PenTool, BookOpen, Home, Feather, Mail } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white/50 border-r border-stone-200 backdrop-blur-sm sticky top-0 z-20 md:h-screen flex flex-col">
        <div className="p-6 border-b border-stone-200 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-full">
            <Feather className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold font-serif tracking-tight text-stone-800">saadwrites</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => onChangeView(ViewState.HOME)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.HOME
                ? 'bg-stone-800 text-white shadow-md'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">ব্লগ</span>
          </button>

          <button
            onClick={() => onChangeView(ViewState.EDITOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.EDITOR
                ? 'bg-stone-800 text-white shadow-md'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <PenTool className="w-5 h-5" />
            <span className="font-medium">নতুন লেখা</span>
          </button>

          <button
            onClick={() => onChangeView(ViewState.CONTACT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === ViewState.CONTACT
                ? 'bg-stone-800 text-white shadow-md'
                : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">যোগাযোগ</span>
          </button>
        </nav>

        <div className="p-6 border-t border-stone-200">
          <p className="text-xs text-stone-400 text-center">
            &copy; {new Date().getFullYear()} saadwrites
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};