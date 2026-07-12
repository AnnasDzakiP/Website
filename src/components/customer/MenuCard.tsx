import React from "react";
import { MenuItem } from "../../types";
import { IconChevronRight } from "../ui/Icons";
import Button from "../ui/Button";

const DEFAULT_IMAGE =
  "https://placehold.co/400x400/fcf9f2/78350f?text=Pancong+Lumer";

interface MenuCardProps {
  item: MenuItem;
  onOpenModal: (item: MenuItem) => void;
}

export default function MenuCard({ item, onOpenModal }: MenuCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-brand-brown/5 overflow-hidden flex flex-col transition-all duration-300 ${item.isAvailable ? "hover:shadow-xl hover:-translate-y-1" : "opacity-80 grayscale-[20%]"}`}
    >
      {/* Gambar & Badge Ketersediaan */}
      <div className="relative h-48 w-full bg-[#FCF9F2] overflow-hidden">
        <img
          src={item.image || DEFAULT_IMAGE}
          alt={item.name}
          loading="lazy"
          onError={(e) => ((e.target as HTMLImageElement).src = DEFAULT_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-md uppercase tracking-wider ${item.isAvailable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
          >
            {item.isAvailable ? "Tersedia" : "Stok Habis"}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-brand-charcoal/90 backdrop-blur-md text-brand-yellow text-sm font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg">
          Rp {item.price.toLocaleString("id-ID")}
        </div>
      </div>

      {/* Info Card & Tombol */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-bold text-lg text-brand-charcoal font-serif line-clamp-1 group-hover:text-brand-brown transition-colors">
            {item.name}
          </h4>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {item.description ||
              "Pancong lumer nikmat siap memanjakan lidah Anda."}
          </p>
        </div>

        <Button
          fullWidth
          variant={item.isAvailable ? "primary" : "outline"}
          disabled={!item.isAvailable}
          onClick={() => onOpenModal(item)}
          className="rounded-xl py-3"
        >
          {item.isAvailable ? "Pesan Sekarang" : "Sedang Kosong"}
          {item.isAvailable && <IconChevronRight />}
        </Button>
      </div>
    </div>
  );
}
