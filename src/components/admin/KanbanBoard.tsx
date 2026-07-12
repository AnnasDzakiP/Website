"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

interface OrderItem {
  menuItem: { name: string };
  quantity: number;
  variant: string;
  selectedToppings: { name: string; price: number }[];
  notes: string;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  status: "pending" | "confirmed" | "ready" | "done";
  total: number;
  order_items: OrderItem[];
  created_at: string;
  payment_method?: string; // <-- Tambahan kolom payment
}

export default function KanbanBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClient();

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "done") // Sembunyikan pesanan yang sudah selesai dari papan
      .order("created_at", { ascending: true });

    if (data) {
      setOrders(data);
    } else if (error) {
      console.error("Gagal mengambil data antrean:", error.message);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe ke perubahan Realtime (Live Update tanpa perlu refresh)
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      fetchOrders();
    }
  };

  const columns = [
    {
      id: "pending",
      title: "🔵 PESANAN BARU",
      nextStatus: "confirmed",
      btnText: "Konfirmasi & Proses",
    },
    {
      id: "confirmed",
      title: "🍳 SEDANG DIPANGGANG",
      nextStatus: "ready",
      btnText: "Selesai Dimasak",
    },
    {
      id: "ready",
      title: "🟢 SIAP DIAMBIL",
      nextStatus: "done",
      btnText: "Selesaikan Pesanan",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map((col) => (
        <div key={col.id} className="space-y-4">
          {/* Header Kolom */}
          <div
            className={`p-4 rounded-2xl font-black text-sm tracking-widest text-center border-2 ${
              col.id === "pending"
                ? "bg-blue-50 border-blue-100 text-blue-700"
                : col.id === "confirmed"
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : "bg-emerald-50 border-emerald-100 text-emerald-700"
            }`}
          >
            {col.title}
          </div>

          {/* Daftar Kartu Pesanan */}
          <div className="space-y-4">
            {orders
              .filter((o) => o.status === col.id)
              .map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-3 animate-fadeIn relative overflow-hidden"
                >
                  {/* Aksen warna metode pembayaran di kiri */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      order.payment_method === "Cash"
                        ? "bg-orange-400"
                        : "bg-blue-500"
                    }`}
                  ></div>

                  {/* Bagian Atas: Nama, Payment Method, & Total Harga */}
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-3 pl-2">
                    <div>
                      <h4 className="font-extrabold text-brand-charcoal text-lg leading-none mb-1">
                        {order.customer_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs text-neutral-400 font-mono font-bold tracking-wider">
                          #{order.id.slice(-4).toUpperCase()}
                        </p>
                        {/* Label Metode Pembayaran */}
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            order.payment_method === "Cash"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.payment_method || "QRIS"}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-brand-brown text-sm bg-brand-cream/30 px-3 py-1 rounded-lg">
                      Rp {order.total.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Rincian Pesanan (Looping dari JSONB) */}
                  <div className="space-y-2.5 pt-1 pl-2">
                    {order.order_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FCF9F2] p-3 rounded-xl border border-brand-brown/5"
                      >
                        <p className="font-extrabold text-brand-charcoal text-sm leading-tight mb-1">
                          {item.quantity}x{" "}
                          {item.menuItem?.name || "Menu Dihapus"}
                        </p>

                        <div className="text-[11px] text-neutral-500 space-y-0.5 pl-1.5 border-l-2 border-brand-yellow/50 ml-1">
                          <p>
                            <span className="font-bold text-neutral-400">
                              Varian:
                            </span>{" "}
                            {item.variant}
                          </p>

                          {item.selectedToppings &&
                            item.selectedToppings.length > 0 && (
                              <p>
                                <span className="font-bold text-neutral-400">
                                  Topping:
                                </span>{" "}
                                {item.selectedToppings
                                  .map((t) => t.name)
                                  .join(", ")}
                              </p>
                            )}

                          {item.notes && (
                            <p className="italic bg-white px-2 py-1 rounded-md mt-1 border border-neutral-200 inline-block text-brand-brown/80 font-medium">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tombol Aksi */}
                  <button
                    onClick={() => updateOrderStatus(order.id, col.nextStatus)}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md hover:shadow-lg mt-2 tracking-wide uppercase ml-1 ${
                      col.id === "pending"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : col.id === "confirmed"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {col.btnText}
                  </button>
                </div>
              ))}

            {/* Tampilan jika kolom kosong */}
            {orders.filter((o) => o.status === col.id).length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl bg-white/50">
                <p className="text-xs font-bold text-neutral-400">Kosong</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
