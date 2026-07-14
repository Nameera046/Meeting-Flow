import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Search,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Meetings', path: '/meetings', icon: CalendarDays },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`bg-primary text-white flex flex-col justify-between transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-primary-light">
            {sidebarOpen ? (
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-accent">Meeting</span>Flow
              </span>
            ) : (
              <span className="text-xl font-bold text-accent px-1">MF</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-secondary-light hover:text-white transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-premium'
                      : 'text-slate-300 hover:bg-primary-light hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-primary-light">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-400 capitalize truncate">
                    {user?.roles?.[0]?.replace('ROLE_', '').toLowerCase() || 'member'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-danger transition-colors p-1"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button onClick={logout} className="text-slate-400 hover:text-danger transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="md:hidden text-secondary hover:text-primary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            
            {/* Global Search bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-md w-full relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search meetings, tasks, decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-accent transition-colors"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-dropdown z-50 animate-fade-in">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <span className="font-semibold text-text text-sm">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-accent hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto divide-y divide-border">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 text-xs hover:bg-slate-50 transition-colors flex justify-between gap-3 ${
                              !n.read ? 'bg-slate-50 font-medium' : ''
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <p className="text-text font-semibold">{n.title}</p>
                              <p className="text-secondary leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-secondary-light">
                                {new Date(n.createdAt).toLocaleDateString()} at{' '}
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0"
                                title="Mark read"
                              ></button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-secondary text-xs">
                          No notifications at the moment.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile User Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm md:hidden">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-background p-6 flex flex-col">
          <div className="w-full flex-1 flex flex-col animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
