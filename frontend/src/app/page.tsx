"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HomeClient = dynamic(() => import("@/components/HomeClient"), { ssr: false });

export default function Page() {
  return (
    <>
      <Navbar />
      <HomeClient />
      <Footer />
    </>
  );
}
