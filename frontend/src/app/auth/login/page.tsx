"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16 flex-1">
        <h1 className="text-2xl font-bold mb-6">Sign in</h1>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-border rounded" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-2 rounded-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          No account? <Link href="/auth/register" className="text-brand hover:underline">Register</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
