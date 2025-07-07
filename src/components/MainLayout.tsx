import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Briefcase, FileText, Users, Bell, MessageCircle, User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const sidebarLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Ispan Panel', to: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Messages', to: '/messages', icon: <MessageCircle className="h-5 w-5" /> },
  { label: 'Proposal Library', to: '/library', icon: <FileText className="h-5 w-5" /> },
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext) as any;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log('Notifications fetch error:', error);
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
      } catch (error) {
        console.log('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();
  }, [user, dropdownOpen]);

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (dropdownOpen && unreadCount > 0 && user?.id) {
      const markAllRead = async () => {
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
          setUnreadCount(0);
        } catch (error) {
          console.log('Error marking notifications as read:', error);
          setUnreadCount(0);
        }
      };
      markAllRead();
    }
  }, [dropdownOpen, unreadCount, user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const NavLink = ({ item, onClick }: { item: any; onClick?: () => void }) => {
    const isActive = location.pathname === item.to;
    return (
      <Link
        to={item.to}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-primary/20 hover:text-primary/90 relative group ${isActive ? 'bg-primary/15 text-primary shadow-lg ring-2 ring-primary/40' : 'text-foreground'}`}
        style={isActive ? { boxShadow: '0 4px 24px 0 rgba(80, 120, 255, 0.10)' } : {}}
      >
        <span className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow' : ''}`}>{item.icon}</span>
        {item.label}
        {isActive && <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-lg animate-pulse" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-card to-background/80 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-2xl font-extrabold bg-gradient-hero bg-clip-text text-transparent">
                    ISpaniBot
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  <nav className="space-y-2">
                    {sidebarLinks.map((item) => (
                      <NavLink 
                        key={item.to} 
                        item={item} 
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    ))}
                  </nav>
                  {/* Upcoming Services */}
                  <div className="pt-4 border-t">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">
                      Upcoming Services
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-300/80 via-yellow-200/80 to-primary/60 text-yellow-900 shadow-lg border border-yellow-300/60 cursor-not-allowed opacity-100">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 animate-bounce flex-shrink-0" />
                          <span className="font-semibold text-sm">Writing Assistant</span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-900 px-2 py-1 rounded shadow flex-shrink-0">Soon</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-400/80 via-pink-300/80 to-primary/60 text-pink-900 shadow-lg border border-pink-300/60 cursor-not-allowed opacity-100">
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-4 w-4 animate-bounce flex-shrink-0" />
                          <span className="font-semibold text-sm">Job Matching</span>
                        </div>
                        <span className="text-xs bg-pink-100 text-pink-900 px-2 py-1 rounded shadow flex-shrink-0">Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-extrabold bg-gradient-hero bg-clip-text text-transparent">ISpaniBot</span>
          </div>
          {/* Mobile Notifications */}
          {user?.id && (
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-primary/10 transition"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 shadow">{unreadCount}</span>
                )}
              </button>
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-lg shadow-xl z-50 animate-fade-in">
                  <div className="p-3 border-b font-bold text-primary">Notifications</div>
                  <div className="max-h-60 overflow-y-auto divide-y">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3 text-sm ${!n.is_read ? 'bg-primary/10' : ''}`}>
                          <div className="font-semibold text-foreground mb-1">{n.type}</div>
                          <div className="text-muted-foreground">{n.content}</div>
                          <div className="text-xs text-muted-foreground mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-card/90 border-r border-border shadow-2xl p-4 gap-1 sticky top-0 min-h-screen z-20">
        <div className="mb-4 flex items-center gap-2 relative">
          <span className="text-2xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight drop-shadow-lg">ISpaniBot</span>
          {/* Desktop Notification Bell */}
          {user?.id && (
            <div className="ml-auto relative">
              <button
                className="relative p-2 rounded-full hover:bg-primary/10 transition"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 shadow">{unreadCount}</span>
                )}
              </button>
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
        {/* Upcoming Services Subheading */}
        <div className="mt-6 mb-2 px-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Upcoming Services</h3>
        </div>
        {/* Writing Assistant and Job Matching (Coming Soon) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-5 py-4 rounded-lg bg-gradient-to-r from-yellow-300/80 via-yellow-200/80 to-primary/60 text-yellow-900 shadow-lg border border-yellow-300/60 cursor-not-allowed opacity-100 hover:scale-105 transition-all duration-200 min-h-[52px]">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 animate-bounce flex-shrink-0" />
              <span className="font-semibold text-sm">Writing Assistant</span>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-900 px-2 py-1 rounded shadow flex-shrink-0">Soon</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 rounded-lg bg-gradient-to-r from-pink-400/80 via-pink-300/80 to-primary/60 text-pink-900 shadow-lg border border-pink-300/60 cursor-not-allowed opacity-100 hover:scale-105 transition-all duration-200 min-h-[52px]">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 animate-bounce flex-shrink-0" />
              <span className="font-semibold text-sm">Job Matching</span>
            </div>
            <span className="text-xs bg-pink-100 text-pink-900 px-2 py-1 rounded shadow flex-shrink-0">Soon</span>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* User Profile Component - will be rendered by individual pages */}
        <div id="user-profile-container"></div>
        <div className="flex-1 p-2 md:p-4 mt-16 md:mt-0 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 