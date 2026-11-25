"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProductRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/products?action=new");
  }, [router]);
  return null;
}
