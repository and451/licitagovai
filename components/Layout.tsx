import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, MessageSquareText, FileText, Library, Menu, X } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { view: AppView.CHAT, label: 'Consultor Normativo', icon: MessageSquareText },
    { view: AppView.DOC_GENERATOR, label: 'Gerador de Minutas', icon: FileText },
    { view: AppView.KNOWLEDGE_BASE, label: 'Base de Conhecimento', icon: Library },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold tracking-tight">LicitaGov AI</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sustentação Operacional</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${currentView === item.view 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
            <p>Versão: MVP 1.0</p>
            <p>Base: Lei 14.133/2021</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold">LicitaGov AI</span>
        </div>
        <button onClick={toggleMenu} className="p-1">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-20 pt-20 px-4">
           <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium
                  ${currentView === item.view 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 bg-slate-800'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative md:static pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;