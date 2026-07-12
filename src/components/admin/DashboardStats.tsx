"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

interface Order {
  id: string;
  customer_name: string;
  status: string;
  total: number;
  payment_method?: string;
  order_items: any[];
  created_at: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    hariIni: 0,
    mingguIni: 0,
    bulanIni: 0,
    sukses: 0,
  });
  const [popularMenus, setPopularMenus] = useState<
    { name: string; count: number }[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<
    { period: string; total: number }[]
  >([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<
    { period: string; total: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchReportData = async () => {
    setIsLoading(true);

    // Ambil semua data order
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      let omsetHariIni = 0;
      let omsetMingguIni = 0;
      let omsetBulanIni = 0;
      let totalSukses = 0;

      const menuCounts: Record<string, number> = {};
      const monthlyStats: Record<string, number> = {};
      const weeklyStats: Record<string, number> = {};

      const now = new Date();
      const todayString = now.toLocaleDateString("id-ID");

      // Batas waktu untuk minggu ini (7 hari terakhir)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      data.forEach((order) => {
        if (order.status === "done") {
          totalSukses += 1;
          const orderDate = new Date(order.created_at);

          // Hitung Omset Hari Ini
          if (orderDate.toLocaleDateString("id-ID") === todayString) {
            omsetHariIni += order.total;
          }

          // Hitung Omset Minggu Ini (7 hari terakhir)
          if (orderDate >= oneWeekAgo) {
            omsetMingguIni += order.total;
          }

          // Hitung Omset Bulan Ini
          if (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          ) {
            omsetBulanIni += order.total;
          }

          // --- REKAP BULANAN ---
          const monthKey = orderDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          });
          monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + order.total;

          // --- REKAP MINGGUAN ---
          // Pendekatan sederhana: Minggu ke-X di bulan Y
          const weekOfMonth = Math.ceil(orderDate.getDate() / 7);
          const shortMonth = orderDate.toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          });
          const weekKey = `Mg ke-${weekOfMonth} ${shortMonth}`;
          weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + order.total;

          // --- MENU POPULER ---
          if (Array.isArray(order.order_items)) {
            order.order_items.forEach((item: any) => {
              const menuName = item.menuItem?.name;
              if (menuName) {
                menuCounts[menuName] =
                  (menuCounts[menuName] || 0) + item.quantity;
              }
            });
          }
        }
      });

      setStats({
        hariIni: omsetHariIni,
        mingguIni: omsetMingguIni,
        bulanIni: omsetBulanIni,
        sukses: totalSukses,
      });

      // Format & Urutkan Menu Top 5
      const sortedMenu = Object.entries(menuCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setPopularMenus(sortedMenu);

      // Format Rekap Mingguan & Bulanan menjadi Array
      setMonthlyRevenue(
        Object.entries(monthlyStats).map(([period, total]) => ({
          period,
          total,
        })),
      );
      setWeeklyRevenue(
        Object.entries(weeklyStats).map(([period, total]) => ({
          period,
          total,
        })),
      );

      // Ambil 10 transaksi terakhir
      setRecentOrders(data.slice(0, 10));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-brown font-bold animate-pulse">
        Menghitung laporan keuangan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 KARTU STATISTIK UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400">
              Omset Hari Ini
            </span>
            <span className="text-lg">🔥</span>
          </div>
          <h3 className="text-xl font-extrabold text-brand-charcoal">
            Rp {stats.hariIni.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400">
              Omset Minggu Ini
            </span>
            <span className="text-lg">📈</span>
          </div>
          <h3 className="text-xl font-extrabold text-brand-charcoal">
            Rp {stats.mingguIni.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400">
              Omset Bulan Ini
            </span>
            <span className="text-lg">💰</span>
          </div>
          <h3 className="text-xl font-extrabold text-brand-charcoal">
            Rp {stats.bulanIni.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400">
              Pesanan Sukses
            </span>
            <span className="text-lg">📦</span>
          </div>
          <h3 className="text-xl font-extrabold text-brand-charcoal">
            {stats.sukses} Porsi
          </h3>
        </div>
      </div>

      {/* BAGIAN TENGAH (TABEL RECENT ORDERS & REKAP WAKTU) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KIRI: Tabel Riwayat Transaksi */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-5 border-b border-neutral-100 bg-neutral-50/50">
            {/* Font disesuaikan agar sama dengan gaya lain */}
            <h4 className="font-extrabold text-brand-charcoal text-lg">
              Riwayat Transaksi Terakhir
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-neutral-100 text-[11px] uppercase tracking-widest text-neutral-400">
                  <th className="p-4 font-bold">Waktu</th>
                  <th className="p-4 font-bold">Pelanggan</th>
                  <th className="p-4 font-bold">Metode</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-neutral-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-neutral-400 font-medium"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="p-4 text-neutral-500 font-medium">
                        {formatTime(order.created_at)}
                      </td>
                      <td className="p-4 font-bold text-brand-charcoal">
                        {order.customer_name}
                        <span className="block text-[10px] text-neutral-400 font-mono">
                          #{order.id.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                            order.payment_method === "Cash"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.payment_method || "QRIS"}
                        </span>
                      </td>
                      <td className="p-4 font-black text-brand-brown">
                        Rp {order.total.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                            order.status === "done"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.status === "done" ? "Selesai" : "Proses"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KANAN: Rekap Keuangan & Menu Populer */}
        <div className="space-y-6">
          {/* Menu Populer */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            {/* Font disesuaikan */}
            <h4 className="font-extrabold text-brand-charcoal text-lg mb-4 border-b border-neutral-100 pb-3">
              Menu Paling Populer
            </h4>
            <div className="space-y-4">
              {popularMenus.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">
                  Belum ada data penjualan.
                </p>
              ) : (
                popularMenus.map((menu, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shadow-sm border ${
                        idx === 0
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : idx === 1
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : idx === 2
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-neutral-50 text-neutral-400 border-neutral-100"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-brand-charcoal truncate">
                        {menu.name}
                      </h5>
                      <p className="text-xs text-neutral-500 font-medium">
                        {menu.count} porsi terjual
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Laporan Per Minggu */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            <h4 className="font-extrabold text-brand-charcoal text-base mb-4 border-b border-neutral-100 pb-3">
              Pendapatan Mingguan
            </h4>
            <div className="space-y-3">
              {weeklyRevenue.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-2">
                  Belum ada rekapan.
                </p>
              ) : (
                weeklyRevenue.map((week, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-bold text-neutral-500">
                      {week.period}
                    </span>
                    <span className="text-sm font-black text-brand-brown">
                      Rp {week.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Laporan Per Bulan */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            <h4 className="font-extrabold text-brand-charcoal text-base mb-4 border-b border-neutral-100 pb-3">
              Pendapatan Bulanan
            </h4>
            <div className="space-y-3">
              {monthlyRevenue.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-2">
                  Belum ada rekapan.
                </p>
              ) : (
                monthlyRevenue.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-neutral-50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-bold text-neutral-500">
                      {month.period}
                    </span>
                    <span className="text-sm font-black text-brand-brown">
                      Rp {month.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
