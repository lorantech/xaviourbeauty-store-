"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.push("/admin/dashboard");
    } else if (!loading && user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  return null;
}