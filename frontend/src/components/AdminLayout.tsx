"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Star,
  MessageSquare,
  BarChart2,
  FileText,
  Tag as TagIcon,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Bell as BellIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  {
    name: "Store Management",
    children: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tag },
      { name: "Inventory", href: "/admin/inventory", icon: Package },
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews & Testimonials", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    name: "Brand Management",
    children: [
      { name: "CEO Corner", href: "/admin/ceo", icon: MessageSquare },
      { name: "Homepage Content", href: "/admin/homepage", icon: LayoutDashboard },
      { name: "Promotional Banners", href: "/admin/banners", icon: TagIcon },
      { name: "Media Library", href: "/admin/media", icon: Star },
    ],
  },
  {
    name: "Business Management",
    children: [
      { name: "Sales Analytics", href: "/admin/analytics", icon: BarChart2 },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Discounts & Promotions", href: "/admin/promotions", icon: TagIcon },
    ],
  },
  {
    name: "System",
    children: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Store Settings", href: "/admin/settings", icon: Settings },
      { name: "Admin Profile", href: "/admin/profile", icon: User },
      { name: "Security", href: "/admin/security", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const saved = localStorage.getItem("dark-mode");
    if (saved !== null) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("dark-mode", String(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const isActive = (href: string) => pathname === href;

  const getActiveParent = () => {
    for (const section of navigation) {
      if (section.children && section.children.some((child) => isActive(child.href))) {
        return section.name;
      }
    }
    return null;
  };

  const activeParent = getActiveParent();

  if (typeof window !== "undefined" && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-light-border transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} dark:bg-gray-900 dark:border-gray-700`}
        aria-label="Admin sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-light-border dark:border-gray-700">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-forest-green flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 0112 12a9.001 9.001 0 00-1 8.945M15 4.636a9.012 9.012 0 00-3.96 8.23M12 3v18m0 0a3 3 0 010 6 3 3 0 010-6 3 3 0 010-6m0 0H9m12 0H3" />
                </svg>
              </div>
              {!collapsed && (
                <span className="font-serif font-bold text-xl text-primary-text">Xaviour</span>
              )}
            </Link>
            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Admin navigation">
            {navigation.map((section) => {
              const isParentActive = section.children && section.children.some((child) => isActive(child.href));
              const isExpanded = expandedSections.includes(section.name);

              if (!section.children) {
                const active = isActive(section.href);
                return (
                  <Link
                    key={section.name}
                    href={section.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary-forest-green/10 text-primary-forest-green"
                        : "text-muted-text hover:bg-muted hover:text-primary-text"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title={collapsed ? section.name : undefined}
                  >
                    <section.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                    {!collapsed && <span>{section.name}</span>}
                  </Link>
                );
              }

              return (
                <div key={section.name}>
                  <button
                    onClick={() => toggleSection(section.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isParentActive
                        ? "bg-primary-forest-green/10 text-primary-forest-green"
                        : "text-muted-text hover:bg-muted hover:text-primary-text"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-3">
                      <section.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                      {!collapsed && <span>{section.name}</span>}
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        className={`w-4 h-4 text-muted-text transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="mt-1 ml-6 space-y-1 animate-in fade-in slide-in-from-top-2">
                      {section.children.map((child) => {
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                              active
                                ? "bg-primary-forest-green/10 text-primary-forest-green font-medium"
                                : "text-muted-text hover:bg-muted hover:text-primary-text"
                            }`}
                          >
                            <child.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-light-border dark:border-gray-700">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-text hover:bg-muted hover:text-red-500 transition-all ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-light-border dark:bg-gray-900/80 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-text"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-muted text-muted-text"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <div className="hidden sm:block">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-1 text-sm">
                    <li>
                      <Link href="/admin" className="text-muted-text hover:text-primary-text">
                        Dashboard
                      </Link>
                    </li>
                    {pathname !== "/admin" && (
                      <>
                        <span className="text-muted-text mx-1">/</span>
                        <li className="text-primary-text capitalize">
                          {pathname.split("/").pop()?.replace(/-/g, " ")}
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Search products, orders, customers..."
                  className="pl-10 pr-4 py-2 w-64 sm:w-80 bg-muted border border-light-border rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <button
                className="relative p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text"
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5" strokeWidth={2} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text"
                aria-label={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-forest-green flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-primary-text">{user?.name || "Admin"}</p>
                    <p className="text-xs text-muted-text capitalize">{user?.role || "admin"}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-text" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-light-border dark:border-gray-700 py-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-muted"
                    >
                      <User className="w-4 h-4" strokeWidth={2} />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-muted"
                    >
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      Settings
                    </Link>
                    <hr className="my-1 border-light-border dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function handleLogout() {
  // This will be replaced by the actual logout function from context
}