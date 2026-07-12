"use client";

import React, { useState } from "react";
import { createClient } from "../../utils/supabase/client";

const DEFAULT_IMAGE =
  "https://placehold.co/400x400/fcf9f2/78350f?text=Preview+Menu";

interface AddMenuFormProps {
  onSuccess: () => void;
  onClose: () => void; // Tambahan prop untuk tombol tutup
}

export default function AddMenuForm({ onSuccess, onClose }: AddMenuFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // State terpisah agar bisa dimunculkan di Live Preview
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "";

    // 1. Proses Upload File jika ada
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, selectedFile);

      if (uploadError) {
        alert("Gagal upload foto: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // 2. Simpan Data ke Database (Tanpa Kategori)
    const newMenu = {
      name: name,
      description: description,
      price: Number(price) || 0,
      image: imageUrl,
      is_available: true,
    };

    const { error } = await supabase.from("menu_items").insert([newMenu]);

    if (error) {
      alert("Gagal menambah menu: " + error.message);
    } else {
      alert("Menu berhasil ditambahkan!");
      onSuccess(); // Trigger fetch ulang dan tutup modal
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-opacity duration-300">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up">
        {/* HEADER MODAL */}
        <div className="p-5 border-b border-brand-brown/5 flex items-center justify-between bg-[#FCF9F2]">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-yellow tracking-widest">
              Admin Panel
            </span>
            <h3 className="font-bold text-lg font-serif text-brand-brown leading-5">
              Tambah Menu Baru
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
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 flex flex-col"
        >
          <div className="p-5 space-y-6 flex-1">
            {/* Info Produk Singkat (Live Preview) */}
            <div className="flex gap-4 items-start pb-4 border-b border-brand-brown/5">
              <img
                className="w-20 h-20 object-cover rounded-xl shadow-inner flex-none border border-brand-brown/5 bg-white"
                src={previewUrl || DEFAULT_IMAGE}
                alt="Preview"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-brown leading-tight">
                  {name || "Nama menu..."}
                </p>
                <p className="text-xs text-neutral-500 leading-normal line-clamp-2">
                  {description || "Deskripsi akan muncul di sini..."}
                </p>
                <span className="block font-extrabold text-sm text-brand-brown">
                  Rp {Number(price || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* 1. NAMA MENU */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                Nama Menu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Pancong Red Velvet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15"
              />
            </div>

            {/* 2. DESKRIPSI */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                Deskripsi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Jelaskan kelezatan menu ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-xs resize-none focus:ring-2 focus:ring-brand-yellow/15"
              />
            </div>

            {/* 3. HARGA */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Contoh: 15000"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15"
              />
            </div>

            {/* 4. UPLOAD FOTO */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                Upload Foto Menu
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2.5 rounded-xl border border-brand-brown/25 outline-none text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-brown/5 file:text-brand-brown hover:file:bg-brand-brown/10 transition-all cursor-pointer bg-neutral-50"
              />
            </div>
          </div>

          {/* FOOTER - TOMBOL AKSI */}
          <div className="p-5 border-t border-brand-brown/5 bg-[#FCF9F2] flex flex-col sm:flex-row items-center justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-3.5 text-xs font-extrabold text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold py-3.5 px-8 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
