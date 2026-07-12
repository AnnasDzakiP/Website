"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

// Mengimpor semua komponen admin yang sudah Anda buat
import AdminSidebar from "../../components/admin/AdminSidebar";
import KanbanBoard from "../../components/admin/KanbanBoard";
import MenuTable from "../../components/admin/MenuTable";
import DashboardStats from "../../components/admin/DashboardStats";

export default function AdminDashboardPage() {
  // 1. STATE GLOBAL APLIKASI ADMIN
  // Menentukan tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "reports">(
    "orders",
  );

  // Mengatur status sidebar (buka/tutup) untuk tampilan HP (Mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Fungsi logout yang sudah dihubungkan ke Supabase Auth
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

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
