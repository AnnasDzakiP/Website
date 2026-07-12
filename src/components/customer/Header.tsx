import React from "react";
import { IconShoppingCart } from "../ui/Icons";

interface HeaderProps {
  appState: "menu" | "payment" | "tracking";
  onNewOrder: () => void;
  cartCount: number; // Ubah ini menerima angka jumlah keranjang
  onOpenCart?: () => void; // Tambahan handler saat ikon keranjang diklik
}

export default function Header({
  appState,
  onNewOrder,
  cartCount,
  onOpenCart,
}: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-brand-brown/5 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO POJOK KIRI */}
        <div
          onClick={onNewOrder}
          className="cursor-pointer flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-md rotate-3 hover:rotate-12 transition-all">
            <span className="text-white font-extrabold text-xl font-serif">
              P
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-brown font-serif tracking-tight leading-4">
              Pancong Lumer Umuy
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">
              Booths & Desserts
            </span>
          </div>
        </div>

        {/* TOMBOL KERANJANG KANAN */}
        <div className="flex items-center gap-4">
          {appState === "menu" && (
            <div onClick={onOpenCart}>
              <IconShoppingCart count={cartCount} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
