"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

interface Topping {
  id: string;
  name: string;
  price: number;
}

export default function AdminSettings() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Tambah Topping
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // State untuk Edit Topping
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = createClient();

  const fetchToppings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("toppings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data topping:", error.message);
    } else if (data) {
      setToppings(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  const handleAddTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    setIsAdding(true);

    const { error } = await supabase.from("toppings").insert({
      name: newName,
      price: parseInt(newPrice),
    });

    if (error) {
      alert("Gagal menambah topping: " + error.message);
    } else {
      setNewName("");
      setNewPrice("");
      fetchToppings();
    }
    setIsAdding(false);
  };

  const handleDeleteTopping = async (id: string) => {
    if (!confirm("Yakin ingin menghapus topping ini secara permanen?")) return;

    const { error } = await supabase.from("toppings").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus topping: " + error.message);
    } else {
      fetchToppings();
    }
  };

  const handleStartEdit = (topping: Topping) => {
    setEditingId(topping.id);
    setEditName(topping.name);
    setEditPrice(topping.price.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editPrice) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("toppings")
      .update({ name: editName, price: parseInt(editPrice) })
      .eq("id", id);

    if (error) {
      alert("Gagal mengubah topping: " + error.message);
    } else {
      setEditingId(null);
      fetchToppings();
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      {/* FORM TAMBAH TOPPING */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-brown/10 shadow-sm">
        <h3 className="font-bold text-lg font-serif text-brand-brown mb-4 border-b border-neutral-100 pb-2">
          Tambah Topping Baru
        </h3>
        <form
          onSubmit={handleAddTopping}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nama Topping (misal: Keju Parut)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15 bg-neutral-50 focus:bg-white"
              required
            />
          </div>
          <div className="w-full sm:w-48">
            <input
              type="number"
              placeholder="Harga (Rp)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15 bg-neutral-50 focus:bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-sm disabled:opacity-50 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
          >
            {isAdding ? "Menyimpan..." : "+ Tambah"}
          </button>
        </form>
      </div>

      {/* DAFTAR TOPPING TERSESDIA */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-brown/10 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-2">
          <h3 className="font-bold text-lg font-serif text-brand-brown">
            Daftar Topping Tersedia
          </h3>
          <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
            {toppings.length} Item
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-brand-brown border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-neutral-400">
              Memuat topping...
            </p>
          </div>
        ) : toppings.length === 0 ? (
          <p className="text-center text-sm text-neutral-400 py-8 border-2 border-dashed border-neutral-100 rounded-xl">
            Belum ada data topping. Silakan tambahkan di atas.
          </p>
        ) : (
          <div className="space-y-3">
            {toppings.map((topping) => (
              <div
                key={topping.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FCF9F2] rounded-xl border border-brand-brown/5 gap-4 transition-all hover:border-brand-yellow/50"
              >
                {editingId === topping.id ? (
                  /* --- MODE EDIT --- */
                  <div className="flex flex-col sm:flex-row gap-3 w-full items-center animate-fadeIn">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full sm:flex-1 p-2.5 rounded-lg border border-brand-brown/20 outline-none focus:border-brand-yellow text-sm font-medium bg-white"
                      required
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full sm:w-32 p-2.5 rounded-lg border border-brand-brown/20 outline-none focus:border-brand-yellow text-sm font-medium bg-white"
                      required
                    />
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(topping.id)}
                        disabled={isUpdating}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? "Simpan..." : "Simpan"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- MODE BACA --- */
                  <>
                    <div className="flex-1">
                      <p className="font-bold text-brand-charcoal text-sm">
                        {topping.name}
                      </p>
                      <span className="inline-block mt-1 font-extrabold text-[11px] text-brand-brown bg-brand-yellow/20 px-2 py-0.5 rounded-md">
                        Rp {topping.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(topping)}
                        className="bg-brand-brown/5 hover:bg-brand-brown/15 text-brand-brown font-extrabold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTopping(topping.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
