import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Calendar, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Settings
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menus para usuários comuns
  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/rooms', label: 'Salas', icon: DoorOpen },
    { path: '/bookings', label: 'Minhas Reservas', icon: Calendar },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
  ];

  // Menus adicionais para admins
  const adminMenuItems = [
    { path: '/calendar', label: 'Calendário', icon: Calendar },
    { path: '/users', label: 'Usuários', icon: Users },
    { path: '/settings', label: 'Configurações', icon: Settings },
    { path: '/logs', label: 'Logs', icon: FileText },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-slate-700 p-2 rounded-md transition-colors"
              data-testid="mobile-menu-button"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-white font-heading">NexusMeet</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white" data-testid="user-name">{user?.nome}</p>
                <p className="text-xs text-slate-400">{isAdmin ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
              data-testid="logout-button"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} data-testid="sidebar">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-blue-50 text-accent border border-blue-200' 
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                  data-testid={`nav-${item.path.substring(1)}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;