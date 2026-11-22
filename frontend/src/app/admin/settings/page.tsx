"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import {
  Save,
  Loader2,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Truck,
  Mail,
  Phone,
  MapPin,
  Image,
  Camera,
  Eye,
  EyeOff,
  Key,
  Unlock,
  Lock,
  User,
  Settings as SettingsIcon,
} from "lucide-react";

const tabConfig = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Image },
];

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data.settings || {});
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = section === "general" ? settings : { [section]: settings[section] };
      await api.patch("/admin/settings", payload);
      setMessage({ type: "success", text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully` });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleImageUpload = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
        .then(res => updateSetting("general", key, res.data.url || res.data.imageUrl))
        .catch(() => alert("Failed to upload image"));
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <ClientOnly>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Settings</h1>
            <p className="text-muted-text mt-1">Configure your store settings and preferences</p>
          </div>
        </div>

        {message && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
          <div className="border-b border-light-border dark:border-gray-700">
            <nav className="flex overflow-x-auto px-4" aria-label="Settings tabs">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-primary-forest-green border-b-2 border-primary-forest-green"
                      : "text-muted-text hover:text-primary-text hover:bg-muted"
                  }`}
                >
                  <tab.icon className="w-4 h-4" strokeWidth={2} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ) : (
              <>
                {activeTab === "general" && (
                  <div className="space-y-6 max-w-3xl">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Image className="w-5 h-5" strokeWidth={2} /> Store Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Store Name</label>
                            <input
                              value={settings.storeName || "Xaviourbeautystore"}
                              onChange={(e) => updateSetting("general", "storeName", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Store Email</label>
                            <input
                              type="email"
                              value={settings.storeEmail || "support@xaviourbeautystore.com"}
                              onChange={(e) => updateSetting("general", "storeEmail", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Store Phone</label>
                            <input
                              value={settings.storePhone || "+234 803 963 0776"}
                              onChange={(e) => updateSetting("general", "storePhone", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">WhatsApp Number</label>
                            <input
                              value={settings.whatsappNumber || "+234 803 963 0776"}
                              onChange={(e) => updateSetting("general", "whatsappNumber", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Store Address</label>
                            <textarea
                              rows={3}
                              value={settings.address || ""}
                              onChange={(e) => updateSetting("general", "address", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              placeholder="Enter full store address"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-primary-text mb-1.5">City</label>
                              <input
                                value={settings.city || ""}
                                onChange={(e) => updateSetting("general", "city", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-primary-text mb-1.5">State</label>
                              <input
                                value={settings.state || ""}
                                onChange={(e) => updateSetting("general", "state", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Image className="w-5 h-5" strokeWidth={2} /> Brand Assets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-2">Logo</label>
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 rounded-lg bg-muted overflow-hidden">
                              {settings.logo ? <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-muted-text mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                            </div>
                            <label className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">
                              Upload Logo
                              <input type="file" accept="image/*" onChange={(e) => e.target.files && updateSetting("general", "logo", URL.createObjectURL(e.target.files[0]))} className="hidden" />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-2">Favicon</label>
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden">
                              {settings.favicon ? <img src={settings.favicon} alt="Favicon" className="w-full h-full object-cover" /> : <svg className="w-6 h-6 text-muted-text mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>}
                            </div>
                            <label className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">
                              Upload Favicon
                              <input type="file" accept="image/*" onChange={(e) => e.target.files && updateSetting("general", "favicon", URL.createObjectURL(e.target.files[0]))} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-light-border dark:border-gray-700">
                      <button onClick={() => handleSave("general")} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save General Settings
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "payments" && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" strokeWidth={2} /> Payment Settings</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <h4 className="font-medium text-primary-text">Paystack</h4>
                            <p className="text-sm text-muted-text">Card payments, bank transfers, USSD</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Public Key</label>
                            <input value={settings.paystackPublicKey || ""} onChange={(e) => updateSetting("payments", "paystackPublicKey", e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Secret Key</label>
                            <input type="password" value={settings.paystackSecretKey || ""} onChange={(e) => updateSetting("payments", "paystackSecretKey", e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-light-border dark:border-gray-700">
                      <button onClick={() => handleSave("payments")} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Payment Settings
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "delivery" && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Truck className="w-5 h-5" strokeWidth={2} /> Delivery Settings</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Free Shipping Threshold (₦)</label>
                            <input type="number" value={settings.freeShippingThreshold || 50000} onChange={(e) => updateSetting("delivery", "freeShippingThreshold", Number(e.target.value))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Standard Shipping Fee (₦)</label>
                            <input type="number" value={settings.standardShippingFee || 2000} onChange={(e) => updateSetting("delivery", "standardShippingFee", Number(e.target.value))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Express Shipping Fee (₦)</label>
                            <input type="number" value={settings.expressShippingFee || 5000} onChange={(e) => updateSetting("delivery", "expressShippingFee", Number(e.target.value))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary-text">Free Shipping</h4>
                              <p className="text-sm text-muted-text">Free shipping on orders above threshold</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={true} className="peer sr-only" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary-text">Cash on Delivery</h4>
                              <p className="text-sm text-muted-text">Allow customers to pay on delivery</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={true} className="peer sr-only" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-light-border dark:border-gray-700">
                      <button onClick={() => handleSave("delivery")} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Save className="w-4 h-4" /> Save Delivery Settings
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Bell className="w-5 h-5" strokeWidth={2} /> Notification Settings</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <div className="space-y-4">
                        {[
                          { key: "newOrderEmail", label: "New Order Email", desc: "Receive email when new order is placed" },
                          { key: "newOrderSms", label: "New Order SMS", desc: "Receive SMS when new order is placed" },
                          { key: "paymentEmail", label: "Payment Confirmation Email", desc: "Receive email when payment is confirmed" },
                          { key: "lowStockEmail", label: "Low Stock Alert Email", desc: "Receive email when stock is low" },
                          { key: "newReviewEmail", label: "New Review Email", desc: "Receive email when new review is posted" },
                          { key: "weeklyReportEmail", label: "Weekly Report Email", desc: "Receive weekly sales report via email" },
                        ].map((notif) => (
                          <div key={notif.key} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary-text">{notif.label}</h4>
                              <p className="text-sm text-muted-text">{notif.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="peer sr-only" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6 max-w-2xl">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Shield className="w-5 h-5" strokeWidth={2} /> Security Settings</h3>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <h4 className="font-medium text-primary-text mb-4">Change Password</h4>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              placeholder="Enter current password"
                            />
                            <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">
                              {showPassword.current ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              placeholder="Enter new password (min 8 characters)"
                            />
                            <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">
                              {showPassword.new ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold"
                              placeholder="Confirm new password"
                            />
                            <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">
                              {showPassword.confirm ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                          <Key className="w-4 h-4" strokeWidth={2} /> Change Password
                        </button>
                      </form>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <h4 className="font-medium text-primary-text mb-4">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-text">Enable 2FA</h4>
                          <p className="text-sm text-muted-text">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <h4 className="font-medium text-primary-text mb-4">Session Management</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <h4 className="font-medium text-primary-text">Auto-logout after inactivity</h4>
                            <p className="text-sm text-muted-text">Automatically log out after 30 minutes of inactivity</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="peer sr-only" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                          </label>
                        </div>
                        <button className="w-full px-4 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
                          <Unlock className="w-4 h-4 mr-2" strokeWidth={2} /> Log out of all other sessions
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-6 max-w-3xl">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Image className="w-5 h-5" strokeWidth={2} /> Appearance</h3>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <h4 className="font-medium text-primary-text mb-4">Theme</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: "light", label: "Light", icon: Sun },
                          { id: "dark", label: "Dark", icon: Moon },
                          { id: "system", label: "System", icon: Globe },
                        ].map((theme) => (
                          <button key={theme.id} className="p-4 border-2 rounded-xl text-center transition-all hover:border-soft-gold" style={{ borderColor: "transparent" }}>
                            <theme.icon className="w-8 h-8 mx-auto mb-2 text-muted-text" strokeWidth={2} />
                            <p className="font-medium text-primary-text">{theme.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <h4 className="font-medium text-primary-text mb-4">Accent Color</h4>
                      <div className="flex gap-4 flex-wrap">
                        {["#172C25", "#223B31", "#C6A66B", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"].map((color) => (
                          <button key={color} className={`w-12 h-12 rounded-full border-3 transition-all ${color === "#172C25" ? "border-soft-gold" : "border-transparent"}`} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
</AdminLayout>
      
    )
  };
}
