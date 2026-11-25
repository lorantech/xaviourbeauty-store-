"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import { Save, Shield, Bell, CreditCard, Truck, Image, Settings as SettingsIcon, Eye, EyeOff, Key } from "lucide-react";

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
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { if (user?.role === "admin") loadSettings(); }, [user]);

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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/admin/settings", settings);
      setMessage({ type: "success", text: "Settings saved successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setMessage({ type: "error", text: "New passwords do not match" });
    if (passwordForm.newPassword.length < 8) return setMessage({ type: "error", text: "Password must be at least 8 characters" });
    setSaving(true);
    setMessage(null);
    try {
      await api.post("/auth/change-password", { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => setSettings((prev: any) => ({ ...prev, [key]: value }));
  const updateBank = (key: string, value: any) => setSettings((prev: any) => ({ ...prev, bankDetails: { ...(prev.bankDetails || {}), [key]: value } }));

  const uploadAsset = (key: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateSetting(key, res.data.url);
    } catch {
      alert("Failed to upload image");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <ClientOnly>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Settings</h1>
            <p className="text-muted-text mt-1">Configure store, payments, delivery, and security</p>
          </div>

          {message && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${message.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{message.text}</div>}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
            <div className="border-b border-light-border dark:border-gray-700">
              <nav className="flex overflow-x-auto px-4" aria-label="Settings tabs">
                {tabConfig.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? "text-primary-forest-green border-b-2 border-primary-forest-green" : "text-muted-text hover:text-primary-text"}`}>
                    <tab.icon className="w-4 h-4" strokeWidth={2} />{tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-4 bg-muted rounded w-3/4" /></div> : (
                <>
                  {activeTab === "general" && (
                    <div className="space-y-6 max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1.5">Store Name</label><input value={settings.storeName || ""} onChange={(e) => updateSetting("storeName", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Contact Email</label><input value={settings.contactEmail || ""} onChange={(e) => updateSetting("contactEmail", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Contact Phone</label><input value={settings.contactPhone || ""} onChange={(e) => updateSetting("contactPhone", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Address</label><input value={settings.address || ""} onChange={(e) => updateSetting("address", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Logo</label>
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden border">{settings.logo ? <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" /> : null}</div>
                            <label className="cursor-pointer bg-muted px-4 py-2 rounded-lg text-sm font-medium">Upload Logo<input type="file" accept="image/*" onChange={uploadAsset("logo")} className="hidden" /></label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t"><button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Settings</button></div>
                    </div>
                  )}

                  {activeTab === "payments" && (
                    <div className="space-y-6 max-w-3xl">
                      <div className="bg-muted/30 rounded-xl border p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Manual Bank Transfer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1.5">Bank Name</label><input value={settings.bankDetails?.bankName || ""} onChange={(e) => updateBank("bankName", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                          <div><label className="block text-sm font-medium mb-1.5">Account Number</label><input value={settings.bankDetails?.accountNumber || ""} onChange={(e) => updateBank("accountNumber", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Account Name</label><input value={settings.bankDetails?.accountName || ""} onChange={(e) => updateBank("accountName", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">WhatsApp Number</label><input value={settings.bankDetails?.whatsappNumber || ""} onChange={(e) => updateBank("whatsappNumber", e.target.value.replace(/\D/g, ""))} placeholder="2348039630776" className="w-full px-4 py-2.5 border rounded-lg" /><p className="text-xs text-muted-text mt-1">Digits only, include country code (e.g. 2348039630776).</p></div>
                          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Payment Instructions</label><textarea value={settings.bankDetails?.instructions || ""} onChange={(e) => updateBank("instructions", e.target.value)} className="w-full px-4 py-2.5 border rounded-lg min-h-28" /></div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t"><button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Settings</button></div>
                    </div>
                  )}

                  {activeTab === "delivery" && (
                    <div className="space-y-6 max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1.5">Shipping Fee (?)</label><input type="number" value={settings.shippingFee ?? 0} onChange={(e) => updateSetting("shippingFee", Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Free Shipping Threshold (?)</label><input type="number" value={settings.freeShippingThreshold ?? 0} onChange={(e) => updateSetting("freeShippingThreshold", Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg" /></div>
                      </div>
                      <div className="flex justify-end pt-4 border-t"><button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary-forest-green text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> Save Settings</button></div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-4 max-w-3xl">
                      <p className="text-sm text-muted-text">Order and payment notifications are created automatically for admin review. Use the Notifications page to manage them.</p>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6 max-w-2xl">
                      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
                        <h4 className="font-medium mb-4">Change Password</h4>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          {(["current", "new", "confirm"] as const).map((k) => (
                            <div key={k}>
                              <label className="block text-sm font-medium mb-1.5">{k === "current" ? "Current Password" : k === "new" ? "New Password" : "Confirm New Password"}</label>
                              <div className="relative">
                                <input type={showPassword[k] ? "text" : "password"} value={(passwordForm as any)[`${k}Password`]} onChange={(e) => setPasswordForm({ ...passwordForm, [`${k}Password`]: e.target.value } as any)} className="w-full px-4 py-2.5 border rounded-lg pr-10" />
                                <button type="button" onClick={() => setShowPassword({ ...showPassword, [k]: !showPassword[k] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text">{showPassword[k] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                              </div>
                            </div>
                          ))}
                          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-forest-green text-white rounded-lg flex items-center gap-2 disabled:opacity-50"><Key className="w-4 h-4" /> Change Password</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === "appearance" && (
                    <div className="space-y-4 max-w-3xl text-sm text-muted-text">
                      <p>Appearance settings are managed by the current theme. Brand tokens and dark mode remain controlled in the shared frontend styles and layout.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </ClientOnly>
    </AdminLayout>
  );
}
