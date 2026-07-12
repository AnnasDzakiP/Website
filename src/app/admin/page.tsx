"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

// Mengimpor semua komponen admin yang sudah Anda buat
import AdminSidebar from "../../components/admin/AdminSidebar";
import KanbanBoard from "../../components/admin/KanbanBoard";
import MenuTable from "../../components/admin/MenuTable";
import DashboardStats from "../../components/admin/DashboardStats";

export default function AdminDashboardPage() {
  // 1. STATE GLOBAL APLIKASI ADMIN
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "reports">(
    "orders",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  const router = useRouter();
  const supabase = createClient();

  // Proteksi Auth: Cek sesi setiap kali halaman dimuat
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
      } else {
        setLoading(false); // Sesi ditemukan, tampilkan konten
      }
    };
    checkAuth();
  }, [router, supabase]);

  // Fungsi logout yang sudah dihubungkan ke Supabase Auth
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Jika sedang mengecek sesi, tampilkan loading/kosong agar tidak terlihat flicker
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  // 2. RENDER DASHBOARD (Menggunakan Return di dalam Fungsi)
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* SIDEBAR COMPONENT */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {activeTab === "orders" && <KanbanBoard />}
        {activeTab === "menu" && <MenuTable />}
        {activeTab === "reports" && <DashboardStats />}
      </main>

      {/* BACKDROP HITAM UNTUK MOBILE SAAT SIDEBAR TERBUKA */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
