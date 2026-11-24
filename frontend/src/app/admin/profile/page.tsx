"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import {
  User,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Camera,
  Image,
  Mail,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Shield,
  Bell,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

export default function AdminProfile() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      });
      if (user.avatar) setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append("avatar", avatarFile);
      await api.patch("/auth/profile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await refresh();
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoading(false);
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (typeof window !== "undefined" && !user) {
    return null;
  }

  return (
    <AdminLayout>
      
        <div className="space-y-6">
          {message && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-text">Admin Profile</h1>
              <p className="text-muted-text mt-1">Manage your account settings and preferences</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
            <div className="border-b border-light-border dark:border-gray-700">
              <nav className="flex overflow-x-auto px-4" aria-label="Profile tabs">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "preferences", label: "Preferences", icon: Shield },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "text-primary-forest-green border-b-2 border-primary-forest-green" : "text-muted-text hover:text-primary-text hover:bg-muted"}`}>
                    <tab.icon className="w-4 h-4" strokeWidth={2} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"} flex items-center justify-between animate-in slide-in-from-top-2`}>
                  <span>{message.text}</span>
                  <button onClick={() => setMessage(null)} className="text-muted-text hover:text-primary-text">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {activeTab === "profile" && (
                <form onSubmit={handleProfileSave} className="max-w-2xl space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                        {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <svg className="w-10 h-10 text-muted-text mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M24 21l-4-4m0 0l-4 4m4-4v12M12 6v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-forest-green flex items-center justify-center text-white cursor-pointer hover:bg-secondary-forest-green transition-colors"><Camera className="w-4 h-4" strokeWidth={2} /></label>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary-text">Profile Picture</h3>
                      <p className="text-sm text-muted-text">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Full Name</label>
                      <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Email</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Phone</label>
                      <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">City</label>
                      <input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">State</label>
                      <input value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Address</label>
                      <textarea rows={3} value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold" placeholder="Enter your address" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-light-border dark:border-gray-700">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                      <Loader2 className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Key className="w-5 h-5" strokeWidth={2} /> Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Current Password</label>
                        <div className="relative">
                          <input type={showPassword.current ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold" placeholder="Current password" />
                          <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">{showPassword.current ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showPassword.new ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold" placeholder="New password (min 8 chars)" />
                          <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">{showPassword.new ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Confirm New Password</label>
                        <div className="relative">
                          <input type={showPassword.confirm ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text pr-10 focus:outline-none focus:ring-2 focus:ring-soft-gold" placeholder="Confirm new password" />
                          <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary-text">{showPassword.confirm ? <EyeOff className="w-5 h-5" strokeWidth={2} /> : <Eye className="w-5 h-5" strokeWidth={2} />}</button>
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Loader2 className="w-4 h-4" /> {saving ? "Updating..." : "Change Password"}
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-light-border dark:border-gray-700 pt-8">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Shield className="w-5 h-5" strokeWidth={2} /> Two-Factor Authentication</h3>
                    <div className="bg-muted rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary-text mb-1">Two-Factor Authentication (2FA)</h4>
                          <p className="text-sm text-muted-text">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soft-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-forest-green"></div>
                        </label>
                      </div>
                      <p className="text-sm text-muted-text mt-4">Enable 2FA to require a verification code from your authenticator app when signing in.</p>
                    </div>
                  </div>

                  <div className="border-t border-light-border dark:border-gray-700 pt-8">
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" strokeWidth={2} /> Danger Zone</h3>
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl p-6">
                      <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Delete Account</h4>
                      <p className="text-sm text-muted-text mb-4">Once you delete your account, there is no going back. All your data will be permanently deleted.</p>
                      <button className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">Delete My Account</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Bell className="w-5 h-5" strokeWidth={2} /> Notification Preferences</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                      <div className="space-y-4">
                        {[
                          { key: "emailOrders", label: "Order Notifications", desc: "Receive email when new orders are placed" },
                          { key: "emailPayments", label: "Payment Confirmations", desc: "Receive email when payments are confirmed" },
                          { key: "emailLowStock", label: "Low Stock Alerts", desc: "Receive email when stock is running low" },
                          { key: "emailReviews", label: "New Reviews", desc: "Receive email when new reviews are posted" },
                          { key: "emailReports", label: "Weekly Reports", desc: "Receive weekly sales reports via email" },
                          { key: "smsOrders", label: "SMS Order Alerts", desc: "Receive SMS for urgent order notifications" },
                        ].map((pref) => (
                          <div key={pref.key} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium text-primary-text">{pref.label}</h4>
                              <p className="text-sm text-muted-text">{pref.desc}</p>
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

                  <div>
                    <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2"><Image className="w-5 h-5" strokeWidth={2} /> Display Preferences</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-4">Theme</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Globe }].map((theme) => (
                            <button key={theme.id} className="p-4 border-2 rounded-xl text-center transition-all border-light-border dark:border-gray-700">
                              <theme.icon className="w-8 h-8 mx-auto mb-2 text-muted-text" strokeWidth={2} />
                              <p className="font-medium text-primary-text">{theme.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

          </div>
        </div>
        </div>
      </AdminLayout>
  );
}
