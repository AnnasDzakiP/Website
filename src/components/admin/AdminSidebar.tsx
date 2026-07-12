import React from "react";

interface AdminSidebarProps {
  activeTab: "orders" | "menu" | "reports";
  setActiveTab: (tab: "orders" | "menu" | "reports") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
}: AdminSidebarProps) {
  // Daftar tab menu navigasi
  const tabs = [
    { id: "orders", label: "Pesanan Masuk", desc: "Kelola order pipeline" },
    { id: "menu", label: "Kelola Menu", desc: "Produk & inventaris stok" },
    {
      id: "reports",
      label: "Laporan Penjualan",
      desc: "Stat ringkasan finansial",
    },
  ] as const;

  return (
    <>
      {/* SIDEBAR NAVIGATION PANEL (Fixed on Desktop, collapsing drawer overlay on Mobile) */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 bg-brand-charcoal text-white w-64 p-5 flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} h-screen`}
      >
        <div className="space-y-8">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-yellow rounded-xl flex items-center justify-center shadow-md rotate-3">
                <span className="text-brand-brown font-extrabold text-lg font-serif">
                  P
                </span>
              </div>
              <div>
                <h2 className="text-sm font-bold font-serif text-white tracking-tight leading-4">
                  Pancong Lumer Umuy
                </h2>
                <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">
                  Admin Vendor
                </span>
              </div>
            </div>
            {/* Collapse Close Button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-neutral-400 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false); // Tutup sidebar di HP setelah klik
                  }}
                  className={`w-full text-left p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                    isActive
                      ? "bg-brand-yellow text-brand-brown border-brand-yellow font-semibold shadow-md shadow-brand-yellow/10"
                      : "border-transparent text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div>
                    <span className="text-xs uppercase tracking-wide">
                      {tab.label}
                    </span>
                    <span
                      className={`block text-[9px] font-normal ${isActive ? "text-brand-brown/70" : "text-neutral-500"}`}
                    >
                      {tab.desc}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-brand-brown rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Logged In Profile Card & Logout */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-yellow/20 flex items-center justify-center text-xs font-bold text-white border border-brand-yellow/30">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-200">Annas Dzaki</p>
              <span className="text-[9px] text-[#F59E0B] font-semibold">
                Role: Administrator
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 border border-red-500/20 hover:bg-rose-900 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
          >
            Keluar Portal
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR (Hamburger trigger banner - Nempel di atas pada layar HP) */}
      <div className="md:hidden sticky top-0 bg-brand-charcoal text-white h-16 px-4 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white"
          >
            {/* Hamburger icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-bold font-serif text-white tracking-tight">
              Pancong Lumer Umuy
            </h2>
            <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">
              Admin Portal
            </span>
          </div>
        </div>
        {/* Tab state indicator on mobile header */}
        <div className="text-xs font-bold text-brand-yellow capitalize bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
          {activeTab === "orders"
            ? "Pesanan"
            : activeTab === "menu"
              ? "Menu"
              : "Laporan"}
        </div>
      </div>
    </>
  );
}
