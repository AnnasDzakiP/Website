"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MenuItem,
  OrderDetails,
  VariantType,
  ToppingOption,
} from "../../types";
import { createClient } from "../../utils/supabase/client";

// Gunakan URL cadangan ini jika foto menu di database kosong ("") atau rusak
const DEFAULT_IMAGE =
  "https://placehold.co/400x400/fcf9f2/78350f?text=Pancong+Lumer";

// --- Komponen Ikon Bawaan ---
const IconPlus = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const IconMinus = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M20 12H4"
    />
  </svg>
);

interface OrderModalProps {
  item: MenuItem;
  onClose: () => void;
  onProceedToPayment: (order: OrderDetails) => void;
  onAddToCart: (order: OrderDetails) => void;
}

export default function OrderModal({
  item,
  onClose,
  onProceedToPayment,
  onAddToCart,
}: OrderModalProps) {
  // State Manajemen Pesanan
  const [customerName, setCustomerName] = useState("");
  const [variant, setVariant] = useState<VariantType>("Setengah Matang");
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [specialNotes, setSpecialNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  // State untuk Topping dari Supabase
  const [dbToppings, setDbToppings] = useState<ToppingOption[]>([]);
  const supabase = createClient();

  // Mengambil data Topping dari Supabase saat modal dibuka
  useEffect(() => {
    const fetchToppings = async () => {
      const { data } = await supabase.from("toppings").select("*");
      if (data) {
        setDbToppings(data);
      }
    };
    fetchToppings();
  }, []);

  // Kalkulasi Harga Reaktif
  const currentSubtotal = useMemo(() => {
    const toppingTotal = selectedToppings.reduce(
      (sum, topping) => sum + topping.price,
      0,
    );
    return (item.price + toppingTotal) * quantity;
  }, [item, selectedToppings, quantity]);

  // Validasi Input Pengguna
  const validateOrder = (): OrderDetails | null => {
    if (!customerName.trim()) {
      setErrorMessage("Silakan masukkan nama pembeli terlebih dahulu.");
      return null;
    }
    return {
      menuItem: item,
      variant,
      selectedToppings,
      customerName,
      notes: specialNotes,
      quantity,
      subtotal: currentSubtotal,
    };
  };

  const handleToggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) return prev.filter((t) => t.id !== topping.id);
      return [...prev, topping];
    });
  };

  const handleBuyNow = () => {
    const orderData = validateOrder();
    if (orderData) onProceedToPayment(orderData);
  };

  const handleAddToCart = () => {
    const orderData = validateOrder();
    if (orderData) onAddToCart(orderData);
  };

  return (
    <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-opacity duration-300">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up">
        {/* HEADER MODAL */}
        <div className="p-5 border-b border-brand-brown/5 flex items-center justify-between bg-[#FCF9F2]">
          <div>
            <h3 className="font-bold text-lg font-serif text-brand-brown leading-5">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded-full bg-brand-brown/5 text-neutral-500 hover:bg-brand-brown/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* KONTEN UTAMA (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Info Produk Singkat */}
          <div className="flex gap-4 items-start pb-4 border-b border-brand-brown/5">
            <img
              className="w-20 h-20 object-cover rounded-xl shadow-inner flex-none border border-brand-brown/5 bg-white"
              src={item.image || DEFAULT_IMAGE}
              alt={item.name}
              onError={(e) =>
                ((e.target as HTMLImageElement).src = DEFAULT_IMAGE)
              }
            />
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 leading-normal">
                {item.description || "Tidak ada deskripsi"}
              </p>
              <span className="block font-extrabold text-sm text-brand-brown">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* 1. NAMA PEMBELI */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
              Nama Pembeli <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda (misal: Annas)"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (e.target.value.trim()) setErrorMessage("");
              }}
              className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15"
            />
            {errorMessage && (
              <p className="text-rose-500 text-xs font-semibold mt-1">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* 2. PILIHAN VARIAN */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
              Pilih Tingkat Kematangan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["Setengah Matang", "Matang"] as VariantType[]).map((v) => (
                <label
                  key={v}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    variant === v
                      ? "border-brand-yellow bg-brand-cream/25 text-brand-brown font-bold"
                      : "border-brand-brown/15 text-neutral-600 bg-white hover:border-brand-brown/30"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs">{v}</span>
                    <span className="text-[9px] text-neutral-400 font-normal">
                      {v === "Setengah Matang" ? "basah lumer" : "Matang empuk"}
                    </span>
                  </div>
                  <input
                    type="radio"
                    checked={variant === v}
                    onChange={() => setVariant(v)}
                    className="w-4 h-4 text-brand-yellow border-neutral-300 focus:ring-brand-yellow cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 3. TOPPING */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
              Tambahan Topping:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dbToppings.map((topping) => {
                const isSelected = selectedToppings.some(
                  (t) => t.id === topping.id,
                );
                return (
                  <label
                    key={topping.id}
                    onClick={() => handleToggleTopping(topping)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-[border-color,background-color] ${
                      isSelected
                        ? "border-brand-yellow bg-brand-cream/25 font-bold text-brand-brown"
                        : "border-brand-brown/10 text-neutral-600 hover:border-brand-brown/30 bg-white"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs">{topping.name}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        + Rp {topping.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-brand-yellow border-neutral-300 rounded focus:ring-brand-yellow cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. CATATAN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
              Catatan Tambahan:
            </label>
            <textarea
              rows={2}
              maxLength={150}
              placeholder="Contoh: Susu kental manis dipisah..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-xs resize-none focus:ring-2 focus:ring-brand-yellow/15"
            />
          </div>

          {/* 5. KUANTITAS */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-brand-brown/5">
            <div className="flex flex-col">
              <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                Jumlah Pesanan
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                Bisa pesan lebih dari satu porsi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${quantity <= 1 ? "border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-100" : "border-brand-brown/20 text-brand-brown hover:bg-neutral-100 hover:scale-105 active:scale-95"}`}
              >
                <IconMinus />
              </button>
              <span className="font-extrabold text-neutral-800 text-base w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-brand-brown/20 text-brand-brown hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <IconPlus />
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER - 2 TOMBOL AKSI */}
        <div className="p-5 border-t border-brand-brown/5 bg-[#FCF9F2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-left flex justify-between sm:block">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Subtotal
            </span>
            <span className="font-extrabold text-lg text-brand-brown leading-tight">
              Rp {currentSubtotal.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-1 sm:justify-end">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial bg-white border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/5 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-sm cursor-pointer"
            >
              🛒 + Keranjang
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 sm:flex-initial bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold py-3.5 px-5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-md cursor-pointer"
            >
              ⚡ Langsung Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
