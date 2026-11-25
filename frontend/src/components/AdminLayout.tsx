"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Star, MessageSquare,
  Image, Tag, Users, BarChart3, Settings, Bell, FileText, Menu, X,
  ChevronLeft, ChevronRight, LogOut, Search, Sun, Moon, ChevronDown, User, CreditCard,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Homepage CMS", href: "/admin/homepage", icon: Image },
  { name: "CEO Corner", href: "/admin/ceo", icon: User },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Bank Transfers", href: "/admin/bank-transfers", icon: CreditCard },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/admin/notifications/unread-count");
        if (mounted) setUnreadNotifications(Number(res.data.count || 0));
      } catch {
        if (mounted) setUnreadNotifications(0);
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(t); };
  }, [user, pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-light-border dark:border-gray-700 transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${collapsed ? "lg:w-16" : "lg:w-64"} w-64`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-light-border dark:border-gray-700">
            {!collapsed && <Link href="/admin" className="flex items-center"><span className="font-serif text-xl font-bold text-primary-forest-green">XBS Admin</span></Link>}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-text" aria-label="Close menu"><X className="w-5 h-5" strokeWidth={2} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? "bg-primary-forest-green text-white" : "text-primary-text hover:bg-muted dark:text-gray-200 dark:hover:bg-gray-800"} ${collapsed ? "justify-center" : ""}`} title={collapsed ? item.name : undefined}>
                      <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                      {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                      {!collapsed && item.name === "Notifications" && unreadNotifications > 0 && <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] text-white">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-light-border dark:border-gray-700">
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-text hover:bg-red-50 hover:text-red-500 transition-colors ${collapsed ? "justify-center" : ""}`} title={collapsed ? "Logout" : undefined}>
              <LogOut className="w-5 h-5" strokeWidth={2} />
              {!collapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-light-border dark:bg-gray-900/80 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-text" aria-label="Open menu"><Menu className="w-5 h-5" strokeWidth={2} /></button>
              <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-muted text-muted-text" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}</button>
              <div className="hidden sm:block">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-1 text-sm">
                    <li><Link href="/admin" className="text-muted-text hover:text-primary-text">Dashboard</Link></li>
                    {pathname !== "/admin" && <><span className="text-muted-text mx-1">/</span><li className="text-primary-text capitalize">{pathname.split("/").pop()?.replace(/-/g, " ")}</li></>}
                  </ol>
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" strokeWidth={2} />
                <input type="search" placeholder="Search..." className="pl-10 pr-4 py-2 w-64 bg-muted border border-light-border rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
              </div>
              <Link href="/admin/notifications" className="relative p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text" aria-label="Notifications">
                <Bell className="w-5 h-5" strokeWidth={2} />
                {unreadNotifications > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
              </Link>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text" aria-label={darkMode ? "Light mode" : "Dark mode"}>{darkMode ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}</button>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted">
                  <div className="w-8 h-8 rounded-full bg-primary-forest-green flex items-center justify-center"><span className="text-white font-medium text-sm">{user?.name?.charAt(0).toUpperCase() || "A"}</span></div>
                  <div className="hidden md:block text-left"><p className="text-sm font-medium text-primary-text">{user?.name || "Admin"}</p><p className="text-xs text-muted-text capitalize">{user?.role || "admin"}</p></div>
                  <ChevronDown className="w-4 h-4 text-muted-text" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-light-border dark:border-gray-700 py-1 z-50">
                    <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-muted"><User className="w-4 h-4" strokeWidth={2} />Profile</Link>
                    <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-muted"><Settings className="w-4 h-4" strokeWidth={2} />Settings</Link>
                    <hr className="my-1 border-light-border dark:border-gray-700" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted"><LogOut className="w-4 h-4" strokeWidth={2} />Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
