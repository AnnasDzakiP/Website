"use client";

import React from "react";
import { OrderDetails } from "../../types";
import { IconChevronRight } from "../ui/Icons";

interface CartModalProps {
  cart: OrderDetails[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: (orders: OrderDetails[]) => void; // Ubah ini menerima array
}

export default function CartModal({
  cart,
  onClose,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartModalProps) {
  const totalHarga = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Fungsi checkout sekarang langsung mengirim SELURUH array keranjang
  // tanpa menggabungkan namanya menjadi satu.
  const handleCheckout = () => {
    if (cart.length === 0) return;
    onProceedToCheckout(cart);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-opacity duration-300">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up border border-brand-brown/10">
        {/* HEADER KERANJANG */}
        <div className="p-5 border-b border-brand-brown/10 flex items-center justify-between bg-[#FCF9F2]">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-bold text-lg font-serif text-brand-brown leading-none">
                Keranjang Pesanan
              </h3>
              <span className="text-[11px] font-semibold text-neutral-500">
                {cart.length} menu dipilih
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 px-3 rounded-full bg-brand-brown/5 hover:bg-brand-brown/10 text-neutral-600 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* DAFTAR ITEM KERANJANG */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-bold text-neutral-700">
                Keranjang Anda masih kosong
              </p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Silakan jelajahi menu lumer kami dan klik tombol "+ Keranjang"
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-brand-brown text-brand-yellow font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer"
              >
                Mulai Pesan Menu
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className={`${idx > 0 ? "pt-4" : ""} flex gap-3.5 items-start`}
              >
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-neutral-100 border border-neutral-200"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-brand-charcoal leading-tight line-clamp-1">
                      {item.menuItem.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      title="Hapus menu ini"
                      className="text-neutral-400 hover:text-rose-600 font-bold text-xs p-1 -mr-1 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.customerName}
                    </span>
                    <span className="bg-neutral-100 text-neutral-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {item.variant}
                    </span>
                  </div>
                  {item.selectedToppings.length > 0 && (
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      <span className="font-semibold text-neutral-600">
                        Topping:
                      </span>{" "}
                      {item.selectedToppings.map((t) => t.name).join(", ")}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] text-brand-brown/80 italic bg-brand-cream/30 p-1.5 rounded-lg border border-brand-brown/5 mt-1">
                      "{item.notes}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-neutral-500">
                      x{item.quantity} porsi
                    </span>
                    <span className="font-extrabold text-sm text-brand-brown">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER KERANJANG */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-brand-brown/10 bg-[#FCF9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Total Pembayaran
                </span>
                <span className="font-extrabold text-xl text-brand-brown">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 underline cursor-pointer"
              >
                Kosongkan Semua
              </button>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            >
              Lanjut ke Pembayaran ({cart.length} Menu) <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
